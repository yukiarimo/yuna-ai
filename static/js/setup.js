// Utility Functions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

// Configuration Handling
const openConfigParams = () => {
  const container = document.getElementById('parameter-container');
  ['ai', 'server', 'settings'].forEach(type => {
    container.appendChild(createBlockList(config_data[type], type));
  });
  return container;
};

const createBlockList = (config, type) => {
  const div = document.createElement('div');
  div.classList.add('block-list', 'el-9', 'v-coll', `${type}-block-list`, 'list-group', 'list-group-flush');
  div.innerHTML = Object.entries(config).map(([key, value]) => 
    typeof value === 'boolean' ? createFormCheck(key, value) :
    Array.isArray(value) ? createFormGroup(key, value.join(',')) :
    createFormGroup(key, value)
  ).join('');
  return div;
};

const createFormGroup = (id, value) => `
  <div class="form-group w-100">
    <label for="${id}">${capitalize(id)}</label>
    <textarea class="form-control" id="${id}">${value}</textarea>
  </div>
`;

const createFormCheck = (id, checked) => `
  <div class="form-check w-100">
    <input class="form-check-input" type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
    <label class="form-check-label" for="${id}">${capitalize(id)}</label>
  </div>
`;

const saveConfigParams = () => {
  const reverseConfig = {
    ai: extractValues('.ai-block-list', ['names', 'himitsu', 'agi', 'emotions', 'miru', 'search', 'audio', 'max_new_tokens', 'context_length', 'temperature', 'repetition_penalty', 'last_n_tokens_size', 'seed', 'top_k', 'top_p', 'stop', 'batch_size', 'threads', 'gpu_layers', 'use_mmap', 'flash_attn', 'use_mlock', 'offload_kqv']),
    server: extractValues('.server-block-list', ['port', 'url', 'yuna_default_model', 'miru_default_model', 'eyes_default_model', 'voice_default_model', 'device', 'yuna_text_mode', 'yuna_audio_mode', 'yuna_reference_audio']),
    settings: extractValues('.settings-block-list', ['pseudo_api', 'fuctions', 'notifications', 'customConfig', 'sounds', 'use_history', 'background_call', 'nsfw_filter', 'streaming', 'default_history_file', 'default_kanojo', 'default_prompt_template']),
    security: extractValues('.security-block-list', ['secret_key', 'encryption_key', '11labs_key'])
  };
  localStorage.setItem('config', JSON.stringify(reverseConfig));
};

const extractValues = (selector, keys) => {
  const block = document.querySelector(selector);
  return keys.reduce((acc, key) => {
    const el = block.querySelector(`#${key}`);
    if (!el) return acc;
    acc[key] = el.type === 'checkbox' ? el.checked :
              el.type === 'number' ? parseFloat(el.value) :
              ['names', 'stop'].includes(key) ? el.value.split(',') :
              el.value;
    return acc;
  }, {});
};

// Configuration Loading
const checkConfigData = async () => {
  await delay(100);
  if (config_data) return;
  
  const storedConfig = localStorage.getItem('config');
  if (storedConfig) {
    setTimeout(() => {
      config_data = JSON.parse(storedConfig);
      ({ server: { url: server_url, port: server_port } } = config_data);
      populateHistorySelect().then(historyManagerInstance.loadSelectedHistory);
    }, 100);
  } else {
    try {
      const response = await fetch('/static/config.json');
      config_data = await response.json();
      localStorage.setItem('config', JSON.stringify(config_data));
      ({ server: { url: server_url, port: server_port } } = config_data);
    } catch (error) {
      console.error('Error:', error);
    }
    await delay(100);
    openConfigParams();
  }
};

checkConfigData();
setTimeout(openConfigParams, 300);

// Event Listeners
document.addEventListener("keydown", event => {
  const activeElement = document.activeElement;
  const isInput = ['INPUT', 'TEXTAREA'].includes(activeElement.tagName);
  
  if (event.key === "Tab") {
    event.preventDefault();
    toggleSidebar();
    return;
  }

  if (event.metaKey && !isInput) {
    const navSidebar = [...document.getElementsByClassName('side-link')];
    const keyMap = {
      '1': () => { activateTab(0, '1'); },
      '2': () => { activateTab(1, '2'); },
      '3': () => { activateTab(2, '4'); },
      '4': () => { activateTab(3, '5'); },
      '5': () => { activateTab(5, '7'); },
      '7': () => { 
        activateTab(6, '7');
        window.open('https://www.patreon.com/YukiArimo', '_blank');
      },
      'Y': () => { 
        document.getElementById('videoCallModal').classList.contains('show') ? callYuna.hide() : callYuna.show();
      }
    };
    if (keyMap[event.key]) {
      event.preventDefault();
      keyMap[event.key]();
    }
  }

  if (event.key === "Enter" && activeElement.id === 'input_text') {
    event.preventDefault();
    messageManagerInstance.sendMessage('');
  }
});

const activateTab = (index, tabId) => {
  const navSidebar = document.getElementsByClassName('side-link');
  [...navSidebar].forEach((link, idx) => link.classList.toggle('active', idx === index));
  if (tabId) OpenTab(tabId);
};

const callYuna = {
  myModal: new bootstrap.Modal(document.getElementById('videoCallModal')),
  show() { this.myModal.show(); },
  hide() { this.myModal.hide(); }
};

// Sidebar and Tabs
const navSidebar = document.getElementsByClassName('side-link');
const scrollToTop = document.querySelector('.scroll-to-top');

[...navSidebar].forEach((link, i) => {
  link.addEventListener('click', () => {
    scrollToTop.style.display = i === 0 ? 'none' : 'flex';
    [...navSidebar].forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

document.querySelectorAll('.side-link')[3]?.addEventListener('click', () => {
  ['character', 'system'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.height = `calc(${el.scrollHeight}px + 3px)`;
  });
});

// Apply Settings
const applySettings = () => {
  const { settings } = JSON.parse(localStorage.getItem('config')) || {};
  if (!settings) return;
  
  settings.streaming && document.querySelector('#streamingChatMode')?.click();
  settings.customConfig && document.querySelector('#customConfig')?.click();
  settings.sounds && document.querySelector('#soundsMode')?.click();
};

applySettings();