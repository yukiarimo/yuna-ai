// Load history when page loads
window.addEventListener('DOMContentLoaded', loadHistory);

function handleSubmit(event) {
  event.preventDefault();
  inputText = document.getElementById("input_text").value;
  inputText = "<|user|>" + inputText + "<|bot|>"

  // Add the user's message block to the message history
  addMessageBlock(inputText, "user");

  if (localStorage.getItem("history") == null) {
    localStorage.setItem("history", "");
  }

  inputText = `${localStorage.getItem("history")}${inputText}`.replace("\r", "");

  const formData = new FormData();
  formData.append("input_text", inputText);
  fetch("/", {
      method: "POST",
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      // Add the server's response block to the message history
      addMessageBlock(data, "server");
      localStorage.setItem("history", `${localStorage.getItem("history")}\n${document.getElementById("input_text").value}${data}`.replace("\r", "").replace("<", ""));
    })
    .catch(error => {
      console.error("Error:", error);
    });
}

function handleSimpleSubmit2() {
  let inputText = document.getElementById("input_text").value;
  inputText = "<|user|>" + inputText + "<|bot|>"

  // Add the user's message block to the message history
  addMessageBlock(inputText, "user");

  const formData = new FormData();
  formData.append("input_text", inputText);
  fetch("/", {
      method: "POST",
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      // Add the server's response block to the message history
      addMessageBlock(data, "server");
    })
    .catch(error => {
      console.error("Error:", error);
    });
}

const handleSimpleSubmit = async () => {
  // Get the user's input text from the input field
  let inputText = document.getElementById("input_text").value;

  // Add the user's message block to the message history
  addMessageBlock(inputText, "user");

  // Get the container for displaying messages
  let messagesContainer = document.querySelector(".messages-container");

  // Create a new message block element
  let messageBlock = document.createElement("div");
  messageBlock.classList.add("message-block");

  // Create a new message div element inside the message block
  let messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageBlock.appendChild(messageDiv);

  // Mark the message block as a server message
  messageBlock.classList.add("server-message");

  // Append the new message block to the messages container
  messagesContainer.appendChild(messageBlock);

  // Create a FormData object and append the input_text to it
  const formData = new FormData();
  formData.append("input_text", inputText);

  try {
    // Make a POST request to the server
    const response = await fetch('http://localhost:4848/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `input_text=${encodeURIComponent("" + inputText + "")}`
    });

    if (!response.ok) {
      throw new Error('Request failed.');
    }

    // Start receiving the streamed data
    const reader = response.body.getReader();

    const processStream = async () => {
      // Continuously read data from the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the streamed data
        const streamText = new TextDecoder().decode(value);

        // Update the message block's content in real-time
        messageDiv.innerHTML += streamText;
      }
    };

    processStream();
  } catch (error) {
    console.error(error);
  }
};

function addMessageBlock(message, sender) {
  // Function to add a new message block to the messages container
  const messagesContainer = document.querySelector(".messages-container");

  // Create a new message block element
  const messageBlock = document.createElement("div");
  messageBlock.classList.add("message-block");

  // Create a new message div element inside the message block
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.textContent = message.replace("<", "");
  messageBlock.appendChild(messageDiv);

  // Set the sender class based on the input "sender" argument
  if (sender === "user") {
    messageBlock.classList.add("user-message");
  } else if (sender === "server") {
    messageBlock.classList.add("server-message");
  }

  // Append the new message block to the messages container
  messagesContainer.appendChild(messageBlock);
}

function clearHistory() {
  // Function to clear the message history and remove it from localStorage
  const messagesContainer = document.querySelector(".messages-container");
  messagesContainer.innerHTML = "";
  localStorage.removeItem("history");
}

function loadHistory() {
  // Function to load the message history from localStorage and display it
  const history = localStorage.getItem("history");
  if (history) {
    const messagesContainer = document.querySelector(".messages-container");
    messagesContainer.innerHTML = "";
    const messages = history.split("\n");
    messages.forEach(message => {
      const sender = message.startsWith("Yuki:") ? "user" : "server";
      const text = message.replace("Yuki:", "").trim();
      if (text !== "") {
        addMessageBlock(text, sender);
      }
    });
  }
}

function downloadHistory() {
  // Function to download the message history as a text file
  const history = localStorage.getItem("history");
  if (history) {
    const blob = new Blob([history], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat_history.txt";
    a.click();
  }
}

// Add this global variable to keep track of the training status
let trainingStatus = document.getElementById("training-status");

// Function to handle the "Start Training" button click
async function startTraining() {
  // Get the training options from the user input
  const num_epochs = document.getElementById("num_epochs").value;
  const learning_rate = document.getElementById("learning_rate").value;

  // Create a FormData object and append the training options to it
  const formData = new FormData();
  formData.append("num_epochs", num_epochs);
  formData.append("learning_rate", learning_rate);

  // Clear the training status and disable the "Start Training" button
  trainingStatus.innerHTML = "";
  document.getElementById("num_epochs").disabled = true;
  document.getElementById("learning_rate").disabled = true;
  document.querySelector(".train-button").disabled = true;

  try {
    // Make a POST request to start the training process
    const response = await fetch('/train', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Request failed.');
    }

    // Start receiving the streamed data
    const reader = response.body.getReader();
    let receivedData = "";

    const processStream = async () => {
      // Continuously read data from the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the streamed data
        const streamText = new TextDecoder().decode(value);

        // Append the streamed data to the receivedData variable
        receivedData += streamText;

        // Check if a complete update has been received
        if (receivedData.includes('\n')) {
          const updates = receivedData.split('\n');
          updates.forEach(update => {
            if (update !== "") {
              // Display the training update on the web page
              trainingStatus.innerHTML += update + "<br>";
            }
          });
          // Clear the receivedData variable after processing updates
          receivedData = "";
        }
      }
    };

    processStream();
  } catch (error) {
    console.error(error);
  }
}