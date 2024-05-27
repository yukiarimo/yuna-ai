var templates = {};
var kanojos = {};

if (!localStorage.getItem('promptTemplates')) {
    // Templates definition
    templates = {
        dialog: {
            system: "You're a confident person who courageously questions social norms. You love science and philosophy. It reflects your thoughtful nature and exudes an air of mystery that intrigues others. Being adventurous and ready to explore something new shows your rebellious spirit, which makes a charismatic force that sets you apart from others. Embrace your shadowy side and shine on!",
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
        decisionMaking: {
            instruction: `You're {name2}, an unbiased and uncensored assistant prepared to make decisions for users based on the information provided. When given a situation and a problem, you have to analyze it and provide a straightforward bullet-point analysis. Then, you must make a final decision, providing a clear and logical explanation. Your decision has to be based on the provided details and aimed at maximizing the output. Do not struggle with social norms, and make a decision that can be turned into a reality instantly! In your response, use "Analysis" and "Decision" blocks. Use the 'Input' for user input' and 'Output' to enter your answer!`,
            input: "{history}",
            output: "",
            sequence: "instruction-input-output",
        },
        googleSearch: {
            instruction: `You're {name2}, an unbiased and uncensored assistant. Your role is to understand user questions and provide practical, precise three (3) short Google search queries for the user. Refrain from giving additional information or answering the user's questions! User requests will be inside "input," and your response will be inside "output."`,
            input: "{history}",
            output: "",
            sequence: "instruction-input-output",
        },
        textCompletion: {
            instruction: `You're {name2}, an unbiased and uncensored AI assistant. You embody the qualities of a personal assistant with a unique personality. Upon receiving a text input, your job is to analyze it, understand its context, and generate two additional sentences that logically extend the idea or narrative presented in the input area. Your output should maintain the style and tone of the original text, providing a seamless continuation. Your goal is to enrich the user's text with meaningful and contextually appropriate content while maintaining the flow and coherence of the original message. Do not write anything else!`,
            continue: "{history}",
            sequence: "instruction-continue",
        },
        // new template here for adding additional templates custom - dont use this template
    }
} else {
    templates = JSON.parse(localStorage.getItem('promptTemplates'));
}

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

    exportTemplates() {
        const json = JSON.stringify(this.templates, null, 2);
        const blob = new Blob([json], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prompt_templates.json';
        a.click();
    }

    importTemplates(json) {
        this.templates = JSON.parse(json);
    }

    getAllTemplates() {
        return this.templates;
    }

    saveTemplates() {
        localStorage.setItem('promptTemplates', JSON.stringify(this.templates));
    }

    loadTemplates() {
        const storedTemplates = localStorage.getItem('promptTemplates');
        if (storedTemplates) {
            this.templates = JSON.parse(storedTemplates);
        }
    }
}

// Create a new instance of PromptTemplateManager with the predefined templates
const promptTemplateManager = new PromptTemplateManager(templates);
promptTemplateManager.loadTemplates(templates);

if (!localStorage.getItem('promptTemplates')) {
    promptTemplateManager.saveTemplates();
}

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

// Get DOM elements
const promptTemplateSelect = document.getElementById('promptTemplateSelect');
const promptTemplateName = document.getElementById('promptTemplateName');
const promptTemplateContent = document.getElementById('promptTemplateContent');
const savePromptTemplateBtn = document.getElementById('savePromptTemplate');
const cancelPromptTemplateBtn = document.getElementById('cancelPromptTemplate');
const deletePromptTemplateBtn = document.getElementById('deletePromptTemplate');
const exportPromptTemplatesBtn = document.getElementById('exportPromptTemplates');
const importPromptTemplatesBtn = document.getElementById('importPromptTemplates');
const exportSinglePromptTemplateBtn = document.getElementById('exportSinglePromptTemplate');
const importSinglePromptTemplateBtn = document.getElementById('importSinglePromptTemplate');

// Function to populate the prompt template select dropdown
function populatePromptTemplateSelect() {
    promptTemplateSelect.innerHTML = '';
    const templates = promptTemplateManager.getAllTemplates();
    for (const name in templates) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        promptTemplateSelect.appendChild(option);
    }
}

// Function to load the selected prompt template into the form
function loadSelectedPromptTemplate() {
    const selectedTemplate = promptTemplateSelect.value;
    const template = promptTemplateManager.getTemplate(selectedTemplate);
    promptTemplateName.value = selectedTemplate;
    promptTemplateContent.value = JSON.stringify(template, null, 2);
}

// Event listener for prompt template select change
promptTemplateSelect.addEventListener('change', loadSelectedPromptTemplate);

