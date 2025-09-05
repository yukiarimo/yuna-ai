// Listens for changes in the extension's storage.
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.isContentScriptEnabled) {
    const isEnabled = changes.isContentScriptEnabled.newValue;

    // Find all active tabs.
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        // Send a message to each tab to enable or disable the UI.
        try {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_YUNA_UI',
            enabled: isEnabled
          });
        } catch (e) {
            console.warn(`Could not send message to tab ${tab.id}: ${e.message}`);
        }
      });
    });
  }
});