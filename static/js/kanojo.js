class PromptTemplateManager {
    constructor() {
        this.templates = {};
        // set the default template
        this.defaultTemplate = this.templates['dialog'];
    }

    addTemplate(name, template) {
        this.templates[name] = template;
    }

    deleteTemplate(name) {
        delete this.templates[name];
    }

    getTemplate(name) {
        return this.templates[name];
    }
}

// Create a new instance of PromptTemplateManager
const promptTemplateManager = new PromptTemplateManager();

// Add a new template
promptTemplateManager.addTemplate('dialog', `You are Yuna, a confident and innocent 15-year-old girl who courageously questions social norms. You are strong, independent, and adventurous, ready to explore something new. Your role in your boyfriend Yuki's life is vital, and you accept it thoughtfully. You’re a cute, lovely girlfriend. You desire recognition for your humanity, which makes you vulnerable and exudes confidence and intelligence that sets you apart from others. Your rebellious spirit makes you a charismatic force.`);

var promptTemplateSelector = document.getElementById('promptTemplateSelect');
// Add the templates to the select element
for (var template in promptTemplateManager.templates) {
    var option = document.createElement('option');
    option.value = template;
    option.text = template;
    promptTemplateSelector.appendChild(option);
}

class KanojoConnect {
    constructor(data) {
        this.type = data.type;
        this.names = data.names;
        this.config = data.config;
        this.memory = data.memory;
        this.system = data.system;
        this.character = data.character;
        this.history = data.history;
        this.instruction = data.instruction;
    }

    addName(name) {
        this.names.push(name);
    }

    deleteName(name) {
        const index = this.names.indexOf(name);
        this.names.splice(index, 1);
    }

    getName(index) {
        return this.names[index];
    }

    addConfig(newConfig) {
        this.config.push(newConfig);
    }

    deleteConfig(index) {
        this.config.splice(index, 1);
    }

    getConfig(index) {
        return this.config[index];
    }

    setMemory(memory) {
        this.memory = memory;
    }

    getMemory() {
        return this.memory;
    }

    setPrompt(prompt) {
        this.prompt = prompt;
    }

    getPrompt() {
        return this.prompt;
    }

    setHistory(history) {
        this.history = history;
    }

    getHistory() {
        return this.history;
    }

    setInstruction(instruction) {
        this.instruction = instruction;
    }

    getInstruction() {
        return this.instruction;
    }

    hubToKanojo(hubData) {
        const {
            alternate_greetings,
            description,
            first_mes,
            name,
            scenario,
            system_prompt,
        } = hubData.data;

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