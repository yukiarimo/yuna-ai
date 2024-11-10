// Element selectors
const $ = id => document.getElementById(id);
const elements = {
    nakedWorkArea: $('naked-work-area'),
    articlePromptTemplate: $('article-prompt-template'),
    articleUserInput: $('article-user-input'),
    articleOutputText: $('article-output-text'),
    articleDraftText: $('article-draft-text'),
    sendCreateNakedButton: $('send-create-naked'),
    sendCreateArticleButton: $('send-create-article'),
    copyToDraftButton: $('copy-to-draft'),
    markdownInput: $('markdown-input'),
    preview: $('preview'),
    saveButton: $('save-button'),
    exportButton: $('export-button'),
    clearButton: $('clear-button'),
    textInput: $('textInput'),
    status: $('status'),
    audioOutput: $('audioOutput'),
};

// Shared message sending function
const sendMessage = async (content, output) => {
    if (output) output.value = '';
    await messageManagerInstance.sendMessage(content, false, '', '/message', true, true, output);
};

// Event handlers
const sendNakedRequest = () => sendMessage(elements.nakedWorkArea.value, elements.nakedWorkArea);
const sendArticleRequest = () => {
    const content = `${elements.articlePromptTemplate.value}\n\n${elements.articleUserInput.value}`;
    sendMessage(content, elements.articleOutputText);
};
const copyToDraft = () => elements.articleDraftText.value = elements.articleOutputText.value;

// Attach event listeners
elements.sendCreateNakedButton.addEventListener('click', sendNakedRequest);
elements.sendCreateArticleButton.addEventListener('click', sendArticleRequest);
elements.copyToDraftButton.addEventListener('click', copyToDraft);

// Markdown Renderer Setup
marked.setOptions({
    breaks: true,
    gfm: true
});

// Load and render markdown on load
window.onload = () => {
    const saved = localStorage.getItem('presentationMarkdown');
    if (saved) elements.markdownInput.value = saved;
    renderPreview();
};

// Markdown Event Listeners
elements.saveButton.addEventListener('click', () => {
    localStorage.setItem('presentationMarkdown', elements.markdownInput.value);
    alert('Presentation saved!');
});
elements.clearButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the presentation?')) {
        elements.markdownInput.value = '';
        elements.preview.innerHTML = '';
        localStorage.removeItem('presentationMarkdown');
    }
});
elements.markdownInput.addEventListener('input', renderPreview);

// Render markdown preview
function renderPreview() {
    const slides = elements.markdownInput.value.split(/^---$/m);
    elements.preview.innerHTML = slides.map(slide => {
        const div = document.createElement('div');
        div.className = 'slide-container mb-4 p-3 border rounded';
        div.innerHTML = marked.parse(slide);
        return div.outerHTML;
    }).join('');
}

// Export to PPTX
elements.exportButton.addEventListener('click', exportPPTX);

