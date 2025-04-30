// Chat history storage
let chatHistory = JSON.parse(localStorage.getItem('yunaChatHistory')) || [];
let selectedText = '';
// Get server URL from localStorage or use default
let serverUrl = localStorage.getItem('yunaServerUrl') || 'https://127.0.0.1:4848';

// Insert HTML for all required elements
document.body.insertAdjacentHTML('beforeend', `
  <div id="yuna-floating-logo">
    <img src="${chrome.runtime.getURL('assets/yuna-ai-128.png')}" alt="Yuna AI">
  </div>
  
  <div id="yuna-chat-container">
    <div id="yuna-chat-header">
      <div id="yuna-chat-title">Yuna <span class="heart">♥</span></div>
      <div class="yuna-header-actions">
        <button id="yuna-chat-settings" title="Settings">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        <button id="yuna-chat-close">×</button>
      </div>
    </div>
    <div id="yuna-chat-messages"></div>
    <div id="yuna-chat-input-area">
      <input type="text" id="yuna-chat-input" placeholder="Type a message...">
      <button id="yuna-chat-send">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
        </svg>
      </button>
    </div>
  </div>
  
  <div id="yuna-settings-modal">
    <div class="yuna-settings-content">
      <div class="yuna-settings-header">
        <h3>Yuna Settings</h3>
        <button id="yuna-settings-close">×</button>
      </div>
      <div class="yuna-settings-body">
        <div class="yuna-settings-group">
          <label for="yuna-server-url">Server URL:</label>
          <input type="text" id="yuna-server-url" placeholder="https://127.0.0.1:4848">
        </div>
        <div class="yuna-settings-group">
          <button id="yuna-clear-history" class="yuna-settings-btn">Clear Chat History</button>
        </div>
      </div>
      <div class="yuna-settings-footer">
        <button id="yuna-settings-save" class="yuna-settings-btn primary">Save Settings</button>
      </div>
    </div>
  </div>
  
  <div id="yuna-ask-button">
    Ask Yuna <span>♥</span>
  </div>
`);

// Elements
const floatingLogo = document.getElementById('yuna-floating-logo');
const chatContainer = document.getElementById('yuna-chat-container');
const chatMessages = document.getElementById('yuna-chat-messages');
const chatInput = document.getElementById('yuna-chat-input');
const chatSend = document.getElementById('yuna-chat-send');
const chatClose = document.getElementById('yuna-chat-close');
const askButton = document.getElementById('yuna-ask-button');

// Settings elements
const settingsButton = document.getElementById('yuna-chat-settings');
const settingsModal = document.getElementById('yuna-settings-modal');
const settingsClose = document.getElementById('yuna-settings-close');
const serverUrlInput = document.getElementById('yuna-server-url');
const clearHistoryButton = document.getElementById('yuna-clear-history');
const saveSettingsButton = document.getElementById('yuna-settings-save');

// Set initial value for server URL input
serverUrlInput.value = serverUrl;

// Names
const userName = "Yuki";
const aiName = "Yuna";

settingsButton.addEventListener('click', openSettings);
settingsClose.addEventListener('click', closeSettings);
clearHistoryButton.addEventListener('click', clearChatHistory);
saveSettingsButton.addEventListener('click', saveSettings);

// Close settings when clicking outside the modal
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    closeSettings();
  }
});

// Settings functions
function openSettings() {
  settingsModal.classList.add('active');
  serverUrlInput.value = serverUrl;
}

function closeSettings() {
  settingsModal.classList.remove('active');
}

function saveSettings() {
  const newServerUrl = serverUrlInput.value.trim();

  if (newServerUrl) {
    serverUrl = newServerUrl;
    localStorage.setItem('yunaServerUrl', serverUrl);
    showNotification('Settings saved!');
  } else {
    showNotification('Server URL cannot be empty');
    return;
  }

  closeSettings();
}

