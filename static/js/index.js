var server_url = 'http://localhost:4848/';
var config_data;

var backgroundMusic = document.getElementById('backgroundMusic');
var isTTS = ''
var messageContainer = document.getElementById('message-container');

function handleSubmit(event) {
  event.preventDefault();
  var message = document.getElementById('input_text').value;
  sendMessage(message);
}

function sendMessage(message) {
  document.getElementById('input_text').value = ''

  messageContainer = document.getElementById('message-container');

  messageData = {
    "name": "Yuki",
    "message": message
  }

  let formattedMessage = formatMessage(messageData);
  messageContainer.appendChild(formattedMessage);

  const typingBubble = `
    <div class="block-message-1" id="bubble">
      <div class="typing-bubble">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  `;

  messageContainer.insertAdjacentHTML('beforeend', typingBubble);

  scrollMsg()
  playAudio(audioType = 'send')

  if (isTTS.toString() == 'true') {
    message = message + '<tts>';
  }

  historySelect = document.getElementById('history-select');
  var selectedFilename = historySelect.value;

  // Send a POST request to /send_message
  fetch(`${server_url}send_message`, {
      method: 'POST',
      body: new URLSearchParams({
        'message': message,
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

      scrollMsg()
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
      playAudio()
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
  messageText.textContent = `${messageData.name}: ${messageData.message}`;

  // Append the message text to the message div
  messageDiv.appendChild(messageText);

  return messageDiv;
}

function downloadHistory() {
  var historySelect = document.getElementById('history-select');
  var selectedFilename = historySelect.value;
  messageContainer = document.getElementById('message-container');

  if (selectedFilename == "") {
    selectedFilename = "history.json"
  }

  // Fetch the selected chat history file from the server
  fetch(`${server_url}load_history_file/${selectedFilename}`, {
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
    selectedFilename = "history.json"
  }

  // Fetch the selected chat history file from the server
  fetch(`${server_url}load_history_file/${selectedFilename}`, {
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
  fetch(`${server_url}edit_history`, {
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
}

// Get access to the user's camera and display the video stream
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

window.onload = function () {
  // Check if SpeechRecognition is supported by the browser
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    // Create a new SpeechRecognition object
    recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)();

    // Configure recognition settings
    recognition.lang = 'en-US'; // Set the language for recognition
    recognition.interimResults = true; // Enable interim results
    recognition.continuous = true; // Enable continuous recognition

    // Variables to track previous recognized text
    let previousText = '';

    // Event listener for results
    recognition.onresult = function (event) {
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
      console.error('Speech recognition error:', event.error);
    };

    // Event listener for end of speech
    recognition.onend = function () {
      console.log('Speech recognition ended.');
      recognition.start()
    };

    // Start recognition
    document.getElementById('startButton').onclick = function () {
      isTTS = true;
      recognition.start();
      console.log('Recognition started.');
    };
  } else {
    console.error('SpeechRecognition not supported by the browser.');
  }
};

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


// Add an event listener to the "Capture Image" button
document.getElementById('capture-image').addEventListener('click', function () {
  var localVideo = document.getElementById('localVideo');
  var captureCanvas = document.getElementById('capture-canvas');
  var captureContext = captureCanvas.getContext('2d');

  // Set the canvas dimensions to match the video element
  captureCanvas.width = localVideo.videoWidth;
  captureCanvas.height = localVideo.videoHeight;

  // Draw the current frame from the video onto the canvas
  captureContext.drawImage(localVideo, 0, 0, captureCanvas.width, captureCanvas.height);

  // Show the canvas (optional)
  captureCanvas.style.display = 'block';
});

// Add an event listener to the "Send Captured Image" button
document.getElementById('send-captured-image').addEventListener('click', function () {
  var captureCanvas = document.getElementById('capture-canvas');
  var imageDataURL = captureCanvas.toDataURL('image/png'); // Convert canvas to base64 data URL

  // Send the captured image to the Flask server
  fetch(`${server_url}upload_captured_image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageDataURL
      })
    })
    .then(response => {
      if (response.ok) {
        // Image successfully sent
        alert('Captured image sent successfully!');
        // You can add further actions here if needed
      } else {
        // Handle the error
        alert('Error sending captured image.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

// Function to fetch and populate chat history file options
function populateHistorySelect() {
  var historySelect = document.getElementById('history-select');
  messageContainer = document.getElementById('message-container');

  // Fetch the list of history files from the server
  fetch(`${server_url}list_history_files`, {
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
}

// Function to load the selected chat history file
function loadSelectedHistory() {
  var historySelect = document.getElementById('history-select');
  var selectedFilename = historySelect.value;
  messageContainer = document.getElementById('message-container');

  if (selectedFilename == "") {
    selectedFilename = "history.json"
  }

  // Fetch the selected chat history file from the server
  fetch(`${server_url}load_history_file/${selectedFilename}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      displayMessages(data); // Display the selected chat history
      scrollMsg();
    })
    .catch(error => {
      console.error('Error loading selected history file:', error);
    });
}

function muteAudio() {
  audioElement = document.getElementById("backgroundMusic");

  if (audioElement) {
    audioElement.muted = true
  } else {
    audioElement.muted = false
  }
}

// Call populateHistorySelect to populate the <select> element on page load
populateHistorySelect();
loadSelectedHistory()

// Get all elements with the class 'side-tab-block-e'
const tabElements = document.getElementsByClassName('side-tab-block-e');

// Add a click event listener to each tab element
for (let i = 0; i < tabElements.length; i++) {
  tabElements[i].addEventListener('click', toggleSidebar);
}

if (localStorage.getItem('config')) {
  data = localStorage.getItem('config')
  config_data = JSON.parse(data)
  configUrl = config_data.configUrl
  server_url = config_data.server
} else {
  // Construct the full URL for the config.json file
  var configUrl = `static/config.json`;

  // Fetch the JSON data
  fetch(configUrl)
    .then(response => response.json())
    .then((data) => {
      // Handle the JSON data
      config_data = data
      localStorage.setItem('config', JSON.stringify(config_data));
      server_url = config_data.server
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function openConfigParams() {
  OpenPopup('settings');
  var config = config_data

  // Get the parameter container element
  const parameterContainer = document.getElementById('parameter-container');

  // Iterate over the JSON properties and create input elements
  for (const key in config) {
    if (config.hasOwnProperty(key)) {
      const label = document.createElement('label');
      label.textContent = key;
      const input = document.createElement('input');
      input.type = 'text';
      input.value = config[key];

      // Append the label and input to the container
      parameterContainer.appendChild(label);
      parameterContainer.appendChild(input);
    }
  }

  return parameterContainer;
}

function saveConfigParams() {
  const parameterContainer = document.getElementById('parameter-container');
  const inputs = parameterContainer.querySelectorAll('input');
  const obj = {};

  inputs.forEach((input) => {
    const label = input.previousSibling.textContent.trim();
    obj[label] = input.value;
  });

  localStorage.setItem('config', JSON.stringify(obj));
  document.getElementById('parameter-container').innerHTML = '';
  PopupClose();
}