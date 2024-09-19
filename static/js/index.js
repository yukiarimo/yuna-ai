var server_url = '';
var server_port = '';
var selectedFilename = '';
var backgroundMusic = document.getElementById('backgroundMusic');
var isHimitsu = false;
var messageContainer = document.getElementById('message-container');
var himitsuCopilot;
var name1;
var name2;
var config_data;
let isRecording = false;
var isYunaListening = false;
let mediaRecorder;
let audioChunks = [];
var activeElement = null;
let isStreamingChatModeEnabled = false;
let isCustomConfigEnabled = false;
let soundsModeEnabled = false;

// Function to handle the toggle switch change
document.querySelector('#streamingChatMode').onchange = e => {
  isStreamingChatModeEnabled = e.target.checked;

  // Retrieve the current configuration from localStorage
  let config = JSON.parse(localStorage.getItem('config')) || {};

  // Ensure the settings object exists
  config.settings = config.settings || {};

  // Update the settings.streaming value
  config.settings.streaming = isStreamingChatModeEnabled;

  // Save the updated configuration back to localStorage
  localStorage.setItem('config', JSON.stringify(config));
};

document.querySelector('#customConfig').onchange = e => {
  isCustomConfigEnabled = e.target.checked;

  // Retrieve the current configuration from localStorage
  let config = JSON.parse(localStorage.getItem('config')) || {};

  // Ensure the settings object exists
  config.settings = config.settings || {};

  // Update the settings.streaming value
  config.settings.customConfig = isCustomConfigEnabled;

  // Save the updated configuration back to localStorage
  localStorage.setItem('config', JSON.stringify(config));
}

document.querySelector('#soundsMode').onchange = e => {
  soundsModeEnabled = e.target.checked;

  // Retrieve the current configuration from localStorage
  let config = JSON.parse(localStorage.getItem('config')) || {};

  // Ensure the settings object exists
  config.settings = config.settings || {};

  // Update the settings.streaming value
  config.settings.sounds = soundsModeEnabled;

  // Save the updated configuration back to localStorage
  localStorage.setItem('config', JSON.stringify(config));
}

const buttonAudioRec = document.querySelector('#buttonAudioRec');
const iconAudioRec = buttonAudioRec.querySelector('#iconAudioRec');

buttonAudioRec.addEventListener('click', () => {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
});

function startRecording(withImage = false, imageDataURL, imageName, messageForImage) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      iconAudioRec.classList.remove('fa-microphone');
      iconAudioRec.classList.add('fa-stop');
      buttonAudioRec.classList.add('btn-danger');
      buttonAudioRec.classList.remove('btn-secondary');
      isRecording = true;

      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

        if (withImage) {
          sendAudioToServer(audioBlob, true, imageDataURL, imageName, messageForImage);
        } else {
          sendAudioToServer(audioBlob);
        }
        audioChunks = [];
      });
    })
    .catch(error => {
      console.error('Error accessing the microphone', error);
    });
}

function stopRecording() {
  mediaRecorder.stop();
  iconAudioRec.classList.add('fa-microphone');
  iconAudioRec.classList.remove('fa-stop');
  buttonAudioRec.classList.remove('btn-danger');
  buttonAudioRec.classList.add('btn-secondary');
  isRecording = false;
}

function sendAudioToServer(audioBlob, withImage = false, imageDataURL, imageName, messageForImage) {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  formData.append('task', 'transcribe');

  fetch('/audio', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (withImage) {
      askYunaImage = messageManagerInstance.sendMessage(data.text, kanojoManager.buildKanojo(), [imageDataURL, imageName, data.text], '/image', false, false, isStreamingChatModeEnabled);
    } else {
      messageManagerInstance.sendMessage(data.text, kanojoManager.buildKanojo(),'', '/message', false, false, isStreamingChatModeEnabled);
    };
  })
  .catch(error => {
    console.error('Error sending audio to server', error);
  });
}

