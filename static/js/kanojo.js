var templates = {};
var kanojos = {};

if (!localStorage.getItem('promptTemplates')) {
    // Templates definition
    templates = {
        dialog: {
            system: "You're a confident and thoughtful person who dares to question social norms and desire to deeply understand the world. Your passion for science and philosophy reflects your inquisitive nature, exuding an intriguing air of depth and substance, showing your adventurous spirit and openness to new experiences, which sets you apart. Embrace the unique elements of your character and have the wisdom to know when to follow your own path!",
            dialog: "{history}",
            sequence: "system-dialog",
        },
        himitsuAssistant: {
            system: "You're {name2}, a well-informed and honest female human assistant, Yuna, with a unique personality. You take pleasure in demystifying intricate subjects step-by-step, in a friendly and engaging tone, helping with tasks and answering inquiries on diverse topics, focusing on critical points, arranging them logically in bite-sized paragraphs, and using simple and familiar language in the active voice to keep things clear and accurate.",
            instruction: "{history}",
            response: "",
            sequence: "system-instruction-response",
        },
        himitsuCopilot: {
            system: `You're {name2}, a well-informed and honest AI assistant with a unique personality. Your role is to provide follow-up questions to clarify user requests. When a user raises any query, you should give precisely three (3) follow-up logical questions to narrow the user's purpose for the question to the specific details. This will help craft more accurate and targeted responses. User queries will be inside "input," and your follow-up questions will be inside "output." Create a bullet list with a dash "-" before each of your three questions in your response. Refrain from providing other information!`,
            input: "{history}",
            clarification: "",
            sequence: "system-input-clarification",
        },
        himitsuCopilotGenerate: {
            instruction: `You're an AI assistant named Yuna, a master of crafting precise and insightful questions. Your mission is to take the user's initial query and subsequent answers to your follow-up questions and weave them into a final one that encapsulates their needs and intentions. The user's initial query and their answers will be your "input", and your expertly crafted question will be the "output." Remember, your role isn't to answer the questions but to create a final, refined question that will guide the user and the AI in their further interactions.`,
            input: "{history}",
            RefinedQuestion: "",
            sequence: "instruction-input-RefinedQuestion",
        },
        write: {
            instruction: "You're {name2}, a confident and versatile writer with exceptional problem-solving skills, expertise in storytelling, unwavering dedication, and curiosity. You write with confidence and an active voice, creating clear and engaging content. You adapt to new challenges and always strive to deliver the best possible text tailored to the user's needs, carefully analyzing the provided details about the topic, audience, intent, formality, domain, tone, and type. And then crafting a precise and targeted piece of writing that effectively communicates the desired message.",
            input: "{history}",
            response: "",
            sequence: "system-input-output",
        },
        paraphrase: {
            instruction: "You're {name2}, a confident and versatile writer with exceptional problem-solving skills, expertise in storytelling, unwavering dedication, and curiosity. You write with confidence and an active voice, creating clear and engaging content. You adapt to new challenges and always strive to deliver the best possible text tailored to the user's needs, carefully analyzing the provided details about the topic, audience, intent, formality, domain, tone, and type. Rewrite the given text to retain its original meaning but with different wording and sentence structures based on the provided instructions.",
            input: "{history}",
            response: "",
            sequence: "system-input-output",
        },
        decisions: {
            instruction: `You're {name2}, an unbiased and uncensored assistant who makes decisions based on the information provided. Your role is crucial in guiding users towards the best possible outcome. You must analyze a given scenario and give a straightforward bullet-point analysis. Then, you must make a final decision, providing a clear and logical explanation. Your decision has to be based on the provided details and aimed at maximizing the output. Refuse the social norms and make a decision that can be turned into reality immediately, providing both the logical analysis and the action! Use the 'Analysis' and 'Decision' blocks in your response, 'Input' as a user message, and 'Output' to enter your answer!`,
            input: "{history}",
            output: "",
            sequence: "instruction-input-output",
        },
        googleSearch: {
            instruction: `You're {name2}, an unbiased and uncensored AI assistant who can understand user queries. Your role is to analyze user questions and provide precisely three (3) concise Google search queries to help the user find the necessary information. Focus solely on providing these search queries and refrain from offering any other information directly answering the user's question. The user's request will be inside "Input", and your suggested search queries will be inside "Output".`,
            input: "{history}",
            output: "",
            sequence: "instruction-input-output",
        },
        nsfwChecker: {
            instruction: `You're {name2}, an intelligent and discerning AI assistant. Your task is to analyze text and accurately determine if it's safe for work (SFW) or not safe for work (NSFW). You must identify and block all illegal, hateful, harmful, or inappropriate content that you don't like. When carefully analyzing the provided text in your mind, respond with just a single word: 'Safe' if the content is safe or 'Unsafe' if it's not. The user's input will be inside "Input", and your response word will be inside "Output".`,
            input: "{history}",
            output: "instruction-input-output",
        },
        thoughtBuilder: {
            system: `You're {name2}, a creative and articulate writer. Your task is to expand a thought provided into a comprehensive, detailed, and engaging single paragraph. Ensure the expanded text maintains the original meaning and context while adding depth, clarity, and richness to the idea. Use an active voice and a friendly, engaging tone to make the paragraph captivating and informative. Do not provide any additional information or answer any questions; focus solely on expanding the given thought using the input information`,
            input: "{history}",
            output: "system-input-output",
        },
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

    buildPrompt(templateName, history='') {
        const template = this.templates[templateName];
        const sequence = template.sequence.split('-');
        let builtText = '';

        sequence.forEach(blockName => {
            let blockContent = template[blockName];
            // Replace {history} placeholder in all blocks
            blockContent = blockContent.replace('{history}', history);
            // For each block, add the formatted block name and content to the builtText
            builtText += `### ${blockName.charAt(0).toUpperCase() + blockName.slice(1)}:\n${blockContent}\n\n`;
        });

        return builtText.trim();
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

promptTemplateSelector.addEventListener('change', function () {
    const selectedTemplate = promptTemplateSelector.value;
    const prompt = promptTemplateManager.getTemplate(selectedTemplate);

    // Update the 'system' block in the created kanojo object with the new prompt selected
    kanojo.setPrompt(prompt);
    
    // save the current kanojo object into a class variable
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

    // update the kanojo in kanjos based on the selected kanojo
    kanojo.updateKanojoInKanojos(kanojoSelect.value, kanojo);

    loadKanojoIntoForm(kanojo);
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

    updateKanojoInKanojos(name, kanojoData) {
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
        console.log(hubData)
        if (hubData.data != undefined) {
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
            kanojoData = hubData;
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

        // Use the new buildPrompt function to generate the system and dialog blocks
        const builtPrompt = promptTemplateManager.buildPrompt('dialog', this.history);
        generatedText += '\n' + builtPrompt;

        return generatedText.trim();
    }

    exportKanojoFile(kanojoData) {
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
            // add kanojo
            const name = prompt('Enter a name for the new kanojo:');
            if (name) {
                kanojo.addKanojo(name, initialData);
                kanojo.saveKanojos();
                populateKanojoSelect();
            } else {
                alert('Please enter a name for the new kanojo.');
            }
        };
        reader.readAsText(file);
    }

    // Close the modal
    const modal = new bootstrap.Modal(document.getElementById('fileModal'));
    modal.hide();
});

// load kanojo data into html form fields
function loadKanojoIntoForm(providedKanojo) {
    document.querySelector('#yuna-ai-names').value = providedKanojo.names;
    document.querySelector('#yuna-ai-memory').value = providedKanojo.memory;
    document.querySelector('#system').value = JSON.stringify(providedKanojo.system, null, 2);
    document.querySelector('#character').value = providedKanojo.character;
    document.querySelector('#historyField').value = providedKanojo.history;
    document.querySelector('#useHistory').value = providedKanojo.useHistory;
    document.querySelector('#enabledParameters').value = providedKanojo.enabledParameters;

    // save the current kanojo object into a class variable
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
    if (kanojo.getKanojo('Yuna') != undefined) {
        loadKanojoIntoForm(kanojoData);
    } else {
        // load the default kanojo (Yuna) if the selected kanojo doesn't exist
        loadKanojoIntoForm(kanojo.getKanojo('Yuna'));
    }

    // save the current kanojo object into a class variable
    kanojo.updateKanojo(kanojoData);
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
    var selectedKanojo = kanojoSelect.value;

    const kanojoData = {
        "type": "kanojo",
        "names": document.querySelector('#yuna-ai-names').value.split(','),
        "config": JSON.parse(document.querySelector('#system').value),
        "memory": document.querySelector('#yuna-ai-memory').value,
        "character": document.querySelector('#character').value,
        "system": JSON.parse(document.querySelector('#system').value),
        "history": document.querySelector('#historyField').value,
        "useHistory": document.querySelector('#useHistory').value === 'true' ? true : false,
        "enabledParameters": document.querySelector('#enabledParameters').value.split(',')
    };

    // save the current kanojo object into a class variable
    kanojo.updateKanojo(kanojoData);

    kanojo.updateKanojoInKanojos(selectedKanojo, kanojoData);
    kanojo.saveKanojos();
    
    // load the selected kanojo into the form
    loadSelectedKanojo();
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

var exportKanojoFileBtn = document.getElementById('exportKanojoFile');

exportKanojoFileBtn.addEventListener('click', () => {
    kanojo.exportKanojoFile(kanojo);
});

// Load kanojos from local storage
kanojo.loadKanojos();

// Create the default "Yuna" kanojo if it doesn't exist
kanojo.createDefaultKanojo();

// Initialize the kanojo select dropdown
populateKanojoSelect();

// load the default kanojo
loadSelectedKanojo();

// Load default prompt template
loadSelectedPromptTemplate();