class OfflineRequest {
    constructor() {
        this.originalFetch = window.fetch;
    }

    monkeyPatchFetch() {
        // Monkey patching the fetch function
        window.fetch = async (resource, init) => {
            if (resource.endsWith('/message')) {
                return this.handleMessageRequest();
            } else if (resource.endsWith('/image')) {
                return this.handleImageRequest();
            } else if (resource.endsWith('/flash-messages')) {
                return this.handleFlashMessageRequest();
            }

            // Proceed with the original fetch request for all other URLs
            return this.originalFetch(resource, init);
        };
    }

    handleMessageRequest() {
        console.log('Running custom function instead of fetch to /message');
        return Promise.resolve(new Response(JSON.stringify({
            message: 'Custom response for /message'
        })));
    }

    handleImageRequest() {
        console.log('Running custom function instead of fetch to /image');
        return Promise.resolve(new Response(JSON.stringify({
            message: 'Custom response for /image'
        })));
    }

    handleFlashMessageRequest() {
        console.log('Running custom function instead of fetch to /flash-message');
        return Promise.resolve(new Response(JSON.stringify([
            'Custom response for /flash-message'
        ])));
    }
}

class OfflineApp {
    constructor() {
        this.offline = Boolean(localStorage.getItem("offline"));
        this.app = Boolean(localStorage.getItem("app"));
        this.offlineRequest = new OfflineRequest();

        if (this.offline) {
            console.log('Offline mode enabled');
        }

        if (this.app && this.offline) {
            this.offlineRequest.monkeyPatchFetch();
        } else if (!this.app && this.offline) {
            this.initializeApp();
        }
    }

    initializeApp() {
        var name = prompt("Please enter your name", "Yuki");
        localStorage.setItem("app", true);
        location.reload();
    }
}

// Instantiate the class
new OfflineApp();

document.getElementById('enableOffline').addEventListener('click', function () {
    // toggle offline mode
    if (localStorage.getItem("offline")) {
        localStorage.removeItem("offline");
    } else {
        localStorage.setItem("offline", true);
    }

    console.log(localStorage.getItem("offline"));
});