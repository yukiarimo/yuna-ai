// Prompt Template Manager
class PromptTemplateManager {
    constructor() {
        this.templates = JSON.parse(localStorage.getItem('promptTemplates')) || {
            'Default': 'You are a helpful assistant.',
            'Creative': 'You are a creative writer with a vivid imagination.',
            'Professional': 'You are a professional business consultant.'
        };
        this.saveTemplates();
    }

    addTemplate(name, content) { this.templates[name] = content; this.saveTemplates(); }
    deleteTemplate(name) { delete this.templates[name]; this.saveTemplates(); }
    getTemplate(name) { return this.templates[name] || ''; }
    getAllTemplates() { return this.templates; }
    saveTemplates() { localStorage.setItem('promptTemplates', JSON.stringify(this.templates)); }
    exportTemplates() {
        const blob = new Blob([JSON.stringify(this.templates, null, 2)], { type: 'application/json' });
        Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'prompt_templates.json' }).click();
    }
    importTemplates(json) { this.templates = JSON.parse(json); this.saveTemplates(); }
}

// Kanojo Connect
class KanojoConnect {
    constructor() {
        this.kanojos = JSON.parse(localStorage.getItem('kanojos')) || {};
        if (!Object.keys(this.kanojos).length) this.addKanojo('Yuna', { name: 'Yuna', memory: "You're a cool girl", character: 'Name: Yuna\nAge: 15\nTraits: Shy, Lovely, Obsessive\nNationality: Japanese\nOccupation: Student\nHobbies: Reading, Drawing, Coding\nBody: Slim, Short, Long hair, Flat chest' });
        this.saveKanojos();
    }

    addKanojo(name, data) { this.kanojos[name] = data; this.saveKanojos(); }
    deleteKanojo(name) { delete this.kanojos[name]; this.saveKanojos(); }
    getKanojo(name) { return this.kanojos[name] || null; }
    getAllKanojos() { return this.kanojos; }
    saveKanojos() { localStorage.setItem('kanojos', JSON.stringify(this.kanojos)); }
    exportKanojos() {
        const blob = new Blob([JSON.stringify(this.kanojos, null, 2)], { type: 'application/json' });
        Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'kanojos.json' }).click();
    }
    importKanojos(json) { this.kanojos = JSON.parse(json); this.saveKanojos(); }
    buildKanojo(name, promptTemplate) {
        const k = this.getKanojo(name);
        return k ? `<|begin_of_text|><memory>${k.memory}</memory>\n<kanojo>${k.character}\n\nTask: ${promptTemplate}</kanojo>\n<dialog>\n` : '';
    }
}

// Initialize managers
const promptManager = new PromptTemplateManager();
const kanojoManager = new KanojoConnect();

// UI Functions
const updateList = (id, items) => {
    const select = document.getElementById(id);
    select.innerHTML = Object.keys(items()).map(name => `<option value="${name}">${name}</option>`).join('');
};

const loadTemplate = () => {
    const name = document.getElementById('promptTemplateSelect').value;
    Object.assign(document.getElementById('promptTemplateName'), { value: name });
    document.getElementById('promptTemplateContent').value = promptManager.getTemplate(name);
};

const loadKanojo = () => {
    const name = document.getElementById('kanojoSelect').value;
    const k = kanojoManager.getKanojo(name);
    if (k) {
        Object.assign(document.getElementById('kanojoName'), { value: k.name });
        Object.assign(document.getElementById('kanojoMemory'), { value: k.memory || '' });
        document.getElementById('kanojoCharacter').value = k.character;
    }
};

