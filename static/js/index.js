var server_url = '';
var server_port = '';
var config_data;;
var backgroundMusic = document.getElementById('backgroundMusic');
var isTTS = false;
var messageContainer = document.getElementById('message-container');
const typingBubble = `<div class="block-message-1" id="circle-loader"><div class="circle-loader"></div></div>`;

// Class and functions to add and removed <br>s from the message container
class messageManager {
  constructor() {
    this.brCount = 0;
  }

  addBr() {
    this.brCount += 1;
    messageContainer = document.getElementById('message-container');

    messageContainer.innerHTML = messageContainer.innerHTML + `<br><br><br><br><br>`
    scrollMsg();
  }

  removeBr() {
    this.brCount -= 1;
    messageContainer = document.getElementById('message-container');

    // Get the current innerHTML
    let currentHTML = messageContainer.innerHTML;

    // Calculate the index to start removing elements from
    let removeIndex = currentHTML.length - 5 * '<br>'.length;

    // Remove the last 5 elements
    let newHTML = currentHTML.substring(0, removeIndex);

    // Set the new innerHTML
    messageContainer.innerHTML = newHTML;
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
    const messageContainer = document.getElementById('message-container');
    messageContainer.insertAdjacentHTML('beforeend', typingBubble);
    scrollMsg();
  }

  removeTypingBubble() {
    const bubble = document.getElementById('circle-loader');
    if (bubble) {
      bubble.remove();
    }
  }
}

// Create a new instance of the messageManager class
messageManager = new messageManager();

function handleSubmit(event) {
  event.preventDefault();
  var message = document.getElementById('input_text').value;
  sendMessage(message);
}

function sendMessage(message, imageName = false) {
  document.getElementById('input_text').value = ''

  var messageContainer = document.getElementById('message-container');

  messageManager.removeBr();
  messageContainer = document.getElementById('message-container');

  var messageData;

  if (currentPromptName == 'default') {
    // Image check
    if (imageName.toString() == 'false') {
      imageName = '';
    } else {
      imageName = `<img src='static/img/call/${imageName}.jpg' class='image-message'>`;
    }

    messageData = {
      name: 'Yuki',
      message: message + imageName,
    };

    messageManager.createMessage(messageData.name, messageData.message);
    messageManager.createTypingBubble();
    messageManager.addBr();

    playAudio(audioType = 'send');

    const historySelect = document.getElementById('history-select');
    const selectedFilename = historySelect.value;

  } else if (currentPromptName != 'default') {
    var messageDiv = document.createElement('div');

    // create #Himitsu element into messageDiv
    const form = document.createElement('form');
    form.setAttribute("id", "Himitsu");
    messageDiv.appendChild(form);

    // Append the button
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'block-button';
    buttonDiv.setAttribute('type', 'button');
    buttonDiv.setAttribute('onclick', 'generateText();');
    buttonDiv.innerText = 'Gen';
    messageDiv.appendChild(buttonDiv);

    messageData = {
      name: 'Yuki',
      message: messageDiv.innerHTML,
    };

    messageManager.createMessage(messageData.name, messageData.message);

    if (currentPromptName == 'himitsu') {
      himitsu.generateSelectElements();
      himitsu.generateTemplateInputs();
    } else if (currentPromptName == 'writer') {
      writer.generateSelectElements();
      writer.generateTemplateInputs();
    } else if (currentPromptName == 'paraphrase') {
      paraphrase.generateSelectElements();
      paraphrase.generateTemplateInputs();
    } else if (currentPromptName == 'decisionMaking') {
      decisionMaking.generateSelectElements();
      decisionMaking.generateTemplateInputs();
    }

    // input a value like before with a 200ms delay
    setTimeout(function () {
      document.getElementById('text').value = message
    }, 50);

    messageManager.createTypingBubble();

    messageManager.addBr();
    return;
  }

  playAudio(audioType = 'send');

  const historySelect = document.getElementById('history-select');
  const selectedFilename = historySelect.value;

  // Send a POST request to /message endpoint
  fetch(`${server_url + server_port}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: selectedFilename,
        text: messageData.message,
      }),
    })
    .then(response => response.json())
    .then(data => {
      messageManager.removeBr();
      messageManager.removeTypingBubble();

      // Display if ok
      const messageContainer = document.getElementById('message-container');

      const messageData = {
        name: 'Yuna',
        message: data.response,
      };

      messageManager.createMessage(messageData.name, messageData.message);

      messageManager.addBr();

      playAudio(audioType = 'message');

      if (isTTS.toString() == 'true') {
        playAudio();
      }
    })
    .catch(error => {
      messageManager.removeTypingBubble();

      const messageContainer = document.getElementById('message-container');

      const messageData = {
        name: 'Yuna',
        message: error,
      };

      messageManager.createMessage(messageData.name, messageData.message);
      playAudio(audioType = 'error');
    });
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
  var messageText = document.createElement('pre');
  messageText.innerHTML = messageData.message;

  // Append the message text to the message div
  messageDiv.appendChild(messageText);

  scrollMsg()

  return messageDiv;
}

function downloadHistory() {
  var historySelect = document.getElementById('history-select');
  var selectedFilename = historySelect.value;

  if (selectedFilename == "") {
    selectedFilename = config_data.server.default_history_file;
  }

  const historyContainer = document.getElementById('message-container');

  // Fetch the selected chat history file from the server
  fetch(`${server_url + server_port}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: selectedFilename,
        task: 'load',
      }),
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
    selectedFilename = config_data.default_history_file;
  }

  // Fetch the selected chat history file from the server
  fetch(`${server_url+server_port}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: selectedFilename,
        task: 'load',
      }),
    })
    .then(response => response.json())
    .then(data => {
      var historyPopup = document.createElement('div');
      historyPopup.classList.add('block-popup');
      historyPopup.classList.add('edit-popup');

      // Create the HTML content for the pop-up dialog
      var popupContent = `
        <div class="modal-content">
          <div class="modal-header">Edit History</div>
          <div class="modal-body">
            <textarea class="block-scroll">${JSON.stringify(data, null, 2)}</textarea>
          </div>
          <div class="modal-footer">
            <button class="block-button" onclick="saveEditedHistory('${selectedFilename}')">Save</button>
            <button class="block-button" onclick="closePopup('${historyPopup.id}')">Cancel</button>
          </div>
        </div>
      `;

      historyPopup.innerHTML = popupContent;

      // Add the pop-up dialog to the body
      document.body.appendChild(historyPopup);
    })
    .catch(error => {
      console.error('Error loading selected history file:', error);
    });
}

function saveEditedHistory(selectedFilename) {
  var editTextArea = document.querySelector('.block-popup.edit-popup textarea');
  var editedText = editTextArea.value;

  // Call the function to save the edited message here, e.g., send it to the server
  sendEditHistory(editedText, selectedFilename);

  // Close the pop-up dialog
  closePopup('call');
}

function closePopup(popupId) {
  var popup = document.getElementById(popupId);
  popup.remove();
}

function sendEditHistory(editTextArea, selectedFilename) {
  // Send a POST request to /history endpoint
  fetch(`${server_url+server_port}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: selectedFilename,
        task: 'edit',
        history: JSON.parse(editTextArea),
      }),
    })
    .then(response => response.json())
    .then(data => {
      // Display if ok
      loadSelectedHistory();
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });
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

  messageContainer.innerHTML = `<br>` + messageContainer.innerHTML + `<br><br><br><br><br>`

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
    document.getElementById('localVideo').remove()
    console.log('Error accessing the camera:', error);
  });

