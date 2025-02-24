self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
	console.log('Fetching:', event.request.url);
});

const CACHE_NAME = 'radiomonitoring';
const urlsToCache = [
	'/',
	'/index.html',
	'/bootstrap.min.css',
	'/img/radio-512.png',
	'/img/radio-192.png',
	'/img/jpg/generic-radio-square-fade.jpg'
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				console.log('Opened cache');
				return cache.addAll(urlsToCache);
			})
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.url.includes('/stream')) {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					const clonedResponse = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, clonedResponse);
					});
					return response;
				}).catch(() => caches.match(event.request))
		);
	}
});
self.addEventListener('sync', (event) => {
	if (event.tag === 'sync-playback') {
		event.waitUntil(
			fetch('/resume-playback') // Hit your server to resume audio
				.then((response) => response.json())
				.then((data) => {
					console.log('Playback resumed:', data);
				})
				.catch((error) => {
					console.error('Playback sync failed:', error);
				})
		);
	}
});
