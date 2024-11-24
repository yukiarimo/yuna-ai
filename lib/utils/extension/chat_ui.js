// index.js
html = `<div id="popoverContainerYuna">
        <div id="popover-header-yuna">
            <h3 class="title">Yuna <span id="heart-yuna">&#x2665;</span></h3>
            <button id="closeButton">X</button>
        </div>
        <div id="chatArea" class="popover-body">
            <!-- Chat bubbles will be added here dynamically -->
        </div>
        <div class="chat-input-area">
            <input type="text" id="inputFieldYuna" placeholder="Type a message...">
            <button id="submitButton">▲</button>
        </div>
    </div>`;

// Add the HTML to the body
document.body.insertAdjacentHTML('beforeend', html);

// Initialize variables
const inputFieldYuna = document.getElementById('inputFieldYuna');
const submitButton = document.getElementById('submitButton');
const chatArea = document.getElementById('chatArea');
const closeButton = document.getElementById('closeButton');
const popoverContainer = document.getElementById('popoverContainerYuna');
const heartYuna = document.getElementById('heart-yuna');
var dataSelected = null;
var selectedText = '';

// Chat history
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// Names
const userName = "You";
const aiName = "Yuna";

// Display existing chat history
displayChatHistory();

// Add event listeners
submitButton.addEventListener('click', sendMessage);
inputFieldYuna.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});
closeButton.addEventListener('click', () => {
    popoverContainer.style.display = 'none';
});
heartYuna.addEventListener('click', () => {
    popoverContainer.style.display = 'block';
});

// show yuna when clicked on "Ask Yuna" button
function showYuna() {
    if (popoverContainer.style.display === 'block' && selectedText !== null) {
        popoverContainer.style.display = 'none';
    } else {
        popoverContainer.style.display = 'block';
    }
}

// Functions
async function sendMessage() {
    const input = inputFieldYuna.value.trim();
    if (input) {
        // show user message
        const userEntry = {
            sender: userName,
            message: input
        };

        chatHistory.push(userEntry);
        displayMessage(userEntry);

        inputFieldYuna.value = '';
        var prompt = '';

        if (dataSelected) {
            prompt = `<yuki>${input} <data>${dataSelected}</data></yuki>\n<yuna>Sure,`;
            dataSelected = null;
        } else {
            prompt = `<yuki>${input}</yuki>\n<yuna>`;
        }
        await getAIResponse(prompt);
    }
}

async function fetchChatHistory() {
    const response = await fetch('https://yuki.yuna-ai.pro/extension-chat_history', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        chatHistory = await response.json();
        displayChatHistory();
    }
}

fetchChatHistory();

function displayChatHistory() {
    chatArea.innerHTML = '';
    chatHistory.forEach(entry => {
        displayMessage(entry);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
}

function displayMessage(entry) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble ' + (entry.sender === userName ? 'you' : 'yuna');

    const messageContent = document.createElement('span');
    messageContent.textContent = entry.message;
    bubble.appendChild(messageContent);

    // Add action buttons
    const actions = document.createElement('div');
    actions.className = 'message-actions';

    if (entry.sender === aiName) {
        const regenerateBtn = document.createElement('button');
        regenerateBtn.textContent = 'Regenerate';
        regenerateBtn.onclick = () => regenerateMessage(entry);
        actions.appendChild(regenerateBtn);
    }

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => copyToClipboard(entry.message);
    actions.appendChild(copyBtn);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editMessage(entry, bubble);
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteMessage(entry, bubble);
    actions.appendChild(deleteBtn);

    bubble.appendChild(actions);
    chatArea.appendChild(bubble);
    chatArea.scrollTop = chatArea.scrollHeight;
}

async function getAIResponse(prompt) {
    const response = await fetch('https://yuki.yuna-ai.pro/extension-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: prompt
        })
    });

    let resultEntry = {
        sender: aiName,
        message: ''
    };
    chatHistory.push(resultEntry);
    displayMessage(resultEntry);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const {
            done,
            value
        } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, {
            stream: true
        });
        resultEntry.message += chunk;

        // Update the last message bubble
        const lastBubble = chatArea.lastChild;
        if (lastBubble && lastBubble.classList.contains('yuna')) {
            const messageSpan = lastBubble.querySelector('span');
            if (messageSpan) {
                messageSpan.textContent = resultEntry.message;
            }
        }

        chatArea.scrollTop = chatArea.scrollHeight;
    }

    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function regenerateMessage(entry) {
    const prompt = `<yuki>${entry.message}</yuki>\n<yuna>`;
    getAIResponse(prompt).then(() => {
        displayChatHistory();
    });
}

