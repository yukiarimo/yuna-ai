// sw.js
const CACHE_NAME = 'my-pwa-cache-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll([
                    '/',
                    '/static/js/index.js',
                    '/static/js/kawai.js',
                    '/static/css/index.js',
                    '/static/css/kawai.js',
                    // Add other static assets as needed
                ]);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