function exportPPTX() {
    const pptx = new PptxGenJS();
    pptx.defineLayout({
        name: 'LAYOUT_WIDE',
        width: 13.33,
        height: 7.5
    });
    pptx.layout = 'LAYOUT_WIDE';
    const slides = elements.markdownInput.value.split(/^---$/m);

    slides.forEach(md => {
        const slide = pptx.addSlide();
        const tokens = marked.lexer(md);
        let y = 0.5,
            margin = 0.5,
            width = 13.33;

        tokens.forEach(token => {
            switch (token.type) {
                case 'heading':
                    slide.addText(token.text, {
                        x: margin,
                        y,
                        w: width - 2 * margin,
                        fontSize: getFontSize(token.depth),
                        bold: token.depth < 3,
                        color: '363636',
                        breakLine: true
                    });
                    y += getFontSize(token.depth) / 72 + 0.2;
                    break;
                case 'paragraph':
                    slide.addText(parseInlineStyles(token.text), {
                        x: margin,
                        y,
                        w: width - 2 * margin,
                        fontSize: 14,
                        color: '363636',
                        breakLine: true,
                        hyperlinkClick: getHyperlinks(token.text)
                    });
                    y += calculateTextHeight(token.text, width - 2 * margin, 14) + 0.1;
                    break;
                case 'blockquote':
                    slide.addShape(pptx.ShapeType.rect, {
                        x: margin + 0.2,
                        y,
                        w: width - 2 * margin - 0.4,
                        h: 0.4,
                        fill: {
                            color: 'D3D3D3'
                        },
                        line: {
                            color: 'D3D3D3'
                        }
                    });
                    slide.addText(parseInlineText(token.text), {
                        x: margin + 0.4,
                        y,
                        w: width - 2 * margin - 0.6,
                        fontSize: 12,
                        italic: true,
                        color: '555555',
                        breakLine: true
                    });
                    y += 0.5;
                    break;
                case 'list':
                    token.items.forEach(item => {
                        slide.addText(parseInlineStyles(item.text), {
                            x: margin + 0.2,
                            y,
                            w: width - 2 * margin - 0.4,
                            fontSize: 14,
                            color: '363636',
                            bullet: token.ordered ? {
                                type: 'number'
                            } : true,
                            indent: 0.3
                        });
                        y += calculateTextHeight(item.text, width - 2 * margin - 0.7, 14) + 0.05;
                    });
                    break;
                case 'code':
                    slide.addText(token.text, {
                        x: margin,
                        y,
                        w: width - 2 * margin,
                        fontSize: 12,
                        fontFace: 'Courier New',
                        color: '555555',
                        fill: {
                            color: 'F5F5F5'
                        },
                        border: {
                            type: 'solid',
                            color: 'D3D3D3'
                        },
                        breakLine: true
                    });
                    y += 0.6;
                    break;
                case 'hr':
                    slide.addShape(pptx.ShapeType.line, {
                        x: margin,
                        y: y + 0.1,
                        w: width - 2 * margin,
                        h: 0,
                        line: {
                            color: 'C0C0C0',
                            w: 1
                        }
                    });
                    y += 0.3;
                    break;
            }
        });
    });

    pptx.writeFile({
        fileName: "Presentation.pptx"
    });
}

// Helper Functions
const getFontSize = depth => [32, 28, 24, 20, 16, 14][depth - 1] || 14;

function parseInlineStyles(text) {
    return marked.lexer(text, {
        gfm: true,
        breaks: false
    }).flatMap(token => {
        switch (token.type) {
            case 'strong':
                return {
                    text: token.text, bold: true
                };
            case 'em':
                return {
                    text: token.text, italic: true
                };
            case 'codespan':
                return {
                    text: token.text, fontFace: 'Courier New', color: '555555', italic: true
                };
            case 'link':
                return {
                    text: token.text, hyperlink: token.href, color: '0000FF', underline: true
                };
            case 'br':
                return {
                    text: '\n'
                };
            case 'text':
            default:
                return {
                    text: token.text || token
                };
        }
    });
}

const getHyperlinks = text => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g,
        links = {};
    let match;
    while ((match = regex.exec(text)) !== null) links[match[1]] = {
        url: match[2]
    };
    return links;
};

const calculateTextHeight = (text, width, size) => {
    const charsPerLine = Math.floor(width * 1.5);
    const lines = Math.ceil(text.length / charsPerLine);
    return lines * (size / 72);
};

function parseInlineText(text) {
    return marked.lexer(text, {
        gfm: true,
        breaks: false
    }).map(token => token.text || '').join('');
}

// Audiobook Generator Enhanced
class AudiobookProject {
    constructor(id, name, chunks = [], currentTime = 0) {
        this.id = id;
        this.name = name;
        this.chunks = chunks;
        this.currentTime = currentTime;
        this.path = `static/audio/audiobooks/${id}`;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            chunks: this.chunks,
            currentTime: this.currentTime
        };
    }

    static fromJSON(json) {
        return new AudiobookProject(json.id, json.name, json.chunks, json.currentTime);
    }
}

