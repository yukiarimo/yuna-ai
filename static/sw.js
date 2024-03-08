'use strict';

importScripts('/static/sw-toolbox.js');

toolbox.precache([
    "/yuna.html",
    "/static/js/offline/llama.js",
    "/static/js/offline/main-worker.js",
    "/static/js/offline/main.js",
    "/static/js/offline/thread.js",
    "/static/js/offline/offline.js",
    "/static/js/setup.js",
    "/static/js/himitsu.js",
    "/static/js/index.js",
    "/static/js/kawai-v11-2.js",
    "/static/js/bootstrap/bootstrap.bundle.min.js",
    "/static/js/bootstrap/script.min.js",
    "/static/fonts/kawai-font.woff",
    "/static/img/yuna-ai.png",
    "/static/img/yuna-girl-head.png"
]);

toolbox.router.get('/images/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.networkFirst, {
    networkTimeoutSeconds: 1
});