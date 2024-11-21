let selectedFilename = '';
const backgroundMusic = document.getElementById('backgroundMusic');
const messageContainer = document.getElementById('message-container');
const inputTextContainer = document.getElementById('input_text');
const buttonAudioRec = document.querySelector('#buttonAudioRec');
const iconAudioRec = buttonAudioRec.querySelector('#iconAudioRec');
let config_data;
let isRecording = false;
let isYunaListening = false;
let mediaRecorder;
let audioChunks = [];
let activeElement = null;
let isStreamingChatModeEnabled = false;
let isCustomConfigEnabled = false;
let soundsModeEnabled = false;

// Helper function to update configuration
function updateConfig(setting, value) {
  const config = JSON.parse(localStorage.getItem('config')) || {};
  config.settings = config.settings || {};
  config.settings[setting] = value;
  localStorage.setItem('config', JSON.stringify(config));
}

// Function to handle the toggle switch change
document.querySelector('#streamingChatMode').onchange = e => {
  isStreamingChatModeEnabled = e.target.checked;
  updateConfig('streaming', isStreamingChatModeEnabled);
};

document.querySelector('#customConfig').onchange = e => {
  isCustomConfigEnabled = e.target.checked;
  updateConfig('customConfig', isCustomConfigEnabled);
};

document.querySelector('#soundsMode').onchange = e => {
  soundsModeEnabled = e.target.checked;
  updateConfig('sounds', soundsModeEnabled);
};

buttonAudioRec.addEventListener('click', () => {
  isRecording ? stopRecording() : startRecording();
});

function toggleRecordingUI(isRecording) {
  iconAudioRec.classList.toggle('fa-microphone', !isRecording);
  iconAudioRec.classList.toggle('fa-stop', isRecording);
  buttonAudioRec.classList.toggle('btn-danger', isRecording);
  buttonAudioRec.classList.toggle('btn-secondary', !isRecording);
}

function startRecording(withImage = false, imageDataURL, imageName, messageForImage) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      toggleRecordingUI(true);
      isRecording = true;

      mediaRecorder.addEventListener('dataavailable', event => audioChunks.push(event.data));
      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendAudioToServer(audioBlob, withImage, imageDataURL, imageName, messageForImage);
        audioChunks = [];
      });
    })
    .catch(error => console.error('Error accessing the microphone', error));
}

function stopRecording() {
  mediaRecorder.stop();
  toggleRecordingUI(false);
  isRecording = false;
}

function sendAudioToServer(audioBlob, withImage = false, imageDataURL, imageName, messageForImage) {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('task', 'transcribe');

  fetch('/audio', { method: 'POST', body: formData })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      const message = data.text;
      const kanojo = kanojoManager.buildKanojo();
      if (withImage) {
        askYunaImage = messageManagerInstance.sendMessage(message, kanojo, [imageDataURL, imageName, message], '/image', false, false, isStreamingChatModeEnabled);
      } else {
        messageManagerInstance.sendMessage(message, kanojo, '', '/message', false, false, isStreamingChatModeEnabled);
      }
    })
    .catch(error => console.error('Error sending audio to server', error));
}

async function loadConfig() {
  let config = localStorage.getItem('config');
  if (config) {
    config = JSON.parse(config);
  } else {
    config = await (await fetch('/static/config.json')).json();
    localStorage.setItem('config', JSON.stringify(config));
  }
  inputTextContainer.placeholder = `Talk to ${config.ai.names[1]}...`;
}

class MessageManager {
  displayMessages(messages) {
    messageContainer.innerHTML = '';
    if (typeof messages === 'string') messages = this.parseJSON(messages);
    messages.forEach(msg => messageContainer.appendChild(formatMessage(msg)));
    this.scrollMsg();
  }

  createMessage(name, content, isStreaming = false) {
    const msgData = { name, message: isStreaming ? '' : content };
    const msgElement = formatMessage(msgData);
    messageContainer.appendChild(msgElement);
    this.scrollMsg();
    if (name === config_data.ai.names[1]) playAudio('message');
    return isStreaming ? msgElement : undefined;
  }

