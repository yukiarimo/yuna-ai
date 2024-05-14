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
      ({
        server: {
          url: server_url,
          port: server_port
        }
      } = config_data);
      fixDialogData();
    }, 100);
  } else {
    try {
      const response = await fetch('/static/config.json');
      config_data = await response.json();
      localStorage.setItem('config', JSON.stringify(config_data));
      ({
        server: {
          url: server_url,
          port: server_port
        }
      } = config_data);
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

document.addEventListener("keydown", function (event) {
  // Prevent default action for Tab to avoid focusing on the next element
  if (event.key === "Tab") {
    event.preventDefault();
    toggleSidebar();
    kawaiAutoScale()
    return;
  }

  var inputs = Array.from(document.getElementsByTagName('input'));
  var textareas = Array.from(document.getElementsByTagName('textarea'));

  // Check if Shift key is pressed along with the key and is not in the input field
  if (!inputs.includes(document.activeElement) && !textareas.includes(document.activeElement) && event.shiftKey) {
    switch (event.key) {
      case "H":
        event.preventDefault(); // Prevent any default action
        var navSidebar = document.getElementsByClassName('side-link');

        for (let j = 0; j < navSidebar.length; j++) {
          navSidebar[j].classList.remove('active');
        }
        navSidebar[0].classList.add('active');
        OpenTab('1')

        break;
      case "L":
        event.preventDefault(); // Prevent any default action
        var navSidebar = document.getElementsByClassName('side-link');

        for (let j = 0; j < navSidebar.length; j++) {
          navSidebar[j].classList.remove('active');
        }
        navSidebar[1].classList.add('active');
        OpenTab('2')
        break;
      case "E":
        event.preventDefault(); // Prevent any default action
        var navSidebar = document.getElementsByClassName('side-link');

        for (let j = 0; j < navSidebar.length; j++) {
          navSidebar[j].classList.remove('active');
        }
        navSidebar[2].classList.add('active');
        OpenTab('3')
        break;
      case "P":
        event.preventDefault(); // Prevent any default action
        var navSidebar = document.getElementsByClassName('side-link');

        for (let j = 0; j < navSidebar.length; j++) {
          navSidebar[j].classList.remove('active');
        }
        navSidebar[3].classList.add('active');
        OpenTab('4')
        break;
      case "S":
        event.preventDefault(); // Prevent any default action
        var navSidebar = document.getElementsByClassName('side-link');

        for (let j = 0; j < navSidebar.length; j++) {
          navSidebar[j].classList.remove('active');
        }
        navSidebar[4].classList.add('active');
        settingsView.show();
        break;
      case "C":
        event.preventDefault(); // Prevent any default action
        // check if callYuna is open
        if (document.getElementById('videoCallModal').classList.contains('show')) {
          callYuna.hide();
        } else {
          callYuna.show();
        }
        break;
    }
  }

  // Check if Enter key is pressed
  if (event.key === "Enter") {
    // Prevent default action for Enter to avoid submitting the form
    event.preventDefault();
    // Check if the message input is focused
    if (document.activeElement === document.getElementById('input_text')) {
      // Send the message
      messageManager.sendMessage('')
    }
  }
})

var callYuna = {
  myModal: new bootstrap.Modal(document.getElementById('videoCallModal'), {}),
  show: function () {
    this.myModal.show();
  },
  hide: function () {
    this.myModal.hide();
  }
};

var promptTemplatePopup = {
  show: function () {
    var myModal = new bootstrap.Modal(document.getElementById('promptTemplatePopup'), {});
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

var navSidebar = document.getElementsByClassName('side-link');
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

// if on mobile, run this function
if (window.matchMedia("(max-width: 767px)").matches) {
  togglesidebarBack()
}

// get the height of the #message-container and get the height of the .input-wrapper.ui-container and set the height of the #message-container to the height of the #message-container - the height of the .input-wrapper.ui-container
// run the function kawaiAutoScale() with 1 second delay
setTimeout(function () {
  var messageContainer = document.getElementById('message-container');
  var inputWrapper = document.getElementsByClassName('input-wrapper')[0];
  messageContainer.style.height = `calc(${messageContainer.innerHeight}px - ${inputWrapper.innerHeight}px)`;
}, 200);

kawaiAutoScale();

function getVisibleHeight() {
  var elem = document.getElementById('message-container');
  var inputWrapper = document.querySelector('.input-wrapper');
  var bob = document.querySelector('.topbar-o');

  elem.style.height = `calc(100% - ${bob.offsetHeight}px - ${inputWrapper.offsetHeight}px)`;

  const topbarElement = document.querySelector('.topbar-o');
  const style = window.getComputedStyle(topbarElement);
  const bottomMargin = style.marginBottom;
}

setTimeout(getVisibleHeight, 100);

// check if mobile device
if (window.matchMedia("(max-width: 767px)").matches) {
  document.querySelectorAll('.side-link').forEach(function (element) {
    element.addEventListener('click', async function () {
      toggleSidebar();
      kawaiAutoScale();
    });
  });
}

document.querySelectorAll('.side-link')[3].addEventListener('click', function () {
  ['character', 'system'].forEach(id => {
    document.getElementById(id).style.height = `calc(${document.getElementById(id).scrollHeight}px + 3px)`;
  });
});