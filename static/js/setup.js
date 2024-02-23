function openConfigParams() {
  const parameterContainer = document.getElementById('parameter-container');
  parameterContainer.appendChild(createBlockList(config_data.ai, 'ai'));
  parameterContainer.appendChild(createBlockList(config_data.server, 'server'));
  return parameterContainer;
}

function createBlockList(config, type) {
  const blockList = document.createElement('div');
  blockList.classList.add('block-list', 'el-9', 'v-coll', `${type}-block-list`, 'list-group', 'list-group-flush');

  let html = '';
  for (const key in config) {
    if (typeof config[key] === 'boolean') {
      html += createFormCheck(key, config[key]);
    } else if (Array.isArray(config[key])) {
      html += createFormGroup(key, config[key].join(','));
    } else {
      html += createFormGroup(key, config[key]);
    }
  }

  blockList.innerHTML = html;
  return blockList;
}

function createFormGroup(id, value) {
  return `
    <div class="form-group" style="width: 100%;">
      <label for="${id}">${capitalize(id)}</label>
      <input type="text" class="form-control" id="${id}" value="${value}">
    </div>
  `;
}

function createFormCheck(id, checked) {
  return `
    <div class="form-check" style="width: 100%;">
      <input class="form-check-input" type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
      <label class="form-check-label" for="${id}">${capitalize(id)}</label>
    </div>
  `;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function saveConfigParams() {
  const reverseConfig = {
    ai: extractValuesFromBlockList('.ai-block-list', ['names', 'emotions', 'art', 'max-new-tokens', 'context-length', 'temperature', 'repetition-penalty', 'last-n-tokens', 'seed', 'top-k', 'top-p', 'stop', 'stream', 'batch-size', 'threads', 'gpu-layers']),
    server: extractValuesFromBlockList('.server-block-list', ['port', 'url', 'history', 'default-history-file', 'images', 'yuna-model-dir', 'yuna-default-model', 'agi-model-dir', 'art-default-model'])
  };

  localStorage.setItem('config', JSON.stringify(reverseConfig));
}

function extractValuesFromBlockList(selector, keys) {
  const blockList = document.querySelector(selector);
  const values = {};

  keys.forEach(key => {
    const element = blockList.querySelector(`#${key}`);
    if (element.type === 'checkbox') {
      values[key] = element.checked;
    } else if (element.type === 'number') {
      values[key] = parseFloat(element.value);
    } else if (key === 'names' || key === 'stop') {
      values[key] = element.value.split(',');
    } else {
      values[key] = element.value;
    }
  });

  return values;
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkConfigData() {
  await delay(100);
  if (config_data) return;

  if (localStorage.getItem('config')) {
    setTimeout(() => {
      config_data = JSON.parse(localStorage.getItem('config'));
      ({ server: { url: server_url, port: server_port } } = config_data);
      fixDialogData();
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
  closePopupsAll();
}

checkConfigData();
// run openConfigParams() with 1 second delay
setTimeout(openConfigParams, 1000);

document.addEventListener('keydown', function (event) {
  if (event.target.tagName.toLowerCase() === 'input' || !event.shiftKey) return;

  const keyActions = {
    'b': toggleSidebar,
    'c': () => {
      if (document.getElementById('call').style.display == 'none') {
        callYuna.show();
      } else {
        closePopupsAll();
      }
    },
    '1': () => OpenTab('1'),
    '2': () => OpenTab('2'),
    '3': () => OpenTab('3'),
  };

  const key = event.key.toLowerCase();
  if (keyActions[key]) keyActions[key]();
});

var callYuna = {
  show: function () {
    var myModal = new bootstrap.Modal(document.getElementById('videoCallModal'), {});
    myModal.show();
  }
};

var settingsView = {
  show: function () {
    var myModal = new bootstrap.Modal(document.getElementById('settingsModal'), {});
    myModal.show();
  }
};

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

if (window.matchMedia("(max-width: 428px)").matches) {
  document.getElementsByClassName('scroll-to-top')[0].style.display = 'none';
}

var navSidebar = document.getElementsByClassName('nav-link');
var scrollToTop = document.getElementsByClassName('scroll-to-top')[0];

for (let i = 0; i < navSidebar.length; i++) {
  navSidebar[i].addEventListener('click', function () {
    scrollToTop.style.display = i === 0 ? 'none' : 'flex';
    for (let j = 0; j < navSidebar.length; j++) {
      navSidebar[j].classList.remove('active');
    }
    navSidebar[i].classList.add('active');
  });
}

document.getElementsByClassName('sidebarToggle')[0].addEventListener('click', function () {
  document.getElementsByClassName('sidebar-o')[0].style.width = '100%';
  kawaiAutoScale();
});

function togglesidebarBack() {
  document.getElementsByClassName('sidebar-o')[0].classList.add('toggled');
  document.getElementsByClassName('sidebar-o')[0].width = '';
  kawaiAutoScale();
}

document.getElementsByClassName('sidebarToggleIn')[0].addEventListener('click', function () {
  document.getElementsByClassName('sidebar-o')[0].style.width = '100%';
  kawaiAutoScale();
});

// if on mobile, run this function
if (window.matchMedia("(max-width: 767px)").matches) {
  togglesidebarBack()
}

kawaiAutoScale();