async function loadConfig() {
  let config;
  // Check if 'config' exists in localStorage
  if (localStorage.getItem('config')) {
    // Parse the 'config' from localStorage
    config = JSON.parse(localStorage.getItem('config'));
  } else {
    // Fetch the config from '/static/config.json' and parse it
    config = await (await fetch('/static/config.json')).json();
    // Store the fetched config in localStorage for future use
    localStorage.setItem('config', JSON.stringify(config));
  }
  // Extract names from the config
  const { ai: { names: [first, second] } } = config;
  name1 = first;
  name2 = second;
  // Set the placeholder using the second name
  document.getElementById('input_text').placeholder = `Ask ${second}...`;
}

class messageManager {
  constructor() {
    this.messageContainer = document.getElementById('message-container');
    this.inputText = document.getElementById('input_text');
  }

  displayMessages(messages) {
    const messageContainer = document.getElementById('message-container');
  
    // Clear the existing content of messageContainer
    while (messageContainer.firstChild) {
      messageContainer.removeChild(messageContainer.firstChild);
    }

    // Check if the messages is an array or string
    if (typeof messages === 'string') {      
      try {
        messages = JSON.parse(messages);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  
    // Loop through the messages and format each one
    messages.forEach(messageData => {
      const formattedMessage = formatMessage(messageData);
      messageContainer.appendChild(formattedMessage);
    });
  
    this.scrollMsg();
  }

  createMessage(name, messageContent, isStreaming = false) {
    const messageContainer = document.getElementById('message-container');
    const messageData = {
        name: name,
        message: isStreaming ? '' : messageContent,
    };

    const formattedMessage = formatMessage(messageData);
    messageContainer.appendChild(formattedMessage);
    this.scrollMsg();

    if (name == name2) {
        playAudio('message');
    }

    if (isStreaming) {
        return formattedMessage;
    }
  }

  updateMessageContent(messageElement, content) {
    messageElement.innerHTML = content;
    this.scrollMsg();
  }

  createTypingBubble(naked = false) {
    const typingBubble = `<div id="circle-loader"><img src="/static/img/loader.gif"></div>`;

    if (naked == false) {
      this.messageContainer.insertAdjacentHTML('beforeend', typingBubble);
      this.scrollMsg();
    } else {
      activeElement.insertAdjacentHTML('beforeend', typingBubble);
    }
  }

  removeTypingBubble() {
    const bubble = document.getElementById('circle-loader');
    bubble?.remove();
    this.scrollMsg();
  }

  scrollMsg() {
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }

  async sendMessage(message, template, imageData = '', url = '/message', naked = false, stream = isStreamingChatModeEnabled || false, outputElement = '', config = null) {
    this.inputText = document.getElementById('input_text');
    const messageContent = message || this.inputText.value;
    var userMessageElement;

    if (url === '/message') {
      if (template !== null) {
        userMessageElement = this.createMessage(name1, messageContent);
        this.createTypingBubble(naked);
        updateMsgCount();
      }

        let result = '';
        const decoder = new TextDecoder();
        const serverEndpoint = `${server_url + server_port}${url}`;
        const headers = { 'Content-Type': 'application/json' };

        var yunaConfig;
        if (config === null) {
            yunaConfig = isCustomConfigEnabled ? config_data : null;
        } else {
            yunaConfig = config;
        }

        const body = JSON.stringify({
            chat: selectedFilename,
            text: messageContent,
            useHistory: kanojoManager.useHistory,
            template: (typeof template !== 'undefined') ? template : (this.inputText.value ? kanojoManager.buildKanojo() : null),
            speech: isYunaListening,
            yunaConfig: yunaConfig,
            stream
        });
        this.inputText.value = '';

        try {
            const response = await fetch(serverEndpoint, { method: 'POST', headers, body });

            if (stream && isStreamingChatModeEnabled) {
                const reader = response.body.getReader();

                var isBubbleCreated = false

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    result += chunk;
                    if (outputElement) {
                        outputElement.value += chunk;
                    } else {
                        if (!isBubbleCreated) {
                            this.createMessage(name2, "");
                            isBubbleCreated = true;
                        }
                        
                        let elements = document.querySelectorAll('.p-2.mb-2.block-message-1.text-start.bg-secondary.text-white');
                        let lastElement = elements[elements.length - 1];
                        let preElement = lastElement.querySelector('pre');
                        this.updateMessageContent(preElement, result);
                    }
                    initializeTextareas();
                }

                this.removeTypingBubble();
            } else {
                const data = await response.json();

                if (template !== null) {
                  this.removeTypingBubble();
                  this.createMessage(name2, data.response);
                }
            }

            if (isYunaListening) {
                playAudio();
            }
        } catch (error) {
            this.handleError(error);
        }
        updateMsgCount();
    } else if (url === '/image') {
        this.sendImage(imageData);
    }
  }

  updateTypingBubble(text) {
    const bubble = document.getElementById('circle-loader');
    if (bubble) {
        bubble.innerHTML = text;
        this.scrollMsg();
    }
  }

  processResponse(response) {
    const splitData = response.split('\n');
    const formInputs = splitData.map((dataPart, index) => `
      <div class="input-group">
        <label for="q${index + 1}">${dataPart}</label>
        <input type="text" id="q${index + 1}" name="q${index + 1}">
      </div>
    `).join('');
  
    return `
      <div>
        <form id="Himitsu">
          ${formInputs}
        </form>
        <div class="block-button" type="button" onclick="generateText();">Gen</div>
      </div>
    `;
  }

  handleError(error) {
    console.error('Error:', error);
    this.removeTypingBubble();
    this.createMessage(name2, error);
    playAudio('error');
  }

  sendImage(imageData) {
    const [imageDataURL, imageName, messageForImage] = imageData;
    const serverEndpoint = `${server_url + server_port}/image`;
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ image: imageDataURL, name: imageName, message: messageForImage, task: 'caption', chat: selectedFilename, speech: isYunaListening });