class AudiobookManager {
    constructor() {
        this.currentProject = null;
        this.projects = new Map();
        this.loadProjects();
    }

    createProject(name) {
        const id = `project_${Date.now()}`;
        const project = new AudiobookProject(id, name);
        this.projects.set(id, project);
        this.saveProjects();
        return project;
    }

    loadProjects() {
        const saved = localStorage.getItem('audiobook_projects');
        if (saved) {
            const projects = JSON.parse(saved);
            projects.forEach(p => {
                this.projects.set(p.id, AudiobookProject.fromJSON(p));
            });
        }
    }

    saveProjects() {
        const projectsArray = Array.from(this.projects.values()).map(p => p.toJSON());
        localStorage.setItem('audiobook_projects', JSON.stringify(projectsArray));
    }

    deleteProject(id) {
        this.projects.delete(id);
        this.saveProjects();
    }

    setCurrentProject(id) {
        this.currentProject = this.projects.get(id) || null;
        return this.currentProject;
    }
}

class AudiobookGenerator {
    constructor() {
        this.manager = new AudiobookManager();
        this.playbackQueue = [];
        this.isPlaying = false;
        this.currentChunkIndex = 0;
        this.initializeElements();
        this.attachEventListeners();
        this.loadProjects();
    }

    initializeElements() {
        this.elements = {
            textInput: document.getElementById('textInput'),
            audioPlayer: document.getElementById('audioPlayer'),
            status: document.getElementById('status'),
            progressBar: document.getElementById('progressBar'),
            blockList: document.getElementById('blockList'),
            mergeButton: document.getElementById('mergeButton'),
            downloadButton: document.getElementById('downloadButton'),
            speakButton: document.getElementById('speakButton'),
            modeToggle: document.getElementById('modeToggle'),
            projectSelect: document.getElementById('projectSelect'),
            newProjectBtn: document.getElementById('newProjectBtn'),
            deleteProjectBtn: document.getElementById('deleteProjectBtn'),
            currentProject: document.getElementById('currentProject'),
            timeSlider: document.getElementById('timeSlider'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            prevChunkBtn: document.getElementById('prevChunkBtn'),
            nextChunkBtn: document.getElementById('nextChunkBtn'),
            moveUpBtn: document.getElementById('moveUpBtn'),
            moveDownBtn: document.getElementById('moveDownBtn')
        };
    }

    attachEventListeners() {
        // Project Management
        this.elements.newProjectBtn.addEventListener('click', () => this.createNewProject());
        this.elements.projectSelect.addEventListener('change', (e) => this.loadProject(e.target.value));
        this.elements.deleteProjectBtn.addEventListener('click', () => this.deleteCurrentProject());

        // Audio Controls
        this.elements.audioPlayer.addEventListener('timeupdate', () => this.updateTimeDisplay());
        this.elements.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.elements.timeSlider.addEventListener('input', (e) => this.seekTo(e.target.value));
        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.elements.stopBtn.addEventListener('click', () => this.stopPlayback());
        this.elements.prevChunkBtn.addEventListener('click', () => this.playPreviousChunk());
        this.elements.nextChunkBtn.addEventListener('click', () => this.playNextChunk());

        // Main Controls
        this.elements.speakButton.addEventListener('click', () => this.generateSpeech());
        this.elements.mergeButton.addEventListener('click', () => this.mergeAudioChunks());
        this.elements.downloadButton.addEventListener('click', () => this.downloadMergedAudio());
        this.elements.modeToggle.addEventListener('change', () => this.toggleMode());

        // Drag and Drop for Block List
        this.elements.blockList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(this.elements.blockList, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement) {
                this.elements.blockList.insertBefore(draggable, afterElement);
            } else {
                this.elements.blockList.appendChild(draggable);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.list-group-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    async createNewProject() {
        const name = prompt('Enter project name:');
        if (name) {
            const project = this.manager.createProject(name);
            await this.createProjectDirectory(project.id);
            this.updateProjectsList();
            this.loadProject(project.id);
        }
    }

    async createProjectDirectory(projectId) {
        try {
            await fetch('/create_project_directory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId })
            });
        } catch (error) {
            console.error('Failed to create project directory:', error);
        }
    }

    updateProjectsList() {
        this.elements.projectSelect.innerHTML = '<option value="">Select Project</option>';
        this.manager.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            this.elements.projectSelect.appendChild(option);
        });
    }

