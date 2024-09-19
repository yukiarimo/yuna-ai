// Prompt Template Manager
class PromptTemplateManager {
    constructor() {
        this.templates = {};
        this.loadTemplates();
    }

    addTemplate(name, content) {
        this.templates[name] = content;
        this.saveTemplates();
    }

    deleteTemplate(name) {
        delete this.templates[name];
        this.saveTemplates();
    }

    getTemplate(name) {
        return this.templates[name] || '';
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
        } else {
            // Default templates
            this.templates = {
                'Default': 'You are a helpful assistant.',
                'Creative': 'You are a creative writer with a vivid imagination.',
                'Professional': 'You are a professional business consultant.'
            };
            this.saveTemplates();
        }
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
        this.saveTemplates();
    }
}

// Kanojo Connect
class KanojoConnect {
    constructor() {
        this.kanojos = {};
        this.loadKanojos();
    }

    addKanojo(name, data) {
        this.kanojos[name] = data;
        this.saveKanojos();
    }

    deleteKanojo(name) {
        delete this.kanojos[name];
        this.saveKanojos();
    }

    getKanojo(name) {
        return this.kanojos[name];
    }

    getAllKanojos() {
        return this.kanojos;
    }

    saveKanojos() {
        localStorage.setItem('kanojos', JSON.stringify(this.kanojos));
    }

    loadKanojos() {
        const storedKanojos = localStorage.getItem('kanojos');
        if (storedKanojos) {
            this.kanojos = JSON.parse(storedKanojos);
        } else {
            this.createDefaultKanojo();
        }
    }

    createDefaultKanojo() {
        const defaultKanojo = {
            name: 'Yuna',
            memory: '',
            character: 'Name: Yuna\nAge: 15\nTraits: Shy, Lovely, Obsessive\nNationality: Japanese\nOccupation: Student\nHobbies: Reading, Drawing, Coding\nBody: Slim, Short, Long hair, Flat chest'
        };
        this.addKanojo('Yuna', defaultKanojo);
    }

    buildKanojo(name, promptTemplate) {
        const kanojo = this.getKanojo(name);
        if (!kanojo) return '';
        return `${kanojo.character}\n\nPrompt: ${promptTemplate}`;
    }

    exportKanojos() {
        const json = JSON.stringify(this.kanojos, null, 2);
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
        this.kanojos = JSON.parse(json);
        this.saveKanojos();
    }
}

// Initialize managers
const promptManager = new PromptTemplateManager();
const kanojoManager = new KanojoConnect();

// UI Functions
function updatePromptTemplateList() {
    const select = document.getElementById('promptTemplateSelect');
    select.innerHTML = '';
    Object.keys(promptManager.getAllTemplates()).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function updateKanojoList() {
    const select = document.getElementById('kanojoSelect');
    select.innerHTML = '';
    Object.keys(kanojoManager.getAllKanojos()).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

function loadSelectedPromptTemplate() {
    const name = document.getElementById('promptTemplateSelect').value;
    document.getElementById('promptTemplateName').value = name;
    document.getElementById('promptTemplateContent').value = promptManager.getTemplate(name);
}

function loadSelectedKanojo() {
    const name = document.getElementById('kanojoSelect').value;
    const kanojo = kanojoManager.getKanojo(name);
    if (kanojo) {
        document.getElementById('kanojoName').value = kanojo.name;
        document.getElementById('kanojoMemory').value = kanojo.memory || '';
        document.getElementById('kanojoCharacter').value = kanojo.character;
    }
}

// Initialize UI and attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    updatePromptTemplateList();
    updateKanojoList();
    loadSelectedPromptTemplate();
    loadSelectedKanojo();

    // Prompt Template event listeners
    document.getElementById('promptTemplateSelect').addEventListener('change', loadSelectedPromptTemplate);
    document.getElementById('savePromptTemplate').addEventListener('click', () => {
        const name = document.getElementById('promptTemplateName').value;
        const content = document.getElementById('promptTemplateContent').value;
        promptManager.addTemplate(name, content);
        updatePromptTemplateList();
        loadSelectedPromptTemplate();
    });
    document.getElementById('deletePromptTemplate').addEventListener('click', () => {
        const name = document.getElementById('promptTemplateSelect').value;
        promptManager.deleteTemplate(name);
        updatePromptTemplateList();
        loadSelectedPromptTemplate();
    });
    document.getElementById('exportPromptTemplates').addEventListener('click', () => {
        promptManager.exportTemplates();
    });
    document.getElementById('importPromptTemplates').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        fileInput.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                promptManager.importTemplates(event.target.result);
                updatePromptTemplateList();
                loadSelectedPromptTemplate();
            };
            reader.readAsText(file);
        };
        fileInput.click();
    });

    // Kanojo event listeners
    document.getElementById('kanojoSelect').addEventListener('change', loadSelectedKanojo);
    document.getElementById('saveKanojo').addEventListener('click', () => {
        const name = document.getElementById('kanojoName').value;
        const memory = document.getElementById('kanojoMemory').value;
        const character = document.getElementById('kanojoCharacter').value;
        kanojoManager.addKanojo(name, {
            name,
            memory,
            character
        });
        updateKanojoList();
        loadSelectedKanojo();
    });
    document.getElementById('addKanojo').addEventListener('click', () => {
        const name = prompt('Enter the name of the new Kanojo:');
        if (name) {
            kanojoManager.addKanojo(name, {
                name,
                memory: '',
                character: ''
            });
            updateKanojoList();
            loadSelectedKanojo();
        }
    });
    document.getElementById('deleteKanojo').addEventListener('click', () => {
        const name = document.getElementById('kanojoSelect').value;
        kanojoManager.deleteKanojo(name);
        updateKanojoList();
        loadSelectedKanojo();
    });
    document.getElementById('exportKanojos').addEventListener('click', () => {
        kanojoManager.exportKanojos();
    });
    document.getElementById('importKanojos').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        fileInput.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                kanojoManager.importKanojos(event.target.result);
                updateKanojoList();
                loadSelectedKanojo();
            };
            reader.readAsText(file);
        };
        fileInput.click();
    });
    document.getElementById('exportSingleKanojo').addEventListener('click', () => {
        const name = document.getElementById('kanojoSelect').value;
        const kanojo = kanojoManager.getKanojo(name);
        if (kanojo) {
            const blob = new Blob([kanojo.character], {
                type: 'text/plain'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name}.txt`;
            a.click();
        }
    });
});