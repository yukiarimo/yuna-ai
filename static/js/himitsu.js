var name1;
var name2;

async function loadConfig() {
  const response = await fetch('../../config.json');
  const data = await response.json();
  name1 = data.ai.names[0];
  name2 = data.ai.names[1];
}


class PromptTemplate {
  constructor(fields, templateInputs) {
    this.fields = fields;
    this.templateInputs = templateInputs;
  }

  generateElements() {
    const form = document.getElementById("Himitsu");
    form.innerHTML = '';

    this.templateInputs.forEach(input => {
      const label = document.createElement("label");
      label.setAttribute("for", input.id);
      label.textContent = `${input.label}:`;

      const newElement = document.createElement(input.type === 'select' ? "select" : "input");
      newElement.setAttribute("id", input.id);
      newElement.setAttribute("name", input.id);

      if (input.type === 'select') {
        input.options.forEach(option => {
          const optionElement = document.createElement("option");
          optionElement.value = option.toLowerCase().replace(/\s+/g, '_');
          optionElement.textContent = option;
          newElement.appendChild(optionElement);
        });
      } else if (input.type === 'text') {
        newElement.setAttribute("type", "text");
        newElement.setAttribute("placeholder", input.placeholder || '');
      }

      form.appendChild(label);
      form.appendChild(newElement);
    });
  }
}

const commonOptions = [
  { id: 'audience', options: ['General', 'Knowledgeable', 'Expert', 'Other'] },
  { id: 'intent', options: ['Inform', 'Describe', 'Convince', 'Tell A Story', 'Other'] },
  { id: 'formality', options: ['Informal', 'Neutral', 'Formal', 'Other'] },
  { id: 'tone', options: ['Neutral', 'Friendly', 'Confident', 'Urgent', 'Joyful', 'Analytical', 'Optimistic', 'Other'] },
  { id: 'type', options: ['Blog Post', 'Email', 'Essay', 'Article', 'Description', 'Social Media Post', 'Document', 'Tutorial', 'Review', 'Creative Writing', 'Presentation', 'Speech', 'Research', 'Other'] }
];

const textInput = [{ id: 'text', label: 'Text', type: 'input' }];

const writer = new PromptTemplate([...commonOptions, { id: 'domain', options: ['Academic', 'Business', 'General', 'Email', 'Casual', 'Creative', 'Other'] }], textInput);
const paraphrase = new PromptTemplate(commonOptions, textInput);
const decisionMaking = new PromptTemplate([{ id: 'Mood', options: ['Good', 'Bad', 'Neutral'] }], textInput);
const himitsu = new PromptTemplate([{ id: 'question_type', options: ['Curiosity', 'Confusion', 'Research', 'Other'] }], [{ id: 'text', label: 'Text', type: 'text' }]);
const dialog = new PromptTemplate([{ id: 'text', label: 'Question', type: 'input' }], textInput);
const search = new PromptTemplate([{ id: 'text', label: 'Question', type: 'input' }], textInput);

let currentPrompt = 'dialog';
let currentPromptName = 'dialog';

function changeTemplate() {
  const templateSelect = document.getElementById("templateSelect");
  const selectedTemplate = templateSelect.options[templateSelect.selectedIndex].value;

  // Generate select elements based on the selected template
  const templateMap = {
    'writer': {
      prompt: writer,
      name: 'writer'
    },
    'paraphrase': {
      prompt: paraphrase,
      name: 'paraphrase'
    },
    'decisionMaking': {
      prompt: decisionMaking,
      name: 'decisionMaking'
    },
    'himitsu': {
      prompt: himitsu,
      name: 'himitsu'
    },
    "search": {
      prompt: search,
      name: 'search'
    }
  };

  if (templateMap[selectedTemplate] == "dialog") {
    // Generate select elements based on the selected template
  } else if (templateMap[selectedTemplate]) {
    currentPrompt = templateMap[selectedTemplate].prompt;
    currentPromptName = templateMap[selectedTemplate].name;
  }
}

function generateText() {
  const selectedValues = {};

  if (isHimitsu.toString() == 'true') {
    // Handle template inputs
    himitsuCopilot.templateInputs.forEach((input) => {
      const element = document.getElementById(input.id);
      if (element) {
        selectedValues[input.id] = element.value;
      }
    })

  } else {
    // Handle template inputs
    currentPrompt.templateInputs.forEach((input) => {
      const element = document.getElementById(input.id);
      if (element) {
        selectedValues[input.id] = element.value;
      }
    })
  }

  const generatedText = Object.entries(selectedValues)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join('\n');

  console.log(generatedText);

  // Send generatedText to the server
  sendGeneratedTextToServer(generatedText);
}

async function sendGeneratedTextToServer(generatedText) {
  const templateSelect = document.getElementById("templateSelect");
  const selectedTemplate = templateSelect.value;

  removeHimitsu(generatedText);

  const sendRequest = async (text, template) => {
    const response = await fetch(`${server_url + server_port}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat: selectedFilename,
        text: text,
        template: template,
      }),
    });

    return await response.json();
  };

  try {
    const data = await sendRequest(generatedText, isHimitsu ? "himitsuCopilotGen" : selectedTemplate);

    if (isHimitsu.toString() === 'true') {
      const data2 = await sendRequest(data.response, selectedTemplate);
      messageManager.createMessage(name2, data2.response);
    } else {
      messageManager.createMessage(name2, data.response);
    }

    messageManager.removeBr();
    messageManager.removeTypingBubble();
    loadConfig();
    messageManager.addBr();
    playAudio(audioType = 'message');

    if (isTTS.toString() === 'true') {
      playAudio();
    }
  } catch (error) {
    messageManager.removeTypingBubble();
    loadConfig();
    messageManager.createMessage(name2, error);
    playAudio(audioType = 'error');
  }
}

function removeHimitsu(msg) {
  // Select the form element with the ID 'Himitsu'
  var formElement = document.getElementById('Himitsu');

  // Get the parent 'pre' element of the form
  var preElement = formElement.parentNode;

  // Clear the contents of the 'pre' element
  preElement.innerHTML = '';

  // Set the text content of the 'pre' element to 'Hello World'
  preElement.innerHTML = msg;
}