var server_url = '';
var server_port = '';
var config_data;;
var backgroundMusic = document.getElementById('backgroundMusic');
var isTTS = false;
var messageContainer = document.getElementById('message-container');
var configUrl = `static/config.json`;
const typingBubble = `
    <div class="block-message-1" id="bubble">
      <div class="typing-bubble">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  `;

function handleSubmit(event) {
  event.preventDefault();
  var message = document.getElementById('input_text').value;
  sendMessage(message);
}

function sendMessage(message, imageName = false) {
  document.getElementById('input_text').value = ''

  messageContainer = document.getElementById('message-container');

  // image check
  if (imageName.toString() == 'false') {
    console.log('no image')
    imageName = ''
  } else {
    imageName = `<img src='static/img/call/${imageName}.jpg' class='image-message'>`
  }

  var messageData = {
    "name": "Yuki",
    "message": message + imageName
  }

  console.log(messageData.message)

  let formattedMessage = formatMessage(messageData);
  messageContainer.appendChild(formattedMessage);

  messageContainer.insertAdjacentHTML('beforeend', typingBubble);

  scrollMsg()
  playAudio(audioType = 'send')

  if (isTTS.toString() == 'true') {
    message = message + '<tts>';
  }

  historySelect = document.getElementById('history-select');
  var selectedFilename = historySelect.value;

  // Send a POST request to /send_message
  fetch(`${server_url+server_port}/send_message`, {
      method: 'POST',
      body: new URLSearchParams({
        'message': messageData.message,
        'chat': selectedFilename
      }), // Send the message as form data
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(response => response.json())
    .then(data => {
      // Delete the element with id "bubble"
      const bubble = document.getElementById('bubble');
      if (bubble) {
        bubble.remove();
      }
      // Display if ok
      messageContainer = document.getElementById('message-container');

      messageData = {
        "name": "Yuna",
        "message": data.response
      }

      let formattedMessage = formatMessage(messageData);
      messageContainer.appendChild(formattedMessage);

      scrollMsg()
      playAudio(audioType = 'message')

      if (isTTS.toString() == 'true') {
        playAudio()
      }
    })
    .catch(error => {
      const bubble = document.getElementById('bubble');
      if (bubble) {
        bubble.remove();
      }

      messageContainer = document.getElementById('message-container');

      messageData = {
        "name": "Yuna",
        "message": error
      }

      let formattedMessage = formatMessage(messageData);
      messageContainer.appendChild(formattedMessage);

      playAudio(audioType = 'error')
    })
}

function playAudio(audioType = 'tts') {
  // Generate a random query parameter value
  var randomValue = Math.random();

  // Get the audio source element
  var audioSource = document.getElementById("backgroundMusic");

  if (audioType == 'tts') {
    // Set the src attribute with the random query parameter
    audioSource.src = `static/audio/output.mp3?v=${randomValue}`;
  } else if (audioType == 'message') {
    audioSource.src = 'static/audio/sounds/message.mp3';
  } else if (audioType == 'send') {
    audioSource.src = 'static/audio/sounds/send.mp3';
  } else if (audioType == 'error') {
    audioSource.src = 'static/audio/sounds/error.mp3';
  } else if (audioType == 'ringtone') {
    audioSource.src = 'static/audio/sounds/ringtone.mp3';
  }

  // Get the audio element and play it
  audio = document.getElementById("backgroundMusic");
  audio.load(); // Reload the audio element to apply the new source
  audio.play()
    .then(() => {
      // Audio playback started successfully
      console.log('Audio playback started.');
    })
    .catch(error => {
      // Handle the error if audio playback fails
      console.error('Error playing audio:', error);
      //playAudio()
    });
}

// Other functions (clearHistory, loadHistory, downloadHistory) go here if needed.
function formatMessage(messageData) {
  // Create a div for the message
  var messageDiv = document.createElement('div');

  // Set the CSS class based on the name
  if (messageData.name === 'Yuki') {
    messageDiv.classList.add('block-message-2'); // Yuki's messages on the right
  } else if (messageData.name === 'Yuna') {
    messageDiv.classList.add('block-message-1'); // Yuna's messages on the left
  }

  // Create a paragraph for the message text
  var messageText = document.createElement('p');
  messageText.innerHTML = `${messageData.name}: ${messageData.message}`;

  // Append the message text to the message div
  messageDiv.appendChild(messageText);

  scrollMsg()

  return messageDiv;
}

function downloadHistory() {
  var historySelect = document.getElementById('history-select');
  var selectedFilename = historySelect.value;
  messageContainer = document.getElementById('message-container');

  if (selectedFilename == "") {
    selectedFilename = config_data.server.default_history_file
  }

  // Fetch the selected chat history file from the server
  fetch(`${server_url+server_port}/load_history_file/${selectedFilename}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      var chatHistory = JSON.stringify(data);
      var blob = new Blob([chatHistory], {
        type: 'text/plain'
      });
      var url = URL.createObjectURL(blob);

      // Create a temporary anchor element for downloading
      var a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFilename}.json`;
      a.click();

      // Clean up
      URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Error fetching history for download:', error);
    });
}

// Function to open a pop-up dialog for editing history
function editHistory() {
  var historySelect = document.getElementById('history-select');
  var selectedFilename = historySelect.value;

  if (selectedFilename == "") {
    selectedFilename = config_data.default_history_file
  }

  // Fetch the selected chat history file from the server
  fetch(`${server_url+server_port}/load_history_file/${selectedFilename}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      var historyPopup = document.createElement('div');
      historyPopup.classList.add('block-popup');
      historyPopup.classList.add('edit-popup');

      // Create a pop-up dialog
      var editDialog = document.createElement('div');
      editDialog.classList.add('block-card');

      // Create a textarea to edit the message
      var editTextArea = document.createElement('textarea');
      editTextArea.classList.add('block-scroll');
      editTextArea.value = JSON.stringify(data, null, 2);
      editDialog.appendChild(editTextArea);

      // Create a button to save the edited message
      var saveButton = document.createElement('button');
      saveButton.classList.add('block-button');
      saveButton.textContent = 'Save';
      saveButton.addEventListener('click', () => {
        var editedText = editTextArea.value;
        // Call the function to save the edited message here, e.g., send it to the server
        sendEditHistory(editedText);
        // Remove the pop-up dialog
        historyPopup.remove();
      });
      editDialog.appendChild(saveButton);

      historyPopup.appendChild(editDialog)

      // Add the pop-up dialog to the body
      document.body.appendChild(historyPopup);
    })
    .catch(error => {
      console.error('Error loading selected history file:', error);
    });
}

function sendEditHistory(editTextArea) {
  historySelect = document.getElementById('history-select');
  var selectedFilename = historySelect.value;

  // Send a POST request to /send_message
  fetch(`${server_url+server_port}/edit_history`, {
      method: 'POST',
      body: new URLSearchParams({
        'history': editTextArea,
        'chat': selectedFilename
      }), // Send the message as form data
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(response => response.json())
    .then(data => {
      // Display if ok
      loadSelectedHistory()
    })
    .catch(error => {
      console.error('Error sending message:', error);
    })
}

function displayMessages(messages) {
  messageContainer = document.getElementById('message-container');

  // Clear the existing content of messageContainer
  while (messageContainer.firstChild) {
    messageContainer.removeChild(messageContainer.firstChild);
  }

  // Loop through the messages and format each one
  messages.forEach(messageData => {
    var formattedMessage = formatMessage(messageData);
    messageContainer.appendChild(formattedMessage);
  });

  scrollMsg()
}

navigator.mediaDevices.getUserMedia({
    video: true
  })
  .then(function (stream) {
    var localVideo = document.getElementById('localVideo');
    localVideo.srcObject = stream;
  })
  .catch(function (error) {
    console.log('Error accessing the camera:', error);
  });

let recognition; // Define the recognition object at a higher scope

function startVoiceRecognition() {
  const setupRecognition = function () {
    // Check if SpeechRecognition is supported by the browser
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Create a new SpeechRecognition object
      recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)();

      // Configure recognition settings
      recognition.lang = 'en-US'; // Set the language for recognition
      recognition.interimResults = true; // Enable interim results
      recognition.continuous = true; // Enable continuous recognition

      recognition.start(); // Start recognition

      // Variables to track previous recognized text
      let previousText = '';

      // Event listener for results
      recognition.onresult = function (event) {
        console.log('Speech recognition results.');
        var result = event.results[event.resultIndex];
        var recognizedText = result[0].transcript;

        if (recognizedText === previousText) {
          console.log('Recognized Text:', recognizedText);
          sendMessage(recognizedText)
        }

        previousText = recognizedText;
      };

      // Event listener for errors
      recognition.onerror = function (event) {
        if (event.error == 'not-allowed') {
          console.error('Permission to access microphone is blocked or denied.');
        } else {
          console.error('Speech recognition error:', event.error);
        }
      };

      // Event listener for end of speech
      recognition.onend = function () {
        console.log('Speech recognition ended.');
        recognition.start()
      };
    } else {
      console.error('SpeechRecognition not supported by the browser.');
    }
  };

  if (document.readyState === 'complete') {
    setupRecognition();
  } else {
    window.onload = setupRecognition;
  }
}

function scrollMsg() {
  objDiv = document.getElementById("message-container");
  objDiv.scrollTop = objDiv.scrollHeight;
}

// code to drag the video
const localVideo = document.getElementById('localVideo');
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

localVideo.addEventListener('mousedown', dragStart);
localVideo.addEventListener('mouseup', dragEnd);
localVideo.addEventListener('mousemove', drag);

function dragStart(e) {
  initialX = e.clientX - xOffset;
  initialY = e.clientY - yOffset;

  if (e.target === localVideo) {
    isDragging = true;
  }
}

function dragEnd(e) {
  initialX = currentX;
  initialY = currentY;

  isDragging = false;
}

function drag(e) {
  if (isDragging) {
    e.preventDefault();

    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;

    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, localVideo);
  }
}

function setTranslate(xPos, yPos, el) {
  el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

function drawArt() {
  historySelect = document.getElementById('history-select');
  messageContainer = document.getElementById('message-container');

  var selectedFilename = historySelect.value
  console.log(selectedFilename)
  var imagePrompt = prompt('Enter a prompt for the image:');

  messageData = {
    "name": "Yuki",
    "message": imagePrompt
  }

  closePopupsAll();

  let formattedMessage = formatMessage(messageData);
  messageContainer.appendChild(formattedMessage);

  messageContainer.insertAdjacentHTML('beforeend', typingBubble);
  scrollMsg()

  // Send the captured image to the Flask server
  fetch(`${server_url+server_port}/text_to_image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        chat: selectedFilename,
      })
    })
    .then(response => {
      if (response.ok) {
        // Parse the JSON data from the response
        return response.json();
      } else {
        throw new Error('Error generating image.');
      }
    })
    .then(data => {
      // Delete the element with id "bubble"
      const bubble = document.getElementById('bubble');
      if (bubble) {
        bubble.remove();
      }
      // Display if ok
      messageContainer = document.getElementById('message-container');

      // Access the image caption from the server response
      const imageCreated = data.message;

      messageData2 = {
        "name": "Yuna",
        "message": imageCreated
      }
    
      let formattedMessage = formatMessage(messageData2);
      messageContainer.appendChild(formattedMessage);

      console.log('Image Generated Successfully');

    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error sending captured image.');
    });
}

