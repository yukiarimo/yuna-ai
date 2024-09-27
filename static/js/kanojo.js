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
        return this.kanojos[name] || null;
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
            memory: "You're a cool girl",
            character: 'Name: Yuna\nAge: 15\nTraits: Shy, Lovely, Obsessive\nNationality: Japanese\nOccupation: Student\nHobbies: Reading, Drawing, Coding\nBody: Slim, Short, Long hair, Flat chest'
        };
        this.addKanojo('Yuna', defaultKanojo);
    }

    buildKanojo(name, promptTemplate) {
        const kanojo = this.getKanojo(name);
        if (!kanojo) return '';

        // Construct the formatted Kanojo string with memory, character, and prompt template
        return `<memory>${kanojo.memory}</memory>
<kanojo>${kanojo.character}

Task: ${promptTemplate}</kanojo>
<dialog>`;
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

// Function to build Kanojo string
function getBuiltKanojo() {
    const kanojoName = document.getElementById('kanojoSelect').value;
    const promptTemplateName = document.getElementById('promptTemplateSelect').value;
    const promptTemplate = promptManager.getTemplate(promptTemplateName);
    return kanojoManager.buildKanojo(kanojoName, promptTemplate);
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
        const name = document.getElementById('promptTemplateName').value.trim();
        const content = document.getElementById('promptTemplateContent').value.trim();
        if (name && content) {
            promptManager.addTemplate(name, content);
            updatePromptTemplateList();
            loadSelectedPromptTemplate();
            alert(`Prompt Template "${name}" saved successfully!`);
        } else {
            alert('Please provide both name and content for the Prompt Template.');
        }
    });
    document.getElementById('deletePromptTemplate').addEventListener('click', () => {
        const name = document.getElementById('promptTemplateSelect').value;
        if (confirm(`Are you sure you want to delete the Prompt Template "${name}"?`)) {
            promptManager.deleteTemplate(name);
            updatePromptTemplateList();
            loadSelectedPromptTemplate();
            alert(`Prompt Template "${name}" deleted successfully!`);
        }
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
                try {
                    promptManager.importTemplates(event.target.result);
                    updatePromptTemplateList();
                    loadSelectedPromptTemplate();
                    alert('Prompt Templates imported successfully!');
                } catch (error) {
                    alert('Failed to import Prompt Templates. Please ensure the file is a valid JSON.');
                }
            };
            reader.readAsText(file);
        };
        fileInput.click();
    });

    // Kanojo event listeners
    document.getElementById('kanojoSelect').addEventListener('change', loadSelectedKanojo);
    document.getElementById('saveKanojo').addEventListener('click', () => {
        const name = document.getElementById('kanojoName').value.trim();
        const memory = document.getElementById('kanojoMemory').value.trim();
        const character = document.getElementById('kanojoCharacter').value.trim();
        if (name && character) {
            kanojoManager.addKanojo(name, {
                name,
                memory,
                character
            });
            updateKanojoList();
            loadSelectedKanojo();
            alert(`Kanojo "${name}" saved successfully!`);
        } else {
            alert('Please provide both name and character details for the Kanojo.');
        }
    });
    document.getElementById('addKanojo').addEventListener('click', () => {
        const name = prompt('Enter the name of the new Kanojo:');
        if (name) {
            if (kanojoManager.getKanojo(name)) {
                alert(`Kanojo "${name}" already exists.`);
                return;
            }
            kanojoManager.addKanojo(name, {
                name,
                memory: '',
                character: ''
            });
            updateKanojoList();
            loadSelectedKanojo();
            alert(`Kanojo "${name}" added successfully!`);
        }
    });
    document.getElementById('deleteKanojo').addEventListener('click', () => {
        const name = document.getElementById('kanojoSelect').value;
        if (confirm(`Are you sure you want to delete the Kanojo "${name}"?`)) {
            kanojoManager.deleteKanojo(name);
            updateKanojoList();
            loadSelectedKanojo();
            alert(`Kanojo "${name}" deleted successfully!`);
        }
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
                try {
                    kanojoManager.importKanojos(event.target.result);
                    updateKanojoList();
                    loadSelectedKanojo();
                    alert('Kanojos imported successfully!');
                } catch (error) {
                    alert('Failed to import Kanojos. Please ensure the file is a valid JSON.');
                }
            };
            reader.readAsText(file);
        };
        fileInput.click();
    });
    document.getElementById('exportSingleKanojo').addEventListener('click', () => {
        const name = document.getElementById('kanojoSelect').value;
        const kanojo = kanojoManager.getKanojo(name);
        if (kanojo) {
            const kanojoContent = kanojoManager.buildKanojo(name, promptManager.getTemplate('Default'));
            const blob = new Blob([kanojoContent], {
                type: 'text/plain'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name}.txt`;
            a.click();
        } else {
            alert(`Kanojo "${name}" does not exist.`);
        }
    });
});