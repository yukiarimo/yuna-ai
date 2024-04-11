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

const buttonAudioRec = document.querySelector('#buttonAudioRec');
const iconAudioRec = buttonAudioRec.querySelector('#iconAudioRec');

buttonAudioRec.addEventListener('click', () => {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
});

function startRecording() {
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
        sendAudioToServer(audioBlob);
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

function sendAudioToServer(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob);

  fetch('/audio', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('The text in video:', data.text);
    // Here you can update the client with the transcription result
    // For example, you could display the result in an HTML element
    messageManager.sendMessage(data.text, imageData = '', url = '/message')
  })
  .catch(error => {
    console.error('Error sending audio to server', error);
  });
}

async function loadConfig() {
  const { ai: { names: [name1, name2] } } = await (await fetch('/static/config.json')).json();
  document.getElementById('input_text').placeholder = `Ask ${name2}...`;
}

function changeHimitsuState() {
  isHimitsu = !isHimitsu;
}

function downloadVariableAsFile(variableContent, filename) {
  // Create a Blob with the variable content
  const blob = new Blob([variableContent], { type: 'text/plain' });

  // Create an anchor element and trigger a download
  const anchor = document.createElement('a');
  const url = URL.createObjectURL(blob);
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up by revoking the Object URL and removing the anchor element
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

class messageManager {
  constructor() {
    this.messageContainer = document.getElementById('message-container');
    this.inputText = document.getElementById('input_text');
  }

  displayMessages(messages) {
    messageContainer = document.getElementById('message-container');
  
    // Clear the existing content of messageContainer
    while (messageContainer.firstChild) {
      messageContainer.removeChild(messageContainer.firstChild);
    }

    messages = messages
    // check if the messages is an array or string
    if (typeof messages === 'string') {      
      try {
        messages = JSON.parse(`${messages}`);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  
    // Loop through the messages and format each one
    messages.forEach(messageData => {
      var formattedMessage = formatMessage(messageData);
      messageContainer.appendChild(formattedMessage);
    });
  
    messageContainer.innerHTML = messageContainer.innerHTML
  
    scrollMsg()
  }

  createMessage(name, messageContent) {
    const messageContainer = document.getElementById('message-container');
    const messageData = {
      name: name,
      message: messageContent,
    };

    const formattedMessage = formatMessage(messageData);
    messageContainer.appendChild(formattedMessage);
    scrollMsg();
  }

  createTypingBubble() {
    const typingBubble = `<div id="circle-loader"><img src="/static/img/loader.gif"></div>`;
    this.messageContainer.insertAdjacentHTML('beforeend', typingBubble);
    scrollMsg();
  }

  removeTypingBubble() {
    const bubble = document.getElementById('circle-loader');
    bubble?.remove();
    scrollMsg();
  }

  scrollMsg() {
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }

  sendMessage(message, imageData = '', url = '/message') {
    this.inputText = document.getElementById('input_text');
    this.createMessage(name1, message || this.inputText.value);
    this.createTypingBubble();

    if (url === '/message') {
      message = message || this.inputText.value;
      this.inputText.value = '';
      const serverEndpoint = `${server_url + server_port}${url}`;
      const headers = { 'Content-Type': 'application/json' };
      const body = JSON.stringify({ chat: selectedFilename, text: message, useHistory: kanojo.useHistory, template: kanojo.buildKanojo(), speech: isYunaListening });

      fetch(serverEndpoint, { method: 'POST', headers, body })
        .then(response => response.json())
        .then(data => {
          this.removeTypingBubble();
          this.createMessage(name2, data.response);
          if (isYunaListening) {
            playAudio();
          }
        })
        .catch(error => {
          this.handleError(error);
        });
    } else if (url === '/image') {
      this.sendImage(imageData);
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
    const body = JSON.stringify({ image: imageDataURL, name: imageName, message: messageForImage, task: 'caption', chat: selectedFilename});

    fetch(serverEndpoint, { method: 'POST', headers, body })
      .then(response => response.ok ? response.json() : Promise.reject('Error sending captured image.'))
      .then(data => {
        this.removeTypingBubble();
        const imageCaption = `${messageForImage}<img src="${data.path}" alt="${imageName}">`;
        this.createMessage(name1, imageCaption);

        const imageResponse = `${data.message}`;
        this.createMessage(name2, imageResponse);

        return imageCaption;
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error sending captured image.');
      });
  }
}

// Create a new instance of the messageManager class
messageManager = new messageManager();

function playAudio(audioType = 'tts') {
  const audioSource = document.getElementById("backgroundMusic");
  const audioMap = {
    'tts': `/static/audio/audio.aiff?v=${Math.random()}`,
    'message': 'audio/sounds/message.mp3',
    'send': 'audio/sounds/send.mp3',
    'error': 'audio/sounds/error.mp3',
    'ringtone': 'audio/sounds/ringtone.mp3'
  };
  audioSource.src = audioMap[audioType];
  // calculate the duration of the audio, play the audio and stop after that duration
  audioSource.play();
  audioSource.addEventListener('ended', () => {
    audioSource.pause();
  });
}

// Other functions (clearHistory, loadHistory, downloadHistory) go here if needed.
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
  menuToggleBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';

  const messageMenu = document.createElement('div');
  messageMenu.classList.add('message-menu');

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('close-btn');
  closeBtn.textContent = 'Close';

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = 'Delete message';

  messageMenu.appendChild(closeBtn);
  messageMenu.appendChild(deleteBtn);

  messageDiv.appendChild(messageText);
  messageDiv.appendChild(menuToggleBtn);
  messageDiv.appendChild(messageMenu);

  scrollMsg();
  setMessagePopoverListeners()

  return messageDiv;
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

      // reload the page
      setTimeout(function () {
        location.reload()
      }, 300);
    });
  });
}

