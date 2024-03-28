'use strict';

importScripts('/static/sw-toolbox.js');

toolbox.precache([
    "/",
    "/yuna.html",
    "/static/js/setup.js",
    "/static/js/himitsu.js",
    "/static/js/index.js",
    "/static/js/kawai-v11-2.js",
    "/static/js/bootstrap/bootstrap.bundle.min.js",
    "/static/js/bootstrap/script.min.js",
    "/static/fonts/kawai-font.woff",
    "/static/img/yuna-ai.png",
    "/static/img/yuna-girl-head.webp",
    '/static/img/yuna-girl.webp'
]);

toolbox.router.get('/images/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.networkFirst, {
    networkTimeoutSeconds: 1
});