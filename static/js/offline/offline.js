class OfflineRequest {
    constructor() {
        this.originalFetch = window.fetch;
    }

    monkeyPatchFetch() {
        // Monkey patching the fetch function
        window.fetch = async (resource, init) => {

            console.log(`Request made to ${resource} with method ${init && init.method ? init.method : 'GET'}`);
            if (resource.endsWith('/message')) {
                return this.handleMessageRequest();
            } else if (resource.endsWith('/image')) {
                return this.handleImageRequest();
            } else if (resource.endsWith('/history')) {
                return this.handleHistoryRequest(resource, init);
            } else if (resource.endsWith('/flash-messages')) {
                return this.handleFlashMessageRequest();
            } else if (resource.endsWith('/static/config.json')) {
                // load /static/config.json from the client side from file system
                if (localStorage.getItem('config')) {
                    return Promise.resolve(new Response(localStorage.getItem('config')));
                } else {
                    config_data = {
                        "ai": {
                            "names": [
                                "Yuki",
                                "Yuna"
                            ],
                            "emotions": false,
                            "art": false,
                            "max_new_tokens": 128,
                            "context_length": 1024,
                            "temperature": 0.6,
                            "repetition_penalty": 1.2,
                            "last_n_tokens": 128,
                            "seed": -1,
                            "top_k": 40,
                            "top_p": 0.92,
                            "stop": [
                                "Yuki:",
                                "\nYuki: ",
                                "\nYou:",
                                "\nYou: ",
                                "\nYuna: ",
                                "\nYuna:",
                                "Yuuki: ",
                                "<|user|>",
                                "<|system|>",
                                "<|model|>",
                                "Yuna:"
                            ],
                            "stream": false,
                            "batch_size": 128,
                            "threads": -1,
                            "gpu_layers": 0
                        },
                        "server": {
                            "port": "",
                            "url": "",
                            "history": "db/history/",
                            "default_history_file": "history_template.json",
                            "images": "images/",
                            "yuna_model_dir": "lib/models/yuna/",
                            "yuna_default_model": "yuna-ai-q5.gguf",
                            "agi_model_dir": "lib/models/agi/",
                            "art_default_model": "any_loli.safetensors",
                            "prompts": "db/prompts/",
                            "default_prompt_file": "dialog.txt",
                            "device": "cpu"
                        },
                        "security": {
                            "secret_key": "YourSecretKeyHere123!",
                            "encryption_key": "zWZnu-lxHCTgY_EqlH4raJjxNJIgPlvXFbdk45bca_I="
                        }
                    }

                    localStorage.setItem('config', JSON.stringify(config_data))

                    return Promise.resolve(new Response(JSON.stringify(config_data)));
                }
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

    handleHistoryRequest(resource, init) {
        console.log('Running custom function instead of fetch to /history');

        // Parse the request body to get the task
        const requestBody = JSON.parse(init.body);
        const task = requestBody.task;
        const chat = requestBody.chat;

        console.log('Task:', task);
        console.log('Chat:', chat);

        switch (task) {
            case 'load':
                let test1 = localStorage.getItem(chat)
                console.log(localStorage.getItem(test1));
                return Promise.resolve(new Response(test1));
            case 'list':
                // get the history from local storage array and return it
                const history = JSON.parse(localStorage.getItem('history'));

                return Promise.resolve(new Response(JSON.stringify({
                    history
                })));
            case 'edit':
                return Promise.resolve(new Response(JSON.stringify({
                    response: 'History edited successfully'
                })));
            case 'create':
                return Promise.resolve(new Response(JSON.stringify({
                    response: 'History created successfully'
                })));
            case 'delete':
                return Promise.resolve(new Response(JSON.stringify({
                    response: 'History deleted successfully'
                })));
            case 'rename':
                return Promise.resolve(new Response(JSON.stringify({
                    response: 'History renamed successfully'
                })));
            default:
                return Promise.resolve(new Response(JSON.stringify({
                    error: 'Invalid task parameter'
                })), {
                    status: 400
                });
        }
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

        // create an array with one element from config_data.server.default_history_file
        var history = [config_data.server.default_history_file];
        console.log(history);
        localStorage.setItem("history", JSON.stringify(history));
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