// Add an event listener to the "Capture Image" button
function captureImage() {
  var localVideo = document.getElementById('localVideo');
  var captureCanvas = document.getElementById('capture-canvas');
  var captureContext = captureCanvas.getContext('2d');
  historySelect = document.getElementById('history-select');
  messageContainer = document.getElementById('message-container');

  // Set the canvas dimensions to match the video element
  captureCanvas.width = localVideo.videoWidth;
  captureCanvas.height = localVideo.videoHeight;

  // Draw the current frame from the video onto the canvas
  captureContext.drawImage(localVideo, 0, 0, captureCanvas.width, captureCanvas.height);

  captureCanvas = document.getElementById('capture-canvas');
  imageDataURL = captureCanvas.toDataURL('image/png'); // Convert canvas to base64 data URL

  var messageForImage = ''
  var selectedFilename = historySelect.value

  if (isTTS.toString() == 'false') {
    messageForImage = prompt('Enter a message for the image:');
  }

  // generate a random image name using current timestamp
  var imageName = new Date().getTime().toString();

  closePopupsAll();

  // Send the captured image to the Flask server
  fetch(`${server_url+server_port}/upload_captured_image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageDataURL,
        name: imageName,
      })
    })
    .then(response => {
      if (response.ok) {
        // Parse the JSON data from the response
        return response.json();
      } else {
        throw new Error('Error sending captured image.');
      }
    })
    .then(data => {
      // Delete the element with id "bubble"
      const bubble = document.getElementById('bubble');
      if (bubble) {
        bubble.remove();
      }
      // Display if ok
      messageContainer = document.getElementById('message-container');

      // Access the image caption from the server response
      const imageCaption = data.message;
      console.log('Image Caption:', imageCaption);

      var askYunaImage = `*You can see ${imageCaption} in the image* ${messageForImage}`

      sendMessage(askYunaImage, imageName)
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error sending captured image.');
    });
}

// Function to fetch and populate chat history file options
function populateHistorySelect() {
  return new Promise((resolve, reject) => {
    var historySelect = document.getElementById('history-select');
    messageContainer = document.getElementById('message-container');

    if (localStorage.getItem('config') == null) {
      // reload the page with delay of 1 second if config is not available
      setTimeout(function () {
        location.reload()
      }, 300);
    }

    server_port = JSON.parse(localStorage.getItem('config')).server.port
    server_url = JSON.parse(localStorage.getItem('config')).server.url

    // Fetch the list of history files from the server
    fetch(`${server_url+server_port}/list_history_files`, {
        method: 'GET',
      })
      .then(response => response.json())
      .then(data => {
        // Populate the <select> with the available options
        data.forEach(filename => {
          var option = document.createElement('option');
          option.value = filename;
          option.textContent = filename;
          historySelect.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Error fetching history files:', error);
      });

    // Resolve the promise when the operation is complete
    resolve();
  });
}

// Function to load the selected chat history file
function loadSelectedHistory() {
  var historySelect = document.getElementById('history-select');
  var selectedFilename = historySelect.value;
  messageContainer = document.getElementById('message-container');

  if (selectedFilename == "") {
    selectedFilename = config_data.server.default_history_file
  }

  // Fetch the selected chat history file from the server
  fetch(`${server_url+server_port}/load_history_file/${selectedFilename}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      displayMessages(data);
    })
    .catch(error => {
      console.error('Error loading selected history file:', error);
    });

  closePopupsAll();
}

