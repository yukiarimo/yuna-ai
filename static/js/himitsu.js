const $ = id => document.getElementById(id);

class kanojoConnect {
    constructor() {
        this.kanojos = {};
        this.loadKanojos();
        this.selectedKanojo = '';

        // Add default if empty
        if (!Object.keys(this.kanojos).length) {
            this.addKanojo(config_data.ai.names[1], {
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

    updateKanojo(name, data) {
        if (this.kanojos[name]) {
            this.kanojos[name] = {...this.kanojos[name], ...data};
            this.saveKanojos();
            return true;
        }
        return false;
    }

    renameKanojo(oldName, newName) {
        if (!this.kanojos[oldName] || this.kanojos[newName]) return false;

        this.kanojos[newName] = {...this.kanojos[oldName]};
        delete this.kanojos[oldName];
        this.saveKanojos();
        return true;
    }

    deleteKanojo(name) {
        if (!this.kanojos[name]) return false;

        delete this.kanojos[name];
        this.saveKanojos();
        return true;
    }

    getKanojo(name) {
        return this.kanojos[name] || null;
    }

    buildPrompt(name) {
        const k = this.getKanojo(name);
        if (!k) return '';

        return `<|begin_of_text|>\n<kanojo>${k.memory}\n${k.character}</kanojo>\n<dialog>\n`;
    }
}

// Initialize manager
const kanojoManagerInstance = new kanojoConnect();

// DOM Ready handler
document.addEventListener('DOMContentLoaded', () => {
    // Populate select
    const populateKanojoSelect = () => {
        const select = document.getElementById('kanojoSelect');
        if (!select) return;

        // Add all existing kanojos
        let options = Object.keys(kanojoManagerInstance.kanojos).map(name =>
            `<option value="${name}">${name}</option>`
        );

        // Add the "Create New" option
        options.push('<option value="__new__">+ Create New</option>');

        select.innerHTML = options.join('');
    };

    // Save the current kanojo data
    const saveCurrentKanojo = () => {
        const name = kanojoManagerInstance.selectedKanojo;
        if (!name || name === '__new__') return;

        const memory = document.getElementById('kanojoMemory').value.trim();
        const character = document.getElementById('kanojoCharacter').value.trim();

        kanojoManagerInstance.updateKanojo(name, { memory, character });
    };

    // Load data into form
    const loadKanojoForm = () => {
        const name = document.getElementById('kanojoSelect').value;

        // Handle "Create New" option
        if (name === '__new__') {
            // Prompt for new name
            const newName = prompt('Enter name for new kanojo:');
            if (!newName || newName.trim() === '') {
                // Reset selection if canceled
                document.getElementById('kanojoSelect').value = kanojoManagerInstance.selectedKanojo ||
                    Object.keys(kanojoManagerInstance.kanojos)[0];
                return;
            }

            // Create new kanojo
            kanojoManagerInstance.addKanojo(newName, {
                memory: "",
                character: `Name: ${newName}\nPersonality: Friendly`
            });

            // Refresh the list and select the new one
            populateKanojoSelect();
            document.getElementById('kanojoSelect').value = newName;
            kanojoManagerInstance.selectedKanojo = newName;
        }

        // Load the selected kanojo
        const k = kanojoManagerInstance.getKanojo(name);
        if (!k) return;

        kanojoManagerInstance.selectedKanojo = name;

        document.getElementById('kanojoMemory').value = k.memory || '';
        document.getElementById('kanojoCharacter').value = k.character || '';
    };

    // Initial setup
    populateKanojoSelect();
    loadKanojoForm();

    // Event listeners
    document.getElementById('kanojoSelect')?.addEventListener('change', loadKanojoForm);

    // Auto-save on edit
    document.getElementById('kanojoMemory')?.addEventListener('input', saveCurrentKanojo);
    document.getElementById('kanojoCharacter')?.addEventListener('input', saveCurrentKanojo);

    // Rename button
    document.getElementById('renameKanojo')?.addEventListener('click', () => {
        const currentName = kanojoManagerInstance.selectedKanojo;
        if (!currentName || currentName === '__new__') {
            alert('Please select a kanojo to rename');
            return;
        }

        const newName = prompt('Enter new name:', currentName);
        if (!newName || newName.trim() === '' || newName === currentName) {
            return;
        }

        if (kanojoManagerInstance.kanojos[newName]) {
            alert('A kanojo with that name already exists');
            return;
        }

        if (kanojoManagerInstance.renameKanojo(currentName, newName)) {
            kanojoManagerInstance.selectedKanojo = newName;
            populateKanojoSelect();
            document.getElementById('kanojoSelect').value = newName;
        }
    });

    // Delete button
    document.getElementById('deleteKanojo')?.addEventListener('click', () => {
        const currentName = kanojoManagerInstance.selectedKanojo;
        if (!currentName || currentName === '__new__') {
            alert('Please select a kanojo to delete');
            return;
        }

        // Ensure there's at least one kanojo remaining
        if (Object.keys(kanojoManagerInstance.kanojos).length <= 1) {
            alert('Cannot delete the last kanojo');
            return;
        }

        if (kanojoManagerInstance.deleteKanojo(currentName)) {
            // Select another kanojo
            const remaining = Object.keys(kanojoManagerInstance.kanojos)[0];
            kanojoManagerInstance.selectedKanojo = remaining;
            populateKanojoSelect();
            document.getElementById('kanojoSelect').value = remaining;
            loadKanojoForm();
        }
    });

    // Export buttons
    document.getElementById('exportKanojos')?.addEventListener('click', () => {
        const data = JSON.stringify(kanojoManagerInstance.kanojos, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'all_kanojos.json';
        a.click();

        URL.revokeObjectURL(url);
    });

    document.getElementById('exportSingleKanojo')?.addEventListener('click', () => {
        const name = kanojoManagerInstance.selectedKanojo;
        if (!name || name === '__new__') {
            alert('Please select a kanojo to export');
            return;
        }

        const k = kanojoManagerInstance.getKanojo(name);
        if (!k) return;

        const data = JSON.stringify({ [name]: k }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.json`;
        a.click();

        URL.revokeObjectURL(url);
    });

    // Import buttons
    document.getElementById('importKanojos')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    kanojoManagerInstance.kanojos = {...kanojoManagerInstance.kanojos, ...data};
                    kanojoManagerInstance.saveKanojos();
                    populateKanojoSelect();
                    alert('Import successful');
                } catch (err) {
                    alert('Failed to import: ' + err.message);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    });
});

// build kanojo
kanojoManagerInstance.buildPrompt(kanojoManagerInstance.selectedKanojo);

// Element selectors
const elements = {
    workArea: $('work-area'),
    outputArea: $('output-area'),
    sendButton: $('createButtonHimitsuCreator'),
    clearButton: $('clearButtonHimitsuCreator'),
};

function sendNaked() {
    fetch(`/extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: elements.workArea?.value })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => { if (elements.outputArea) elements.outputArea.value = data.response; })
    .catch(console.error);
}

// Attach event listeners
elements.sendButton?.addEventListener('click', sendNaked);

// Markdown Renderer Setup (guard if missing)
if (window.marked) {
    marked.setOptions({ breaks: true, gfm: true });
} else {
    console.warn('marked.js not found; skipping markdown setup');
}

// Load and render markdown on load
document.addEventListener('DOMContentLoaded', () => {
    const savedOutput = localStorage.getItem('outputAreaContent');
    if (savedOutput && elements.outputArea) elements.outputArea.value = savedOutput;
});

elements.clearButton?.addEventListener('click', () => {
    if (elements.workArea) elements.workArea.value = '';
    if (elements.outputArea) elements.outputArea.value = '';
    localStorage.removeItem('outputAreaContent');
});

// Save output area content on change
elements.outputArea?.addEventListener('input', () => {
    if (elements.outputArea) {
        localStorage.setItem('outputAreaContent', elements.outputArea.value);
    }
});