var messageIdCounter = 0;
var currentAttachments = [];

// Panel Management Functions
const togglePanel = (panelName) => {
    const panels = document.querySelectorAll('.popup-panel');
    panels.forEach(panel => {
        panel.id === `${panelName}Panel` ? panel.classList.toggle('active') : panel.classList.remove('active');
    });
    const overlay = document.getElementById('overlay');
    const currentPanel = document.getElementById(`${panelName}Panel`);
    overlay.classList.toggle('active', currentPanel.classList.contains('active'));
};

const closeAllPanels = () => {
    document.querySelectorAll('.popup-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('overlay').classList.remove('active');
};

// Modal Management Functions
const showCallModal = () => new bootstrap.Modal(document.getElementById('callModal'), 
    { backdrop: 'static', keyboard: false }).show();

const endCall = () => {
    resetCallUI();
    bootstrap.Modal.getInstance(document.getElementById('callModal')).hide();
};

// Toggle Top Menu Visibility
const toggleFloatingMenu = () => document.getElementById('floatingMenu').classList.toggle('visible');

// Add attachment handling functions
const handleFileAttachment = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*,video/*,audio/*,text/*';
    
    fileInput.onchange = (e) => {
        const files = Array.from(e.target.files);
        currentAttachments = files;
        updateAttachmentIndicator();
    };
    
    fileInput.click();
};

const updateAttachmentIndicator = () => {
    const attachButton = document.querySelector('.attach-button');
    const messageInput = document.getElementById('messageInput');
    
    if (currentAttachments.length > 0) {
        attachButton.classList.add('has-attachments');
        attachButton.innerHTML = `<i class="fas fa-paperclip"></i> ${currentAttachments.length}`;
        messageInput.placeholder = `Message Yuna... (${currentAttachments.length} files attached)`;
    } else {
        attachButton.classList.remove('has-attachments');
        attachButton.innerHTML = `<i class="fas fa-paperclip"></i>`;
        messageInput.placeholder = 'Message Yuna...';
    }
};

// file to base64 converter
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// messageManager Class
class messageManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    generateUniqueId() {
        return `msg-${Date.now()}-${messageIdCounter++}`;
    }

    renderMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.id = this.generateUniqueId();
        msgDiv.className = `message message-${message.sender === 'Yuna' ? 'ai' : 'user'}`;

        const { src, description, render = true, type } = message.data || {};
        const createMediaElement = (tag, src, type) => {
            const media = document.createElement(tag);
            media.src = src;
            media.classList.add('message-media');
            media.controls = type === 'video';
            media.addEventListener('click', () => openMediaModal(src, type));
            return media;
        };

        if (['image', 'multiimage', 'video', 'mixed-text', 'yunafile'].includes(message.type)) {
            if (!render) {
                msgDiv.textContent = description;
            } else {
                switch (message.type) {
                    case 'image':
                        msgDiv.appendChild(createMediaElement('img', src, 'image'));
                        break;
                    case 'multiimage':
                        message.data.src.forEach(s => msgDiv.appendChild(createMediaElement('img', s, 'image')));
                        break;
                    case 'video':
                        msgDiv.appendChild(createMediaElement('video', src, 'video'));
                        break;
                    case 'mixed-text':
                        msgDiv.innerHTML = message.text.replace(/\n/g, '<br>');
                        if (render && ['image', 'multiimage', 'video', 'yunafile'].includes(type)) {
                            msgDiv.appendChild(createMediaElement(type === 'video' ? 'video' : 'img', src, type));
                        }
                        break;
                    case 'yunafile':
                        const fileLink = document.createElement('a');
                        fileLink.href = src;
                        fileLink.download = description;
                        fileLink.classList.add('file-link');
                        fileLink.innerHTML = `<i class="fas fa-file-download"></i> ${description}`;
                        msgDiv.appendChild(fileLink);
                        break;
                }
            }
        } else {
            msgDiv.textContent = message.text;
        }

        this.container.appendChild(msgDiv);
        this.container.scrollTop = this.container.scrollHeight;
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        
        if (!text && currentAttachments.length === 0) return;

        const processFiles = async (asMixed) => {
            try {
                if (currentAttachments.length === 0) return null;

                const files = await Promise.all(
                    currentAttachments.map(file => fileToBase64(file))
                );

                // Determine message type and structure
                if (asMixed) {
                    return {
                        sender: 'User',
                        type: 'mixed-text',
                        data: {
                            src: currentAttachments.length > 1 ? files : files[0],
                            description: currentAttachments[0].name,
                            type: currentAttachments.length > 1 ? 'multiimage' : 
                                  currentAttachments[0].type.startsWith('image/') ? 'image' :
                                  currentAttachments[0].type.startsWith('video/') ? 'video' : 'yunafile',
                            render: true
                        },
                        text
                    };
                }

                // Handle single file types
                const firstFile = currentAttachments[0];
                if (firstFile.type.startsWith('image/')) {
                    return {
                        sender: 'User',
                        type: currentAttachments.length > 1 ? 'multiimage' : 'image',
                        data: {
                            src: currentAttachments.length > 1 ? files : files[0],
                            description: firstFile.name,
                            render: true
                        }
                    };
                } else if (firstFile.type.startsWith('video/')) {
                    return {
                        sender: 'User',
                        type: 'video',
                        data: {
                            src: files[0],
                            description: firstFile.name,
                            render: true
                        }
                    };
                } else {
                    return {
                        sender: 'User',
                        type: 'yunafile',
                        data: {
                            src: files[0],
                            description: firstFile.name,
                            render: true
                        }
                    };
                }
            } catch (error) {
                console.error('Error processing files:', error);
                alert('Failed to process files');
                return null;
            }
        };

        if (currentAttachments.length > 0) {
            const message = await processFiles(text ? confirm('Send as mixed message with text?') : false);
            if (message) {
                this.renderMessage(message);
                currentAttachments = [];
                updateAttachmentIndicator();
                input.value = '';

                fetch('/message', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: message,
                        chatId: chatHistoryManagerInstance.selectedFilename,
                        useHistory: true, // document.getElementById('useHistory').checked,
                        kanojo: kanojoManagerInstance.buildPrompt(kanojoManagerInstance.selectedKanojo, promptManagerInstance.getTemplate(promptManagerInstance.selectedTemplate)),
                        speech: false,
                        yunaConfig: config_data,
                        stream: false
                    })
                })
                .then(response => response.json())
                .then(data => this.renderMessage({ 
                    sender: 'Yuna', 
                    type: 'text', 
                    text: data.reply 
                }))
                .catch(error => console.error('Error:', error));
            }
            return;
        }

        // Normal text message handling
        const userMsg = { sender: 'User', type: 'text', text };
        this.renderMessage(userMsg);
        input.value = '';

        fetch('/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: userMsg,
                chatId: chatHistoryManagerInstance.selectedFilename,
                useHistory: document.getElementById('useHistory').checked,
                kanojo: kanojoManagerInstance.buildPrompt(kanojoManagerInstance.selectedKanojo, promptManagerInstance.getTemplate(promptManagerInstance.selectedTemplate)),
                speech: false,
                yunaConfig: config_data,
                stream: false
            })
        })
        .then(response => response.json())
        .then(data => this.renderMessage({ 
            sender: 'Yuna', 
            type: 'text', 
            text: data.reply 
        }))
        .catch(error => console.error('Error:', error));
    }
}

const messageManagerInstance = new messageManager('chatContainer');
document.querySelector('.attach-button').addEventListener('click', handleFileAttachment);

// Event listener for sending message on Enter key
document.getElementById('messageInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        messageManagerInstance.sendMessage();
    }
});

// Save Advanced Config
const saveAdvancedConfig = () => {
    const config = {
        maxNewTokens: document.getElementById('maxNewTokens').value,
        contextLength: document.getElementById('contextLength').value,
        temperature: document.getElementById('temperature').value,
        topP: document.getElementById('topP').value
    };
    fetch('/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error('Error:', error));
};

// File Modal Submit
document.getElementById('fileSubmit').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return alert('No file selected.');

    const reader = new FileReader();
    reader.onload = () => {
        const kanojoData = JSON.parse(reader.result);
        // Send to server
        fetch('/import-kanojo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(kanojoData)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fileInput.value = '';
        })
        .catch(error => console.error('Error:', error));
    };
    reader.readAsText(file);
});

// Send Message Function
const sendMessage = () => {
    messageManagerInstance.sendMessage();
};

// Media Modal Function
const openMediaModal = (src, type) => {
    let modal = document.getElementById('mediaModal') || (() => {
        const m = document.createElement('div');
        m.id = 'mediaModal';
        m.className = 'modal fade';
        m.tabIndex = -1;
        m.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-xl">
                <div class="modal-content">
                    <div class="modal-body">
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        <div class="media-content"></div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(m);
        return m;
    })();

    const element = document.createElement(type === 'image' ? 'img' : 'video');
    element.src = src;
    element.className = 'modal-media';
    if (type === 'video') element.controls = true;

    modal.querySelector('.media-content').replaceChildren(element);
    new bootstrap.Modal(modal).show();
};

// Make floating audio window draggable
const makeDraggable = el => {
    let pos = { x: 0, y: 0 };

    const dragMouseDown = e => {
        e.preventDefault();
        pos = { x: e.clientX, y: e.clientY };
        document.addEventListener('mouseup', closeDragElement);
        document.addEventListener('mousemove', elementDrag);
    };

    const elementDrag = e => {
        e.preventDefault();
        el.style.top = `${el.offsetTop + (e.clientY - pos.y)}px`;
        el.style.left = `${el.offsetLeft + (e.clientX - pos.x)}px`;
        pos = { x: e.clientX, y: e.clientY };
    };

    const closeDragElement = () => {
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
    };

    el.addEventListener('mousedown', dragMouseDown);
};

// Switch to Audio Call Mode
const switchToAudio = () => {
    const audioWindow = document.createElement('div');
    audioWindow.className = 'floating-audio-window active';
    audioWindow.id = 'audioWindow';
    audioWindow.innerHTML = `
        <div class="controls-bar">
            <button class="control-button" aria-label="Mute/Unmute Microphone"><i class="fas fa-microphone"></i></button>
            <button class="control-button" aria-label="End Call" onclick="endAudioCall()">
                <i class="fas fa-phone-slash"></i>
            </button>
        </div>
    `;
    document.body.appendChild(audioWindow);
    makeDraggable(audioWindow);
    bootstrap.Modal.getInstance(document.getElementById('callModal')).hide();
};

// End Audio Call Function and Reset Call UI
const endAudioCall = () => {
    const audioWindow = document.getElementById('audioWindow');
    if (audioWindow) audioWindow.remove();
};

// Handle End Call from Floating Audio Window
document.body.addEventListener('click', (e) => {
    if (e.target.closest('.floating-audio-window .fa-phone-slash')) endAudioCall();
});

// Initialize draggable audio window
document.addEventListener('DOMNodeInserted', (event) => {
    if (event.target.id === 'audioWindow') makeDraggable(event.target);
});

// Initialize draggable elements
const initializeDraggables = () => {
    document.querySelectorAll('.floating-audio-window').forEach(makeDraggable);
};

// Run on DOM load
document.addEventListener('DOMContentLoaded', initializeDraggables);