const getBuiltKanojo = () => {
    const name = document.getElementById('kanojoSelect').value;
    const template = promptManager.getTemplate(document.getElementById('promptTemplateSelect').value);
    return kanojoManager.buildKanojo(name, template);
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateList('promptTemplateSelect', () => promptManager.getAllTemplates());
    updateList('kanojoSelect', () => kanojoManager.getAllKanojos());
    loadTemplate();
    loadKanojo();

    // Prompt Template
    document.getElementById('promptTemplateSelect').addEventListener('change', loadTemplate);
    document.getElementById('savePromptTemplate').addEventListener('click', () => {
        const name = document.getElementById('promptTemplateName').value.trim();
        const content = document.getElementById('promptTemplateContent').value.trim();
        if (name && content) { promptManager.addTemplate(name, content); updateList('promptTemplateSelect', () => promptManager.getAllTemplates()); loadTemplate(); alert(`Prompt Template "${name}" saved!`); }
        else { alert('Provide both name and content.'); }
    });
    document.getElementById('deletePromptTemplate').addEventListener('click', () => {
        const name = document.getElementById('promptTemplateSelect').value;
        if (confirm(`Delete Prompt Template "${name}"?`)) { promptManager.deleteTemplate(name); updateList('promptTemplateSelect', () => promptManager.getAllTemplates()); loadTemplate(); alert(`Deleted "${name}".`); }
    });
    document.getElementById('exportPromptTemplates').addEventListener('click', () => promptManager.exportTemplates());
    document.getElementById('importPromptTemplates').addEventListener('click', () => {
        const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = 'application/json';
        fileInput.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                try { promptManager.importTemplates(event.target.result); updateList('promptTemplateSelect', () => promptManager.getAllTemplates()); loadTemplate(); alert('Imported templates!'); }
                catch { alert('Invalid JSON.'); }
            };
            reader.readAsText(file);
        };
        fileInput.click();
    });

    // Kanojo
    document.getElementById('kanojoSelect').addEventListener('change', loadKanojo);
    document.getElementById('saveKanojo').addEventListener('click', () => {
        const name = document.getElementById('kanojoName').value.trim();
        const memory = document.getElementById('kanojoMemory').value.trim();
        const character = document.getElementById('kanojoCharacter').value.trim();
        if (name && character) { kanojoManager.addKanojo(name, { name, memory, character }); updateList('kanojoSelect', () => kanojoManager.getAllKanojos()); loadKanojo(); alert(`Kanojo "${name}" saved!`); }
        else { alert('Provide name and character details.'); }
    });
    document.getElementById('addKanojo').addEventListener('click', () => {
        const name = prompt('New Kanojo name:');
        if (name && !kanojoManager.getKanojo(name)) { kanojoManager.addKanojo(name, { name, memory: '', character: '' }); updateList('kanojoSelect', () => kanojoManager.getAllKanojos()); loadKanojo(); alert(`Added "${name}".`); }
        else { alert(`Kanojo "${name}" exists or invalid.`); }
    });
    document.getElementById('deleteKanojo').addEventListener('click', () => {
        const name = document.getElementById('kanojoSelect').value;
        if (confirm(`Delete Kanojo "${name}"?`)) { kanojoManager.deleteKanojo(name); updateList('kanojoSelect', () => kanojoManager.getAllKanojos()); loadKanojo(); alert(`Deleted "${name}".`); }
    });
    document.getElementById('exportKanojos').addEventListener('click', () => kanojoManager.exportKanojos());
    document.getElementById('importKanojos').addEventListener('click', () => {
        const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = 'application/json';
        fileInput.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                try { kanojoManager.importKanojos(event.target.result); updateList('kanojoSelect', () => kanojoManager.getAllKanojos()); loadKanojo(); alert('Imported Kanojos!'); }
                catch { alert('Invalid JSON.'); }
            };
            reader.readAsText(file);
        };
        fileInput.click();
    });
    document.getElementById('exportSingleKanojo').addEventListener('click', () => {
        const name = document.getElementById('kanojoSelect').value;
        const k = kanojoManager.getKanojo(name);
        if (k) {
            const blob = new Blob([kanojoManager.buildKanojo(name, promptManager.getTemplate('Default'))], { type: 'text/plain' });
            Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${name}.txt` }).click();
        }
        else { alert(`Kanojo "${name}" does not exist.`); }
    });
});