document.addEventListener('DOMContentLoaded', function () {
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const sendBtn = document.getElementById('sendBtn');
  const durationElem = document.getElementById('duration');
  const audioPlayer = document.getElementById('audioPlayer');

  let recorder;
  let startTime;
  let isRecording = false;
  let recordedChunks = [];

  startBtn.addEventListener('click', startRecording);
  pauseBtn.addEventListener('click', pauseRecording);
  stopBtn.addEventListener('click', stopRecording);
  sendBtn.addEventListener('click', sendAudio);

  function startRecording() {
    navigator.mediaDevices.getUserMedia({
        audio: true
      })
      .then(function (stream) {
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = handleDataAvailable;
        recorder.onstop = handleRecordingStop;
        recorder.start();
        startTime = new Date();
        isRecording = true;

        updateButtons();
        updateDuration();
      })
      .catch(function (err) {
        console.error('Error accessing microphone:', err);
      });
  }

  function pauseRecording() {
    if (isRecording) {
      recorder.pause();
      isRecording = false;
    } else {
      recorder.resume();
      isRecording = true;
    }

    updateButtons();
  }

  function stopRecording() {
    recorder.stop();
    isRecording = false;

    updateButtons();
  }

  function handleDataAvailable(event) {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  }

  function handleRecordingStop() {
    const audioBlob = new Blob(recordedChunks, {
      type: 'audio/wav'
    });
    audioPlayer.src = URL.createObjectURL(audioBlob);
    audioPlayer.style.display = 'block';
    audioPlayer.controls = true; // Enable controls for audio playback
    audioPlayer.autoplay = true; // Auto-play the recorded audio

    sendBtn.disabled = false;

    updateDuration();
  }

  function updateButtons() {
    startBtn.disabled = isRecording;
    pauseBtn.disabled = !isRecording;
    stopBtn.disabled = !isRecording;
    sendBtn.disabled = !audioPlayer.src;
  }

  function updateDuration() {
    if (isRecording) {
      const currentTime = new Date();
      const elapsedTime = new Date(currentTime - startTime);
      const minutes = elapsedTime.getUTCMinutes();
      const seconds = elapsedTime.getUTCSeconds();
      durationElem.textContent = `Duration: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      setTimeout(updateDuration, 1000);
    }
  }

  function sendAudio() {
    const audioData = new FormData();
    audioData.append('audio', new Blob(recordedChunks, {
      type: 'audio/wav'
    }));

    fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: audioData
      })
      .then(response => response.json())
      .then(data => {
        console.log('Server response:', data);
      })
      .catch(error => {
        console.error('Error sending audio:', error);
      });
  }
});

function scrollMsg() {
  objDiv = document.getElementById("message-container");
  objDiv.scrollTop = objDiv.scrollHeight;
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
  fetch(`${server_url+server_port}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        chat: selectedFilename,
        task: 'generate',
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
      const bubble = document.getElementById('circle-loader');
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
  fetch(`${server_url+server_port}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageDataURL,
        name: imageName,
        task: 'caption',
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
      const bubble = document.getElementById('circle-loader');
      if (bubble) {
        bubble.remove();
      }
      // Display if ok
      messageContainer = document.getElementById('message-container');

      // Access the image caption from the server response
      const imageCaption = data.message;
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
        // Populate the <select> with the available options
        historySelect.innerHTML = data.map(filename => `<option class="block-list-e" value="${filename}">${filename}</option>`).join('');
        countOptions()
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
    selectedFilename = config_data.server.default_history_file;
  }

  // Define the data to be sent in the POST request
  var requestData = {
    task: 'load',
    chat: selectedFilename
  };

  // Fetch the selected chat history file from the server using POST
  fetch(`${server_url+server_port}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
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