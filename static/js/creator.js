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
        Object.assign(this, { id, name, chunks, currentTime, path: `static/audio/audiobooks/${id}` });
    }

    toJSON() {
        const { id, name, chunks, currentTime } = this;
        return { id, name, chunks, currentTime };
    }

    static fromJSON(json) {
        return new AudiobookProject(json.id, json.name, json.chunks, json.currentTime);
    }
}

class AudiobookManager {
    constructor() {
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
            JSON.parse(saved).forEach(p => {
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
        this.currentChunkIndex = 0;
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadProjects();
    }

    cacheElements() {
        const ids = [
            'textInput', 'audioPlayer', 'status', 'progressBar', 'blockList', 'mergeButton',
            'downloadButton', 'speakButton', 'modeToggle', 'projectSelect', 'newProjectBtn',
            'deleteProjectBtn', 'currentProject', 'timeSlider', 'currentTime', 'duration',
            'playPauseBtn', 'stopBtn', 'prevChunkBtn', 'nextChunkBtn', 'moveUpBtn', 'moveDownBtn'
        ];
        this.elements = {};
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    bindEvents() {
        const E = this.elements;
        // Project Management
        E.newProjectBtn.addEventListener('click', () => this.createNewProject());
        E.projectSelect.addEventListener('change', e => this.loadProject(e.target.value));
        E.deleteProjectBtn.addEventListener('click', () => this.deleteCurrentProject());

        // Audio Controls
        E.audioPlayer.addEventListener('timeupdate', () => this.updateTimeDisplay());
        E.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        E.timeSlider.addEventListener('input', e => this.seekTo(e.target.value));
        E.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        E.stopBtn.addEventListener('click', () => this.stopPlayback());
        E.prevChunkBtn.addEventListener('click', () => this.playPreviousChunk());
        E.nextChunkBtn.addEventListener('click', () => this.playNextChunk());

        // Main Controls
        E.speakButton.addEventListener('click', () => this.generateSpeech());
        E.mergeButton.addEventListener('click', () => this.mergeAudioChunks());
        E.downloadButton.addEventListener('click', () => this.downloadMergedAudio());
        E.modeToggle.addEventListener('change', () => this.toggleMode());

        // Drag and Drop for Block List
        E.blockList.addEventListener('dragover', e => this.onDragOver(e));
        E.blockList.addEventListener('drop', () => this.updateChunksOrder());
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
        await fetch('/create_project_directory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId })
        }).catch(console.error);
    }

    updateProjectsList() {
        const { projectSelect } = this.elements;
        projectSelect.innerHTML = '<option value="">Select Project</option>';
        this.manager.projects.forEach(project => {
            const option = new Option(project.name, project.id);
            projectSelect.add(option);
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
        const { currentProject } = this.manager;
        if (!currentProject) return;
        this.elements.blockList.innerHTML = '';
        currentProject.chunks.forEach(chunk => {
            this.addBlockToUI(chunk.id, chunk.text, chunk.status);
        });
    }

    deleteCurrentProject() {
        const { currentProject } = this.manager;
        if (currentProject && confirm(`Delete project "${currentProject.name}"?`)) {
            this.manager.deleteProject(currentProject.id);
            this.manager.currentProject = null;
            this.elements.currentProject.textContent = 'No Project Selected';
            this.elements.deleteProjectBtn.disabled = true;
            this.updateProjectsList();
            this.elements.blockList.innerHTML = '';
        }
    }

    updateTimeDisplay() {
        const { audioPlayer, currentTime, timeSlider } = this.elements;
        const current = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        currentTime.textContent = this.formatTime(current);
        timeSlider.value = (current / duration) * 100;
    }

    updateDuration() {
        const { audioPlayer, duration } = this.elements;
        duration.textContent = this.formatTime(audioPlayer.duration);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${secs}`;
    }

    seekTo(value) {
        const { audioPlayer } = this.elements;
        audioPlayer.currentTime = (value / 100) * audioPlayer.duration;
    }

    togglePlayPause() {
        const { audioPlayer, playPauseBtn } = this.elements;
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    stopPlayback() {
        const { audioPlayer, playPauseBtn } = this.elements;
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    playPreviousChunk() {
        if (this.currentChunkIndex > 0) this.playChunk(--this.currentChunkIndex);
    }

    playNextChunk() {
        if (this.currentChunkIndex < this.manager.currentProject.chunks.length - 1)
            this.playChunk(++this.currentChunkIndex);
    }

    highlightCurrentChunk(id) {
        const blocks = this.elements.blockList.querySelectorAll('.list-group-item');
        blocks.forEach(block => {
            block.classList.toggle('active', block.dataset.id === id);
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
                        const data = JSON.parse(message);
                        if (data.audio_path && data.id === blockData.id) {
                            const chunk = this.manager.currentProject.chunks.find(c => c.id === data.id);
                            if (chunk) {
                                Object.assign(chunk, { audioPath: data.audio_path, status: 'completed' });
                                this.updateBlockStatus(data.id, 'completed');
                            }
                        }
                        if (data.status === 'complete') {
                            this.updateStatus('Audio generation completed.', 'success');
                            this.elements.mergeButton.disabled = false;
                        }
                        this.manager.saveProjects();
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
        return text
            .replace(/\(([^)]+)\)/g, ',$1,')
            .replace(/\bi\.?e\.?\b/gi, 'that is')
            .replace(/\be\.?g\.?\b/gi, 'for example')
            .replace(/\betc\.?\b/gi, 'and so on')
            .replace(/-/g, ' ')
            .replace(/:/g, ',')
            .replace(/["']/g, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/,{2,}/g, ',')
            .replace(/\b[A-Z]{5,}\b/g, word => word.toLowerCase());
    }

    splitTextIntoChunks(text, maxChars = 400) {
        const sentences = text.match(/[^.!?]+[.!?]/g) || [text];
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
        const { status } = this.elements;
        status.textContent = `Status: ${message}`;
        status.className = `alert alert-${type}`;
        const progress = type === 'success' ? 100 : type === 'danger' ? 0 : 50;
        this.updateProgressBar(progress);
    }

    updateProgressBar(progress) {
        const { progressBar } = this.elements;
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress}%`;
        progressBar.className = `progress-bar bg-${progress === 100 ? 'success' : progress > 50 ? 'info' : 'warning'}`;
    }

    updateBlockStatus(id, status) {
        const block = this.elements.blockList.querySelector(`[data-id="${id}"]`);
        if (block) {
            block.dataset.status = status;
            const badge = block.querySelector('.badge');
            badge.className = `badge bg-${status === 'completed' ? 'success' : status === 'failed' ? 'danger' : 'warning'} me-2`;
            badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
    }

    toggleMode() {
        const { modeToggle, textInput, speakButton } = this.elements;
        const isListeningMode = modeToggle.checked;
        textInput.disabled = isListeningMode;
        speakButton.disabled = isListeningMode;
        this.updateStatus(isListeningMode ? 'Listening mode activated.' : 'Generation mode activated.', 'info');
    }

    static init() {
        new AudiobookGenerator();
    }

    addBlockToUI(id, text, status = 'pending') {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        Object.assign(li.dataset, { id, text, status });
        li.draggable = true;
        li.innerHTML = `
            <div class="flex-grow-1 me-3">${text}</div>
            <div class="d-flex align-items-center">
                <span class="badge bg-${status === 'completed' ? 'success' : status === 'failed' ? 'danger' : 'warning'} me-2">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary"><i class="fas fa-play"></i></button>
                    <button class="btn btn-outline-secondary"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-outline-warning"><i class="fas fa-sync"></i></button>
                    <button class="btn btn-outline-danger"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        const [playBtn, editBtn, regenBtn, delBtn] = li.querySelectorAll('.btn');
        playBtn.onclick = () => this.playChunkById(id);
        editBtn.onclick = () => this.editChunk(id);
        regenBtn.onclick = () => this.regenerateChunk(id);
        delBtn.onclick = () => this.deleteChunk(id);
        li.addEventListener('dragstart', e => {
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
        const index = this.manager.currentProject.chunks.findIndex(c => c.id === id);
        if (index !== -1) this.playChunk(index);
    }

    updateChunksOrder() {
        const chunks = Array.from(this.elements.blockList.children).map(li => {
            return this.manager.currentProject.chunks.find(c => c.id === li.dataset.id);
        });
        this.manager.currentProject.chunks = chunks;
        this.manager.saveProjects();
    }

    async mergeAudioChunks() {
        const { currentProject } = this.manager;
        if (!currentProject || currentProject.chunks.length === 0) {
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
                    audio_paths: currentProject.chunks.map(c => c.audioPath),
                    project_id: currentProject.id
                })
            });
            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
            const data = await response.json();
            if (data.merged_path) {
                const { downloadButton } = this.elements;
                downloadButton.href = data.merged_path;
                downloadButton.download = `${currentProject.name}_audiobook.mp3`;
                downloadButton.disabled = false;
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
        if (confirm('Are you sure you want to delete this chunk?')) {
            this.manager.currentProject.chunks = this.manager.currentProject.chunks.filter(c => c.id !== id);
            this.elements.blockList.querySelector(`[data-id="${id}"]`)?.remove();
            this.manager.saveProjects();
        }
    }

    async playChunk(index) {
        const chunk = this.manager.currentProject.chunks[index];
        if (!chunk) return;
        this.currentChunkIndex = index;
        try {
            const { audioPlayer, playPauseBtn } = this.elements;
            audioPlayer.pause();
            this.highlightCurrentChunk(chunk.id);
            this.updateStatus(`Loading chunk ${index + 1}/${this.manager.currentProject.chunks.length}...`, 'info');
            audioPlayer.src = chunk.audioPath;
            await audioPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.updateStatus(`Playing chunk ${index + 1}/${this.manager.currentProject.chunks.length}`, 'info');
            audioPlayer.onended = () => {
                if (this.currentChunkIndex < this.manager.currentProject.chunks.length - 1) {
                    this.playChunk(++this.currentChunkIndex);
                } else {
                    this.updateStatus('Playback completed', 'success');
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
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
        this.elements.downloadButton.disabled = true;
        this.elements.mergeButton.disabled = true;
        this.updateStatus('Processing text...', 'info');
        const chunks = this.splitTextIntoChunks(text);
        const projectPath = `audiobooks/${this.manager.currentProject.id}`;
        this.manager.currentProject.chunks = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const id = this.generateUniqueId();
            const blockData = { id, text: chunk, status: 'pending', projectPath };
            this.manager.currentProject.chunks.push(blockData);
            this.addBlockToUI(id, chunk);
            try {
                this.updateStatus(`Generating chunk ${i + 1}/${chunks.length}...`, 'info');
                await this.sendMessageBook(blockData);
                if (i === 0 && blockData.status === 'completed') this.playChunk(0);
            } catch (error) {
                console.error('Error generating speech for chunk:', error);
                this.updateStatus(`Failed to generate chunk ${i + 1}`, 'danger');
            }
        }
        this.manager.saveProjects();
        this.elements.mergeButton.disabled = false;
        this.updateStatus('All chunks generated successfully', 'success');
    }

    onDragOver(e) {
        e.preventDefault();
        const { blockList } = this.elements;
        const afterElement = this.getDragAfterElement(blockList, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement) {
            blockList.insertBefore(draggable, afterElement);
        } else {
            blockList.appendChild(draggable);
        }
    }

    getDragAfterElement(container, y) {
        const elements = [...container.querySelectorAll('.list-group-item:not(.dragging)')];
        return elements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    AudiobookGenerator.init();
});