    fetch(serverEndpoint, { method: 'POST', headers, body })
      .then(response => response.ok ? response.json() : Promise.reject('Error sending captured image.'))
      .then(data => {
        this.removeTypingBubble();
        const imageCaption = `${messageForImage}<img src="${data.path}" alt="${imageName}">`;
        this.createMessage(name1, imageCaption);

        const imageResponse = `${data.message}`;
        this.createMessage(name2, imageResponse);

        // play audio
        if (isYunaListening) {
          playAudio();
        }

        return imageCaption;
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error sending captured image.');
      });
  }
}

// Create a new instance of the messageManager class
messageManagerInstance = new messageManager();

function playAudio(audioType = 'tts') {
  if (!soundsModeEnabled && audioType != 'tts') {
    return;
  }

  const audioSource = document.getElementById("backgroundMusic");
  const audioMap = {
    'tts': `/static/audio/audio.mp3?v=${Math.random()}`,
    'call': '/audio/sfx/app/ringtone.mp3',
    'camera': '/audio/sfx/app/camera.mp3',
    'confirm': '/audio/sfx/app/confirm.mp3',
    'error': '/audio/sfx/app/error.mp3',
    'keyboard': '/audio/sfx/app/keyboard.mp3',
    'message': '/audio/sfx/app/message.mp3',
    'mouseclick': '/audio/sfx/app/mouseclick.mp3',
    'notification': '/audio/sfx/app/notification.mp3',
    'popup': '/audio/sfx/app/popup.mp3',
    'server': '/audio/sfx/app/server.mp3',
    'welcome': '/audio/sfx/app/welcome.mp3',
    'wrong': '/audio/sfx/app/wrong.mp3',
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

  const classes = messageData.name == name1 || messageData.name == 'Yuki'
    ? ['block-message-2', 'text-end', 'bg-primary', 'text-white'] 
    : ['block-message-1', 'text-start', 'bg-secondary', 'text-white'];
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
  const input_text = document.getElementById('input_text');
  input_text.value = messageText;

  messageManagerInstance.sendMessage('');
}

function setMessagePopoverListeners() {
  // Select all message bubbles
  const messageBubbles = document.querySelectorAll('.message');

  // Iterate over each message bubble
  messageBubbles.forEach(message => {
    // Add click event listener to each message bubble
    message.addEventListener('click', function(event) {
      // Prevent event from bubbling up to avoid triggering click events on parent elements
      event.stopPropagation();

      // Close all open message menus
      document.querySelectorAll('.message-menu').forEach(menu => {
        menu.style.display = 'none';
      });

      // Toggle the display of the current message's menu
      const currentMenu = this.querySelector('.message-menu');
      currentMenu.style.display = currentMenu.style.display === 'block' ? 'none' : 'block';
    });
  });

  // Add a global click listener to close all message menus when clicking outside
  document.addEventListener('click', function() {
    document.querySelectorAll('.message-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  });

  // Select all delete buttons
  const deleteButtons = document.querySelectorAll('.delete-btn');

  // Add click event listener to each delete button
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      // Prevent event from bubbling up to avoid triggering click events on parent elements
      event.stopPropagation();

      // Get the message text to be deleted
      const messageText = this.closest('.message').querySelector('.message-text').textContent;

      // Call the deleteMessageFromHistory function with the message text
      deleteMessageFromHistory(messageText);
    });
  });
}
setTimeout(setMessagePopoverListeners, 200);

