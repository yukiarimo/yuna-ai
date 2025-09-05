const contentScriptToggle = document.getElementById('content-script-toggle');
chrome.storage.sync.get(['isContentScriptEnabled'], (result) => {
    contentScriptToggle.checked = result.isContentScriptEnabled !== false;
});
contentScriptToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.sync.set({
        isContentScriptEnabled: isEnabled
    }, () => {
        console.log('Content script toggle state saved:', isEnabled);
    });
});