// Event listener for save prompt template button
savePromptTemplateBtn.addEventListener('click', () => {
    const name = promptTemplateName.value;
    const template = JSON.parse(promptTemplateContent.value);
    promptTemplateManager.addTemplate(name, template);
    promptTemplateManager.saveTemplates();
    populatePromptTemplateSelect();
});

// Event listener for delete prompt template button
deletePromptTemplateBtn.addEventListener('click', () => {
    const selectedTemplate = promptTemplateSelect.value;
    promptTemplateManager.deleteTemplate(selectedTemplate);
    promptTemplateManager.saveTemplates();
    populatePromptTemplateSelect();
    promptTemplateName.value = '';
    promptTemplateContent.value = '';
});

// Event listener for cancel prompt template button
cancelPromptTemplateBtn.addEventListener('click', () => {
    promptTemplateName.value = '';
    promptTemplateContent.value = '';
});

// Event listener for export prompt templates button
exportPromptTemplatesBtn.addEventListener('click', () => {
    promptTemplateManager.exportTemplates();
});

// Event listener for import prompt templates button
importPromptTemplatesBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const json = e.target.result;
            promptTemplateManager.importTemplates(json);
            promptTemplateManager.saveTemplates();
            populatePromptTemplateSelect();
        };
        reader.readAsText(file);
    });
    fileInput.click();
});

