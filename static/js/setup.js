function openConfigParams() {
    var aiConfig = config_data.ai;
    var serverConfig = config_data.server;

    // Get the parameter container element
    const parameterContainer = document.getElementById('parameter-container');

    // Create the block list element
    const blockList = document.createElement('div');
    blockList.classList.add('block-list', 'el-9', 'v-coll');

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
        <label>Art</label>
        <input type="checkbox" id="art" ${aiConfig.art ? 'checked' : ''}>
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
        <label>Server URL</label>
        <input type="text" id="url" value="${serverConfig.url}">
      </div>
      <div class="block-list-e">
        <label>History</label>
        <input type="text" id="history" value="${serverConfig.history}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input type="text" id="default-history-file" value="${serverConfig.default_history_file}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input type="text" id="images" value="${serverConfig.images}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input type="text" id="yuna-model-dir" value="${serverConfig.yuna_model_dir}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input type="text" id="yuna-default-model" value="${serverConfig.yuna_default_model}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input type="text" id="agi-model-dir" value="${serverConfig.agi_model_dir}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input type="text" id="art-default-model" value="${serverConfig.art_default_model}">
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
    reverseConfig.ai.art = aiBlockList.querySelector('#art').checked;
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
    reverseConfig.server.url = serverBlockList.querySelector('#server').value;
    reverseConfig.server.history = serverBlockList.querySelector('#history').value;
    reverseConfig.server.default_history_file = serverBlockList.querySelector('#default-history').value;
    reverseConfig.server.images = serverBlockList.querySelector('#images').value;
    reverseConfig.server.yuna_model_dir = serverBlockList.querySelector('#yuna-model-dir').value;
    reverseConfig.server.yuna_default_model = serverBlockList.querySelector('#yuna-default-model').value;
    reverseConfig.server.agi_model_dir = serverBlockList.querySelector('#agi-model-dir').value;
    reverseConfig.server.art_default_model = serverBlockList.querySelector('#art-default-model').value;
    localStorage.setItem('config', JSON.stringify(reverseConfig));
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkConfigData() {
    await delay(100);
    if (typeof config_data === 'undefined') {
        console.log('You messed up production. Trying to load config.json again');

        if (localStorage.getItem('config')) {
            // reload the page with delay of 1 second if config is not available
            setTimeout(function () {
                config_data = JSON.parse(localStorage.getItem('config'))
                server_url = config_data.server.url
                server_port = config_data.server.port

                fixDialogData();
            }, 100);
        } else {
            // Fetch the JSON data
            fetch('static/config.json')
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

            await delay(100);
            openConfigParams();
        }
        closePopupsAll();
    }
}

function countOptions() {
    const selectElement = document.getElementById('history-select');
    const numberOfOptions = selectElement.options.length;
    selectElement.setAttribute('size', numberOfOptions);
}

// Function to open chat manager
function openChatManager() {
    OpenPopup('chat')
    // Get the parameter container element
    const chatManagerContainer = document.getElementById('current-history');

    // get sel3ected history from options
    var historySelect = document.getElementById('history-select');
    var selectedFilename = historySelect.value;

    chatManagerContainer.innerHTML = selectedFilename
}

// Function to work with history file manager
async function processForm(event) {
    // Prevent the form from being submitted normally
    event.preventDefault();

    // Get the form data
    var form = document.getElementById('mng-hist-form');
    var historyName = form.historyName.value;
    var historyNewName = form.historyNewName.value;
    var historyOptions = form.historyOptions.value;

    // Prepare the data to be sent
    var data = {
        chat: historyName,
        history: historyNewName,
        task: historyOptions
    };

    // Send the data to the server
    try {
        var response = await fetch(`${server_url + server_port}/history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        // Check the response
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the response data
        var responseData = await response.json();

        // Log the response data
        console.log(responseData);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

checkConfigData();