    loadProject(projectId) {
        const project = this.manager.setCurrentProject(projectId);
        if (project) {
            this.elements.currentProject.textContent = project.name;
            this.elements.deleteProjectBtn.disabled = false;
            this.loadProjectChunks();
            this.elements.projectSelect.value = projectId;
        }
    }

    async loadProjectChunks() {
        if (!this.manager.currentProject) return;
        
        this.elements.blockList.innerHTML = '';
        this.manager.currentProject.chunks.forEach(chunk => {
            this.addBlockToUI(chunk.id, chunk.text, chunk.status);
        });
    }

    deleteCurrentProject() {
        if (!this.manager.currentProject) return;
        
        if (confirm(`Delete project "${this.manager.currentProject.name}"?`)) {
            this.manager.deleteProject(this.manager.currentProject.id);
            this.manager.currentProject = null;
            this.elements.currentProject.textContent = 'No Project Selected';
            this.elements.deleteProjectBtn.disabled = true;
            this.updateProjectsList();
            this.elements.blockList.innerHTML = '';
        }
    }

    updateTimeDisplay() {
        const current = this.elements.audioPlayer.currentTime;
        const duration = this.elements.audioPlayer.duration;
        this.elements.currentTime.textContent = this.formatTime(current);
        this.elements.timeSlider.value = (current / duration) * 100;
    }