  updateMessageContent(element, content) {
    element.innerHTML = content;
    this.scrollMsg();
  }

  createTypingBubble(naked = false) {
    const bubble = `<div id="circle-loader"><img src="/static/img/loader.gif"></div>`;
    const container = naked ? activeElement : messageContainer;
    container.insertAdjacentHTML('beforeend', bubble);
    this.scrollMsg();
  }

  removeTypingBubble() {
    document.getElementById('circle-loader')?.remove();
    this.scrollMsg();
  }

  scrollMsg() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  async sendMessage(message, kanojo, imageData = '', url = '/message', naked = false, stream = isStreamingChatModeEnabled, outputElement = '', config = null) {
    message = message || inputTextContainer.value;
    if (url === '/message') {
      if (kanojo !== null) {
        this.createMessage(config_data.ai.names[0], message);
        this.createTypingBubble(naked);
        updateMsgCount();
      }

      const body = JSON.stringify({
        chat: selectedFilename,
        text: message,
        useHistory: kanojoManager.useHistory,
        kanojo:
          kanojo === false
            ? null
            : kanojo || kanojoManager.buildKanojo(document.getElementById('kanojoSelect').value),
        speech: isYunaListening,
        yunaConfig: config || (isCustomConfigEnabled ? config_data : null),
        stream
      });

      inputTextContainer.value = '';
      try {
        const response = await fetch(
          `${config_data.server.url}${config_data.server.port}${url}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
          }
        );

        if (stream && isStreamingChatModeEnabled) {
          await this.handleStreaming(response, outputElement);
        } else {
          const data = await response.json();
          if (kanojo !== null) {
            this.removeTypingBubble();
            this.createMessage(config_data.ai.names[1], data.response);
          }
        }
        if (isYunaListening) playAudio();
      } catch (error) {
        this.handleError(error);
      }
      updateMsgCount();
    } else if (url === '/image') {
      this.sendImage(imageData);
    }
  }

  async handleStreaming(response, outputElement) {
    const decoder = new TextDecoder();
    let result = '';
    let isBubbleCreated = false;
    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      if (outputElement) {
        outputElement.value += chunk;
      } else {
        if (!isBubbleCreated) {
          this.createMessage(config_data.ai.names[1], '');
          isBubbleCreated = true;
        }
        const lastMsg = messageContainer.querySelector(
          '.p-2.mb-2.block-message-1.text-start.bg-secondary.text-white:last-child pre'
        );
        this.updateMessageContent(lastMsg, result);
      }
      initializeTextareas();
    }
    this.removeTypingBubble();
  }

  handleError(error) {
    console.error('Error:', error);
    this.removeTypingBubble();
    this.createMessage(config_data.ai.names[1], error.toString());
    playAudio('error');
  }

  sendImage([imageDataURL, imageName, messageForImage]) {
    const body = JSON.stringify({
      image: imageDataURL,
      name: imageName,
      message: messageForImage,
      task: 'caption',
      chat: selectedFilename,
      speech: isYunaListening
    });

    fetch(`${config_data.server.url}${config_data.server.port}/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })
      .then(response => (response.ok ? response.json() : Promise.reject('Error sending image.')))
      .then(data => {
        this.removeTypingBubble();
        const imageCaption = `${messageForImage}<img src="${data.path}" alt="${imageName}">`;
        this.createMessage(config_data.ai.names[0], imageCaption);
        this.createMessage(config_data.ai.names[1], data.message);
        if (isYunaListening) playAudio();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error sending captured image.');
      });
  }

  parseJSON(str) {
    try {
      return JSON.parse(str);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  }
}

// Create a new instance of the messageManager class
messageManagerInstance = new MessageManager();

function playAudio(audioType = 'tts') {
  if (!soundsModeEnabled && audioType != 'tts') {
    return;
  }

  const audioSource = document.getElementById("backgroundMusic");
  const audioMap = {
    'tts': `/static/audio/audio.mp3?v=${Math.random()}`,
    'call': '/static/audio/sfx/app/ringtone.mp3',
    'camera': '/static/audio/sfx/app/camera.mp3',
    'confirm': '/static/audio/sfx/app/confirm.mp3',
    'error': '/static/audio/sfx/app/error.mp3',
    'keyboard': '/static/audio/sfx/app/keyboard.mp3',
    'message': '/static/audio/sfx/app/message.mp3',
    'mouseclick': '/static/audio/sfx/app/mouseclick.mp3',
    'notification': '/static/audio/sfx/app/notification.mp3',
    'popup': '/static/audio/sfx/app/popup.mp3',
    'server': '/static/audio/sfx/app/server.mp3',
    'welcome': '/static/audio/sfx/app/welcome.mp3',
    'wrong': '/static/audio/sfx/app/wrong.mp3',
  };
  audioSource.src = audioMap[audioType];
  // Check if the audio type can be played
  const canPlay = audioSource.canPlayType('audio/mpeg');
  if (canPlay) {
    // calculate the duration of the audio, play the audio and stop after that duration
    audioSource.play();
    audioSource.addEventListener('ended', () => {
      audioSource.pause();
    });
  } else {
    console.error(`Cannot play audio of type ${audioType}`);
  }
}

function formatMessage(messageData) {
  const messageDiv = document.createElement('div');
  loadConfig();
  messageDiv.classList.add('message', 'p-2', 'mb-2');
  messageDiv.id = 'message1';

  const classes = messageData.name == config_data.ai.names[0] || messageData.name == 'Yuki' ? ['block-message-2', 'text-end', 'bg-primary', 'text-white'] : ['block-message-1', 'text-start', 'bg-secondary', 'text-white'];
  messageDiv.classList.add(...classes);

  const messageText = document.createElement('pre');
  messageText.classList.add('message-text', 'm-0');
  messageText.innerHTML = messageData.message;

  const menuToggleBtn = document.createElement('button');
  menuToggleBtn.classList.add('menu-toggle-btn');
  menuToggleBtn.setAttribute('aria-label', 'Message Bubble Menu');
  menuToggleBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';

  const messageMenu = document.createElement('div');
  messageMenu.classList.add('message-menu');

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('close-btn');
  closeBtn.textContent = 'Close';

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = 'Delete message';

  const copyBtn = document.createElement('button');
  copyBtn.classList.add('copy-btn');
  copyBtn.textContent = 'Copy text';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(messageData.message).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  });

