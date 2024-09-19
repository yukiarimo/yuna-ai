// Get the necessary elements
const promptTemplateTextareaArticle = document.querySelector('#article-prompt-template');
const bodyTextTextareaArticle = document.querySelector('#body-text-article-container');
const resultTextareaArticle = document.querySelector('#result-create-article');
const submitButtonArticle = document.getElementById('send-create-article');

// Set the default text for the Prompt Template block
const defaultPromptTemplate = promptTemplateManager.buildKanojo('himitsuAssistant');
promptTemplateTextareaArticle.value = defaultPromptTemplate.replace('### Instruction:\n', '### Instruction:\n{body_text}');

// Function to send the request to the server
async function sendRequestArticle() {
    const bodyText = bodyTextTextareaArticle.value;
    const promptTemplate = promptTemplateTextareaArticle.value.replace('{body_text}', bodyText);

    // Clear the result textarea before starting
    resultTextareaArticle.value = '';

    messageManagerInstance.sendMessage(promptTemplate, null, imageData = '', url = '/message', naked = false, stream = true, outputElement = resultTextareaArticle);
}

// Add an event listener to the submit button
submitButtonArticle.addEventListener('click', sendRequestArticle);

// Get the necessary elements for the Presentation tab
const presentationPromptTemplateTextarea = document.getElementById('presentation-prompt-template');
const presentationUserInputTextarea = document.getElementById('presentation-user-input');
const presentationOutputTextarea = document.getElementById('presentation-output-text');
const presentationDraftTextarea = document.getElementById('presentation-draft-text');
const generateButton = document.getElementById('send-create-article');
const copyToDraftButton = document.getElementById('copy-to-draft');

// Set the default text for the Presentation Prompt Template block
const defaultPresentationPromptTemplate = promptTemplateManager.buildPrompt('write');
presentationPromptTemplateTextarea.value = defaultPresentationPromptTemplate;

// Function to send the request to the server for the Presentation tab
async function sendPresentationRequest() {
    const userInput = presentationUserInputTextarea.value;
    const promptTemplate = presentationPromptTemplateTextarea.value.replace('{user_input}', userInput);

    // Clear the output textarea before starting
    presentationOutputTextarea.value = '';

    // similar implementation as the previous function
}

// Function to copy the output text to the draft text area
function copyToDraft() {
    presentationDraftTextarea.value = presentationOutputTextarea.value;
}

// Add event listeners to the buttons
generateButton.addEventListener('click', sendPresentationRequest);
copyToDraftButton.addEventListener('click', copyToDraft);

// Function for naked mode
const nakedWorkArea = document.querySelector('#naked-work-area');
const submitButtonNaked = document.getElementById('send-create-naked');

// Function to send the request to the server
async function sendRequestNaked() {
    messageManagerInstance.sendMessage(nakedWorkArea.value, null, imageData = '', url = '/message', naked = false, stream = true, outputElement = nakedWorkArea);
}

// Add an event listener to the submit button
submitButtonNaked.addEventListener('click', sendRequestNaked);