function copyToClipboard(message) {
    navigator.clipboard.writeText(message).then(() => {
        alert('Message copied to clipboard');
    });
}

function editMessage(entry, bubble) {
    const newMessage = prompt('Edit your message:', entry.message);
    if (newMessage !== null) {
        entry.message = newMessage;
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        const messageSpan = bubble.querySelector('span');
        if (messageSpan) {
            messageSpan.textContent = newMessage;
        }
    }
}

function deleteMessage(entry, bubble) {
    chatHistory = chatHistory.filter(e => e !== entry);
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    chatArea.removeChild(bubble);
}

// "Ask Yuna" button
// Create the "Ask Yuna" button element
const yunaButton = document.createElement('div');
yunaButton.id = 'yuna-button';
yunaButton.innerHTML = 'Ask Yuna <span>&#x2665;</span>';
document.body.appendChild(yunaButton);

// Hide the button initially
yunaButton.style.display = 'none';

// Add styles
const style = document.createElement('style');
style.textContent = `
#yuna-button {
    position: absolute;
    padding: 8px 12px;
    background: #00BFA5;
    color: white;
    font-family: 'Comic Sans MS', cursive;
    font-size: 14px;
    border-radius: 20px;
    box-shadow: 0 4px 10px rgba(0, 191, 165, 0.3);
    cursor: pointer;
    user-select: none;
    transform: translate(-50%, -150%);
    transition: opacity 0.3s, transform 0.3s;
    z-index: 1000;
    animation: resize 1s infinite alternate;
}

#yuna-button:hover {
    transform: translate(-50%, -150%) scale(1.05);
}

@keyframes resize {
    0% {
        transform: translate(-50%, -150%) scale(1);
    }
    100% {
        transform: translate(-50%, -150%) scale(1.1);
    }
}

/* Responsive styling for mobile */
@media (max-width: 600px) {
    #yuna-button {
        font-size: 12px;
        padding: 6px 10px;
    }
}
`;
document.head.appendChild(style);

// Update button position based on selection
document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    if (selection.isCollapsed || !selection.toString().trim()) {
        yunaButton.style.display = 'none';
        selectedText = null;
        return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    yunaButton.style.top = `${rect.top + window.scrollY}px`;
    yunaButton.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    yunaButton.style.display = 'block';

    selectedText = selection.toString().trim();
});

// For touch devices
document.addEventListener('touchend', () => {
    const selection = window.getSelection();
    if (selection.isCollapsed || !selection.toString().trim()) {
        yunaButton.style.display = 'none';
        selectedText = null;
        return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    yunaButton.style.top = `${rect.top + window.scrollY}px`;
    yunaButton.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    yunaButton.style.display = 'block';

    selectedText = selection.toString().trim();
});

// Prevent selection loss on button click
yunaButton.addEventListener('mousedown', (event) => {
    event.preventDefault();
});

// Log selected text on button click
yunaButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (selectedText) {
        dataSelected = selectedText;
        showYuna();
    }
    yunaButton.style.display = 'none';
});

// Hide the button when clicking elsewhere
document.addEventListener('mousedown', (event) => {
    if (!yunaButton.contains(event.target)) {
        yunaButton.style.display = 'none';
    }
});

document.addEventListener('keydown', (event) => {
    if (event.metaKey && event.shiftKey && event.key === 'Y') {
        showYuna();
    }
});