  const regenerateBtn = document.createElement('button');
  regenerateBtn.classList.add('regenerate-btn');
  regenerateBtn.textContent = 'Regenerate';
  regenerateBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(messageData.message).then(() => {
      // Artificially click the delete button
      deleteBtn.click();
      // Call the regenerateMessage function with the message text
      setTimeout(() => {
        regenerateMessage(messageData.message);
      }, 300);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  });

  messageMenu.appendChild(closeBtn);
  messageMenu.appendChild(deleteBtn);
  messageMenu.appendChild(copyBtn);
  messageMenu.appendChild(regenerateBtn);

  messageDiv.appendChild(messageText);
  messageDiv.appendChild(menuToggleBtn);
  messageDiv.appendChild(messageMenu);

  scrollMsg();
  setMessagePopoverListeners();

  return messageDiv;
}

function regenerateMessage(messageText) {
  inputTextContainer.value = messageText;
  messageManagerInstance.sendMessage('');
}

function setMessagePopoverListeners() {
  // Handle message bubble clicks and delete button clicks using event delegation
  document.addEventListener('click', (event) => {
    const message = event.target.closest('.message');
    const deleteBtn = event.target.closest('.delete-btn');

    if (message) {
      event.stopPropagation();
      // Close all other menus
      document.querySelectorAll('.message-menu').forEach(menu => {
        if (menu !== message.querySelector('.message-menu')) {
          menu.style.display = 'none';
        }
      });
      // Toggle current menu
      const currentMenu = message.querySelector('.message-menu');
      currentMenu.style.display = currentMenu.style.display === 'block' ? 'none' : 'block';
    } else if (deleteBtn) {
      event.stopPropagation();
      const messageText = deleteBtn.closest('.message').querySelector('.message-text').textContent;
      deleteMessageFromHistory(messageText);
    } else {
      // Click outside to close all menus
      document.querySelectorAll('.message-menu').forEach(menu => {
        menu.style.display = 'none';
      });
    }
  });
}
setTimeout(setMessagePopoverListeners, 200);

