'use strict';

// Remove the conditional check that's causing issues
importScripts('/static/sw-toolbox.js');

toolbox.precache([
    "/",
    "/static/js/index.js",
    "/static/js/history.js",
    "/static/js/himitsu.js",
    "/static/js/markdown.js",
    "/static/js/bootstrap.min.js",
    "/static/fonts/yukiarimo.woff",
    "/static/img/yuna-ai.png",
    '/static/img/yuna-girl.webp'
]);

toolbox.router.get('/images/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.networkFirst, {
    networkTimeoutSeconds: 1
});

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        fetch(event.request).catch(function () {
            return caches.match(event.request);
        })
    );
});