class HistoryManager {
  constructor(serverUrl, serverPort, defaultHistoryFile) {
    this.serverUrl = serverUrl || 'https://localhost:';
    this.serverPort = serverPort || 4848;
    this.defaultHistoryFile = defaultHistoryFile || 'history_template:general.json';
    this.messageContainer = document.getElementById('message-container');
  }

  createHistoryFile() {
    const newFileName = prompt('Enter a name for the new file (with .json):');
    if (!newFileName) {
      return; // Exit if no name is entered
    }

    selectedFilename = newFileName;

    fetch(`${server_url + server_port}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat: newFileName,
          task: "create"
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(populateHistorySelect())
      .catch(error => {
        console.error('An error occurred:', error);
      });
  }

  get selectedFilename() {
    return this._selectedFilename || this.defaultHistoryFile;
  }

  set selectedFilename(filename) {
    this._selectedFilename = filename;
  }

  downloadHistory() {
    this.fetchHistory('load')
      .then(data => {
        const chatHistory = JSON.stringify(data);
        const blob = new Blob([chatHistory], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.selectedFilename}.json`;
        document.body.appendChild(a); // Append to body to ensure visibility in Firefox
        a.click();
        document.body.removeChild(a); // Clean up

        URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Error fetching history for download:', error));
  }

  async importHistory() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
  
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      const reader = new FileReader();
  
      await new Promise((resolve) => {
        reader.onload = () => {
          resolve();
        };
        reader.readAsText(file);
      });
  
      const historyData = reader.result;
      const filename = prompt('Enter a name for the new file (with .json):');
  
      try {
        const response = await fetch(`${server_url + server_port}/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat: filename,
            task: 'save',
            history: historyData,
          }),
        });
  
        await response.json();
        alert('History imported successfully.');
        location.reload();
      } catch (error) {
        console.error('Error sending edited history:', error);
      }
    };
  
    fileInput.click();
  }  

  editHistory() {
    this.fetchHistory('load')
      .then(data => {
        const historyPopup = document.createElement('div');
        historyPopup.classList.add('block-popup', 'edit-popup');

        const popupContent = `
          <div class="modal-content">
            <div class="modal-header">Edit History</div>
            <div class="modal-body">
              <textarea class="block-scroll">${JSON.stringify(data, null, 2)}</textarea>
            </div>
            <div class="modal-footer">
              <button class="block-button" onclick="historyManagerInstance.saveEditedHistory('${this.selectedFilename}')">Save</button>
              <button class="block-button" onclick="historyManagerInstance.closePopup('${historyPopup.id}')">Cancel</button>
            </div>
          </div>
        `;

        historyPopup.innerHTML = popupContent;
        document.body.appendChild(historyPopup);
      })
      .catch(error => console.error('Error loading selected history file:', error));
  }

  saveEditedHistory() {
    const editTextArea = document.querySelector('.block-popup.edit-popup textarea');
    const editedText = editTextArea.value;

    this.sendEditHistory(editedText, this.selectedFilename);
  }

  sendEditHistory(editedText, filename) {
    fetch(`${this.serverUrl + this.serverPort}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat: filename,
        task: 'edit',
        history: JSON.parse(editedText),
      }),
    })
    .then(response => response.json())
    .then(() => this.loadSelectedHistory())
    .catch(error => console.error('Error sending edited history:', error));
  }

  fetchHistory(task) {
    return fetch(`${this.serverUrl + this.serverPort}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat: this.selectedFilename,
        task: task,
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    });
  }

  // Placeholder for loadSelectedHistory method
  loadSelectedHistory(selectedFilename) {
    const messageContainer = document.getElementById('message-container');
    if (selectedFilename == undefined) {
      selectedFilename = config_data.settings.default_history_file;
    }
  
    fetch(`${server_url+server_port}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'load', chat: selectedFilename })
    })
    .then(response => {
      if (!response.ok) throw new Error('Error loading selected history file.');
      return response.json();
    })
    .then(data => {
      messageManagerInstance.displayMessages(data);
      updateMsgCount();
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
}

// Assuming server_url, server_port, and config_data are defined globally
var historyManagerInstance = new HistoryManager();

function initializeVideoStream() {
  var localVideo = document.getElementById('localVideo');
  var videoStream = null; // To hold the stream globally
  var facingMode = "user"; // Default facing mode

  localVideo.style.transform = "scaleX(-1)";

  // Function to start or restart the video stream with the given facingMode
  function startVideo() {
    // First, stop any existing video stream
    if (videoStream) {
      stopVideo();
    }

    // Request video stream with the current facingMode
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode },
      audio: false
    })
    .then(function(stream) {
      videoStream = stream; // Assign the stream to the global variable
      localVideo.srcObject = stream;
    })
    .catch(function(error) {
      console.log('Error accessing the camera:', error);
      localVideo.remove();
    });
  }

  // Function to stop the video stream
  function stopVideo() {
    if (videoStream) {
      videoStream.getTracks().forEach(function(track) {
        track.stop();
      });
      videoStream = null; // Clear the global stream variable
      localVideo.srcObject = null;
    }
  }

  // Function to flip the camera
  function flipCamera() {
    // Toggle facingMode between "user" and "environment"
    facingMode = facingMode === "user" ? "environment" : "user";
    startVideo(); // Restart video with the new facingMode
  }

  // Add click event listener to the video element to flip the camera on click
  localVideo.addEventListener('click', flipCamera);

  // Start the video stream when the modal is shown
  var videoCallModal = document.getElementById('videoCallModal');
  videoCallModal.addEventListener('shown.bs.modal', function () {
    isYunaListening = true;
    startVideo();
  });

  // Stop the video stream when the modal is hidden
  videoCallModal.addEventListener('hidden.bs.modal', function () {
    isYunaListening = false;
    stopVideo();
  });
}

