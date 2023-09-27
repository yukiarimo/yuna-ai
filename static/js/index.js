const backgroundMusic = document.getElementById('backgroundMusic');
var isTTS = ''

function handleSubmit(event) {
  event.preventDefault();
  const message = document.getElementById('input_text').value;
  sendMessage(message);
}

function sendMessage(message) {
  setTimeout(loadHistory, 300);
  document.getElementById('input_text').value = ''

  if (isTTS.toString() == 'true') {
    message = message + '<tts>';
  }

  // Send a POST request to /send_message
  fetch('/send_message', {
      method: 'POST',
      body: new URLSearchParams({
        'message': message
      }), // Send the message as form data
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(response => response.json())
    .then(data => {
      // Display if ok
      loadHistory();
    })
    .catch(error => {
      console.error('Error sending message:', error);
    })
    .finally(() => {
      // This code will be executed regardless of success or error
      if (isTTS.toString() == 'true') {
        playAudio()
      }
      console.log('done');
    });
}

function playAudio() {
  stopSpeechRecognition()
  // Generate a random query parameter value
  const randomValue = Math.random();

  // Get the audio source element
  const audioSource = document.getElementById("backgroundMusic");

  // Set the src attribute with the random query parameter
  audioSource.src = `/static/audio/output.aiff?v=${randomValue}`;

  // Get the audio element and play it
  audio = document.getElementById("backgroundMusic");
  audio.load(); // Reload the audio element to apply the new source
  audio.play();
  startSpeechRecognition()
}

// Other functions (clearHistory, loadHistory, downloadHistory) go here if needed.
function formatMessage(messageData) {
  // Create a div for the message
  const messageDiv = document.createElement('div');

  // Set the CSS class based on the name
  if (messageData.name === 'Yuki') {
    messageDiv.classList.add('block-message-2'); // Yuki's messages on the right
  } else if (messageData.name === 'Yuna') {
    messageDiv.classList.add('block-message-1'); // Yuna's messages on the left
  }

  // Create a paragraph for the message text
  const messageText = document.createElement('p');
  messageText.textContent = `${messageData.name}: ${messageData.message}`;

  // Append the message text to the message div
  messageDiv.appendChild(messageText);

  return messageDiv;
}

function downloadHistory() {
  fetch('/history', {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    const chatHistory = JSON.stringify(data);
    const blob = new Blob([chatHistory], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element for downloading
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.txt';
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
  })
  .catch(error => {
    console.error('Error fetching history for download:', error);
  });
}

// Function to open a pop-up dialog for editing history
function editHistory(messageId, currentText) {
  // Create a pop-up dialog
  const editDialog = document.createElement('div');
  editDialog.classList.add('edit-dialog');

  // Create a textarea to edit the message
  const editTextArea = document.createElement('textarea');
  editTextArea.value = currentText;
  editDialog.appendChild(editTextArea);

  // Create a button to save the edited message
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.addEventListener('click', () => {
    const editedText = editTextArea.value;
    // Call the function to save the edited message here, e.g., send it to the server
    saveEditedMessage(messageId, editedText);
    // Remove the pop-up dialog
    editDialog.remove();
  });
  editDialog.appendChild(saveButton);

  // Add the pop-up dialog to the body
  document.body.appendChild(editDialog);
}

// Function to save the edited message (you can send it to the server here)
function saveEditedMessage(messageId, editedText) {
  // Assuming you send the edited message to the server and handle the update there
  console.log(`Message with ID ${messageId} edited: ${editedText}`);
}

function displayMessages(messages) {
  const messageContainer = document.getElementById('message-container');

  // Clear the existing content of messageContainer
  while (messageContainer.firstChild) {
    messageContainer.removeChild(messageContainer.firstChild);
  }

  // Loop through the messages and format each one
  messages.forEach(messageData => {
    const formattedMessage = formatMessage(messageData);
    messageContainer.appendChild(formattedMessage);
  });
}

// Function to fetch and display chat history
function loadHistory() {
  fetch('/history', {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      displayMessages(data); // Display the chat history
      scrollMsg()
    })
    .catch(error => {
      console.error('Error fetching history:', error);
    });
}

// Call loadHistory to initially load chat history
loadHistory();

// Get access to the user's camera and display the video stream
navigator.mediaDevices.getUserMedia({
    video: true
  })
  .then(function (stream) {
    const localVideo = document.getElementById('localVideo');
    localVideo.srcObject = stream;
  })
  .catch(function (error) {
    console.error('Error accessing the camera:', error);
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
      const result = event.results[event.resultIndex];
      const recognizedText = result[0].transcript;

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