class HistoryManager {
  constructor(props) {
    this.loadSelectedHistory = this.loadSelectedHistory.bind(this);
}
  postHistory(task, data = {}) {
    return fetch(`${config_data.server.url}${config_data.server.port}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, ...data }),
    }).then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    });
  }

  createHistoryFile() {
    const newFileName = prompt('Enter a name for the new file (with .json):');
    if (!newFileName) return;
    selectedFilename = newFileName;
    this.postHistory('create', { chat: newFileName })
      .then(() => populateHistorySelect())
      .catch(console.error);
  }

  get selectedFilename() {
    return this._selectedFilename || config_data.settings.default_history_file;
  }

  set selectedFilename(filename) {
    this._selectedFilename = filename;
  }

  downloadHistory() {
    this.postHistory('load', { chat: this.selectedFilename })
      .then(data => {
        const blob = new Blob([JSON.stringify(data)], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${this.selectedFilename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      })
      .catch(console.error);
  }

  importHistory() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const filename = prompt('Enter a name for the new file (with .json):');
        if (!filename) return;
        this.postHistory('save', { chat: filename, history: JSON.parse(reader.result) })
          .then(() => {
            alert('History imported successfully.');
            location.reload();
          })
          .catch(console.error);
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }

  editHistory() {
    this.postHistory('load', { chat: this.selectedFilename })
      .then(data => {
        const popup = document.createElement('div');
        popup.className = 'block-popup edit-popup';
        popup.innerHTML = `
          <div class="modal-content">
            <div class="modal-header">Edit History</div>
            <div class="modal-body">
              <textarea class="block-scroll">${JSON.stringify(data, null, 2)}</textarea>
            </div>
            <div class="modal-footer">
              <button class="block-button" onclick="historyManagerInstance.saveEditedHistory()">Save</button>
              <button class="block-button" onclick="historyManagerInstance.closePopup('${popup.id}')">Cancel</button>
            </div>
          </div>
        `;
        document.body.appendChild(popup);
      })
      .catch(console.error);
  }

  saveEditedHistory() {
    const editedText = document.querySelector('.block-popup.edit-popup textarea').value;
    this.postHistory('edit', { chat: this.selectedFilename, history: JSON.parse(editedText) })
      .then(() => this.loadSelectedHistory())
      .catch(console.error);
  }

  fetchHistory(task) {
    return this.postHistory(task, { chat: this.selectedFilename });
  }

  loadSelectedHistory(selectedFilename = config_data.settings.default_history_file) {
    this.postHistory('load', { chat: selectedFilename })
      .then(data => {
        messageManagerInstance.displayMessages(data);
        updateMsgCount();
      })
      .catch(console.error);
  }
}

// Assuming server_url, server_port, and config_data are defined globally
var historyManagerInstance = new HistoryManager();

function initializeVideoStream() {
  const localVideo = document.getElementById('localVideo');
  let videoStream = null;
  let facingMode = 'user';

  localVideo.style.transform = 'scaleX(-1)';

  function startVideo() {
    if (videoStream) stopVideo();
    navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false })
      .then(stream => {
        videoStream = stream;
        localVideo.srcObject = stream;
      })
      .catch(error => {
        console.log('Error accessing the camera:', error);
        localVideo.remove();
      });
  }

  function stopVideo() {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
      localVideo.srcObject = null;
    }
  }

  function flipCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    startVideo();
  }

  localVideo.addEventListener('click', flipCamera);

  const videoCallModal = document.getElementById('videoCallModal');
  videoCallModal.addEventListener('shown.bs.modal', () => {
    isYunaListening = true;
    startVideo();
  });
  videoCallModal.addEventListener('hidden.bs.modal', () => {
    isYunaListening = false;
    stopVideo();
  });
}

setTimeout(initializeVideoStream, 500);

function scrollMsg() {
  const objDiv = document.getElementById('message-container');
  objDiv.scrollTop = objDiv.scrollHeight;
}

async function captureImage() {
  const localVideo = document.getElementById('localVideo');
  const captureCanvas = document.getElementById('capture-canvas');
  const ctx = captureCanvas.getContext('2d');

  captureCanvas.width = localVideo.videoWidth;
  captureCanvas.height = localVideo.videoHeight;

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(localVideo, -captureCanvas.width, 0, captureCanvas.width, captureCanvas.height);
  ctx.restore();

  const imageDataURL = captureCanvas.toDataURL('image/png');
  const imageName = Date.now().toString();

  if (isYunaListening) {
    startRecording(true, imageDataURL, imageName, '');
  } else {
    const messageForImage = prompt('Enter a message for the image:');
    messageManagerInstance.sendMessage(messageForImage, kanojoManager.buildKanojo(), [imageDataURL, imageName, messageForImage], '/image', false, false, isStreamingChatModeEnabled);
  }
}

async function captureImageViaFile(inputElement, image = null, imagePrompt = null) {
  const file = inputElement?.files?.[0] || image;
  if (!file) return alert('No file selected.');

  const reader = new FileReader();
  reader.onloadend = () => {
    const imageDataURL = reader.result;
    const messageForImage = prompt('Enter a message for the image:');
    const imageName = Date.now().toString();
    messageManagerInstance.sendMessage('', kanojoManager.buildKanojo(), [imageDataURL, imageName, messageForImage], '/image', false, false, isStreamingChatModeEnabled);
  };
  reader.readAsDataURL(file);
}

function captureAudioViaFile() {
  const audioUpload = document.getElementById('audioUpload');
  const file = audioUpload.files[0];
  if (!file) return alert('No file selected.');

  const formData = new FormData();
  formData.append('audio', file);
  formData.append('task', 'transcribe');

  const userQuestion = prompt("What's your question?");
  fetch('/audio', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      if (!confirm('Do you want to make a RAG?')) {
        const ragMessage = `Context Audio: "${data.text}"\nQuestion: ${userQuestion}`;
        inputTextContainer.value = ragMessage;
        messageManagerInstance.sendMessage(ragMessage);
      } else {
        const textBlob = new Blob([data.text], { type: 'text/plain' });
        const questionFormData = new FormData();
        questionFormData.append('text', textBlob, 'content.txt');
        questionFormData.append('query', userQuestion);
        fetch('/analyze', { method: 'POST', body: questionFormData })
          .then(response => response.json())
          .then(result => console.log(result))
          .catch(error => console.error('Error:', error));
      }
    });
}

function captureVideoViaFile() {
  const videoUpload = document.getElementById('videoUpload');
  const file = videoUpload.files[0];
  if (!file) return alert('No file selected.');

  const video = document.createElement('video');
  video.src = URL.createObjectURL(file);

  video.addEventListener('loadedmetadata', () => {
    const duration = video.duration;
    const videoFrames = [];
    let currentTime = 0;

    const captureFrame = () => {
      if (currentTime <= duration) {
        video.currentTime = currentTime;
        video.addEventListener('seeked', function onSeeked() {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          videoFrames.push(canvas.toDataURL('image/jpeg'));
          currentTime += 30;
          captureFrame();
          video.removeEventListener('seeked', onSeeked);
        }, { once: true });
      } else {
        captureImageViaFile(null, videoFrames[0], 'Describe the image');
      }
    };
    captureFrame();
  });

  const formData = new FormData();
  formData.append('audio', file);
  formData.append('task', 'transcribe');

  fetch('/audio', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => console.log('The text in video:', data.text))
    .catch(error => console.error('Error:', error));
}

function captureTextViaFile() {
  const file = document.getElementById('textUpload').files[0];
  if (!file) return alert('No file selected.');

  const reader = new FileReader();
  reader.onloadend = () => {
    const formData = new FormData();
    formData.append('audio', file);

    fetch('/text', { method: 'POST', body: formData })
      .then(response => response.json())
      .then(data => console.log('The text in video:', data.text))
      .catch(console.error);
  };
  reader.readAsDataURL(file);
}

// Helper function for POST requests
function postData(task, data = {}) {
  return fetch(`${config_data.server.url + config_data.server.port}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, ...data }),
  }).then(res => res.json());
}