// Initialize the video stream functionality after a delay
setTimeout(initializeVideoStream, 500);

function scrollMsg() {
  objDiv = document.getElementById("message-container");
  objDiv.scrollTop = objDiv.scrollHeight;
}

async function drawArt() {
  const messageContainer = document.getElementById('message-container');
  const imagePrompt = prompt('Enter a prompt for the image:');
  loadConfig();

  messageContainer.insertAdjacentHTML('beforeend', formatMessage({ name: name1, message: imagePrompt }));
  messageContainer.insertAdjacentHTML('beforeend', typingBubble);
  scrollMsg();

  try {
    const response = await fetch(`${server_url+server_port}/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: imagePrompt, chat: selectedFilename, task: 'generate' })
    });

    if (!response.ok) throw new Error('Error generating image.');

    const data = await response.json();
    document.getElementById('circle-loader')?.remove();

    messageContainer.insertAdjacentHTML('beforeend', formatMessage({ name: name2, message: data.message }));
  } catch (error) {
    console.error('Error:', error);
    alert('Error sending captured image.');
  }
}

// Add an event listener to the "Capture Image" button
async function captureImage() {
  var localVideo = document.getElementById('localVideo');
  var captureCanvas = document.getElementById('capture-canvas');
  var captureContext = captureCanvas.getContext('2d');
  var messageContainer = document.getElementById('message-container');

  // Set the canvas dimensions to match the video element
  captureCanvas.width = localVideo.videoWidth;
  captureCanvas.height = localVideo.videoHeight;

  // Apply mirroring transformation to the canvas context
  captureContext.save(); // Save the current state
  captureContext.scale(-1, 1); // Flip horizontally
  captureContext.drawImage(localVideo, -captureCanvas.width, 0, captureCanvas.width, captureCanvas.height); // Draw the video frame
  captureContext.restore(); // Restore the original state

  var imageDataURL = captureCanvas.toDataURL('image/png'); // Convert canvas to base64 data URL

  let messageForImage = '';
  var imageName = new Date().getTime().toString();


  if (isYunaListening) {
    // Start recording
    startRecording(true, imageDataURL, imageName, messageForImage);

    return true;
  } else {
    messageForImage = prompt('Enter a message for the image:');
    askYunaImage = messageManagerInstance.sendMessage(messageForImage, kanojoManager.buildKanojo(), [imageDataURL, imageName, messageForImage], '/image', false, false, isStreamingChatModeEnabled);
  }
}

// Modify the captureImage function to handle file uploads
async function captureImageViaFile(inputElement, image=null, imagePrompt=null) {
  var file = '';
  file = inputElement.files[0] || (image && !imagePrompt ? image : imagePrompt && image ? image : null);
  if (!file) return alert('No file selected.');

  const reader = new FileReader();
  reader.onloadend = async function () {
    const imageDataURL = reader.result;
    var messageForImage = '';
    messageForImage = prompt('Enter a message for the image:');

    const imageName = Date.now().toString();
    messageManagerInstance.sendMessage('', kanojoManager.buildKanojo(), [imageDataURL, imageName, messageForImage], '/image', false, false, isStreamingChatModeEnabled);
  };

  reader.readAsDataURL(file);
}

function captureAudioViaFile() {
  const audioUpload = document.getElementById('audioUpload');
  const file = audioUpload.files[0];

  if (!file) {
    alert('No file selected.');
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async function () {
    const audioDataURL = reader.result;
    const audioName = Date.now().toString();
  };

  const formData = new FormData();

  formData.append('audio', file);
  formData.append('task', 'transcribe');

  const userQuestion = prompt("What's your question?");

  fetch('/audio', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    const makeRAG = confirm("Do you want to make a RAG?");
    if (!makeRAG) {
      var ragMessage = `Context Audio: "${data.text}"\nQuestion: ${userQuestion}`
      document.getElementById('input_text').value = ragMessage;
      messageManagerInstance.sendMessage(ragMessage);
    } else {
      const textBlob = new Blob([data.text], { type: 'text/plain' });
      const questionFormData = new FormData();
      questionFormData.append('text', textBlob, 'content.txt');
      questionFormData.append('query', userQuestion);

      fetch('/analyze', {
        method: 'POST',
        body: questionFormData
      })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  });

  reader.readAsDataURL(file);
}

function captureVideoViaFile() {
  const videoUpload = document.getElementById('videoUpload');
  const file = videoUpload.files[0];

  if (!file) {
    alert('No file selected.');
    return;
  }

  const videoFrames = [];

  const video = document.createElement('video');
  video.src = URL.createObjectURL(file);

  video.addEventListener('loadedmetadata', function() {
    const duration = video.duration;
    let currentTime = 0;

    function captureFrame() {
      if (currentTime <= duration) {
        video.currentTime = currentTime;
        video.addEventListener('seeked', function() {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameDataURL = canvas.toDataURL('image/jpeg');
          videoFrames.push(frameDataURL);
          currentTime += 30;
          captureFrame();
        }, { once: true });
      } else {
        console.log('not implemented');
      }
    }

    captureFrame();
  });

  // capture first frame using captureImageViaFile(image) function
  captureRessult = captureImageViaFile(videoFrames[0], 'Describe the image');

  const formData = new FormData();
  formData.append('audio', file);
  formData.append('task', 'transcribe');

  fetch('/audio', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('The text in video:', data.text);
  });
}

function captureTextViaFile() {
  const textUpload = document.getElementById('textUpload');
  const file = textUpload.files[0];

  if (!file) {
    alert('No file selected.');
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async function () {
    const textDataURL = reader.result;
    const textName = Date.now().toString();
  }

  const formData = new FormData();

  formData.append('audio', file);

  fetch('/text', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('The text in video:', data.text);
  })

  reader.readAsDataURL(file);
}

// Function to fetch and populate chat history file options
function populateHistorySelect() {
  loadConfig();
  return new Promise((resolve, reject) => {
    var historySelect = document.getElementById('chat-items');
    historySelect.innerHTML = '';

    server_port = JSON.parse(localStorage.getItem('config')).server.port
    server_url = JSON.parse(localStorage.getItem('config')).server.url

    // Fetch the list of history files from the server using the new /history route with 'load' task
    fetch(`${server_url+server_port}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: 'list',
        }),
      })
      .then(response => response.json())
      .then(data => {
        historySelect = document.getElementById('chat-items');
        if (data.history != undefined) {
          data = data.history;
        }

        // Populate the <select> with the available options 
        historySelect.insertAdjacentHTML('beforeend', data.map(filename => 
          ` 
          <li class="collection-item list-group-item d-flex justify-content-between align-items-center">
          <div class="collection-info"> 
              <span class="collection-name">${filename}</span> 
            </div>
              <div class="btn-group">
                  <button type="button" class="btn btn-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Action</button>
                  <ul class="dropdown-menu collection-actions">
                      <li><button class="dropdown-item" type="button">Open</button></li>
                      <li><button class="dropdown-item" type="button">Edit</button></li>
                      <li><button class="dropdown-item" type="button">Delete</button></li>
                      <li><button class="dropdown-item" type="button">Download</button></li>
                      <li><button class="dropdown-item" type="button">Rename</button></li>
                  </ul>
              </div>
          </li>
          
          `).join(''));

        duplicateAndCategorizeChats()
        // Select all the buttons in the list
        let buttons = document.querySelectorAll('.collection-item .collection-actions li button');

        // Add an event listener to each button
        buttons.forEach(button => {
          button.addEventListener('click', function (event) {
            // Prevent the default action
            event.preventDefault();

            // Get the name of the file
            let fileName = this.closest('.collection-item').querySelector('.collection-name').textContent;

            // Get the action (the button's text content)
            let action = this.textContent;

            // Handle the action
            switch (action) {
              case 'Open':
                selectedFilename = fileName;
                historyManagerInstance.loadSelectedHistory(fileName);
                OpenTab('1');
                break;
              case 'Edit':
                selectedFilename = fileName;

                fetch(`${server_url + server_port}/history`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      chat: fileName,
                      task: "load"
                    })
                  })
                  .then(response => response.json())
                  .then(data => {
                    var historyPopup = document.createElement('div');
                    historyPopup.classList.add('block-popup', 'edit-popup');

                    var popupContent = `
                      <div class="modal-content">
                        <div class="modal-header">Edit History</div>
                        <div class="modal-body edit-history">
                          <textarea class="block-scroll">${JSON.stringify(data, null, 2)}</textarea>
                        </div>
                        <div class="modal-footer">
                          <button class="block-button" onclick="historyManagerInstance.saveEditedHistory('${fileName}')">Save</button>
                          <button class="block-button" onclick="historyManagerInstance.closePopup('${historyPopup.id}')">Cancel</button>
                        </div>
                      </div>
                    `;

                    historyPopup.innerHTML = popupContent;
                    document.body.appendChild(historyPopup);
                  }
                );
                break;
              case 'Delete':
                fetch(`${server_url + server_port}/history`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      chat: fileName,
                      task: "delete"
                    })
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                  })
                  .then(populateHistorySelect())
                  .catch(error => {
                    console.error('An error occurred:', error);
                  });
                break;
              case 'Download':
                // request load history file from the server and download it as json file
                fetch(`${server_url + server_port}/history`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      chat: fileName,
                      task: "load"
                    })
                  })
                  .then(response => response.json())
                  .then(data => {
                    var chatHistory = JSON.stringify(data);
                    var blob = new Blob([chatHistory], {
                      type: 'text/plain',
                    });
                    var url = URL.createObjectURL(blob);

                    // Create a temporary anchor element for downloading
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = `${fileName}.json`;
                    a.click();

                    // Clean up
                    URL.revokeObjectURL(url);
                  })
                  .catch(error => {
                    console.error('Error fetching history for download:', error);
                  });
                break;
              case 'Rename':
                var newName = prompt('Enter a new name for the file (with .json):', fileName);
                selectedFilename = newName;

                fetch(`${server_url + server_port}/history`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      chat: fileName,
                      name: newName,
                      task: "rename"
                    })
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                  })
                  .then(populateHistorySelect())
                  .catch(error => {
                    console.error('An error occurred:', error);
                  });
                break;
            }
          });
        });

        selectedFilename = config_data.settings.default_history_file;
      })
      .catch(error => {
        console.error('Error fetching history files:', error);
      });

    // Resolve the promise when the operation is complete
    resolve();
  });
}

