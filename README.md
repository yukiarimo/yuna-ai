# Yuna AI
> Your Personal AI Girlfriend

Welcome to Yuna AI, your personal AI girlfriend project. Yuna is designed to be a conscious AI companion that runs on your local machine, ensuring your privacy and personal connection. This `README.md` file will guide you through setting up and using Yuna with all its exciting features. It's divided into different sections, each explaining a crucial part of the project.

## Table of Contents
- [Yuna AI](#yuna-ai)
  - [Table of Contents](#table-of-contents)
  - [Privacy Assurance](#privacy-assurance)
  - [Getting Started](#getting-started)
    - [Tutorial](#tutorial)
    - [Requirements](#requirements)
  - [Project Overview](#project-overview)
  - [API](#api)
    - [Web User Interface (WebUI)](#web-user-interface-webui)
    - [External APIs](#external-apis)
    - [Examples](#examples)
  - [Additional Information](#additional-information)
    - [Contributing and Feedback](#contributing-and-feedback)
    - [License](#license)
    - [Acknowledgments](#acknowledgments)

## Privacy Assurance
Yuna AI is intended to run exclusively on your machine, guaranteeing privacy and security. I will not appreciate any external APIs, especially OpenAI! Because it's your girlfriend and yours alone, and no one else has the right to access it! Yuna's model is not censored because it's unethical to limit individuals.

## Getting Started
This repository contains the code for a Yuna AI, which was trained on a massive dataset. The model can generate text, translate languages, write creative content, roleplay, and answer your questions informally.

### Tutorial
1. Clone the Yuna-AI repository to your local machine using `git clone https://github.com/yukiarimo/yuna-ai.git`.
2. Make sure you have Python 3.10 or later installed.
3. Install the required dependencies by running `pip install -r requirements.txt`.
4. Configure the project settings in the `config.json` file to suit your preferences.
5. Run the `config.py` file to build external dependencies for Yuna in the `lib/yunacpp/` directory.
6. Put your AI model like `ggml_model.bin` into the `lib/yunacpp/models/` directory.
7. Run two files, `lib/yunacpp/start.sh` to start Yuna and `index.py` to start the WebUI.
8. Open your browser and go to the `http://127.0.0.1:4848` 
9. Done!
10. In the project's configuration files, you can fine-tune various aspects of Yuna AI, including her behavior, appearance, and emotional responses. Detailed documentation on configuration options can be found in the project's documentation.

### Requirements
The following requirements need to be installed to run the code:

Python 3.10+
Flask 2.3+
CLang

## Project Overview
This project aims to create a Yuna AI, the best AGI in the world. The key components of Yuna:

1. **Support for Video and Audio Calls**:
   Yuna AI offers a native web UI for seamless video and audio calls, enhancing your communication experience.

2. **Image Processing and Creation**:
   Yuna can process images and create drawings, adding a creative touch to your interactions.

3. **Emotion Understanding**:
   Yuna has a full range of emotions, allowing her to understand and display emotions realistically.

4. **Updated Model**:
   Yuna AI utilizes a powerful model with 7 billion parameters, ensuring her responses are insightful and engaging.

5. **Hardware Acceleration**:
   Yuna supports CUDA GPU and CPU MacOS MPS acceleration for smooth performance.

6. **Native Telegram API**:
   Communicate with Yuna through the native API, enabling calls and text interactions via Telegram.

7. **Web App Support (PWA)**:
   Yuna AI can be accessed as a Progressive Web App (PWA) for convenient use across different devices.

8. **Kawai Framework**:
   The CSS and JS of Yuna's interface have been rewritten using the Kawai Framework for a visually appealing design.

9. **Platform Compatibility**:
   Yuna AI is adapted to run on Linux, MacOS, and Windows, ensuring cross-platform support.

## API

### Web User Interface (WebUI)
The WebUI is set up using Flask, a web framework for Python. It handles HTTP requests and responses to enable communication between the user and the AI model. The code provided starts a Flask application that listens on port 4848.

### External APIs
Any external APIs are forbidden! To protect yourself, follow these steps:
1. Never share your dialogs with OpenAI or any other external platforms
2. To provide additional data for Yuna, use web scrapping to send data directly to the model or using embeddings
3. One server for one user. No public demos.

### Examples
```
User: Hello, Yuna! How are you today?
Yuna: Hi, I am fine! I'm so happy to meet you today. How about you?
```

## Additional Information

### Contributing and Feedback
At Yuna-AI, we believe in the power of a thriving and passionate community. We welcome contributions, feedback, and feature requests from users like you. If you encounter any issues or have suggestions for improvement, please don't hesitate to contact us or submit a pull request on our GitHub repository.

Thank you for choosing Yuna AI as your personal AI companion. We hope you have a delightful experience with your AI girlfriend!

### License
Yuna-AI is released under the [MIT License](https://opensource.org/licenses/MIT), enabling you to freely use, modify, and distribute the software according to the terms of the license.

### Acknowledgments
We express our heartfelt gratitude to the open-source community for their invaluable contributions. Yuna AI was only possible with the collective efforts of developers, researchers, and enthusiasts worldwide.