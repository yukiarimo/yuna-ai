// Class constructor for different prompts
class PromptTemplate {
  constructor(fields, templateInputs) {
    this.fields = fields;
    this.templateInputs = templateInputs;
  }

  generateSelectElements() {
    const form = document.getElementById("Himitsu");
    form.innerHTML = '';

    this.fields.forEach(field => {
      const label = document.createElement("label");
      label.setAttribute("for", field.id);
      label.textContent = `${field.id.charAt(0).toUpperCase() + field.id.slice(1)}:`;

      const select = document.createElement("select");
      select.setAttribute("id", field.id);
      select.setAttribute("name", field.id);

      field.options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.toLowerCase().replace(/\s+/g, '_');
        optionElement.textContent = option;
        select.appendChild(optionElement);
      });

      form.appendChild(label);
      form.appendChild(select);
    });
  }

  generateTemplateInputs() {
    const form = document.getElementById("Himitsu");

    this.templateInputs.forEach(input => {
      const label = document.createElement("label");
      label.setAttribute("for", input.id);
      label.textContent = `${input.label}:`;

      const newElement = input.type === 'select' ? document.createElement("select") : document.createElement("input");
      newElement.setAttribute("id", input.id);
      newElement.setAttribute("name", input.id);

      if (input.type === 'select') {
        input.options.forEach(option => {
          const optionElement = document.createElement("option");
          optionElement.value = option.toLowerCase().replace(/\s+/g, '_');
          optionElement.textContent = option;
          newElement.appendChild(optionElement);
        });
      }

      form.appendChild(label);
      form.appendChild(newElement);
    });
  }
}

// Example of different prompts
const writer = new PromptTemplate(
  [{
      id: 'audience',
      options: ['General', 'Knowledgeable', 'Expert', 'Other']
    },
    {
      id: 'intent',
      options: ['Inform', 'Describe', 'Convince', 'Tell A Story', 'Other']
    },
    {
      id: 'formality',
      options: ['Informal', 'Neutral', 'Formal', 'Other']
    },
    {
      id: 'domain',
      options: ['Academic', 'Business', 'General', 'Email', 'Casual', 'Creative', 'Other']
    },
    {
      id: 'tone',
      options: ['Neutral', 'Friendly', 'Confident', 'Urgent', 'Joyful', 'Analytical', 'Optimistic', 'Other']
    },
    {
      id: 'type',
      options: ['Blog Post', 'Email', 'Essay', 'Article', 'Description', 'Social Media Post', 'Document', 'Tutorial', 'Review', 'Creative Writing', 'Presentation', 'Speech', 'Research', 'Other']
    }
  ],
  [{
    id: 'text',
    label: 'Text',
    type: 'input'
  }]
);

const paraphrase = new PromptTemplate(
  [{
      id: 'audience',
      options: ['General', 'Knowledgeable', 'Expert', 'Other']
    },
    {
      id: 'intent',
      options: ['Inform', 'Describe', 'Convince', 'Tell A Story', 'Other']
    },
    {
      id: 'formality',
      options: ['Informal', 'Neutral', 'Formal', 'Other']
    },
    {
      id: 'domain',
      options: ['Academic', 'Business', 'General', 'Email', 'Casual', 'Creative', 'Other']
    },
    {
      id: 'tone',
      options: ['Neutral', 'Friendly', 'Confident', 'Urgent', 'Joyful', 'Analytical', 'Optimistic', 'Other']
    },
    {
      id: 'type',
      options: ['Blog Post', 'Email', 'Essay', 'Article', 'Description', 'Social Media Post', 'Document', 'Tutorial', 'Review', 'Creative Writing', 'Presentation', 'Speech', 'Research', 'Other']
    }
  ],
  [{
    id: 'text',
    label: 'Text',
    type: 'input'
  }]
);

const decisionMaking = new PromptTemplate(
  [{
      id: 'environment',
      options: ['Option 1', 'Option 2', 'Option 3', 'Other']
    },
    {
      id: 'constraints',
      options: ['Constraint 1', 'Constraint 2', 'Other']
    },
    {
      id: 'focus',
      options: ['Main Objective 1', 'Main Objective 2', 'Other']
    },
    {
      id: 'actions',
      options: ['Action 1', 'Action 2', 'Action 3', 'Other']
    }
  ],
  [{
      id: 'location',
      label: 'Location',
      type: 'input'
    },
    {
      id: 'time',
      label: 'Time',
      type: 'input'
    },
    {
      id: 'context',
      label: 'Context',
      type: 'input'
    },
    {
      id: 'constraint1',
      label: 'Constraint 1',
      type: 'input'
    },
    {
      id: 'constraint2',
      label: 'Constraint 2',
      type: 'input'
    },
    {
      id: 'mainObjective',
      label: 'Main Objective',
      type: 'input'
    },
    {
      id: 'action1',
      label: 'Action 1',
      type: 'input'
    },
    {
      id: 'action2',
      label: 'Action 2',
      type: 'input'
    },
    {
      id: 'action3',
      label: 'Action 3',
      type: 'input'
    }
  ]
);

const dialog = new PromptTemplate([{
    id: 'text',
    label: 'Question',
    type: 'input'
  },
  {
    id: 'clarification',
    label: 'Clarification',
    type: 'input'
  }
])

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
    'decisionMaking': {
      prompt: decisionMaking,
      name: 'decisionMaking'
    },
    'paraphrase': {
      prompt: paraphrase,
      name: 'paraphrase'
    },
    'himitsu': {
      prompt: himitsu,
      name: 'himitsu'
    },
    "dialog": {
      prompt: dialog,
      name: 'dialog'
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

  // Handle select fields
  currentPrompt.fields.forEach((field) => {
    selectedValues[field.id] = document.getElementById(field.id).value;
  });

  // Handle template inputs
  currentPrompt.templateInputs.forEach((input) => {
    selectedValues[input.id] = document.getElementById(input.id).value;
  });

  const generatedText = Object.entries(selectedValues)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join('\n');

  console.log(generatedText);

  // Send generatedText to the server
  sendGeneratedTextToServer(generatedText);
}

function sendGeneratedTextToServer(generatedText) {
  const templateSelect = document.getElementById("templateSelect");
  const selectedTemplate = templateSelect.value;

  // Send a POST request to /message endpoint
  fetch(`${server_url + server_port}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: selectedFilename,
        text: generatedText,
        template: currentPromptName,
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      console.log(data);

      messageManager.removeBr();
      messageManager.removeTypingBubble();

      const messageData = {
        name: 'Yuna',
        message: data.response,
      };

      messageManager.createMessage(messageData.name, messageData.message);
      messageManager.addBr();

      playAudio(audioType = 'message');

      if (isTTS.toString() == 'true') {
        playAudio();
      }
    })
    .catch((error) => {
      messageManager.removeTypingBubble();

      const messageData = {
        name: 'Yuna',
        message: error,
      };

      messageManager.createMessage(messageData.name, messageData.message);
      playAudio(audioType = 'error');
    });
}