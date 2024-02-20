'use strict';

importScripts('sw-toolbox.js');

toolbox.precache(["/yuna.html", "static/js/offline/llama.js", "static/js/offline/main-worker.js", "static/js/offline/main.js", "static/js/offline/example-single-thread.js", "static/js/offline/offline.js", "static/js/setup.js", "static/js/himitsu.js", "index.js", "kawai-v11-2.js", "static/js/bootstrap/bootstrap.bundle.min.js", "jquery.min.js", "script.min.js", "fonts/kawai-font.woff", "img/yuna-ai.png", "img/yuna-girl-head.png"]);

toolbox.router.get('/images/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.networkFirst, {
    networkTimeoutSeconds: 1
});