function clearChatHistory() {
  chatHistory = [];
  localStorage.removeItem('yunaChatHistory');
  displayChatHistory();

  // Add welcome message back
  chatHistory.push({
    sender: aiName,
    message: "Hi, Yuki! I'm Yuna, your little companion.",
    timestamp: new Date().toISOString()
  });
  saveChatHistory();
  displayChatHistory();

  showNotification('Chat history cleared!');
  closeSettings();
}

function showNotification(message) {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.yuna-notification');
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }

  // Create and show new notification
  const notification = document.createElement('div');
  notification.className = 'yuna-notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  // Remove notification after 2 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 2000);
}

// Initialize chat with welcome message if history is empty
if (chatHistory.length === 0) {
  chatHistory.push({
    sender: aiName,
    message: "Hi, Yuki! I'm Yuna, your little companion.",
    timestamp: new Date().toISOString()
  });
  saveChatHistory();
}

// Display existing chat history
displayChatHistory();

// Event listeners
floatingLogo.addEventListener('click', toggleChat);
chatClose.addEventListener('click', toggleChat);
chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// Text selection functionality
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('touchend', handleTextSelection);

// Prevent selection loss on button click
askButton.addEventListener('mousedown', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

// Handle ask button click
askButton.addEventListener('click', () => {
  if (selectedText) {
    openChatWithSelectedText();
    askButton.style.display = 'none';
  }
});

// Hide the button when clicking elsewhere
document.addEventListener('mousedown', (e) => {
  if (!askButton.contains(e.target)) {
    askButton.style.display = 'none';
  }
});

// Functions
function toggleChat() {
  chatContainer.classList.toggle('active');
  if (chatContainer.classList.contains('active')) {
    chatInput.focus();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function handleTextSelection() {
  setTimeout(() => {
    const selection = window.getSelection();
    if (selection.isCollapsed || !selection.toString().trim()) {
      askButton.style.display = 'none';
      selectedText = '';
      return;
    }

    selectedText = selection.toString().trim();

    if (selectedText) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      askButton.style.top = `${rect.top + window.scrollY}px`;
      askButton.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
      askButton.style.display = 'block';
    }
  }, 10);
}

function openChatWithSelectedText() {
  chatContainer.classList.add('active');
  chatInput.value = `Question: <data>${selectedText}</data>`;
  chatInput.focus();
}

function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  // Add user message to chat
  const userEntry = {
    sender: userName,
    message: message,
    timestamp: new Date().toISOString()
  };

  chatHistory.push(userEntry);
  displayMessage(userEntry);

  // Clear input
  chatInput.value = '';

  // Create prompt with selected text context if available
  let prompt = message;
  if (selectedText) {
    prompt = `Context: "${selectedText}"\n\nUser message: ${message}`;
    selectedText = '';
  }

  // Send to API and get response
  getAIResponse(prompt);
}

function getAIResponse(prompt) {
  // Show typing indicator
  const typingEntry = {
    sender: aiName,
    message: "Typing...",
    timestamp: new Date().toISOString(),
    isTyping: true
  };

  chatHistory.push(typingEntry);
  const typingBubble = displayMessage(typingEntry);

  // Format history and current message in XML-like format
  let formattedPrompt = '';
  
  // Include chat history (limited to last 10 messages for context)
  const relevantHistory = chatHistory
    .filter(entry => !entry.isTyping && !entry.isError)
    .slice(-20)  // Last 20 messages
    .slice(0, -1); // Exclude the message just added
  
  // Format history in XML tags
  relevantHistory.forEach(entry => {
    if (entry.sender === userName) {
      formattedPrompt += `<yuki>${entry.message}</yuki>\n`;
    } else if (entry.sender === aiName) {
      formattedPrompt += `<yuna>${entry.message}</yuna>\n`;
    }
  });
  
  // Add the current message
  formattedPrompt += `<yuki>${prompt}</yuki>\n<yuna>`;

  // Send request to the backend API
  fetch(`${serverUrl}/extension`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: formattedPrompt
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Remove typing indicator
      chatHistory = chatHistory.filter(entry => !entry.isTyping);

      // Add AI response
      const aiEntry = {
        sender: aiName,
        message: data.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date().toISOString()
      };

      chatHistory.push(aiEntry);

      // Update displayed messages
      chatMessages.removeChild(typingBubble);
      displayMessage(aiEntry);

      // Save updated history
      saveChatHistory();
    })
    .catch(error => {
      console.error('Error:', error);

      // Remove typing indicator
      chatHistory = chatHistory.filter(entry => !entry.isTyping);

      // Add error message
      const errorEntry = {
        sender: aiName,
        message: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true
      };

      chatHistory.push(errorEntry);

      // Update displayed messages
      chatMessages.removeChild(typingBubble);
      displayMessage(errorEntry);

      // Save updated history
      saveChatHistory();
    });
}