function muteAudio() {
  audioElement = document.getElementById("backgroundMusic");

  if (audioElement) {
    audioElement.muted = true
  } else {
    audioElement.muted = false
  }
}

// Run populateHistorySelect first and then loadSelectedHistory

/* CRINGE CODE EVERYTHING IS CRASHED
populateHistorySelect().then(() => {
  loadSelectedHistory();
}); */

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

function openConfigParams() {
  OpenPopup('settings');

  var aiConfig = config_data.ai;
  var serverConfig = config_data.server;

  // Get the parameter container element
  const parameterContainer = document.getElementById('parameter-container');

  // Create the block list element
  const blockList = document.createElement('div');
  blockList.classList.add('block-list', 'el-9', 'v-coll');

  console.log(config_data)

  // Create the AI block list element
  const aiBlockList = createAIBlockList(aiConfig);

  // Create the Server block list element
  const serverBlockList = createServerBlockList(serverConfig);

  // Append both block lists to the parameter container
  parameterContainer.appendChild(aiBlockList);
  parameterContainer.appendChild(serverBlockList);

  return parameterContainer;
}

function createAIBlockList(aiConfig) {
  // Create the AI block list element
  const aiBlockList = document.createElement('div');
  aiBlockList.classList.add('block-list', 'el-9', 'v-coll', 'ai-block-list');

  // Create the HTML for the AI-related predefined blocks
  const aiHtml = `
    <div class="block-list-e">
      <label>Names</label>
      <input type="text" id="names" value="${aiConfig.names.join(',')}">
    </div>
    <div class="block-list-e">
      <label>Emotions</label>
      <input type="checkbox" id="emotions" ${aiConfig.emotions ? 'checked' : ''}>
    </div>
    <div class="block-list-e">
      <label>Max New Tokens</label>
      <input type="number" id="max-new-tokens" value="${aiConfig.max_new_tokens}">
    </div>
    <div class="block-list-e">
      <label>Context Length</label>
      <input type="number" id="context-length" value="${aiConfig.context_length}">
    </div>
    <div class="block-list-e">
      <label>Temperature</label>
      <input type="number" id="temperature" value="${aiConfig.temperature}">
    </div>
    <div class="block-list-e">
      <label>Repetition Penalty</label>
      <input type="number" id="repetition-penalty" value="${aiConfig.repetition_penalty}">
    </div>
    <div class="block-list-e">
      <label>Last N Tokens</label>
      <input type="number" id="last-n-tokens" value="${aiConfig.last_n_tokens}">
    </div>
    <div class="block-list-e">
      <label>Seed</label>
      <input type="number" id="seed" value="${aiConfig.seed}">
    </div>
    <div class="block-list-e">
      <label>Top K</label>
      <input type="number" id="top-k" value="${aiConfig.top_k}">
    </div>
    <div class="block-list-e">
      <label>Top P</label>
      <input type="number" id="top-p" value="${aiConfig.top_p}">
    </div>
    <div class="block-list-e">
      <label>Stop</label>
      <input type="text" id="stop" value="${aiConfig.stop.join(',')}">
    </div>
    <div class="block-list-e">
      <label>Stream</label>
      <input type="checkbox" id="stream" ${aiConfig.stream ? 'checked' : ''}>
    </div>
    <div class="block-list-e">
      <label>Batch Size</label>
      <input type="number" id="batch-size" value="${aiConfig.batch_size}">
    </div>
    <div class="block-list-e">
      <label>Threads</label>
      <input type="number" id="threads" value="${aiConfig.threads}">
    </div>
    <div class="block-list-e">
      <label>GPU Layers</label>
      <input type="number" id="gpu-layers" value="${aiConfig.gpu_layers}">
    </div>
  `;

  // Set the HTML of the AI block list
  aiBlockList.innerHTML = aiHtml;

  return aiBlockList;
}

