class promptTemplateManager {
    constructor() {
        this.templates = {
            'dialog': 'You are having a friendly conversation.',
            'creative': 'You are being creative and imaginative.',
            'teaching': 'You are teaching and explaining concepts.'
        };
        this.loadTemplates();
        this.selectedTemplate = 'diaog';
    }

    loadTemplates() {
        const saved = localStorage.getItem('promptTemplates');
        if (saved) this.templates = JSON.parse(saved);
    }

    saveTemplates() {
        localStorage.setItem('promptTemplates', JSON.stringify(this.templates));
    }

    addTemplate(name, content) {
        this.templates[name] = content;
        this.saveTemplates();
    }

    getTemplate(name) {
        return this.templates[name] || this.templates['dialog'];
    }
}

class kanojoConnect {
    constructor() {
        this.kanojos = {};
        this.loadKanojos();
        this.selectedKanojo = '';
        
        // Add default if empty
        if (!Object.keys(this.kanojos).length) {
            this.addKanojo(config_data.ai.names[1], {
                name: config_data.ai.names[1],
                memory: "",
                character: `Name: ${config_data.ai.names[1]}\nPersonality: Friendly`
            });
        }
    }

    loadKanojos() {
        const saved = localStorage.getItem('kanojos');
        if (saved) this.kanojos = JSON.parse(saved);
    }

    saveKanojos() {
        localStorage.setItem('kanojos', JSON.stringify(this.kanojos));
    }

    addKanojo(name, data) {
        this.kanojos[name] = data;
        this.saveKanojos();
    }

    getKanojo(name) {
        return this.kanojos[name] || null;
    }

    buildPrompt(name, template) {
        const k = this.getKanojo(name);
        if (!k) return '';
        
        return `<|begin_of_text|>\n<kanojo>${k.memory}\n${k.character}\n\nTask: ${template}</kanojo>\n<dialog>\n`;
    }
}

// Initialize managers
const promptManagerInstance = new promptTemplateManager();
const kanojoManagerInstance = new kanojoConnect();

// DOM Ready handler
document.addEventListener('DOMContentLoaded', () => {
    // Populate selects
    const populateSelect = (id, items) => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = Object.keys(items).map(name => 
            `<option value="${name}">${name}</option>`
        ).join('');
    };

    // Load data into forms
    const loadKanojoForm = () => {
        const name = document.getElementById('kanojoSelect').value;
        const k = kanojoManagerInstance.getKanojo(name);
        if (!k) return;

        kanojoManagerInstance.selectedKanojo = name;

        document.getElementById('kanojoName').value = k.name;
        document.getElementById('kanojoMemory').value = k.memory || '';
        document.getElementById('kanojoCharacter').value = k.character || '';
    };

    const loadTemplateForm = () => {
        const name = document.getElementById('promptTemplateSelect').value;
        document.getElementById('promptTemplateName').value = name;
        document.getElementById('promptTemplateContent').value = promptManagerInstance.getTemplate(name);
    };

    // Initial setup
    populateSelect('kanojoSelect', kanojoManagerInstance.kanojos);
    populateSelect('promptTemplateSelect', promptManagerInstance.templates);
    loadKanojoForm();
    loadTemplateForm();

    // Event listeners
    document.getElementById('kanojoSelect')?.addEventListener('change', loadKanojoForm);
    document.getElementById('promptTemplateSelect')?.addEventListener('change', loadTemplateForm);

    document.getElementById('saveKanojo')?.addEventListener('click', () => {
        const name = document.getElementById('kanojoName').value.trim();
        const memory = document.getElementById('kanojoMemory').value.trim();
        const character = document.getElementById('kanojoCharacter').value.trim();

        if (!name || !character) {
            alert('Name and character details required');
            return;
        }

        kanojoManagerInstance.addKanojo(name, { name, memory, character });
        populateSelect('kanojoSelect', kanojoManagerInstance.kanojos);
        document.getElementById('kanojoSelect').value = name;
    });

    document.getElementById('savePromptTemplate')?.addEventListener('click', () => {
        const name = document.getElementById('promptTemplateName').value.trim();
        const content = document.getElementById('promptTemplateContent').value.trim();

        if (!name || !content) {
            alert('Name and content required');
            return;
        }

        promptManagerInstance.addTemplate(name, content);
        populateSelect('promptTemplateSelect', promptManagerInstance.templates);
        document.getElementById('promptTemplateSelect').value = name;
    });
});

// build kanojo
kanojoManagerInstance.buildPrompt(kanojoManagerInstance.selectedKanojo, promptManagerInstance.getTemplate(promptManagerInstance.selectedTemplate));