// Utility Functions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

// Configuration Handling
const openConfigParams = () => {
  const container = document.getElementById('parameter-container');
  ['ai', 'server', 'settings'].forEach(type => 
    container.appendChild(createBlockList(config_data[type], type))
  );
  return container;
};

const createBlockList = (config, type) => {
  const div = document.createElement('div');
  div.className = `block-list el-9 v-coll ${type}-block-list list-group list-group-flush`;
  div.innerHTML = Object.entries(config).map(([k, v]) => 
    typeof v === 'boolean' ? createFormCheck(k, v) :
    Array.isArray(v) ? createFormGroup(k, v.join(',')) :
    createFormGroup(k, v)
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
    ai: extractValues('.ai-block-list', ['names','himitsu','agi','emotions','miru','search','audio','max_new_tokens','context_length','temperature','repetition_penalty','last_n_tokens_size','seed','top_k','top_p','stop','batch_size','threads','gpu_layers','use_mmap','flash_attn','use_mlock','offload_kqv']),
    server: extractValues('.server-block-list', ['port','url','yuna_default_model','miru_default_model','eyes_default_model','voice_default_model','device','yuna_text_mode','yuna_audio_mode','yuna_reference_audio']),
    settings: extractValues('.settings-block-list', ['pseudo_api','fuctions','notifications','customConfig','sounds','use_history','background_call','nsfw_filter','streaming','default_history_file','default_kanojo','default_prompt_template']),
    security: extractValues('.security-block-list', ['secret_key','encryption_key','11labs_key'])
  };
  localStorage.setItem('config', JSON.stringify(reverseConfig));
};

const extractValues = (selector, keys) => {
  const block = document.querySelector(selector);
  return keys.reduce((acc, key) => {
    const el = block.querySelector(`#${key}`);
    if (el) acc[key] = el.type === 'checkbox' ? el.checked :
                  el.type === 'number' ? parseFloat(el.value) :
                  ['names','stop'].includes(key) ? el.value.split(',') :
                  el.value;
    return acc;
  }, {});
};

// Configuration Loading
const checkConfigData = async () => {  
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
  }
};
!config_data && setTimeout(checkConfigData, 100);
setTimeout(openConfigParams, 300);

if (window.innerWidth <= 440) {
  document.querySelectorAll('.side-link').forEach(link => link.addEventListener('click', () => toggleSidebar()));
  toggleSidebar(); // Toggle sidebar when the site first loads for mobile
}

// Event Listeners
document.addEventListener("keydown", event => {
  const active = document.activeElement.tagName;
  const isInput = ['INPUT','TEXTAREA'].includes(active);
  if (event.key === "Tab") return (event.preventDefault(), toggleSidebar());
  if (event.metaKey && !isInput) {
    const keyMap = {
      '1': () => activateTab(0, '1'),
      '2': () => activateTab(1, '2'),
      '3': () => activateTab(2, '4'),
      '4': () => activateTab(3, '5'),
      '5': () => activateTab(5, '7'),
      '7': () => { activateTab(6, '7'); window.open('https://www.patreon.com/YukiArimo', '_blank'); },
      'Y': () => callYuna[document.getElementById('videoCallModal').classList.contains('show') ? 'hide' : 'show']()
    };
    if (keyMap[event.key]) { event.preventDefault(); keyMap[event.key](); }
  }
  if (event.key === "Enter" && document.activeElement.id === 'input_text') {
    event.preventDefault(); messageManagerInstance.sendMessage('');
  }
});

const activateTab = (index, tabId) => {
  [...document.getElementsByClassName('side-link')].forEach((l, i) => l.classList.toggle('active', i === index));
  if (tabId) OpenTab(tabId);
};

const callYuna = {
  myModal: new bootstrap.Modal(document.getElementById('videoCallModal')),
  show() { this.myModal.show(); },
  hide() { this.myModal.hide(); }
};