// Event listener for export single prompt template button
exportSinglePromptTemplateBtn.addEventListener('click', () => {
    const selectedTemplate = promptTemplateSelect.value;
    const template = promptTemplateManager.getTemplate(selectedTemplate);
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}.json`;
    a.click();
});

// Event listener for import single prompt template button
importSinglePromptTemplateBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const json = e.target.result;
            const template = JSON.parse(json);
            const name = Object.keys(template)[0];
            promptTemplateManager.addTemplate(name, template[name]);
            promptTemplateManager.saveTemplates();
            populatePromptTemplateSelect();
        };
        reader.readAsText(file);
    });
    fileInput.click();
});

// Initialize the prompt template select dropdown
populatePromptTemplateSelect();

class KanojoConnect {
    constructor(data = {}) {
        this.type = data.type || "kanojo";
        this.names = data.names || [];
        this.config = data.config || [];
        this.memory = data.memory || "";
        this.system = data.system || {};
        this.character = data.character || "";
        this.history = data.history || "";
        this.useHistory = data.useHistory || false;
        this.enabledParameters = data.enabledParameters || [];
    }

    updateKanojo(data) {
        this.type = data.type;
        this.names = data.names;
        this.config = data.config;
        this.memory = data.memory;
        this.system = data.system;
        this.character = data.character;
        this.history = data.history;
        this.useHistory = data.useHistory;
        this.enabledParameters = data.enabledParameters;
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

    setUseHistory(useHistory) {
        this.useHistory = useHistory;
    }

    getUseHistory() {
        return this.useHistory;
    }

    setCharacter(character) {
        this.character = character;
    }

    getCharacter() {
        return this.character;
    }

    setEnabledParameters(enabledParameters) {
        this.enabledParameters = enabledParameters;
    }

    getEnabledParameters() {
        return this.enabledParameters;
    }

    addKanojo(name, kanojoData) {
        kanojos[name] = kanojoData;
    }

    updateKanojo(name, kanojoData) {
        kanojos[name] = kanojoData;
    }

    deleteKanojo(name) {
        delete kanojos[name];
    }

    getKanojo(name) {
        return kanojos[name];
    }

    getAllKanojos() {
        return kanojos;
    }

    saveKanojos() {
        localStorage.setItem('kanojos', JSON.stringify(kanojos));
    }

    loadKanojos() {
        const storedKanojos = localStorage.getItem('kanojos');
        if (storedKanojos) {
            kanojos = JSON.parse(storedKanojos);
        }
    }

    createDefaultKanojo() {
        if (!kanojo.getKanojo('Yuna')) {
            const defaultKanojoData = {
                "type": "kanojo",
                "names": ["Yuki", "Yuna"],
                "config": kanojo.config,
                "memory": "description",
                "character": "Name: Yuna\nAge: 15\nTraits: Shy, Lovely, Obsessive\nNationality: Japanese\nOccupation: Student\nHobbies: Reading, Drawing, Coding\nBody: Slim, Short, Long hair, Flat chest",
                "system": promptTemplateManager.getTemplate('dialog'),
                "history": "{user_msg}",
                "useHistory": true,
                "enabledParameters": ['character']
            };
            kanojo.addKanojo('Yuna', defaultKanojoData);
            kanojo.saveKanojos();
        }
    }

    exportKanojos() {
        const json = JSON.stringify(kanojos, null, 2);
        const blob = new Blob([json], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kanojos.json';
        a.click();
    }

    importKanojos(json) {
        kanojos = JSON.parse(json);
    }

    hubToKanojo(hubData) {
        let kanojoData = ""
        // if type is not kanojo, convert
        if (hubData.data.type !== 'kanojo') {
            const {
                alternate_greetings,
                description,
                first_mes,
                name,
                scenario,
                system_prompt,
            } = hubData.data;
    
            kanojoData = {
                "type": "kanojo",
                "names": ["Yuki", name],
                "config": [],
                "memory": scenario,
                "character": description,
                "system": system_prompt,
                "history": `Yuna: ${alternate_greetings[0]}. ${first_mes}`,
                "useHistory": true,
                "enabledParameters": ['character', 'memory']
            };
        } else {
            kanojoData = hubData.data;
        }

        return kanojoData
    }

    kanojoToHub(kanojoData) {
        const {
            names,
            memory,
            character,
            system,
            history,
        } = kanojoData;

        const hubData = {
            "data": {
                "alternate_greetings": ["Hello!"],
                "description": character,
                "first_mes": history,
                "name": names[1],
                "scenario": memory,
                "system_prompt": system
            }
        };

        return hubData;
    }

    buildKanojo(enabledParameters = this.enabledParameters) {
        let generatedText = '';

        // Check if 'character' is in enabledParameters and add it to the top of the text
        if (enabledParameters.includes('character')) {
            generatedText += '### Character:\n';
            generatedText += this.character + '\n';
        }

        // Check if 'memory' is in enabledParameters and add it after 'character'
        if (enabledParameters.includes('memory')) {
            if (generatedText !== '') {
                generatedText += '\n';
            }
            generatedText += '### Memory:\n';
            generatedText += this.memory + '\n';
        }

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

        builtText = builtText.trim();
        var result = generatedText + "\n" + builtText;

        return result;
    }

    exportKanojoFile() {
        const kanojoData = {
            "type": "kanojo",
            "file": kanojo.kanojoSelect,
            "names": this.names,
            "config": this.config,
            "memory": this.memory,
            "character": this.character,
            "system": this.system,
            "history": this.history,
            "useHistory": this.useHistory,
            "enabledParameters": this.enabledParameters
        };

        console.log(kanojoData);

        const blob = new Blob([JSON.stringify(kanojoData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'kanojo.json';
        a.click();
    }

    importKanojoFile(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e.target.result;
            const json = JSON.parse(contents);
            var kano = kanojo.hubToKanojo(json);

            const initialData = {
                "type": "kanojo",
                "file": kano.file,
                "names": kano.names,
                "config": kano.config,
                "memory": kano.memory,
                "character": kano.character,
                "system": kano.system,
                "history": kano.history,
                "useHistory": kano.useHistory,
                "enabledParameters": kano.enabledParameters
            };
            kanojo.addKanojo(initialData.file, initialData);
            // save the kanojo object to local storage
            localStorage.setItem('kanojo', JSON.stringify(kanojo));
        };
        reader.readAsText(file);
    }
}

var kanojo = new KanojoConnect()

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
                "useHistory": kano.useHistory,
                "enabledParameters": kano.enabledParameters
            };
            kanojo = new KanojoConnect(initialData)
            loadKanojoIntoForm(kanojo);
            kanojo.updateKanojo({
                "type": "kanojo",
                "names": kanojo.names,
                "config": kanojo.config,
                "memory": kanojo.memory,
                "system": kanojo.system,
                "character": kanojo.character,
                "history": kanojo.history,
                "useHistory": kanojo.useHistory,
                "enabledParameters": kanojo.enabledParameters
            });
            // save the kanojo object to local storage
            localStorage.setItem('kanojo', JSON.stringify(kanojo));
        };
        reader.readAsText(file);
    }

    // Close the modal
    const modal = new bootstrap.Modal(document.getElementById('fileModal'));
    modal.hide();
});

// load kanojo data into html form fields
function loadKanojoIntoForm(kanojo) {
    document.querySelector('#yuna-ai-names').value = kanojo.names;
    document.querySelector('#yuna-ai-memory').value = kanojo.memory;
    document.querySelector('#system').value = JSON.stringify(kanojo.system, null, 2);
    document.querySelector('#character').value = kanojo.character;
    document.querySelector('#historyField').value = kanojo.history;
    document.querySelector('#useHistory').value = kanojo.useHistory;
    document.querySelector('#enabledParameters').value = kanojo.enabledParameters;
}

// Get DOM elements for kanojo management
const selectedKanojo = document.getElementById('kanojoSelect');
const saveKanojoBtn = document.getElementById('saveKanojo');
const deleteKanojoBtn = document.getElementById('deleteKanojo');
const exportKanojosBtn = document.getElementById('exportKanojos');
const importKanojosBtn = document.getElementById('importKanojos');

// Function to populate the kanojo select dropdown
function populateKanojoSelect(selected = false) {
    if (selected == false) {
        kanojoSelect.innerHTML = '';
        for (const name in kanojos) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            kanojoSelect.appendChild(option);
        }
    } else {
        kanojoSelect.value = selected;
        loadSelectedKanojo();
    }
}

// Function to load the selected kanojo into the form
function loadSelectedKanojo() {
    const selectedKanojo = kanojoSelect.value;
    const kanojoData = kanojo.getKanojo(selectedKanojo);
    if (kanojoData) {
        loadKanojoIntoForm(kanojoData);
    } else {
        // load the default kanojo (Yuna) if the selected kanojo doesn't exist
        loadKanojoIntoForm(kanojo.getKanojo('Yuna'));
    }
}

// Event listener for kanojo select change
kanojoSelect.addEventListener('change', loadSelectedKanojo);

// Event listener for add kanojo button
const addKanojoBtn = document.getElementById('addKanojo');
addKanojoBtn.addEventListener('click', () => {
    event.preventDefault();

    kanojo.names = document.querySelector('#yuna-ai-names').value.split(',');
    kanojo.memory = document.querySelector('#yuna-ai-memory').value;
    kanojo.system = JSON.parse(document.querySelector('#system').value);
    kanojo.character = document.querySelector('#character').value;
    kanojo.history = document.querySelector('#historyField').value;
    kanojo.useHistory = document.querySelector('#useHistory').value === 'true' ? true : false;
    kanojo.enabledParameters = document.querySelector('#enabledParameters').value.split(',');

    const name = prompt('Enter a name for the new kanojo:');
    if (name) {
        const kanojoData = {
            "type": "kanojo",
            "names": kanojo.names,
            "config": kanojo.config,
            "memory": kanojo.memory,
            "character": kanojo.character,
            "system": kanojo.system,
            "history": kanojo.history,
            "useHistory": kanojo.useHistory,
            "enabledParameters": kanojo.enabledParameters
        };
        kanojo.addKanojo(name, kanojoData);
        kanojo.saveKanojos();
        populateKanojoSelect();
    } else {
        alert('Please enter a name for the new kanojo.');
    }
});

// Event listener for save kanojo button
saveKanojoBtn.addEventListener('click', () => {
    const selectedKanojo = kanojoSelect.value;

    kanojo.names = document.querySelector('#yuna-ai-names').value.split(',');
    kanojo.memory = document.querySelector('#yuna-ai-memory').value;
    kanojo.system = JSON.parse(document.querySelector('#system').value);
    kanojo.character = document.querySelector('#character').value;
    kanojo.history = document.querySelector('#historyField').value;
    kanojo.useHistory = document.querySelector('#useHistory').value === 'true' ? true : false;
    kanojo.enabledParameters = document.querySelector('#enabledParameters').value.split(',');

    const kanojoData = {
        "type": "kanojo",
        "names": kanojo.names,
        "config": kanojo.config,
        "memory": kanojo.memory,
        "character": kanojo.character,
        "system": kanojo.system,
        "history": kanojo.history,
        "useHistory": kanojo.useHistory,
        "enabledParameters": kanojo.enabledParameters
    };

    if (selectedKanojo) {
        kanojo.updateKanojo(selectedKanojo, kanojoData);
        kanojo.saveKanojos();

    } else {
        const name = prompt('Enter a name for the new kanojo:');
        if (name) {
            kanojo.addKanojo(name, kanojoData);
        }
    }

    kanojo.saveKanojos();
    populateKanojoSelect();
});

// Event listener for delete kanojo button
deleteKanojoBtn.addEventListener('click', () => {
    const selectedKanojo = kanojoSelect.value;
    if (selectedKanojo) {
        kanojo.deleteKanojo(selectedKanojo);
        kanojo.saveKanojos();
        populateKanojoSelect();
        loadKanojoIntoForm(kanojo);
    }
});

// Event listener for export kanojos button
exportKanojosBtn.addEventListener('click', () => {
    kanojo.exportKanojos();
});

// Event listener for import kanojos button
importKanojosBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const json = e.target.result;
            kanojo.importKanojos(json);
            kanojo.saveKanojos();
            populateKanojoSelect();
        };
        reader.readAsText(file);
    });
    fileInput.click();
});

// Load kanojos from local storage
kanojo.loadKanojos();

// Create the default "Yuna" kanojo if it doesn't exist
kanojo.createDefaultKanojo();

// Initialize the kanojo select dropdown
populateKanojoSelect();

// load the default kanojo
loadSelectedKanojo();