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

        // Add the text content first if it exists
        if (message.text && message.text.trim()) {
            const textDiv = document.createElement('div');
            textDiv.className = 'message-text';
            textDiv.textContent = message.text;
            msgDiv.appendChild(textDiv);
        }

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

        if (message.data && Array.isArray(message.data)) {
            message.data.forEach(attachment => {
                if (attachment.type === 'image') {
                    // When loading from history, the path is the server path.
                    // When sending, the src is a local dataURL. This handles both.
                    const imageSrc = attachment.path || attachment.src;
                    if (imageSrc) {
                        msgDiv.appendChild(createMediaElement('img', imageSrc, 'image'));
                    }
                }
                else if (attachment.type === 'video') {
                    const videoSrc = attachment.path || attachment.src;
                    if (videoSrc) {
                        msgDiv.appendChild(createMediaElement('video', videoSrc, 'video'));
                    }
                }
                else if (attachment.type === 'audio') {
                    const audioSrc = attachment.path || attachment.src;
                    if (audioSrc) {
                        msgDiv.appendChild(createMediaElement('audio', audioSrc, 'audio'));
                    }
                }
                else if (attachment.type === 'yunafile') {
                    const fileLink = document.createElement('a');
                    fileLink.href = attachment.path || '#';
                    fileLink.textContent = attachment.description || 'Download file';
                    fileLink.className = 'message-file-link';
                    fileLink.target = '_blank';
                    msgDiv.appendChild(fileLink);
                }
            });
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

        // Prepare attachments for the backend
        const attachmentData = await Promise.all(
            currentAttachments.map(async (file) => ({
                name: file.name,
                type: file.type,
                content: await fileToBase64(file) // Assumes fileToBase64 returns only the base64 part
            }))
        );

        // The user's message object with all data
        const userMsg = {
            name: 'User',
            type: 'text',
            text: text,
            data: attachmentData,
            id: this.generateUniqueId()
        };

        // Render the user message
        this.renderMessage(userMsg);

        // Render attachments visually if they exist
        currentAttachments.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const attachmentMsg = {
                    name: 'User',
                    type: file.type.startsWith('image/') ? 'image' : 'yunafile',
                    data: {
                        src: e.target.result,
                        description: file.name,
                        render: true
                    },
                    id: this.generateUniqueId()
                };
                this.renderMessage(attachmentMsg);
            };
            reader.readAsDataURL(file);
        });

        // Clear input and attachments after preparing them
        if (input) input.value = '';
        currentAttachments = [];
        updateAttachmentIndicator();

        // Send the complete user message object to the backend
        fetch('/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMsg, // Send the whole user message object
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

        // Remove the original message and all following messages from the UI
        let next = messageElement;
        while (next) {
            const temp = next;
            next = next.nextElementSibling;
            temp.remove();
        }

        // Create the new user message object to be sent
        const userMsg = { name: 'User', type: 'text', text: messageText, data: [], id: this.generateUniqueId() };

        // Render the new user message in the UI
        this.renderMessage(userMsg);

        fetch('/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMsg,
                chat: chatHistoryManagerInstance?.selectedFilename,
                useHistory: document.getElementById('useHistory')?.checked,
                kanojo: kanojoManagerInstance?.buildPrompt(kanojoManagerInstance?.selectedKanojo),
                speech: false,
                yunaConfig: typeof config_data !== 'undefined' ? config_data : undefined,
                stream: false,
                regenerate: true, // This flag tells the backend to truncate history before this message
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

class CallManager {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.pendingAudioUrl = null;
        this.recordButton = null;
        this.recordButtonFloating = null;
        this.callStatus = null;
        this.callModal = null;
    }

    init() {
        this.recordButton = document.getElementById('recordButton');
        this.callStatus = document.getElementById('callStatus');
        this.callModal = new bootstrap.Modal(document.getElementById('callModal'));
        if (this.recordButton) this.recordButton.addEventListener('click', () => this.toggleRecording());
        if (this.callStatus) this.callStatus.addEventListener('click', () => this.playPendingAudio());
    }

    async startCall() {
        this.callModal.show();
        if (!this.stream) {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.setupMediaRecorder();
                this.updateStatus('Click the microphone to speak');
            } catch (err) {
                console.error('Error accessing microphone:', err);
                this.updateStatus('Could not access microphone. Please grant permission.');
                alert('Microphone permission is required for the call feature.');
            }
        }
    }

    endCall() {
        if (this.isRecording) this.mediaRecorder.stop();
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.callModal.hide();
        this.endAudioCall();
        this.updateStatus('Call ended.');
    }

    setupMediaRecorder() {
        if (!this.stream) return;
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.mediaRecorder.ondataavailable = event => this.audioChunks.push(event.data);
        this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            this.sendAudioToServer(audioBlob);
            this.audioChunks = [];
        };
    }

    toggleRecording() {
        if (!this.mediaRecorder) {
            alert('Call is not ready. Please wait or reload.');
            return;
        }
        this.isRecording = !this.isRecording;
        if (this.isRecording) {
            this.audioChunks = [];
            this.mediaRecorder.start();
            this.updateRecordButtons(true);
            this.updateStatus('Listening...');
        } else {
            this.mediaRecorder.stop();
            this.updateRecordButtons(false);
            this.updateStatus('Processing...');
        }
    }

    updateRecordButtons(isRecording) {
        [this.recordButton, this.recordButtonFloating].forEach(btn => {
            if (btn) {
                if (isRecording) btn.classList.add('recording');
                else btn.classList.remove('recording');
            }
        });
    }

    async sendAudioToServer(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'user_recording.wav');
        formData.append('chat_id', chatHistoryManagerInstance.selectedFilename);
        formData.append('kanojo', kanojoManagerInstance.buildPrompt(kanojoManagerInstance.selectedKanojo));
        formData.append('useHistory', document.getElementById('useHistory')?.checked);
        try {
            const response = await fetch('/call', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            messageManagerInstance.renderMessage({ name: 'User', type: 'text', text: data.user_text });
            messageManagerInstance.renderMessage({ name: 'Yuna', type: 'text', text: data.yuna_text });
            this.pendingAudioUrl = data.audio_url;
            this.updateStatus(`Yuna: "${data.yuna_text}" (Click to hear)`, true)
            setTimeout(() => this.playPendingAudio(), 1000);
        } catch (err) {
            console.error('Error during call:', err);
            this.updateStatus('Sorry, an error occurred.', false);
        }
    }

    playPendingAudio() {
        if (this.pendingAudioUrl) {
            this.updateStatus('Playing...', false);
            const audio = new Audio(this.pendingAudioUrl);
            audio.play();
            this.pendingAudioUrl = null;
            audio.onended = () => this.updateStatus('Click the microphone to speak', false);
        }
    }

    updateStatus(text, isPlayable = false) {
        if (this.callStatus) {
            this.callStatus.textContent = text;
            if (isPlayable) this.callStatus.classList.add('playable');
            else this.callStatus.classList.remove('playable');
        }
    }

    switchToAudio() {
        let audioWindow = document.getElementById('audioWindow');
        if (!audioWindow) {
            audioWindow = document.createElement('div');
            audioWindow.className = 'floating-audio-window';
            audioWindow.id = 'audioWindow';
            audioWindow.innerHTML = `
                <div class="controls-bar">
                    <button id="recordButtonFloating" class="control-button record-button" aria-label="Start Recording">
                        <i class="bi bi-mic-fill"></i>
                    </button>
                    <button class="control-button" aria-label="End Call" onclick="callManagerInstance.endCall()">
                        <i class="bi-telephone-x"></i>
                    </button>
                </div>`;
            document.body.appendChild(audioWindow);
            this.recordButtonFloating = document.getElementById('recordButtonFloating');
            if (this.recordButtonFloating) this.recordButtonFloating.addEventListener('click', () => this.toggleRecording());
            makeDraggable(audioWindow);
        }
        audioWindow.classList.add('active');
        this.callModal.hide();
    };

    endAudioCall() {
        const audioWindow = document.getElementById('audioWindow');
        if (audioWindow) audioWindow.classList.remove('active');
    }
}

const callManagerInstance = new CallManager();

const showCallModal = () => callManagerInstance.startCall();
const endCall = () => callManagerInstance.endCall();
const switchToAudio = () => callManagerInstance.switchToAudio();
const endAudioCall = () => callManagerInstance.endAudioCall();

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

// This ensures all HTML is loaded before we try to find elements
document.addEventListener('DOMContentLoaded', () => {
    callManagerInstance.init(); // Initialize the call manager
    bindAttachButton();
    initializeDraggables();
});

// Expose needed functions to window
try {
    Object.assign(window, {
        togglePanel,
        closeAllPanels,
        showCallModal, // Already points to the instance method
        endCall,         // Already points to the instance method
        toggleFloatingMenu,
        handleFileAttachment,
        updateAttachmentIndicator,
        fileToBase64,
        openMediaModal,
        makeDraggable,
        switchToAudio,   // Already points to the instance method
        endAudioCall,    // Already points to the instance method
    });
    window.messageManagerInstance = messageManagerInstance;
    window.callManagerInstance = callManagerInstance;
} catch (e) {}