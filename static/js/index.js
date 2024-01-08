var server_url = '';
var server_port = '';
var config_data;
var selectedFilename = '';
var backgroundMusic = document.getElementById('backgroundMusic');
var isTTS = false;
var isHimitsu = false;
var messageContainer = document.getElementById('message-container');
const typingBubble = `<div class="block-message-1" id="circle-loader"><div class="circle-loader"></div></div>`;
var himitsuCopilot;

function checkHimitsuCopilotState() {
  var toggleSwitch = document.getElementById('customSwitch');
  var isOn = toggleSwitch.checked;
  return isOn // This will log 'true' if the switch is on, 'false' if it's off
}

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

function sendMessage(message, imageName = false) {
  if (message == '') {
    message = document.getElementById('input_text').value;
  }

  if (checkHimitsuCopilotState()) {
    fetch(`${server_url + server_port}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat: selectedFilename,
          text: message,
          template: "himitsuCopilot",
        }),
      })
      .then(response => response.json())
      .then(data => {
        messageManager.removeBr();
        messageManager.removeTypingBubble();

        // Split the response data into three parts in an array by the "\n" character
        var splitData = data.response.split('\n');
        console.log(splitData);

        himitsuCopilot = new PromptTemplate(
          [],
          [{
              id: 'text',
              label: 'Input',
              type: 'text'
            },
            {
              id: 'q1',
              label: `${splitData[0]}`,
              type: 'text'
            },
            {
              id: 'q2',
              label: `${splitData[1]}`,
              type: 'text'
            },
            {
              id: 'q3',
              label: `${splitData[2]}`,
              type: 'text'
            },
          ]
        );

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

        himitsuCopilot.generateElements();

        isHimitsu = true;
      })
      .catch(error => {
        console.error('Error:', error);

        messageManager.removeTypingBubble();

        const messageData = {
          name: 'Yuna',
          message: error,
        };

        messageManager.createMessage(messageData.name, messageData.message);
        playAudio(audioType = 'error');
      });
    return
  }

  document.getElementById('input_text').value = ''

  messageManager.removeBr();
  messageContainer = document.getElementById('message-container');

  var messageData;

  if (currentPromptName == 'dialog') {
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

  } else if (currentPromptName != 'dialog') {
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
      template: currentPromptName,
    };

    messageManager.createMessage(messageData.name, messageData.message);

    if (currentPromptName == 'himitsu') {
      himitsu.generateElements();
    } else if (currentPromptName == 'writer') {
      writer.generateSelectElements();
      writer.generateTemplateInputs();
    } else if (currentPromptName == 'paraphrase') {
      paraphrase.generateSelectElements();
      paraphrase.generateTemplateInputs();
    } else if (currentPromptName == 'decisionMaking') {
      decisionMaking.generateSelectElements();
      decisionMaking.generateTemplateInputs();
    } else if (currentPromptName == 'dialog') {
      // skip this
    }

    // input a value like before with a 200ms delay
    if (currentPromptName != 'dialog') {
      setTimeout(function () {
        document.getElementById('text').value = message
      }, 50);
    }

    messageManager.createTypingBubble();

    messageManager.addBr();
    return;
  }

  playAudio(audioType = 'send');

  // Send a POST request to /message endpoint
  fetch(`${server_url + server_port}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: selectedFilename,
        text: messageData.message,
        template: currentPromptName,
      }),
    })
    .then(response => response.json())
    .then(data => {
      messageManager.removeBr();
      messageManager.removeTypingBubble();

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

function scrollMsg() {
  objDiv = document.getElementById("message-container");
  objDiv.scrollTop = objDiv.scrollHeight;
}

function drawArt() {
  messageContainer = document.getElementById('message-container');

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

// Modify the captureImage function to handle file uploads
function captureImageViaFile() {
  var imageUpload = document.getElementById('imageUpload');
  var messageContainer = document.getElementById('message-container');

  if (imageUpload.files.length > 0) {
    var file = imageUpload.files[0];
    var reader = new FileReader();

    reader.onloadend = function () {
      // Convert the image file to a base64 data URL
      var imageDataURL = reader.result;

      var messageForImage = '';
      if (isTTS.toString() == 'false') {
        messageForImage = prompt('Enter a message for the image:');
      }

      // Generate a random image name using current timestamp
      var imageName = new Date().getTime().toString();

      closePopupsAll();

      // Send the uploaded image to the Flask server
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
            throw new Error('Error sending uploaded image.');
          }
        })
        .then(data => {
          // Access the image caption from the server response
          const imageCaption = data.message;
          var askYunaImage = `*You can see ${imageCaption} in the image* ${messageForImage}`;

          sendMessage(askYunaImage, imageName);
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error sending uploaded image.');
        });
    };

    // Read the image file as a data URL
    reader.readAsDataURL(file);
  } else {
    alert('No file selected.');
  }
}

