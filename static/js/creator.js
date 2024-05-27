// Get the necessary elements
const promptTemplateTextarea = document.querySelector('.prompt-template');
const bodyTextTextarea = document.querySelector('.body-text');
const resultTextarea = document.querySelector('.result-container');
const submitButton = document.getElementById('send-create-freeform');

// Set the default text for the Prompt Template block
const defaultPromptTemplate = `### System:
You're a helpful AI assistant

### Input:
{body_text}

### Output:`;
promptTemplateTextarea.value = defaultPromptTemplate;

// Function to send the request to the server
async function sendRequest() {
    const bodyText = bodyTextTextarea.value;
    const promptTemplate = promptTemplateTextarea.value.replace('{body_text}', bodyText);

    let ResultMe = await messageManager.sendMessage(promptTemplate, '', '/message', true)
    console.log(ResultMe)

    resultTextarea.value = ResultMe
}

// Add an event listener to the submit button
submitButton.addEventListener('click', sendRequest);