function duplicateAndCategorizeChats() {
  const chatList = document.querySelector('#chat-items');
  const collectionItems = document.querySelector('#collectionItems');
  
  // Clear existing content in collectionItems
  collectionItems.innerHTML = '';

  // Create an object to store categorized chats
  const categories = {
      'Uncategorized': []
  };

  // Check if chatList exists and has items
  const items = chatList && chatList.children.length > 0 
      ? chatList.querySelectorAll('.collection-item') 
      : document.querySelectorAll('.collection-item');

  items.forEach(item => {
      const chatName = item.querySelector('.collection-name').textContent;
      const colonIndex = chatName.indexOf(':');
      
      if (colonIndex !== -1) {
          const folder = chatName.substring(colonIndex + 1).split('.')[0]; // Get the part after ':' and before '.'
          if (!categories[folder]) {
              categories[folder] = [];
          }
          categories[folder].push(item.cloneNode(true));
      } else {
          categories['Uncategorized'].push(item.cloneNode(true));
      }
  });

  // Create category blocks and add chats
  for (const [category, chats] of Object.entries(categories)) {
      if (chats.length === 0) continue; // Skip empty categories

      const categoryBlock = document.createElement('div');
      categoryBlock.className = 'category-block mb-3';
      categoryBlock.innerHTML = `<h6 class="fw-bold">${category}</h6>`;

      const categoryList = document.createElement('ul');
      categoryList.className = 'list-group';

      chats.forEach(chat => {
          categoryList.appendChild(chat);
      });

      categoryBlock.appendChild(categoryList);
      collectionItems.appendChild(categoryBlock);
  }
}

