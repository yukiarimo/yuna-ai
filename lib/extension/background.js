// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
    console.log('Yuna AI Extension installed successfully');
  });
  
  // Handle messages from content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openYuna') {
      // Open Yuna webpage in a new tab
      chrome.tabs.create({ url: localStorage.getItem('yunaServerUrl') + '/yuna' });
      return true;
    }
  });