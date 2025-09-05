// ===================================================================================
// CONFIGURATION
// ===================================================================================
const SERVER_URL = 'http://127.0.0.1:5000/message'; // Example for a local server
// ===================================================================================

let yunaUIInitialized = false;

const YUNA_HTML = `
    <!-- SVG Filter for Liquid Glass Distortion -->
    <svg id="yuna-svg-filter" style="display: none" aria-hidden="true">
        <filter id="yuna-glass-distortion">
            <feTurbulence type="turbulence" baseFrequency="0.005" numOctaves="1" result="noise"></feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="40"></feDisplacementMap>
        </filter>
    </svg>

    <!-- Floating Logo Button -->
    <div id="yuna-logo-button" class="yuna-glass-container">ゆ</div>

    <!-- Main Chat Window -->
    <div id="yuna-chat-window" class="yuna-glass-container">
        <div id="yuna-chat-header">
            <span>Chat with Yuna</span>
            <button id="yuna-chat-close-btn">&times;</button>
        </div>
        <div id="yuna-chat-messages"></div>
        <div id="yuna-input-area">
            <textarea id="yuna-chat-input" placeholder="Message Yuna..." rows="1"></textarea>
            <button id="yuna-chat-send-btn" aria-label="Send"><i class="bi bi-send-fill"></i></button>
        </div>
    </div>

    <!-- Ask Yuna button for selected text -->
    <div id="yuna-ask-context-button" class="yuna-glass-container"><i class="bi bi-chat-quote-fill"></i></div>

    <!-- Context Modal -->
    <div id="yuna-context-modal">
        <div class="yuna-context-modal-content yuna-glass-container">
            <h3>Ask Yuna about...</h3>
            <textarea id="yuna-context-textarea" title="Context from page"></textarea>
            <textarea id="yuna-context-prompt" placeholder="Your question..." rows="2"></textarea>
            <div class="yuna-context-modal-actions">
                <button id="yuna-context-cancel">Cancel</button>
                <button id="yuna-context-send">Ask Yuna</button>
            </div>
        </div>
    </div>
`;

