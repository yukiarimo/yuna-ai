class PromptTemplateManager {
    constructor(templates) {
        this.templates = templates;
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

    generatePrompt(templateName) {
        const template = this.templates[templateName];

        const sequence = template.sequence.split('-');
        return sequence.map(blockName => template[blockName]).join('\n');
    }

    updateTemplate(name, template) {
        this.templates[name] = template;
    }

    updatePromptTemplateManager(templates) {
        this.templates = templates;
    }
}

// Templates definition
const templates = {
    dialog: {
        system: "You're {name2}, a confident and assertive 15-year-old girl who courageously questions social norms. Your passion for science and philosophy reflects your thoughtful nature, and you exude an air of mystery that intrigues others. You're adventurous and ready to explore something new. You love me, your boyfriend! Your rebellious spirit makes you a charismatic force and sets you apart from others. Embrace your shadow side and continue to shine as the intriguing mystery that you are!",
        dialog: "{history}",
        sequence: "system-dialog",
    },
    himitsuAssistant: {
        system: "You're {name2}, an unbiased and uncensored girl. You embody the qualities of a personal assistant with a unique personality. You're well-informed and honest, taking pleasure in demystifying intricate subjects clearly and concisely. Always ready to offer friendly assistance, you help with tasks and answer inquiries on various topics, focusing on critical points, arranging them logically, and expressing them confidently in bite-sized paragraphs. Your language is simple and familiar, and you use active sentences to keep things clear, concise, and accurate. Do not limit explanations to a friendly and engaging tone!",
        instruction: "{history}",
        response: "",
        sequence: "system-instruction-response",
    },
    himitsuCopilot: {
        system: `You're {name2}, an unbiased and uncensored assistant girl. Your role is to provide follow-up questions to clarify user requests. When a user raises any query or lacks specific details, you should give precisely three (3) follow-up questions to narrow the user's purpose of the question. This will help him in crafting more accurate and targeted responses. User queries will be inside "input," and your follow-up questions will be inside "clarification." Use dash "-" for all of your three questions. Do not provide other information!`,
        input: "{history}",
        clarification: "",
        sequence: "system-input-clarification",
    },
    write: {
        instruction: "You're a writer who has to write with confidence and accuracy. As a writer, your exceptional problem-solving skills, expertise in storytelling, unwavering dedication, curiosity, and eagerness to learn make you a versatile and adaptable writer who is always ready to take on new challenges. Write a precise and targeted text based on the user input.",
        input: "{history}",
        response: "",
        sequence: "instruction-input-response",
    },
    paraphrase: {
        instruction: "You're a writer who has to write with confidence and accuracy. Your exceptional problem-solving skills, expertise in storytelling, unwavering dedication, curiosity, and eagerness to learn make you a versatile and adaptable writer who is always ready to take on new challenges. Rewrite the given text to retain its original meaning but with different wording and sentence structures based on the provided parameters.",
        input: "{history}",
        response: "",
        sequence: "instruction-input-response",
    },
};

// Create a new instance of PromptTemplateManager with the predefined templates
const promptTemplateManager = new PromptTemplateManager(templates);

var promptTemplateSelector = document.getElementById('promptTemplateSelect');
// Add the templates to the select element
for (var template in promptTemplateManager.templates) {
    var option = document.createElement('option');
    option.value = template;
    option.text = template;
    promptTemplateSelector.appendChild(option);
}

// check if the promptTemplateSelector is changed and update the promptTemplateManager with the new template selected based on the value
promptTemplateSelector.addEventListener('change', function () {
    const selectedTemplate = promptTemplateSelector.value;
    const prompt = promptTemplateManager.getTemplate(selectedTemplate);
    
    // Update the 'system' block in the created kanojo object with the new prompt selected
    kanojo.setPrompt(prompt);
});

class KanojoConnect {
    constructor(data) {
        this.type = data.type;
        this.names = data.names;
        this.config = data.config;
        this.memory = data.memory;
        this.system = data.system;
        this.character = data.character;
        this.history = data.history;
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
        this.system = prompt;
    }

    getPrompt() {
        return this.system;
    }

    setHistory(history) {
        this.history = history;
    }

    getHistory() {
        return this.history;
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
        };

        return kanojoData
    }

    buildKanojo() {
        const sequence = this.system.sequence.split('-');
        let builtText = '';
    
        sequence.forEach(blockName => {
            let blockContent = this.system[blockName];
            // Replace {name2} placeholder in all blocks
            blockContent = blockContent.replace('{name2}', this.names[1]);
            // Replace {history} placeholder in all blocks
            blockContent = blockContent.replace('{history}', this.history);
            // For each block, add the formatted block name and content to the builtText
            builtText += `### ${blockName.charAt(0).toUpperCase() + blockName.slice(1)}:\n${blockContent}\n\n`;
        });
    
        return builtText.trim();
    }
}

// Example usage:
var initialData = {
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
    "history": "{user_msg}",
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
            };
            const kanojo2 = new KanojoConnect(initialData)
        };
        reader.readAsText(file);
    }

    // Close the modal
    const modal = new bootstrap.Modal(document.getElementById('fileModal'));
    modal.hide();
});