var server_url = '';
var server_port = '';
var selectedFilename = '';
var backgroundMusic = document.getElementById('backgroundMusic');
var isHimitsu = false;
var messageContainer = document.getElementById('message-container');
const typingBubble = `<div class="block-message-1" id="circle-loader"><div class="circle-loader"></div></div>`;
var himitsuCopilot;
var name1;
var name2;
var config_data;

async function loadConfig() {
  const { ai: { names: [name1, name2] } } = await (await fetch('/static/config.json')).json();
  document.getElementById('input_text').placeholder = `Ask ${name2}...`;
}

function checkHimitsuCopilotState() {
  var toggleSwitch = document.getElementById('customSwitch');
  var isOn = toggleSwitch.checked;
  return isOn // This will log 'true' if the switch is on, 'false' if it's off
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

    console.log('Messages:', messages);
    
  
  // Example usage:
  downloadVariableAsFile(JSON.stringify(messages), 'myVariable.txt');
  
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
    const typingBubble = '<div id="circle-loader"></div>';
    this.messageContainer.insertAdjacentHTML('beforeend', typingBubble);
    scrollMsg();
  }

  removeTypingBubble() {
    const bubble = document.getElementById('circle-loader');
    bubble?.remove();
  }

  scrollMsg() {
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }

  sendMessage(message, imageData = '', url = '/message') {
    this.inputText = document.getElementById('input_text');
    this.createMessage(name1, this.inputText.value);
    this.createTypingBubble();

    if (url === '/message') {
      message = message || this.inputText.value;
      this.inputText.value = '';
      const serverEndpoint = `${server_url + server_port}${url}`;
      const headers = { 'Content-Type': 'application/json' };
      const body = JSON.stringify({ chat: selectedFilename, text: message, template: currentPromptName });

      fetch(serverEndpoint, { method: 'POST', headers, body })
        .then(response => response.json())
        .then(data => {
          this.removeTypingBubble();
          this.createMessage(name2, data.response);
          playAudio('send');
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
    const body = JSON.stringify({ image: imageDataURL, name: imageName, task: 'caption' });

    fetch(serverEndpoint, { method: 'POST', headers, body })
      .then(response => response.ok ? response.json() : Promise.reject('Error sending captured image.'))
      .then(data => {
        this.removeTypingBubble();
        const imageCaption = `*You can see ${data.message} in the image* ${messageForImage}`;
        return imageCaption; // You might want to do something with this caption
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
    'tts': `audio/output.mp3?v=${Math.random()}`,
    'message': 'audio/sounds/message.mp3',
    'send': 'audio/sounds/send.mp3',
    'error': 'audio/sounds/error.mp3',
    'ringtone': 'audio/sounds/ringtone.mp3'
  };
  audioSource.src = audioMap[audioType];
}

// Other functions (clearHistory, loadHistory, downloadHistory) go here if needed.
function formatMessage(messageData) {
  const messageDiv = document.createElement('div');
  loadConfig();
  messageDiv.classList.add('p-2', 'mb-2');

  const classes = messageData.name == name1 || messageData.name == 'Yuki'
    ? ['block-message-2', 'text-end', 'bg-primary', 'text-white'] 
    : ['block-message-1', 'text-start', 'bg-secondary', 'text-white'];
  messageDiv.classList.add(...classes);

  const messageText = document.createElement('pre');
  messageText.classList.add('m-0');
  messageText.innerHTML = messageData.message;

  messageDiv.appendChild(messageText);

  scrollMsg();

  return messageDiv;
}

class HistoryManager {
  constructor(serverUrl, serverPort, defaultHistoryFile) {
    this.serverUrl = serverUrl;
    this.serverPort = serverPort;
    this.defaultHistoryFile = defaultHistoryFile;
    this.messageContainer = document.getElementById('message-container');
  }

  createHistoryFile() {
    const newFileName = prompt('Enter a name for the new file (with .json):');
    if (!newFileName) {
      console.log('File creation cancelled.');
      return; // Exit if no name is entered
    }

    fetch(`${this.serverUrl + this.serverPort}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      console.log('File created:', responseData);
      // Optionally, update UI or state to reflect the new file
    })
    .catch(error => {
      console.error('An error occurred:', error);
    });

    // Reload the page with a delay of 1 second
    setTimeout(() => {
      location.reload();
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
var historyManager = ''

navigator.mediaDevices.getUserMedia({
    video: true
  })
  .then(function (stream) {
    var localVideo = document.getElementById('localVideo');
    localVideo.srcObject = stream;
  })
  .catch(function (error) {
    document.getElementById('localVideo').remove()
    console.log('Error accessing the camera:', error);
  });

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
    console.log('Image Generated Successfully');
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

  var messageForImage = ''

  if (isTTS.toString() == 'false') {
    messageForImage = prompt('Enter a message for the image:');
  }

  // generate a random image name using current timestamp
  var imageName = new Date().getTime().toString();

  closePopupsAll();

  askYunaImage = messageManager.sendMessage('', [imageDataURL, imageName, messageForImage], '/image');

  messageManager.sendMessage(askYunaImage, imageName, '/message');
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

    try {
      const response = await fetch(`${server_url+server_port}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataURL, name: imageName, task: 'caption' })
      });

      if (!response.ok) throw new Error('Error sending uploaded image.');

      const data = await response.json();
      const imageCaption = data.message;
      const askYunaImage = `*You can see ${imageCaption} in the image* ${messageForImage}`;

      sendMessage(askYunaImage, imageName);
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending uploaded image.');
    }
  };

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

        // Populate the <select> with the available options 
        historySelect.insertAdjacentHTML('beforeend', data.map(filename => ` 
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

/*
async function populateHistorySelect() {
  loadConfig();
  const historySelect = document.getElementById('chat-items');
  const config = JSON.parse(localStorage.getItem('config'));

  if (!config) {
    setTimeout(() => location.reload(), 100);
    return;
  }

  server_port = config.server.port;
  server_url = config.server.url;

  try {
    const response = await fetch(`${server_url+server_port}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'list' })
    });

    if (!response.ok) throw new Error('Error fetching history files.');

    const data = await response.json();
    console.log('History files:', data);
    historySelect.insertAdjacentHTML('beforeend', data.map(filename => `...`).join(''));
    
    selectedFilename = config_data.server.default_history_file;
    historyManager = new HistoryManager(server_url, server_port, config_data.server.default_history_file);
  } catch (error) {
    console.error('Error:', error);
  }
}
*/

async function loadSelectedHistory(selectedFilename = config_data.server.default_history_file) {
  const messageContainer = document.getElementById('message-container');

  try {
    const response = await fetch(`${server_url+server_port}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'load', chat: selectedFilename })
    });

    if (!response.ok) throw new Error('Error loading selected history file.');
    console.log(response.json());

    const data = await response.json();
    messageManager.displayMessages(data);
  } catch (error) {
    console.error('Error:', error);
  }

  closePopupsAll();
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

function muteAudio() {
  audioElement = document.getElementById("backgroundMusic");

  if (audioElement) {
    audioElement.muted = true
  } else {
    audioElement.muted = false
  }
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

function handleTextFileClick() {
  console.log('Text file option clicked');
  // Add your code here to handle text file selection
}

function handleImageFileClick() {
  document.getElementById('imageUpload').click();
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
      <div class="mr-3">
        <div class="icon-circle bg-primary">
          <i class="fas fa-file-alt text-white"></i>
        </div>
      </div>
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
  }, 500);
}