// Function to initialize the Yuna UI
function initializeYunaUI() {
    if (yunaUIInitialized) return;

    // Inject HTML into the page
    document.body.insertAdjacentHTML('beforeend', YUNA_HTML);

    // --- DOM Element References ---
    const logoButton = document.getElementById('yuna-logo-button');
    const chatWindow = document.getElementById('yuna-chat-window');
    const closeBtn = document.getElementById('yuna-chat-close-btn');
    const messagesContainer = document.getElementById('yuna-chat-messages');
    const inputArea = document.getElementById('yuna-chat-input');
    const sendBtn = document.getElementById('yuna-chat-send-btn');
    const askContextBtn = document.getElementById('yuna-ask-context-button');
    const contextModal = document.getElementById('yuna-context-modal');
    const contextTextarea = document.getElementById('yuna-context-textarea');
    const contextPrompt = document.getElementById('yuna-context-prompt');
    const contextCancelBtn = document.getElementById('yuna-context-cancel');
    const contextSendBtn = document.getElementById('yuna-context-send');

    // --- State Management ---
    let chatHistory = JSON.parse(localStorage.getItem('yunaContentChatHistory')) || [];

    // --- Functions ---
    function displayMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `yuna-message yuna-glass-container yuna-${sender}`;
        const content = document.createElement('p');
        content.textContent = message;
        messageDiv.appendChild(content);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function saveHistory() {
        localStorage.setItem('yunaContentChatHistory', JSON.stringify(chatHistory));
    }

    function loadHistory() {
        messagesContainer.innerHTML = '';
        chatHistory.forEach(item => displayMessage(item.sender, item.message));
    }

    async function sendMessage(message, context = null) {
        if (!message.trim()) return;

        displayMessage('user', message);
        chatHistory.push({ sender: 'user', message });

        let prompt = message;
        if (context) {
            prompt = `Based on this context:\n\n---\n${context}\n---\n\nMy question is: ${message}`;
        }

        try {
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: prompt, chat: "extension_chat", stream: false })
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            const aiMessage = data.response || "Sorry, I couldn't get a response.";

            displayMessage('ai', aiMessage);
            chatHistory.push({ sender: 'ai', message: aiMessage });
            saveHistory();

        } catch (error) {
            console.error("Yuna Ai Error:", error);
            displayMessage('ai', "I'm having trouble connecting right now. Please try again later.");
        }
    }

    // --- Event Listeners ---
    // Toggle chat window
    logoButton.addEventListener('click', () => {
        chatWindow.classList.toggle('yuna-active');
        if (chatWindow.classList.contains('yuna-active')) {
            loadHistory();
            inputArea.focus();
        }
    });

    closeBtn.addEventListener('click', () => chatWindow.classList.remove('yuna-active'));

    // Handle sending message from main chat
    sendBtn.addEventListener('click', () => {
        sendMessage(inputArea.value);
        inputArea.value = '';
        inputArea.style.height = 'auto';
    });

    // Enter key to send message
    inputArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputArea.value);
            inputArea.value = '';
            inputArea.style.height = 'auto';
        }
    });

    // Auto-resize textarea
    inputArea.addEventListener('input', () => {
        inputArea.style.height = 'auto';
        inputArea.style.height = `${inputArea.scrollHeight}px`;
    });

    // Handle text selection
    document.addEventListener('mouseup', (e) => {
        // Don't trigger if clicking inside Yuna's UI
        if (e.target.closest('#yuna-chat-window, #yuna-logo-button, #yuna-ask-context-button, #yuna-context-modal')) return;

        const selection = window.getSelection().toString().trim();
        if (selection.length > 10) {
            askContextBtn.style.top = `${e.clientY - 40}px`;
            askContextBtn.style.left = `${e.clientX}px`;
            askContextBtn.style.display = 'flex';
        } else {
            askContextBtn.style.display = 'none';
        }
    });

    // Hide context button on any click
    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('#yuna-ask-context-button')) {
            askContextBtn.style.display = 'none';
        }
    });

    // Open and populate the context modal
    askContextBtn.addEventListener('click', () => {
        const selectedText = window.getSelection().toString().trim();
        contextTextarea.value = selectedText;
        contextPrompt.value = '';
        contextModal.classList.add('yuna-active');
        contextPrompt.focus();
        askContextBtn.style.display = 'none';
    });

    // Context modal actions
    contextCancelBtn.addEventListener('click', () => contextModal.classList.remove('yuna-active'));

    contextSendBtn.addEventListener('click', () => {
        const context = contextTextarea.value;
        const prompt = contextPrompt.value;
        sendMessage(prompt, context);
        contextModal.classList.remove('yuna-active');
        if (!chatWindow.classList.contains('yuna-active')) {
            chatWindow.classList.add('yuna-active');
            loadHistory();
        }
    });

    yunaUIInitialized = true;
}

// Function to toggle UI visibility
function toggleYunaUIVisibility(show) {
    const elements = [
        document.getElementById('yuna-logo-button'),
        document.getElementById('yuna-chat-window'),
        document.getElementById('yuna-ask-context-button'),
        document.getElementById('yuna-context-modal'),
        document.getElementById('yuna-svg-filter')
    ];

    elements.forEach(element => {
        if (element) {
            element.style.display = show ? '' : 'none';
        }
    });
}

// --- Message Listener for Toggle ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_YUNA_UI') {
        if (message.enabled) {
            if (!yunaUIInitialized) {
                initializeYunaUI();
            } else {
                toggleYunaUIVisibility(true);
            }
        } else {
            toggleYunaUIVisibility(false);
        }
    }
});

// --- Initial Setup ---
// Check the initial state when the script is first injected
chrome.storage.sync.get(['isContentScriptEnabled'], (result) => {
    // Default to true if not set
    if (result.isContentScriptEnabled !== false) {
        initializeYunaUI();
    }
});