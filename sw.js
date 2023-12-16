'use strict';

importScripts('sw-toolbox.js');

toolbox.precache(["index.html", "static/css/index.css", "static/fonts/kawai-font.woff", "static/js/index.js", "static/img/yuna.png", "static/img/yuna-full.png", "static/img/yuna-ai.png"]);

toolbox.router.get('/images/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.networkFirst, {
    networkTimeoutSeconds: 1
});