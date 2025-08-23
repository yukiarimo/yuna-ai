'use strict';

importScripts('/static/sw-toolbox.js');

toolbox.precache([
    "/",
    "/static/js/setup.js",
    "/static/js/himitsu.js",
    "/static/js/index.js",
    "/static/js/kawai-v11-2.js",
    "/static/js/bootstrap.min.js",
    "/static/js/script.min.js",
    "/static/fonts/kawai-font.woff",
    "/static/img/yuna-ai.png",
    "/static/img/yuna-girl-head.webp",
    '/static/img/yuna-girl.webp'
]);

toolbox.router.get('/images/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.networkFirst, {
    networkTimeoutSeconds: 1
});

// sw.js
self.addEventListener('push', function(event) {
    console.log('Push received:', event);

    let payload;
    try {
        payload = event.data.json();
    } catch (e) {
        payload = {
            title: 'Yuna Ai',
            body: event.data ? event.data.text() : 'No payload'
        };
    }

    const options = {
        body: payload.body,
        icon: payload.icon || '/static/img/yuna-ai.png',
        badge: payload.badge || '/static/img/yuna-girl-head.webp',
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            url: 'https://www.yuna-ai.com'
        }
    };

    event.waitUntil(
        self.registration.showNotification(payload.title || 'Yuna Ai', options)
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log('Notification clicked:', event);

    event.notification.close();

    event.waitUntil(
        clients.openWindow('https://www.himitsu.dev')
    );
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

// app.js
if ('serviceWorker' in navigator) {
    let swRegistration = null;

    navigator.serviceWorker.register('/sw.js')
        .then(function (registration) {
            console.log('ServiceWorker registered successfully');
            swRegistration = registration;
        })
        .catch(function (error) {
            console.error('ServiceWorker registration failed:', error);
        });
}