function createServerBlockList(serverConfig) {
  // Create the Server block list element
  const serverBlockList = document.createElement('div');
  serverBlockList.classList.add('block-list', 'el-9', 'v-coll', 'server-block-list');

  // Create the HTML for the Server-related predefined blocks
  const serverHtml = `
    <div class="block-list-e">
      <label>Port</label>
      <input type="number" id="port" value="${serverConfig.port}">
    </div>
    <div class="block-list-e">
      <label>History</label>
      <input type="text" id="history" value="${serverConfig.history}">
    </div>
    <div class="block-list-e">
      <label>Default History</label>
      <input type="text" id="default-history" value="${serverConfig.default_history_file}">
    </div>
    <div class="block-list-e">
      <label>Server URL</label>
      <input type="text" id="server" value="${serverConfig.url}">
    </div>
  `;

  // Set the HTML of the Server block list
  serverBlockList.innerHTML = serverHtml;

  return serverBlockList;
}

function saveConfigParams() {
  // Create an object to store the reverse configuration
  const reverseConfig = {
    ai: {},
    server: {}
  };

  // Get the AI block list element
  const aiBlockList = document.querySelector('.ai-block-list');

  // Extract values from AI block list
  reverseConfig.ai.names = aiBlockList.querySelector('#names').value.split(',');
  reverseConfig.ai.emotions = aiBlockList.querySelector('#emotions').checked;
  reverseConfig.ai.max_new_tokens = parseInt(aiBlockList.querySelector('#max-new-tokens').value);
  reverseConfig.ai.context_length = parseInt(aiBlockList.querySelector('#context-length').value);
  reverseConfig.ai.temperature = parseFloat(aiBlockList.querySelector('#temperature').value);
  reverseConfig.ai.repetition_penalty = parseFloat(aiBlockList.querySelector('#repetition-penalty').value);
  reverseConfig.ai.last_n_tokens = parseInt(aiBlockList.querySelector('#last-n-tokens').value);
  reverseConfig.ai.seed = parseInt(aiBlockList.querySelector('#seed').value);
  reverseConfig.ai.top_k = parseInt(aiBlockList.querySelector('#top-k').value);
  reverseConfig.ai.top_p = parseFloat(aiBlockList.querySelector('#top-p').value);
  reverseConfig.ai.stop = aiBlockList.querySelector('#stop').value.split(',');
  reverseConfig.ai.stream = aiBlockList.querySelector('#stream').checked;
  reverseConfig.ai.batch_size = parseInt(aiBlockList.querySelector('#batch-size').value);
  reverseConfig.ai.threads = parseInt(aiBlockList.querySelector('#threads').value);
  reverseConfig.ai.gpu_layers = parseInt(aiBlockList.querySelector('#gpu-layers').value);

  // Get the Server block list element
  const serverBlockList = document.querySelector('.server-block-list');

  // Extract values from Server block list
  reverseConfig.server.port = parseInt(serverBlockList.querySelector('#port').value);
  reverseConfig.server.history = serverBlockList.querySelector('#history').value;
  reverseConfig.server.default_history_file = serverBlockList.querySelector('#default-history').value;
  reverseConfig.server.url = serverBlockList.querySelector('#server').value;

  localStorage.setItem('config', JSON.stringify(reverseConfig));
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkConfigData() {
  await delay(300);
  if (typeof config_data === 'undefined') {
    console.warn('You messed up production. Trying to load config.json again');

    if (localStorage.getItem('config')) {
      // reload the page with delay of 1 second if config is not available
      setTimeout(function () {
        config_data = JSON.parse(localStorage.getItem('config'))
        server_url = config_data.server.url
        server_port = config_data.server.port

        fixDialogData();
      }, 300);
    } else {
      // Fetch the JSON data
      fetch(configUrl)
        .then(response => response.json())
        .then((data) => {
          // Handle the JSON data
          config_data = data
          localStorage.setItem('config', JSON.stringify(config_data));
          server_url = config_data.server.url
          server_port = config_data.server.port
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      await delay(300);
      openConfigParams();
    }

    closePopupsAll();

  } else {
    console.log('You did it');
  }
}

checkConfigData();