'use strict';

importScripts('sw-toolbox.js');

toolbox.precache(["index.html", "assets/css/*", "static/fonts/kawai-font.woff", "assets/js/*", "static/img/*"]);

toolbox.router.get('/images/*', toolbox.cacheFirst);
toolbox.router.get('/*', toolbox.networkFirst, {
    networkTimeoutSeconds: 1
});