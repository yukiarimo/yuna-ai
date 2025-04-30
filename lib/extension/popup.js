document.getElementById('openWebpage').addEventListener('click', () => {
    chrome.tabs.create({ url: localStorage.getItem('yunaServerUrl') + '/yuna' });
  });