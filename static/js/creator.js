// Element selectors
const $ = id => document.getElementById(id);
const elements = {
    workArea: $('work-area'),
    draftArea: $('draft-area'),
    outputArea: $('output-area'),
    sendButton: $('createButtonHimitsuCreator'),
    presentationPreview: $('presentation-content'),
    saveButton: $('savePresentationButtonHimitsuCreator'),
    clearButton: $('clearButtonHimitsuCreator'),
    copyToDraftButton: $('copyToDraftButtonHimitsuCreator'),
};
// Simplified event handlers
const copyToDraft = () => elements.draftArea.value = elements.outputArea.value;

// Alternative approach
function sendNaked() {
    // Send request to the backend API
    fetch(`/extension`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: elements.workArea.value
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        elements.outputArea.value = data.response;
      })
  }

// Attach event listeners
elements.copyToDraftButton.addEventListener('click', copyToDraft);
elements.sendButton.addEventListener('click', sendNaked);

// Markdown Renderer Setup
marked.setOptions({
    breaks: true,
    gfm: true
});

// Load and render markdown on load
window.onload = () => {
    // Load all saved content
    const savedPresentation = localStorage.getItem('presentationMarkdown');
    if (savedPresentation) elements.workArea.value = savedPresentation;

    const savedDraft = localStorage.getItem('draftAreaContent');
    if (savedDraft) elements.draftArea.value = savedDraft;

    const savedOutput = localStorage.getItem('outputAreaContent');
    if (savedOutput) elements.outputArea.value = savedOutput;

    renderPreview();
};

// Markdown Event Listeners
elements.saveButton.addEventListener('click', () => {
    // Save all three text areas to localStorage
    localStorage.setItem('presentationMarkdown', elements.workArea.value);
    localStorage.setItem('draftAreaContent', elements.draftArea.value);
    localStorage.setItem('outputAreaContent', elements.outputArea.value);
    alert('All content saved!');
});

elements.clearButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all content?')) {
        elements.workArea.value = '';
        elements.draftArea.value = '';
        elements.outputArea.value = '';
        elements.presentationPreview.innerHTML = '';

        // Clear all stored content
        localStorage.removeItem('presentationMarkdown');
        localStorage.removeItem('draftAreaContent');
        localStorage.removeItem('outputAreaContent');
    }
});

elements.workArea.addEventListener('input', renderPreview);

// Render markdown preview
function renderPreview() {
    const slides = elements.workArea.value.split(/^---$/m);
    elements.presentationPreview.innerHTML = slides.map(slide => {
        const div = document.createElement('div');
        div.className = 'slide-container mb-4 p-3 border rounded';
        div.innerHTML = marked.parse(slide);
        return div.outerHTML;
    }).join('');
}