function displayChatHistory() {
  chatMessages.innerHTML = '';
  chatHistory.forEach(entry => {
    displayMessage(entry);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayMessage(entry) {
  const bubble = document.createElement('div');
  bubble.className = `yuna-message ${entry.sender === userName ? 'user' : 'ai'}`;

  if (entry.isError) {
    bubble.classList.add('error');
  }

  const messageContent = document.createElement('div');
  messageContent.textContent = entry.message;
  bubble.appendChild(messageContent);

  // Add timestamp
  const timestamp = document.createElement('div');
  timestamp.className = 'timestamp';
  timestamp.textContent = formatTime(new Date(entry.timestamp));
  bubble.appendChild(timestamp);

  // Add action buttons for non-typing messages
  if (!entry.isTyping) {
    const actions = document.createElement('div');
    actions.className = 'yuna-message-actions';

    // Only add regenerate for AI messages
    if (entry.sender === aiName) {
      const regenerateBtn = document.createElement('button');
      regenerateBtn.className = 'yuna-action-btn';
      regenerateBtn.textContent = '🔄';
      regenerateBtn.title = 'Regenerate';
      regenerateBtn.onclick = () => regenerateMessage(entry);
      actions.appendChild(regenerateBtn);
    }

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'yuna-action-btn';
    copyBtn.textContent = '📋';
    copyBtn.title = 'Copy';
    copyBtn.onclick = () => copyToClipboard(entry.message);
    actions.appendChild(copyBtn);

    bubble.appendChild(actions);
  }

  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return bubble;
}

function regenerateMessage(entry) {
  // Find the previous user message
  const index = chatHistory.indexOf(entry);
  let userPrompt = "Please try again.";

  for (let i = index - 1; i >= 0; i--) {
    if (chatHistory[i].sender === userName) {
      userPrompt = chatHistory[i].message;
      break;
    }
  }

  // Remove the AI message to be regenerated
  chatHistory = chatHistory.filter(item => item !== entry);
  saveChatHistory();

  // Display updated chat
  displayChatHistory();

  // Get new response
  getAIResponse(userPrompt);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show a small notification
    const notification = document.createElement('div');
    notification.textContent = 'Copied to clipboard!';
    notification.style.position = 'fixed';
    notification.style.bottom = '60px';
    notification.style.right = '20px';
    notification.style.background = 'rgba(0,0,0,0.7)';
    notification.style.color = 'white';
    notification.style.padding = '8px 12px';
    notification.style.borderRadius = '4px';
    notification.style.fontSize = '12px';
    notification.style.zIndex = '10001';

    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
  });
}

function saveChatHistory() {
  // Limit chat history to last 100 messages
  if (chatHistory.length > 100) {
    chatHistory = chatHistory.slice(-100);
  }

  localStorage.setItem('yunaChatHistory', JSON.stringify(chatHistory));
}

function formatTime(date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}