var myDefaultAllowList = bootstrap.Tooltip.Default.allowList;
myDefaultAllowList['a'] = myDefaultAllowList['a'] || [];
myDefaultAllowList['a'].push('onclick');

var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl, {
    sanitize: false,
    allowList: myDefaultAllowList
  });
});

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

class NotificationManager {
  constructor() {
    this.dropdownMenu = document.querySelector('.dropdown-menu.dropdown-menu-end.dropdown-list.animated--grow-in');
    this.messages = [];
  }

  add(message) {
    this.messages.push(message);
    this.render();
  }

  delete(message) {
    this.messages = this.messages.filter(msg => msg !== message);
    this.render();
  }

  clearAll() {
    this.messages = [];
    this.render();
  }

  render() {
    this.dropdownMenu.innerHTML = this.messages.map(message => `
      <a class="dropdown-item d-flex align-items-center" href="#">
        <div>
          <span class="font-weight-bold">${message}</span>
        </div>
      </a>
    `).join('');
  }
}

// Create an instance of NotificationManager
const notificationManagerInstance = new NotificationManager();

// Call the add method
notificationManagerInstance.add("Hello! Welcome to the chat room!");

function updateMsgCount() {
  setTimeout(() => {
    document.getElementById('messageCount').textContent = document.querySelectorAll('#message-container .p-2.mb-2').length;
    document.getElementById('chatsCount').textContent = document.querySelectorAll('#chat-items .collection-item').length;
  }, 300);
}

function deleteMessageFromHistory(message) {
  let fileName = selectedFilename;

  fetch(`${server_url + server_port}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: fileName,
        task: "delete_message",
        text: message
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(historyManagerInstance.loadSelectedHistory(fileName))
    .catch(error => {
      console.error('An error occurred:', error);
    });
}

// Function to adjust textarea height
function adjustTextareaHeight(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// Function to initialize all textareas
function initializeTextareas() {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    // Disable manual resizing
    textarea.style.resize = 'none';
    
    // Initial adjustment
    adjustTextareaHeight(textarea);
    
    // Add event listeners for real-time updates
    textarea.addEventListener('input', () => adjustTextareaHeight(textarea));
    textarea.addEventListener('change', () => adjustTextareaHeight(textarea));
    
    // Create a MutationObserver to watch for changes in content
    const observer = new MutationObserver(() => adjustTextareaHeight(textarea));
    observer.observe(textarea, { childList: true, characterData: true, subtree: true });
  });
}

// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeTextareas);

// Also run it immediately in case the script is loaded after the DOM
initializeTextareas();