var messageIdCounter = 0;
var currentAttachments = [];

// Panel Management
const togglePanel = (panelName) => {
    const id = `${panelName}Panel`;
    document.querySelectorAll('.popup-panel').forEach(p => {
        p.id === id ? p.classList.toggle('active') : p.classList.remove('active');
    });
    const overlay = document.getElementById('overlay');
    const currentPanel = document.getElementById(id);
    overlay && overlay.classList.toggle('active', currentPanel?.classList.contains('active'));
};

const closeAllPanels = () => {
    document.querySelectorAll('.popup-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('overlay')?.classList.remove('active');
};

// Modals
const showCallModal = () =>
    new bootstrap.Modal(document.getElementById('callModal'), { backdrop: 'static', keyboard: false }).show();

const endCall = () => {
    try { typeof resetCallUI === 'function' && resetCallUI(); } catch (e) {}
    const modal = bootstrap.Modal.getInstance(document.getElementById('callModal'));
    modal && modal.hide();
};

// Top Menu
const toggleFloatingMenu = () => document.getElementById('floatingMenu')?.classList.toggle('visible');

// Attachments
const handleFileAttachment = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*,video/*,audio/*,text/*';
    fileInput.onchange = (e) => {
        currentAttachments = Array.from(e.target.files || []);
        updateAttachmentIndicator();
    };
    fileInput.click();
};

const updateAttachmentIndicator = () => {
    const attachButton = document.querySelector('.attach-button');
    const messageInput = document.getElementById('messageInput');
    if (!attachButton || !messageInput) return;
    if (currentAttachments.length > 0) {
        attachButton.classList.add('has-attachments');
        attachButton.innerHTML = `<i class="bi-paperclip"></i> ${currentAttachments.length}`;
        messageInput.placeholder = `Message Yuna... (${currentAttachments.length} files attached)`;
    } else {
        attachButton.classList.remove('has-attachments');
        attachButton.innerHTML = `<i class="bi-paperclip"></i>`;
        messageInput.placeholder = 'Message Yuna...';
    }
};

const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

// Message Manager
class messageManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    generateUniqueId() {
        return `msg-${Date.now()}-${messageIdCounter++}`;
    }

    renderMessage(message) {
        if (!message.id) message.id = this.generateUniqueId();

        const msgDiv = document.createElement('div');
        msgDiv.id = message.id;
        msgDiv.className = `message message-${message.name === 'Yuna' ? 'ai' : 'user'}`;

        const actionButtons = document.createElement('div');
        actionButtons.className = 'message-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '<i class="bi-trash"></i>';
        deleteBtn.title = 'Delete message';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteMessage(message.id);
        };

        if (message.name !== 'Yuna') {
            const regenerateBtn = document.createElement('button');
            regenerateBtn.className = 'action-btn regenerate-btn';
            regenerateBtn.innerHTML = '<i class="bi-arrow-clockwise"></i>';
            regenerateBtn.title = 'Regenerate response';
            regenerateBtn.onclick = (e) => {
                e.stopPropagation();
                this.regenerateMessage(message.id);
            };
            actionButtons.appendChild(regenerateBtn);
        }
        actionButtons.appendChild(deleteBtn);

        const createMediaElement = (tag, src, type) => {
            const media = document.createElement(tag);
            media.src = src;
            media.classList.add('message-media');
            if (type === 'video') media.controls = true;
            media.addEventListener('click', () => openMediaModal(src, type));
            return media;
        };

        if (['image', 'multiimage', 'video', 'mixed-text', 'yunafile'].includes(message.type)) {
            const { src, description, render = true, type } = message.data || {};
            if (!render) {
                msgDiv.textContent = description;
            } else {
                switch (message.type) {
                    case 'image':
                        msgDiv.appendChild(createMediaElement('img', src, 'image'));
                        break;
                    case 'multiimage':
                        (Array.isArray(message.data.src) ? message.data.src : [message.data.src]).forEach(s => msgDiv.appendChild(createMediaElement('img', s, 'image')));
                        break;
                    case 'video':
                        msgDiv.appendChild(createMediaElement('video', src, 'video'));
                        break;
                    case 'mixed-text':
                        msgDiv.innerHTML = (message.text || '').replace(/\n/g, '<br>');
                        if (render && ['image', 'multiimage', 'video', 'yunafile'].includes(type)) {
                            msgDiv.appendChild(createMediaElement(type === 'video' ? 'video' : 'img', src, type));
                        }
                        break;
                    case 'yunafile':
                        const fileLink = document.createElement('a');
                        fileLink.href = src;
                        fileLink.download = description;
                        fileLink.classList.add('file-link');
                        fileLink.innerHTML = `<i class="bi-file-earmark-arrow-down"></i> ${description}`;
                        msgDiv.appendChild(fileLink);
                        break;
                }
            }
        } else {
            msgDiv.textContent = message.text || '';
        }

        msgDiv.appendChild(actionButtons);
        this.container.appendChild(msgDiv);
        this.container.scrollTop = this.container.scrollHeight;
        return message.id;
    }

    async sendMessage() {
        const input = document.getElementById('messageInput');
        const text = (input?.value || '').trim();
        if (!text && currentAttachments.length === 0) return;

        const processFiles = async (asMixed) => {
            try {
                if (!currentAttachments.length) return null;
                const files = await Promise.all(currentAttachments.map(fileToBase64));
                const first = currentAttachments[0];

                if (asMixed) {
                    return {
                        name: 'User',
                        type: 'mixed-text',
                        data: {
                            src: currentAttachments.length > 1 ? files : files[0],
                            description: first.name,
                            type: currentAttachments.length > 1
                                ? 'multiimage'
                                : first.type.startsWith('image/') ? 'image'
                                : first.type.startsWith('video/') ? 'video'
                                : 'yunafile',
                            render: true
                        },
                        text
                    };
                }

                if (first.type.startsWith('image/')) {
                    return {
                        name: 'User',
                        type: currentAttachments.length > 1 ? 'multiimage' : 'image',
                        data: {
                            src: currentAttachments.length > 1 ? files : files[0],
                            description: first.name,
                            render: true
                        }
                    };
                } else if (first.type.startsWith('video/')) {
                    return {
                        name: 'User',
                        type: 'video',
                        data: { src: files[0], description: first.name, render: true }
                    };
                } else {
                    return {
                        name: 'User',
                        type: 'yunafile',
                        data: { src: files[0], description: first.name, render: true }
                    };
                }
            } catch (err) {
                console.error('Error processing files:', err);
                alert('Failed to process files');
                return null;
            }
        };

        // With attachments
        if (currentAttachments.length > 0) {
            const asMixed = text ? confirm('Send as mixed message with text?') : false;
            const message = await processFiles(asMixed);
            if (!message) return;

            this.renderMessage(message);
            currentAttachments = [];
            updateAttachmentIndicator();
            if (input) input.value = '';

            fetch('/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: message,
                    chat: chatHistoryManagerInstance?.selectedFilename,
                    useHistory: document.getElementById('useHistory')?.checked,
                    kanojo: kanojoManagerInstance?.buildPrompt(kanojoManagerInstance?.selectedKanojo),
                    speech: false,
                    yunaConfig: typeof config_data !== 'undefined' ? config_data : undefined,
                    stream: false
                })
            })
            .then(r => r.json())
            .then(data => this.renderMessage({ name: 'Yuna', type: 'text', text: data.response, data: null }))
            .catch(err => console.error('Error:', err));
            return;
        }

        // Text only
        const userMsg = { name: 'User', type: 'text', text, data: null };
        this.renderMessage(userMsg);
        if (input) input.value = '';

        fetch('/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                chat: chatHistoryManagerInstance?.selectedFilename,
                useHistory: document.getElementById('useHistory')?.checked,
                kanojo: kanojoManagerInstance?.buildPrompt(kanojoManagerInstance?.selectedKanojo),
                speech: false,
                yunaConfig: typeof config_data !== 'undefined' ? config_data : undefined,
                stream: false
            })
        })
        .then(r => r.json())
        .then(data => this.renderMessage({ name: 'Yuna', type: 'text', text: data.response, data: null }))
        .catch(err => console.error('Error:', err));
    }

    async deleteMessage(messageId) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;

        fetch('/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task: 'delete_message',
                chat: chatHistoryManagerInstance?.selectedFilename,
                text: messageId
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.response === 'Message deleted successfully') {
                messageElement.remove();
            } else {
                console.error('Failed to delete message:', data);
            }
        })
        .catch(err => console.error('Error:', err));
    }

    async regenerateMessage(messageId) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;

        let messageText = (messageElement.textContent || '').trim();
        const actionButtonsText = messageElement.querySelector('.message-actions')?.textContent.trim() || '';
        if (actionButtonsText) messageText = messageText.replace(actionButtonsText, '').trim();

        // Remove all messages after this one
        const removedMessages = [];
        let next = messageElement.nextElementSibling;
        while (next) {
            removedMessages.push(next.id);
            const temp = next;
            next = next.nextElementSibling;
            temp.remove();
        }

        const userMsg = { name: 'User', type: 'text', text: messageText, data: null, id: this.generateUniqueId() };
        this.renderMessage(userMsg);

        fetch('/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: messageText,
                chat: chatHistoryManagerInstance?.selectedFilename,
                useHistory: document.getElementById('useHistory')?.checked,
                kanojo: kanojoManagerInstance?.buildPrompt(kanojoManagerInstance?.selectedKanojo),
                speech: false,
                yunaConfig: typeof config_data !== 'undefined' ? config_data : undefined,
                stream: false,
                regenerate: true,
                removedMessages
            })
        })
        .then(r => r.json())
        .then(data => this.renderMessage({
            name: 'Yuna',
            type: 'text',
            text: data.response,
            data: null,
            id: this.generateUniqueId()
        }))
        .catch(err => console.error('Error:', err));
    }
}

const messageManagerInstance = new messageManager('chatContainer');

// Attach-button listener (idempotent binding in case this script loads at different times)
const bindAttachButton = () => {
    const btn = document.querySelector('.attach-button');
    if (btn && !btn.dataset.bound) {
        btn.addEventListener('click', handleFileAttachment);
        btn.dataset.bound = '1';
    }
};
bindAttachButton();
document.addEventListener('DOMContentLoaded', bindAttachButton);

// Advanced Config
const saveAdvancedConfig = () => {
    const config = {
        maxNewTokens: document.getElementById('maxNewTokens')?.value,
        contextLength: document.getElementById('contextLength')?.value,
        temperature: document.getElementById('temperature')?.value,
        topP: document.getElementById('topP')?.value
    };
    fetch('/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    })
    .then(r => r.json())
    .then(data => alert(data.message))
    .catch(err => console.error('Error:', err));
};

// File Modal Submit
document.getElementById('fileSubmit')?.addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput?.files?.[0];
    if (!file) return alert('No file selected.');

    const reader = new FileReader();
    reader.onload = () => {
        const kanojoData = JSON.parse(reader.result);
        fetch('/import-kanojo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(kanojoData)
        })
        .then(r => r.json())
        .then(data => {
            alert(data.message);
            if (fileInput) fileInput.value = '';
        })
        .catch(err => console.error('Error:', err));
    };
    reader.readAsText(file);
});

// Media Modal
const openMediaModal = (src, type) => {
    let modal = document.getElementById('mediaModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mediaModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-xl">
                <div class="modal-content">
                    <div class="modal-body">
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        <div class="media-content"></div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }

    const element = document.createElement(type === 'image' ? 'img' : 'video');
    element.src = src;
    element.className = 'modal-media';
    if (type === 'video') element.controls = true;

    modal.querySelector('.media-content')?.replaceChildren(element);
    new bootstrap.Modal(modal).show();
};

// Draggable
const makeDraggable = (el) => {
    if (!el) return;
    let pos = { x: 0, y: 0 };
    const dragMouseDown = (e) => {
        e.preventDefault();
        pos = { x: e.clientX, y: e.clientY };
        document.addEventListener('mouseup', closeDragElement);
        document.addEventListener('mousemove', elementDrag);
    };
    const elementDrag = (e) => {
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

// Audio Call UI
const switchToAudio = () => {
    const audioWindow = document.createElement('div');
    audioWindow.className = 'floating-audio-window active';
    audioWindow.id = 'audioWindow';
    audioWindow.innerHTML = `
        <div class="controls-bar">
            <button class="control-button" aria-label="Mute/Unmute Microphone"><i class="bi-mic-mute"></i></button>
            <button class="control-button" aria-label="End Call" onclick="endAudioCall()">
                <i class="bi-telephone-x"></i>
            </button>
        </div>`;
    document.body.appendChild(audioWindow);
    makeDraggable(audioWindow);
    const modal = bootstrap.Modal.getInstance(document.getElementById('callModal'));
    modal && modal.hide();
};

const endAudioCall = () => document.getElementById('audioWindow')?.remove();

document.body.addEventListener('click', (e) => {
    if (e.target.closest('.floating-audio-window .bi-telephone-x')) endAudioCall();
});

// Observe for dynamic audio windows
const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
        m.addedNodes.forEach(n => { if (n.id === 'audioWindow') makeDraggable(n); });
    });
});
observer.observe(document.body, { childList: true, subtree: true });

// Initialize draggables on load
const initializeDraggables = () => {
    document.querySelectorAll('.floating-audio-window').forEach(makeDraggable);
};
document.addEventListener('DOMContentLoaded', initializeDraggables);

// Expose needed functions to window
try {
    Object.assign(window, {
        togglePanel,
        closeAllPanels,
        showCallModal,
        endCall,
        toggleFloatingMenu,
        handleFileAttachment,
        updateAttachmentIndicator,
        fileToBase64,
        openMediaModal,
        makeDraggable,
        switchToAudio,
        endAudioCall,
        messageManager
    });
    window.messageManagerInstance = messageManagerInstance;
} catch (e) {}