// Populate history select
function populateHistorySelect() {
  loadConfig();
  const historySelect = document.getElementById('chat-items');
  historySelect.innerHTML = '';

  postData('list').then(data => {
    const histories = data.history || data;
    historySelect.insertAdjacentHTML('beforeend', histories.map(filename => `
      <li class="collection-item list-group-item d-flex justify-content-between align-items-center">
        <div class="collection-info"><span class="collection-name">${filename}</span></div>
        <div class="btn-group">
          <button type="button" class="btn btn-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">Action</button>
          <ul class="dropdown-menu collection-actions">
            ${['Open', 'Edit', 'Delete', 'Download', 'Rename'].map(action => `<li><button class="dropdown-item">${action}</button></li>`).join('')}
          </ul>
        </div>
      </li>
    `).join(''));

    duplicateAndCategorizeChats();
    document.querySelectorAll('.collection-item .collection-actions li button').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        const item = button.closest('.collection-item');
        const fileName = item.querySelector('.collection-name').textContent;
        const action = button.textContent;
        selectedFilename = action !== 'Rename' ? fileName : prompt('Enter new name:', fileName);

        switch (action) {
          case 'Open':
            historyManagerInstance.loadSelectedHistory(fileName);
            OpenTab('1');
            break;
          case 'Edit':
            postData('load', { chat: fileName }).then(data => {
              const popup = document.createElement('div');
              popup.className = 'block-popup edit-popup';
              popup.innerHTML = `
                <div class="modal-content">
                  <div class="modal-header">Edit History</div>
                  <div class="modal-body edit-history">
                    <textarea class="block-scroll">${JSON.stringify(data, null, 2)}</textarea>
                  </div>
                  <div class="modal-footer">
                    <button class="block-button" onclick="historyManagerInstance.saveEditedHistory('${fileName}')">Save</button>
                    <button class="block-button" onclick="historyManagerInstance.closePopup('${popup.id}')">Cancel</button>
                  </div>
                </div>
              `;
              document.body.appendChild(popup);
            });
            break;
          case 'Delete':
          case 'Rename':
            const task = action.toLowerCase();
            postData(task, { chat: fileName, name: selectedFilename }).then(() => populateHistorySelect()).catch(console.error);
            break;
          case 'Download':
            postData('load', { chat: fileName }).then(data => {
              const blob = new Blob([JSON.stringify(data)], { type: 'text/plain' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = `${fileName}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
            }).catch(console.error);
            break;
        }
      });
    });
    selectedFilename = config_data.settings.default_history_file;
  }).catch(console.error);

  return Promise.resolve();
}

function duplicateAndCategorizeChats() {
  const categories = { 'Uncategorized': [] };
  document.querySelectorAll('#chat-items .collection-item').forEach(item => {
    const name = item.querySelector('.collection-name').textContent;
    const folder = name.includes(':') ? name.split(':')[1].split('.')[0] : 'Uncategorized';
    (categories[folder] = categories[folder] || []).push(item.cloneNode(true));
  });

  const collectionItems = document.getElementById('collectionItems');
  collectionItems.innerHTML = Object.entries(categories).map(([cat, chats]) => `
    <div class="category-block mb-3">
      <h6 class="fw-bold">${cat}</h6>
      <ul class="list-group">
        ${chats.map(chat => chat.outerHTML).join('')}
      </ul>
    </div>
  `).join('');
}

const allowList = bootstrap.Tooltip.Default.allowList;
(allowList['a'] = allowList['a'] || []).push('onclick');

[...document.querySelectorAll('[data-bs-toggle="popover"]')].map(el => new bootstrap.Popover(el, {
  sanitize: false,
  allowList
}));

function handleImageFileClick() {
  document.getElementById('imageUpload').click();
}

function handleAudioFileClick() {
  document.getElementById('audioUpload').click();
}

function handleVideoFileClick() {
  document.getElementById('videoUpload').click();
}

function handleTextFileClick() {
  document.getElementById('textUpload').click();
}

document.addEventListener('DOMContentLoaded', loadConfig);