// Function to fetch and populate chat history file options
function populateHistorySelect() {
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

function duplicateAndCategorizeChats() {
  // Get the history select element
  var historySelect = document.getElementById('chat-items');

  // Create a new div for the categorized chats
  var collectionItems = document.createElement('div');
  collectionItems.id = 'collectionItems';
  // add class 'list-group' to the div

  // Get the chat items
  var chatItems = historySelect.querySelectorAll('.collection-item');

  // Create divs for the general and other chats
  var generalChatsDiv = document.createElement('div');
  generalChatsDiv.className = 'general-chats';
  var otherChatsDiv = document.createElement('div');
  otherChatsDiv.className = 'other-chats';

  // Iterate over the chat items
  chatItems.forEach(item => {
    // Clone the item
    var clonedItem = item.cloneNode(true);

    // Get the collection name
    var collectionName = clonedItem.querySelector('.collection-name').textContent;

    // Check if the collection name contains ':general:'
    if (collectionName.includes(':general:')) {
      // Add the cloned item to the general chats div
      generalChatsDiv.appendChild(clonedItem);
    } else {
      // Add the cloned item to the other chats div
      otherChatsDiv.appendChild(clonedItem);
    }
  });

  // Add the general and other chats divs to the collection select div
  collectionItems.appendChild(generalChatsDiv);
  collectionItems.appendChild(otherChatsDiv);

  // Add the collection select div to the body
  document.getElementById('collectionItems').innerHTML = collectionItems.innerHTML;
  document.getElementById('collectionItems').classList.add('list-group');
}

// Function to load the selected chat history file
function loadSelectedHistory(selectedFilename) {
  messageContainer = document.getElementById('message-container');

  if (selectedFilename == undefined) {
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

// Get all tabs
const tabs = document.querySelectorAll('.tab');
// Get all content sections
const sections = document.querySelectorAll('.section');

// Function to remove active class from all tabs and hide all sections
function resetActiveTabsAndHideSections() {
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });
  sections.forEach(section => {
    section.style.display = 'none';
  });
}

// Function to initialize tabs functionality
function initTabs() {
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      resetActiveTabsAndHideSections();
      // Add active class to the clicked tab
      tab.classList.add('active');
      // Display the corresponding section
      sections[index].style.display = 'block';
    });
  });
}

var firstNavSidebar = document.getElementsByClassName('nav-link')[0];
var secondNavSidebar = document.getElementsByClassName('nav-link')[1];
var thirdNavSidebar = document.getElementsByClassName('nav-link')[2];
var fourthNavSidebar = document.getElementsByClassName('nav-link')[3];

if (window.matchMedia("(max-width: 428px)").matches) {
  document.getElementsByClassName('scroll-to-top')[0].style.display = 'none';
}

// add "selected" class to which is clicked and remove from other tabs
firstNavSidebar.addEventListener('click', function () {
  document.getElementsByClassName('scroll-to-top')[0].style.display = 'none';
  firstNavSidebar.classList.add('active');
  secondNavSidebar.classList.remove('active');
  thirdNavSidebar.classList.remove('active');
  fourthNavSidebar.classList.remove('active');
});

secondNavSidebar.addEventListener('click', function () {
  document.getElementsByClassName('scroll-to-top')[0].style.display = 'flex';
  firstNavSidebar.classList.remove('active');
  secondNavSidebar.classList.add('active');
  thirdNavSidebar.classList.remove('active');
  fourthNavSidebar.classList.remove('active');
});

thirdNavSidebar.addEventListener('click', function () {
  document.getElementsByClassName('scroll-to-top')[0].style.display = 'flex';
  firstNavSidebar.classList.remove('active');
  secondNavSidebar.classList.remove('active');
  thirdNavSidebar.classList.add('active');
  fourthNavSidebar.classList.remove('active');
});

fourthNavSidebar.addEventListener('click', function () {
  document.getElementsByClassName('scroll-to-top')[0].style.display = 'flex';
  firstNavSidebar.classList.remove('active');
  secondNavSidebar.classList.remove('active');
  thirdNavSidebar.classList.remove('active');
  fourthNavSidebar.classList.add('active');
});

document.getElementById('sidebarToggle').addEventListener('click', function () {
  kawaiAutoScale();
});

document.getElementById('sidebarToggleTop').addEventListener('click', function () {
  kawaiAutoScale();
});

kawaiAutoScale();

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

// Assuming you have a modal with the ID 'videoCallModal'
var callYuna = new bootstrap.Modal(document.getElementById('videoCallModal'), {
  keyboard: false
});