// run the setMessagePopoverListeners function with a delay of 1 second
setTimeout(setMessagePopoverListeners, 1000);

class HistoryManager {
  constructor(serverUrl, serverPort, defaultHistoryFile) {
    this.serverUrl = serverUrl || 'http://localhost:';
    this.serverPort = serverPort || 4848;
    this.defaultHistoryFile = defaultHistoryFile || 'history_template.json';
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
      .then(responseData => {
        alert(responseData);
      })
      .catch(error => {
        console.error('An error occurred:', error);
      });

    // Reload the page with a delay of 1 second
    setTimeout(() => {
      //location.reload();
    }, 1000);
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
              <button class="block-button" onclick="historyManager.saveEditedHistory('${this.selectedFilename}')">Save</button>
              <button class="block-button" onclick="historyManager.closePopup('${historyPopup.id}')">Cancel</button>
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

  closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup?.remove();
  }

  // Placeholder for loadSelectedHistory method
  loadSelectedHistory(filename) {
    const selectedFilename = filename || this.defaultHistoryFile;

    fetch(`${this.serverUrl + this.serverPort}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'load',
        chat: selectedFilename
      }),
    })
    .then(response => response.json())
    .then(data => {
      this.displayMessages(data);
    })
    .catch(error => {
      console.error('Error loading selected history file:', error);
    });

    this.closePopupsAll();
  }
}

// Assuming server_url, server_port, and config_data are defined globally
var historyManager = new HistoryManager();

function initializeVideoStream() {
  var localVideo = document.getElementById('localVideo');
  var videoStream = null; // To hold the stream globally
  var facingMode = "user"; // Default facing mode

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
setTimeout(initializeVideoStream, 3000);

function closePopup(popupId) {
  var popup = document.getElementById(popupId);
  popup.remove();
}

function scrollMsg() {
  objDiv = document.getElementById("message-container");
  objDiv.scrollTop = objDiv.scrollHeight;
}

async function drawArt() {
  const messageContainer = document.getElementById('message-container');
  const imagePrompt = prompt('Enter a prompt for the image:');
  loadConfig();

  closePopupsAll();

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
function captureImage() {
  var localVideo = document.getElementById('localVideo');
  var captureCanvas = document.getElementById('capture-canvas');
  var captureContext = captureCanvas.getContext('2d');
  messageContainer = document.getElementById('message-container');

  // Set the canvas dimensions to match the video element
  captureCanvas.width = localVideo.videoWidth;
  captureCanvas.height = localVideo.videoHeight;

  // Draw the current frame from the video onto the canvas
  captureContext.drawImage(localVideo, 0, 0, captureCanvas.width, captureCanvas.height);

  captureCanvas = document.getElementById('capture-canvas');
  imageDataURL = captureCanvas.toDataURL('image/png'); // Convert canvas to base64 data URL

  messageForImage = prompt('Enter a message for the image:');

  // generate a random image name using current timestamp
  var imageName = new Date().getTime().toString();

  closePopupsAll();

  askYunaImage = messageManager.sendMessage('', [imageDataURL, imageName, messageForImage], '/image');
}

// Modify the captureImage function to handle file uploads
async function captureImageViaFile() {
  const imageUpload = document.getElementById('imageUpload');
  const file = imageUpload.files[0];

  if (!file) {
    alert('No file selected.');
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async function () {
    const imageDataURL = reader.result;
    const messageForImage = prompt('Enter a message for the image:');
    const imageName = Date.now().toString();

    closePopupsAll();
    messageManager.sendMessage('', [imageDataURL, imageName, messageForImage], '/image');
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

    closePopupsAll();
  };

  const formData = new FormData();

  formData.append('audio', file);

  fetch('/audio', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('The text in video:', data.text);
  })

  reader.readAsDataURL(file);
}

function captureVideoViaFile() {
  const videoUpload = document.getElementById('videoUpload');
  const file = videoUpload.files[0];

  if (!file) {
    alert('No file selected.');
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async function () {
    const videoDataURL = reader.result;
    const videoName = Date.now().toString();

    closePopupsAll();
  }

  const formData = new FormData();

  formData.append('audio', file);

  fetch('/audio', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('The text in video:', data.text);
  })

  reader.readAsDataURL(file);
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

    closePopupsAll();
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

    if (localStorage.getItem('config') == null) {
      // reload the page with delay of 1 second if config is not available
      setTimeout(function () {
        location.reload()
      }, 100);
    }

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

            // You can now use fileName and action for whatever you need
            console.log(`Action: ${action}, File Name: ${fileName}`);

            // Handle the action
            switch (action) {
              case 'Open':
                selectedFilename = fileName;
                loadSelectedHistory(fileName);
                OpenTab('1');
                break;
              case 'Edit':
                selectedFilename = fileName;

                alert('Edit History is not available yet.');
                break;
              case 'Delete':
                // continue only if the user confirms alert
                if (confirm("Are you sure you want to delete this file?")) {
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
                    .then(responseData => {
                      console.log(responseData);
                    })
                    .catch(error => {
                      console.error('An error occurred:', error);
                    });

                  // reload the page with delay of 1 second
                  setTimeout(function () {
                    location.reload()
                  }, 100);
                }
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
                  .then(responseData => {
                    console.log(responseData);
                  })
                  .catch(error => {
                    console.error('An error occurred:', error);
                  });
                break;
              default:
                console.log(`Unknown action: ${action} for file: ${fileName}`);
            }
          });
        });

        selectedFilename = config_data.server.default_history_file;
      })
      .catch(error => {
        console.error('Error fetching history files:', error);
      });

    // Resolve the promise when the operation is complete
    resolve();
  });
}

function loadSelectedHistory(selectedFilename) {
  const messageContainer = document.getElementById('message-container');
  if (selectedFilename == undefined) {
    selectedFilename = config_data.server.default_history_file;
  }

  fetch(`${server_url+server_port}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'load', chat: selectedFilename })
  })
  .then(response => {
    console.log();
    if (!response.ok) throw new Error('Error loading selected history file.');
    return response.json();
  })
  .then(data => {
    messageManager.displayMessages(data);
    closePopupsAll();
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function duplicateAndCategorizeChats() {
  const chatItems = document.querySelectorAll('#chat-items .collection-item');
  const collectionItems = document.createElement('div');
  collectionItems.id = 'collectionItems';
  collectionItems.classList.add('list-group');

  const generalChatsDiv = document.createElement('div');
  const otherChatsDiv = document.createElement('div');

  chatItems.forEach(item => {
    const clonedItem = item.cloneNode(true);
    const collectionName = clonedItem.querySelector('.collection-name').textContent;
    (collectionName.includes(':general:') ? generalChatsDiv : otherChatsDiv).appendChild(clonedItem);
  });

  collectionItems.append(generalChatsDiv, otherChatsDiv);
  document.getElementById('collectionItems').replaceWith(collectionItems);
}

function fixDialogData() {
  populateHistorySelect().then(() => {
    loadSelectedHistory();
  });

  closePopupsAll();
}

function closePopupsAll() {
  var popups = document.querySelectorAll('.block-popup');
  popups.forEach(popup => {
    popup.style.display = 'none';
  });

  var parameterContainer = document.getElementById('parameter-container');
  parameterContainer.innerHTML = '';
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

document.addEventListener('DOMContentLoaded', (event) => {
  const switchInput = document.getElementById('customSwitch');
  const toastElement = document.getElementById('toggleToast');
  const toast = new bootstrap.Toast(toastElement);

  switchInput.addEventListener('change', () => {
    toast.show();
  });
});

async function checkMe() {
  const response = await fetch('/flash-messages');
  return response.json();
}

document.addEventListener('DOMContentLoaded', loadConfig);

function importFlash(messages) {
  const dropdownMenu = document.querySelector('.dropdown-menu.dropdown-menu-end.dropdown-list.animated--grow-in');
  dropdownMenu.innerHTML = messages.map(message => `
    <a class="dropdown-item d-flex align-items-center" href="#">
      <div>
        <span class="font-weight-bold">${message}</span>
      </div>
    </a>
  `).join('');
}

checkMe().then(importFlash).catch(console.error);

function updateMsgCount() {
  setTimeout(() => {
    document.getElementById('messageCount').textContent = document.querySelectorAll('#message-container .p-2.mb-2').length;
    document.getElementById('chatsCount').textContent = document.querySelectorAll('#chat-items .collection-item').length;
  }, 500);
}

updateMsgCount();

function deleteMessageFromHistory(message) {
  let fileName = selectedFilename;

  if (confirm("Are you sure you want to delete this file?")) {
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
      .then(responseData => {
        console.log(responseData);
      })
      .catch(error => {
        console.error('An error occurred:', error);
      });

    // reload the page with delay of 1 second
    //setTimeout(function () {
    //  location.reload()
    //}, 100);
  }
}