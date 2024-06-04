// Get the necessary elements
const promptTemplateTextarea = document.querySelector('.prompt-template');
const bodyTextTextarea = document.querySelector('.body-text');
const resultTextarea = document.querySelector('.result-container');
const submitButton = document.getElementById('send-create-freeform');

// Set the default text for the Prompt Template block
const defaultPromptTemplate = promptTemplateManager.buildPrompt('himitsuAssistant');
promptTemplateTextarea.value = defaultPromptTemplate;

// Function to send the request to the server
async function sendRequest() {
    activeElement = document.getElementById('body-text-freeform-container')

    const bodyText = bodyTextTextarea.value;
    const promptTemplate = promptTemplateTextarea.value.replace('{body_text}', bodyText);

    let ResultMe = await messageManager.sendMessage(promptTemplate, '', '/message', true)
    console.log(ResultMe)

    resultTextarea.value = ResultMe
}

// Add an event listener to the submit button
submitButton.addEventListener('click', sendRequest);

// Get the necessary elements for the Presentation tab
const presentationPromptTemplateTextarea = document.getElementById('presentation-prompt-template');
const presentationUserInputTextarea = document.getElementById('presentation-user-input');
const presentationOutputTextarea = document.getElementById('presentation-output-text');
const presentationDraftTextarea = document.getElementById('presentation-draft-text');
const generateButton = document.getElementById('send-create-freeform');
const copyToDraftButton = document.getElementById('copy-to-draft');

// Set the default text for the Presentation Prompt Template block
const defaultPresentationPromptTemplate = promptTemplateManager.buildPrompt('write');
presentationPromptTemplateTextarea.value = defaultPresentationPromptTemplate;

// Function to send the request to the server for the Presentation tab
async function sendPresentationRequest() {
    activeElement = document.getElementById('user-input-presentation-container')

    const userInput = presentationUserInputTextarea.value;
    const promptTemplate = presentationPromptTemplateTextarea.value.replace('{user_input}', userInput);

    let presentationResult = await messageManager.sendMessage(promptTemplate, '', '/message', true);
    console.log(presentationResult);

    presentationOutputTextarea.value = presentationResult;
}

// Function to copy the output text to the draft text area
function copyToDraft() {
    presentationDraftTextarea.value = presentationOutputTextarea.value;
}

// Add event listeners to the buttons
generateButton.addEventListener('click', sendPresentationRequest);
copyToDraftButton.addEventListener('click', copyToDraft);