// Sidebar and Tabs
const navSidebar = document.getElementsByClassName('side-link');
[...navSidebar].forEach((link, i) => {
  link.addEventListener('click', () => {
    [...navSidebar].forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});
document.querySelectorAll('.side-link')[3]?.addEventListener('click', () => {
  ['character','system'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.height = `calc(${el.scrollHeight}px + 3px)`;
  });
});

// Apply Settings
const applySettings = () => {
  const { settings } = JSON.parse(localStorage.getItem('config')) || {};
  if (settings) {
    settings.streaming && document.querySelector('#streamingChatMode')?.click();
    settings.customConfig && document.querySelector('#customConfig')?.click();
    settings.sounds && document.querySelector('#soundsMode')?.click();
  }
};
setTimeout(applySettings, 100);

class NotificationManager {
  constructor() {
    this.dropdownMenu = document.querySelector('#notifications-container');
    this.messages = [];
  }

  add(message) {
    this.messages.push(message);
    this.render();
  }

  delete(message) {
    this.messages = this.messages.filter(msg => msg !== message);
    this.render();
  }

  clearAll() {
    this.messages = [];
    this.render();
  }

  render() {
    this.dropdownMenu.innerHTML = this.messages.map(message => `
      <a class="dropdown-item d-flex align-items-center" href="#">
        <div>
          <span class="font-weight-bold">${message}</span>
          <h1>Push Notifications Demo</h1>
    <button id="subscribe" class="button">Enable Notifications</button>
    <button id="unsubscribe" class="button">Disable Notifications</button>
    
    <div id="notification-form">
        <h2>Send Test Notification</h2>
        <input type="text" id="title" placeholder="Notification Title" /><br>
        <textarea id="body" placeholder="Notification Body"></textarea><br>
        <button onclick="sendNotification()" class="button">Send Notification</button>
    </div>
        </div>
      </a>
    `).join('');
  }
}

// Create an instance of NotificationManager
const notificationManagerInstance = new NotificationManager();

// Call the add method
notificationManagerInstance.add("Hello! Welcome to the chat room!");

function updateMsgCount() {
  setTimeout(() => {
    document.getElementById('messageCount').textContent = document.querySelectorAll('#message-container .p-2.mb-2').length;
    document.getElementById('chatsCount').textContent = document.querySelectorAll('#chat-items .collection-item').length;
  }, 300);
}

function deleteMessageFromHistory(message) {
  let fileName = selectedFilename;

  fetch(`${config_data.server.url + config_data.server.port}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: fileName,
        task: "delete_message",
        text: message
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(historyManagerInstance.loadSelectedHistory(fileName))
    .catch(error => {
      console.error('An error occurred:', error);
    });
}

// Function to adjust textarea height
function adjustTextareaHeight(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// Function to initialize all textareas
function initializeTextareas() {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    // Disable manual resizing
    textarea.style.resize = 'none';

    // Initial adjustment
    adjustTextareaHeight(textarea);

    // Add event listeners for real-time updates
    textarea.addEventListener('input', () => adjustTextareaHeight(textarea));
    textarea.addEventListener('change', () => adjustTextareaHeight(textarea));

    // Create a MutationObserver to watch for changes in content
    const observer = new MutationObserver(() => adjustTextareaHeight(textarea));
    observer.observe(textarea, {
      childList: true,
      characterData: true,
      subtree: true
    });
  });
}

// Run the initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeTextareas);

var vapidPublicKey = 'BLAWDkBakXLWfyQP5zAXR5Dyv4-W1nsRDkUk9Kw9MqKppQCdbsP-yfz7kEpAPvDMy2lszg_SZ9QEC9Uda8mpKSg'

// static/app.js
let swRegistration = null;

// Check if service workers are supported
if ('serviceWorker' in navigator && 'PushManager' in window) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js')
            .then(registration => {
                swRegistration = registration;
                initializeUI();
            })
            .catch(error => console.error('Service Worker Error:', error));
    });
}

function initializeUI() {
    const subscribeButton = document.getElementById('subscribe');
    const unsubscribeButton = document.getElementById('unsubscribe');

    // Check for existing subscription
    swRegistration.pushManager.getSubscription()
        .then(subscription => {
            if (subscription) {
                console.log('User is already subscribed:', subscription);
                updateSubscriptionOnServer(subscription);
                subscribeButton.disabled = true;
                unsubscribeButton.disabled = false;
            } else {
                subscribeButton.disabled = false;
                unsubscribeButton.disabled = true;
            }
        });

    // Set button click events
    subscribeButton.addEventListener('click', subscribeUser);
    unsubscribeButton.addEventListener('click', unsubscribeUser);
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(vapidPublicKey);

    swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
        .then(subscription => {
            console.log('User is subscribed:', subscription);
            updateSubscriptionOnServer(subscription);
            updateButtonState();
        })
        .catch(err => console.error('Failed to subscribe user: ', err));
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(subscription => {
            if (subscription) {
                return subscription.unsubscribe();
            }
        })
        .then(() => {
            updateButtonState();
            console.log('User is unsubscribed');
        })
        .catch(error => console.error('Error unsubscribing', error));
}

function updateSubscriptionOnServer(subscription) {
    fetch('/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
    });
}

function sendNotification() {
    const title = document.getElementById('title').value;
    const body = document.getElementById('body').value;

    fetch('/send-notification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            body: body
        })
    });
}

// Helper function to convert VAPID key
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function updateButtonState() {
    const subscribeButton = document.getElementById('subscribe');
    const unsubscribeButton = document.getElementById('unsubscribe');
    swRegistration.pushManager.getSubscription()
        .then(subscription => {
            if (subscription) {
                subscribeButton.disabled = true;
                unsubscribeButton.disabled = false;
            } else {
                subscribeButton.disabled = false;
                unsubscribeButton.disabled = true;
            }
        });
}