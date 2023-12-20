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
        <input class="block-input" type="text" id="names" value="${aiConfig.names.join(',')}">
      </div>
      <div class="block-list-e">
        <label>Emotions</label>
        <label class="toggle-switch">
          <input type="checkbox" id="emotions" ${aiConfig.emotions ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="block-list-e">
        <label>Art</label>
        <label class="toggle-switch">
          <input type="checkbox" id="art" ${aiConfig.art ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="block-list-e">
        <label>Max New Tokens</label>
        <input class="block-input" type="number" id="max-new-tokens" value="${aiConfig.max_new_tokens}">
      </div>
      <div class="block-list-e">
        <label>Context Length</label>
        <input class="block-input" type="number" id="context-length" value="${aiConfig.context_length}">
      </div>
      <div class="block-list-e">
        <label>Temperature</label>
        <input class="block-input" type="number" id="temperature" value="${aiConfig.temperature}">
      </div>
      <div class="block-list-e">
        <label>Repetition Penalty</label>
        <input class="block-input" type="number" id="repetition-penalty" value="${aiConfig.repetition_penalty}">
      </div>
      <div class="block-list-e">
        <label>Last N Tokens</label>
        <input class="block-input" type="number" id="last-n-tokens" value="${aiConfig.last_n_tokens}">
      </div>
      <div class="block-list-e">
        <label>Seed</label>
        <input class="block-input" type="number" id="seed" value="${aiConfig.seed}">
      </div>
      <div class="block-list-e">
        <label>Top K</label>
        <input class="block-input" type="number" id="top-k" value="${aiConfig.top_k}">
      </div>
      <div class="block-list-e">
        <label>Top P</label>
        <input class="block-input" type="number" id="top-p" value="${aiConfig.top_p}">
      </div>
      <div class="block-list-e">
        <label>Stop</label>
        <input class="block-input" type="text" id="stop" value="${aiConfig.stop.join(',')}">
      </div>
      <div class="block-list-e">
        <label>Stream</label>
        <label class="toggle-switch">
          <input type="checkbox" id="stream" ${aiConfig.stream ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="block-list-e">
        <label>Batch Size</label>
        <input class="block-input" type="number" id="batch-size" value="${aiConfig.batch_size}">
      </div>
      <div class="block-list-e">
        <label>Threads</label>
        <input class="block-input" type="number" id="threads" value="${aiConfig.threads}">
      </div>
      <div class="block-list-e">
        <label>GPU Layers</label>
        <input class="block-input" type="number" id="gpu-layers" value="${aiConfig.gpu_layers}">
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
        <input class="block-input" type="number" id="port" value="${serverConfig.port}">
      </div>
      <div class="block-list-e">
        <label>Server URL</label>
        <input class="block-input" type="text" id="url" value="${serverConfig.url}">
      </div>
      <div class="block-list-e">
        <label>History</label>
        <input class="block-input" type="text" id="history" value="${serverConfig.history}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input class="block-input" type="text" id="default-history-file" value="${serverConfig.default_history_file}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input class="block-input" type="text" id="images" value="${serverConfig.images}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input class="block-input" type="text" id="yuna-model-dir" value="${serverConfig.yuna_model_dir}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input class="block-input" type="text" id="yuna-default-model" value="${serverConfig.yuna_default_model}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input class="block-input" type="text" id="agi-model-dir" value="${serverConfig.agi_model_dir}">
      </div>
      <div class="block-list-e">
        <label>Default History</label>
        <input class="block-input" type="text" id="art-default-model" value="${serverConfig.art_default_model}">
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
  console.log(reverseConfig);

  // Extract values from Server block list
  reverseConfig.server.port = parseInt(serverBlockList.querySelector('#port').value);
  reverseConfig.server.url = serverBlockList.querySelector('#url').value;
  reverseConfig.server.history = serverBlockList.querySelector('#history').value;
  reverseConfig.server.default_history_file = serverBlockList.querySelector('#default-history-file').value;
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

checkConfigData();
// run openConfigParams() with 1 second delay
setTimeout(openConfigParams, 1000);

document.addEventListener('keydown', function (event) {
  // If the target element is an input, don't execute the rest of the function
  if (event.target.tagName.toLowerCase() === 'input') {
    return;
  }

  if (event.shiftKey) { // Check if shift key is pressed
    switch (event.key) {
      case 'b':
      case 'B':
        toggleSidebar();
        break;
      case 'c':
      case 'C':
        // check if popup with id call has css display none
        if (document.getElementById('call').style.display == 'none') {
          OpenPopup('call');
        } else {
          closePopupsAll();
        }
        break;
      case '1':
      case 'End':
      case '!':
        OpenTab('1');
        break;
      case '2':
      case 'ArrowDown':
      case '@':
        OpenTab('2');
        break;
      case '3':
      case 'PageDown':
      case '#':
        OpenTab('3');
        break;
    }
  }
});