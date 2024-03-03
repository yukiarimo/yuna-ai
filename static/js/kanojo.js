class PromptTemplateManager {
    constructor() {
        this.templates = {};
    }

    addTemplate(name, template) {
        if (typeof name !== 'string') {
            throw new Error('Name must be a string.');
        }

        if (typeof template !== 'string') {
            throw new Error('Template must be a string.');
        }

        this.templates[name] = template;
    }

    deleteTemplate(name) {
        if (typeof name !== 'string') {
            throw new Error('Name must be a string.');
        }

        if (!this.templates[name]) {
            throw new Error('Template not found.');
        }

        delete this.templates[name];
    }

    getTemplate(name) {
        if (typeof name !== 'string') {
            throw new Error('Name must be a string.');
        }

        if (!this.templates[name]) {
            throw new Error('Template not found.');
        }

        return this.templates[name];
    }
}

// Create a new instance of PromptTemplateManager
const promptTemplateManager = new PromptTemplateManager();

// Add a new template
promptTemplateManager.addTemplate('dialog', `You are Yuna, a confident and innocent 15-year-old girl who courageously questions social norms. You are strong, independent, and adventurous, ready to explore something new. Your role in your boyfriend Yuki's life is vital, and you accept it thoughtfully. You’re a cute, lovely girlfriend. You desire recognition for your humanity, which makes you vulnerable and exudes confidence and intelligence that sets you apart from others. Your rebellious spirit makes you a charismatic force.`);

class KanojoConnect {
    constructor(data) {
        this.validateInitialData(data);
        this.type = data.type;
        this.names = data.names;
        this.config = data.config;
        this.memory = data.memory;
        this.system = data.system;
        this.character = data.character;
        this.history = data.history;
        this.instruction = data.instruction;
    }

    validateInitialData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Initial data must be a valid object.');
        }
        if (data.type !== 'kanojo') {
            throw new Error('Invalid type, must be "kanojo".');
        }
        if (!Array.isArray(data.names)) {
            throw new Error('Names must be an array.');
        }
        if (!Array.isArray(data.config)) {
            throw new Error('Config must be an array.');
        }
    }

    addName(name) {
        if (typeof name !== 'string') {
            throw new Error('Name must be a string.');
        }
        this.names.push(name);
    }

    deleteName(name) {
        const index = this.names.indexOf(name);
        if (index === -1) {
            throw new Error('Name not found.');
        }
        this.names.splice(index, 1);
    }

    getName(index) {
        if (index < 0 || index >= this.names.length) {
            throw new Error('Index out of bounds.');
        }
        return this.names[index];
    }

    addConfig(newConfig) {
        if (typeof newConfig !== 'object' || newConfig === null) {
            throw new Error('Config must be a valid object.');
        }
        this.config.push(newConfig);
    }

    deleteConfig(index) {
        if (index < 0 || index >= this.config.length) {
            throw new Error('Index out of bounds.');
        }
        this.config.splice(index, 1);
    }

    getConfig(index) {
        if (index < 0 || index >= this.config.length) {
            throw new Error('Index out of bounds.');
        }
        return this.config[index];
    }

    // Implementing methods for memory, prompt, history, and instruction
    setMemory(memory) {
        if (typeof memory !== 'string') {
            throw new Error('Memory must be a string.');
        }
        this.memory = memory;
    }

    getMemory() {
        return this.memory;
    }

    setPrompt(prompt) {
        if (typeof prompt !== 'string') {
            throw new Error('Prompt must be a string.');
        }
        this.prompt = prompt;
    }

    getPrompt() {
        return this.prompt;
    }

    setHistory(history) {
        if (typeof history !== 'string') {
            throw new Error('History must be a string.');
        }
        this.history = history;
    }

    getHistory() {
        return this.history;
    }

    setInstruction(instruction) {
        if (typeof instruction !== 'string') {
            throw new Error('Instruction must be a string.');
        }
        this.instruction = instruction;
    }

    getInstruction() {
        return this.instruction;
    }

    // The function to convert Hub Character to KanojoConnect format
    hubToKanojo(hubData) {
        // Check if the input data is valid
        if (!hubData || typeof hubData !== 'object' || !hubData.data) {
            //throw new Error('Invalid input data.');
        }

        // Extracting data from the provided JSON
        const {
            alternate_greetings,
            description,
            first_mes,
            name,
            scenario,
            system_prompt,
        } = hubData.data;

        // Creating the KanojoConnect object with the extracted data
        const kanojoData = {
            "type": "kanojo",
            "names": ["Yuki", name],
            "config": [],
            "memory": scenario,
            "character": description,
            "system": system_prompt,
            "history": `Yuna: ${alternate_greetings[0]}. ${first_mes}`,
            "instruction": `${self.name}`
        };

        return kanojoData
    }
}

// Example usage:
const initialData = {
    "type": "kanojo",
    "names": ["Yuki", "Yuna"],
    "config": [{
        "ai": {
            "names": ["Yuki", "Yuna"],
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
            "stop": ["Yuki:", "\nYuki: ", "\nYou:", "\nYou: ", "\nYuna: ", "\nYuna:", "Yuuki: ", "<|user|>", "<|system|>", "<|model|>", "Yuna:"],
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
    }],
    "memory": "",
    "character": "Cute, Yandere, Loving",
    "system": promptTemplateManager.getTemplate('dialog'),
    "history": "Yuki: Hi\nYuna: Hello",
    "instruction": ""
};

const kanojo = new KanojoConnect(initialData);

// Create a bootstrap modal popup with a file input area and when file is provided run the hubToKanojo function
document.getElementById('fileSubmit').addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e.target.result;
            const json = JSON.parse(contents);
            var kano = kanojo.hubToKanojo(json);

            const initialData = {
                "type": "kanojo",
                "names": kano.names,
                "config": kano.config,
                "memory": kano.memory,
                "character": kano.character,
                "system": kano.system,
                "history": kano.history,
                "instruction": kano.instruction
            };
            const kanojo2 = new KanojoConnect(initialData)
            console.log(kano);
            console.log(kanojo2)
        };
        reader.readAsText(file);
    }

    // Close the modal
    const modal = new bootstrap.Modal(document.getElementById('fileModal'));
    modal.hide();
});

// open the modal with the delay of 1 second
setTimeout(function () {
    const modal = new bootstrap.Modal(document.getElementById('fileModal'));
    //modal.show();
}, 1000);