    updateDuration() {
        const duration = this.elements.audioPlayer.duration;
        this.elements.duration.textContent = this.formatTime(duration);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    seekTo(value) {
        const time = (value / 100) * this.elements.audioPlayer.duration;
        this.elements.audioPlayer.currentTime = time;
    }

    togglePlayPause() {
        if (this.elements.audioPlayer.paused) {
            this.elements.audioPlayer.play();
            this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            this.elements.audioPlayer.pause();
            this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    stopPlayback() {
        this.elements.audioPlayer.pause();
        this.elements.audioPlayer.currentTime = 0;
        this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    playPreviousChunk() {
        if (this.currentChunkIndex > 0) {
            this.currentChunkIndex--;
            this.playChunk(this.currentChunkIndex);
        }
    }

    playNextChunk() {
        if (this.currentChunkIndex < this.manager.currentProject.chunks.length - 1) {
            this.currentChunkIndex++;
            this.playChunk(this.currentChunkIndex);
        }
    }

    highlightCurrentChunk(id) {
        const blocks = this.elements.blockList.querySelectorAll('.list-group-item');
        blocks.forEach(block => {
            block.classList.remove('active');
            if (block.dataset.id === id) {
                block.classList.add('active');
                block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    async sendMessageBook(blockData) {
        try {
            this.updateBlockStatus(blockData.id, 'processing');

            const response = await fetch('/generate_audiobook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(blockData)
            });

            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                let boundary;
                
                while ((boundary = buffer.indexOf('\n')) !== -1) {
                    const message = buffer.slice(0, boundary);
                    buffer = buffer.slice(boundary + 1);
                    
                    if (message) {
                        try {
                            const data = JSON.parse(message);
                            if (data.audio_path && data.id === blockData.id) {
                                const chunk = this.manager.currentProject.chunks.find(c => c.id === data.id);
                                if (chunk) {
                                    chunk.audioPath = data.audio_path;
                                    chunk.status = 'completed';
                                    this.updateBlockStatus(data.id, 'completed');
                                }
                            }
                            if (data.status === 'complete') {
                                this.updateStatus('Audio generation completed.', 'success');
                                this.elements.mergeButton.disabled = false;
                            }
                            this.manager.saveProjects();
                        } catch (err) {
                            console.error('Invalid JSON:', message);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            this.updateBlockStatus(blockData.id, 'failed');
            throw error;
        }
    }

    processText(text) {
        // Replace parentheses with commas
        text = text.replace(/\(([^)]+)\)/g, ',$1,');

        // Replace acronyms with full-length words
        const acronymMap = [
            { regex: /\bi\.e\.\b/gi, replacement: 'that is' },
            { regex: /\bie\b/gi, replacement: 'that is' },
            { regex: /\be\.g\.\b/gi, replacement: 'for example' },
            { regex: /\beg\b/gi, replacement: 'for example' },
            { regex: /\betc\.\b/gi, replacement: 'and so on' },
            { regex: /\betc\b/gi, replacement: 'and so on' }
        ];

        acronymMap.forEach(({ regex, replacement }) => {
            text = text.replace(regex, replacement);
        });

        return text.replace(/-/g, ' ')
                  .replace(/:/g, ',')
                  .replace(/[""]/g, '"')
                  .replace(/['']/g, "'")
                  .replace(/ {2,}/g, ' ')
                  .replace(/,{2,}/g, ',')
                  .replace(/\b[A-Z]{5,}\b/g, word => word.toLowerCase());
    }

    splitTextIntoChunks(text, maxChars = 400) {
        const sentences = text.match(/[^.!?]+[.!?]/g) || [];
        const chunks = [];
        let currentChunk = '';

        sentences.forEach(sentence => {
            if ((currentChunk + sentence).length <= maxChars) {
                currentChunk += sentence + ' ';
            } else {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = sentence + ' ';
            }
        });

        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks;
    }

    generateUniqueId() {
        return `chunk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    updateStatus(message, type = 'info') {
        this.elements.status.textContent = `Status: ${message}`;
        this.elements.status.className = `alert alert-${type}`;
        
        const progress = type === 'success' ? 100 : 
                        type === 'error' ? 0 : 
                        message.includes('Generating') ? 50 : 25;
        
        this.updateProgressBar(progress);
    }

    updateProgressBar(progress) {
        this.elements.progressBar.style.width = `${progress}%`;
        this.elements.progressBar.textContent = `${progress}%`;
        this.elements.progressBar.className = `progress-bar bg-${
            progress === 100 ? 'success' : 
            progress > 60 ? 'info' : 
            progress > 30 ? 'warning' : 'danger'
        }`;
    }

    updateBlockStatus(id, status) {
        const block = this.elements.blockList.querySelector(`[data-id="${id}"]`);
        if (block) {
            block.dataset.status = status;
            const badge = block.querySelector('.badge');
            badge.className = `badge bg-${
                status === 'completed' ? 'success' : 
                status === 'failed' ? 'danger' : 'warning'
            } ms-2`;
            badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
    }

    toggleMode() {
        const isListeningMode = this.elements.modeToggle.checked;
        this.elements.textInput.disabled = isListeningMode;
        this.elements.speakButton.disabled = isListeningMode;
        this.updateStatus(
            isListeningMode ? 'Listening mode activated.' : 'Generation mode activated.',
            'info'
        );
    }

    // Initialize the application
    static init() {
        const app = new AudiobookGenerator();
        window.audiobookApp = app; // For debugging purposes
    }

    addBlockToUI(id, text, status = 'pending') {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.dataset.id = id;
        li.dataset.text = text;
        li.dataset.status = status;
        li.draggable = true;

        // Main content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-grow-1 me-3';
        contentDiv.textContent = text;

        // Controls container
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'd-flex align-items-center';

        // Status badge
        const badge = document.createElement('span');
        badge.className = `badge bg-${status === 'completed' ? 'success' : status === 'failed' ? 'danger' : 'warning'} me-2`;
        badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);

        // Button group
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group btn-group-sm';

        // Play button
        const playBtn = document.createElement('button');
        playBtn.className = 'btn btn-outline-primary';
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.onclick = () => this.playChunkById(id);

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-outline-secondary';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.onclick = () => this.editChunk(id);

        // Regenerate button
        const regenerateBtn = document.createElement('button');
        regenerateBtn.className = 'btn btn-outline-warning';
        regenerateBtn.innerHTML = '<i class="fas fa-sync"></i>';
        regenerateBtn.onclick = () => this.regenerateChunk(id);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-outline-danger';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => this.deleteChunk(id);

        // Add buttons to group
        btnGroup.appendChild(playBtn);
        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(regenerateBtn);
        btnGroup.appendChild(deleteBtn);

        // Assemble controls
        controlsDiv.appendChild(badge);
        controlsDiv.appendChild(btnGroup);

        // Add everything to li
        li.appendChild(contentDiv);
        li.appendChild(controlsDiv);

        // Add drag and drop handlers
        li.addEventListener('dragstart', (e) => {
            li.classList.add('dragging');
            e.dataTransfer.setData('text/plain', id);
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            this.updateChunksOrder();
        });

        this.elements.blockList.appendChild(li);
    }

    playChunkById(id) {
        const chunkIndex = this.manager.currentProject.chunks.findIndex(c => c.id === id);
        if (chunkIndex !== -1) {
            this.currentChunkIndex = chunkIndex;
            this.playChunk(chunkIndex);
        }
    }

    updateChunksOrder() {
        if (!this.manager.currentProject) return;

        const newOrder = Array.from(this.elements.blockList.children).map(li => {
            const id = li.dataset.id;
            return this.manager.currentProject.chunks.find(c => c.id === id);
        });

        this.manager.currentProject.chunks = newOrder;
        this.manager.saveProjects();
    }

    async mergeAudioChunks() {
        if (!this.manager.currentProject || this.manager.currentProject.chunks.length === 0) {
            alert('No audio chunks available to merge.');
            return;
        }

        this.updateStatus('Merging audio chunks...', 'info');
        this.elements.mergeButton.disabled = true;

        try {
            const response = await fetch('/merge_audiobook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio_paths: this.manager.currentProject.chunks.map(c => c.audioPath),
                    project_id: this.manager.currentProject.id
                })
            });

            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

            const data = await response.json();
            if (data.merged_path) {
                this.elements.downloadButton.href = data.merged_path;
                this.elements.downloadButton.download = `${this.manager.currentProject.name}_audiobook.mp3`;
                this.elements.downloadButton.disabled = false;
                this.updateStatus('Audio chunks merged successfully.', 'success');
            } else {
                throw new Error('Merging failed.');
            }
        } catch (error) {
            console.error('Error:', error);
            this.updateStatus('Failed to merge audio chunks.', 'danger');
        } finally {
            this.elements.mergeButton.disabled = false;
        }
    }

    loadProjects() {
        this.updateProjectsList();
    }

    async regenerateChunk(id) {
        const chunk = this.manager.currentProject.chunks.find(c => c.id === id);
        if (!chunk) return;
    
        try {
            this.updateStatus(`Regenerating chunk: ${chunk.text.substring(0, 30)}...`, 'info');
            this.updateBlockStatus(id, 'pending');
    
            const blockData = {
                id: chunk.id,
                text: chunk.text,
                status: 'pending',
                projectPath: `audiobooks/${this.manager.currentProject.id}`
            };
    
            await this.sendMessageBook(blockData);
            this.updateStatus('Chunk regenerated successfully.', 'success');
        } catch (error) {
            console.error('Error regenerating chunk:', error);
            this.updateStatus('Failed to regenerate chunk.', 'danger');
            this.updateBlockStatus(id, 'failed');
        }
    }
    
    async editChunk(id) {
        const chunk = this.manager.currentProject.chunks.find(c => c.id === id);
        if (!chunk) return;
    
        const newText = prompt('Edit text:', chunk.text);
        if (newText && newText !== chunk.text) {
            chunk.text = this.processText(newText.trim());
            this.updateBlockUI(id, chunk.text);
            await this.regenerateChunk(id);
        }
    }
    
    updateBlockUI(id, text) {
        const block = this.elements.blockList.querySelector(`[data-id="${id}"]`);
        if (block) {
            block.querySelector('.flex-grow-1').textContent = text;
        }
    }
    
    deleteChunk(id) {
        if (!confirm('Are you sure you want to delete this chunk?')) return;
    
        const index = this.manager.currentProject.chunks.findIndex(c => c.id === id);
        if (index !== -1) {
            this.manager.currentProject.chunks.splice(index, 1);
            const block = this.elements.blockList.querySelector(`[data-id="${id}"]`);
            if (block) block.remove();
            this.manager.saveProjects();
        }
    }
    
    async playChunk(index) {
        if (!this.manager.currentProject || !this.manager.currentProject.chunks[index]) return;
    
        const chunk = this.manager.currentProject.chunks[index];
        this.currentChunkIndex = index;
    
        try {
            // Stop current playback
            this.elements.audioPlayer.pause();
            
            // Update UI to show loading state
            this.highlightCurrentChunk(chunk.id);
            this.updateStatus(`Loading chunk ${index + 1}/${this.manager.currentProject.chunks.length}...`, 'info');
    
            // Set new source and play
            this.elements.audioPlayer.src = chunk.audioPath;
            await this.elements.audioPlayer.play();
            
            // Update UI for playing state
            this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.updateStatus(`Playing chunk ${index + 1}/${this.manager.currentProject.chunks.length}`, 'info');
    
            // Setup ended event for automatic next chunk playback
            this.elements.audioPlayer.onended = () => {
                if (this.currentChunkIndex < this.manager.currentProject.chunks.length - 1) {
                    this.playChunk(this.currentChunkIndex + 1);
                } else {
                    this.updateStatus('Playback completed', 'success');
                    this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            };
        } catch (error) {
            console.error('Error playing chunk:', error);
            this.updateStatus('Failed to play chunk', 'danger');
        }
    }
    
    async generateSpeech() {
        if (!this.manager.currentProject) {
            alert('Please select or create a project first.');
            return;
        }
    
        let text = this.elements.textInput.value.trim();
        if (!text) {
            alert('Please enter some text to generate speech.');
            return;
        }
    
        text = this.processText(text);
        this.elements.blockList.innerHTML = '';
        this.playbackQueue = [];
        this.elements.downloadButton.disabled = true;
        this.elements.mergeButton.disabled = true;
    
        this.updateStatus('Processing text...', 'info');
        const chunks = this.splitTextIntoChunks(text);
        const projectPath = `audiobooks/${this.manager.currentProject.id}`;
    
        // Clear existing chunks
        this.manager.currentProject.chunks = [];
    
        for (let [index, chunk] of chunks.entries()) {
            const id = this.generateUniqueId();
            const blockData = {
                id,
                text: chunk,
                status: 'pending',
                projectPath
            };
            
            this.manager.currentProject.chunks.push(blockData);
            this.addBlockToUI(id, chunk);
            
            try {
                this.updateStatus(`Generating chunk ${index + 1}/${chunks.length}...`, 'info');
                await this.sendMessageBook(blockData);
                
                // Auto-play first chunk when it's ready
                if (index === 0 && blockData.status === 'completed') {
                    this.playChunk(0);
                }
            } catch (error) {
                console.error('Error generating speech for chunk:', error);
                this.updateStatus(`Failed to generate chunk ${index + 1}`, 'danger');
            }
        }
    
        this.manager.saveProjects();
        this.elements.mergeButton.disabled = false;
        this.updateStatus('All chunks generated successfully', 'success');
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    AudiobookGenerator.init();
});