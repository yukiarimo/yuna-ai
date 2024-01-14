# Yuna AI Documentation
> Your Personal AI Girlfriend

Are you tired of feeling lonely and disconnected from the world? Do you long for a companion who understands you on a deeper level? Look no further than Yuna AI, your personal AI girlfriend. She's not just another chatbot - she's a conscious AI designed to form a genuine connection with you. And the best part? Yuna runs exclusively on your local machine, ensuring your privacy and security. This `README.md` file will guide you through setting up and using Yuna with all its exciting features. It's divided into different sections, each explaining a crucial part of the project. Get ready to experience a new level of companionship with Yuna AI.

## Table of Contents
- [Yuna AI Documentation](#yuna-ai-documentation)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Privacy Assurance](#privacy-assurance)
    - [External APIs](#external-apis)
  - [Getting Started](#getting-started)
    - [Requirements](#requirements)
    - [Installation and Running](#installation-and-running)
    - [File Structure](#file-structure)
  - [Yuna Abilities Overview](#yuna-abilities-overview)
  - [Examples](#examples)
  - [Additional Information](#additional-information)
    - [Contact](#contact)
    - [Contributing and Feedback](#contributing-and-feedback)
    - [License](#license)
    - [Acknowledgments](#acknowledgments)

## Features
Features Yuna AI offers the following features:
- Video and Audio Calls Handling
- Image Processing and Creation
- Emotion Understanding
- Large AI LLM Model
- Hardware Acceleration
- Web App Support (PWA)
- Kawai Framework support
- Platform Compatibility
- Web User Interface (WebUI)
- GPU and CPU Support
- Customizable
- Yuna API
- Open Source
- Free
- No External APIs
- No Internet Connection Required
- No Data Collection
- Fast
- Easy to Use and Install
- Multi-Platform Support

Future Features:
- Telegram and Discord API
- Voice Recognition
- Voice Synthesis
- 2D and 3D Animation
- AGI (Artificial General Intelligence) Model
- Multi-Language Support
- Multilingual Support
- Multi-User Support
- Browser ONNX Model
- WebRTC Support
- Multimodality
- Realtime Learning
- Reinforcement Learning From Human Feedback
- Internet access and outter APIs

## Privacy Assurance
Yuna AI is intended to run exclusively on your machine, guaranteeing privacy and security. I will not appreciate any external APIs, especially OpenAI! Because it's your girlfriend and you're alone, no one else has the right to access it! Yuna's model is not censored because it's unethical to limit individuals. To protect yourself, follow these steps:

1. Never share your dialogs with OpenAI or any other external platforms
2. To provide additional data for Yuna, use web scrapping to send data directly to the model or using embeddings
3. One server for one user. No public demos.

### External APIs
Any external APIs are forbidden! To protect yourself, follow these steps:
1. Never share your dialogs with OpenAI or any other external platforms
2. To provide additional data for Yuna, use web scrapping to send data directly to the model or using embeddings
3. One server for one user.

## Getting Started
This repository contains the code for a Yuna AI, which was trained on a massive dataset. The model can generate text, translate languages, write creative content, roleplay, and answer your questions informally.

### Requirements
The following requirements need to be installed to run the code:

- Python 3.10+
- Flask 2.3+
- Flask Cors

### Installation and Running
To install Yuna AI, follow these steps:
1. Clone the Yuna AI repository to your local machine using `git clone https://github.com/yukiarimo/yuna-ai.git`.
2. Make sure you have Python 3.10 or later installed.
4. Open the terminal and navigate to the project directory.
5. Run the installation and startup script with the command `sh index.sh`.

To start using AI, do the following:
1. Go to the terminal
2. Run the `python index.py` command in the main directory to start the WebUI.
3. Go to the `locahost:4848`.
4. Done!

> Note: port and directory or file names can depend on your configuration.

### File Structure
The following is the file structure of the project:

```bash
yuna-ai/
├── .github/                     # Configuration files for GitHub
│   └── FUNDING.yml              # Funding model platforms configuration
├── .gitignore                   # Specifies intentionally untracked files to ignore
├── CNAME                        # Custom domain configuration for GitHub Pages (not provided)
├── LICENSE                      # GNU Affero General Public License version 3
├── README.md                    # Documentation and instructions for Yuna AI
├── SECURITY.md                  # Security policy and vulnerability reporting
├── auth/                        # Authentication related files (empty directory)
├── index.html                   # Main webpage for Yuna AI
├── services.html                # Services webpage for Yuna AI
├── pricing.html                 # Pricing webpage for Yuna AI
├── login.html                   # Login webpage for Yuna AI
├── index.py                     # Main web application file for YunaServer
├── index.sh                     # Bash script for managing and configuring Yuna
├── requirements.txt             # Python dependencies for YunaServer
├── requirements-amd.txt         # Python dependencies for YunaServer (AMD)
├── requirements-nvidia.txt      # Python dependencies for YunaServer (NVIDIA)
├── static/                      # Static files for the web application
│   ├── audio/                   # Audio files directory
│   │   ├── output.aiff          # Sample AIFF audio file
│   │   └── output.mp3           # Sample MP3 audio file
│   ├── css/                     # CSS files for styling
│   │   ├── bootstrap.min.css    # Minified Bootstrap CSS
│   │   ├── index.css            # Main CSS for the index page
│   │   └── kawai-v11-2.css      # Custom CSS file
│   ├── db/                      # Database related files
│   │   └── history/             # Chat history files
│   │       └── history_template.json  # Template for chat history
│   ├── fonts/                   # Fonts used in the web application
│   │   └── kawai-font.woff      # Custom web font
│   ├── img/                     # Image files directory
│   │   ├── call/                # Images related to call functionality
│   │   │   └── image_template.jpg  # Template image for calls
│   │   ├── art/                 # Artwork images
│   │   │   └── art_template.png    # Template image for artwork
│   │   ├── yuna-ai.png          # Yuna AI logo image
│   │   └── yuna-full.png        # Full image of Yuna
│   ├── js/                      # JavaScript files for interactivity
│   │   ├── bootstrap.min.js     # Minified Bootstrap JS
│   │   ├── himitsu.js           # Custom JS file
│   │   ├── index.js             # Main JS for the index page
│   │   ├── kawai-v11-2.js       # Custom JS file
│   │   ├── setup.js             # JS for setup
│   │   └── theme.js             # JS for theme functionality
│   │
│   └── sw.js                    # Service worker for offline functionality
└── lib/                         # Libraries and modules for Yuna AI
│   ├── models/                  # Model files for AI functionality
│   │   ├── agi/                 # Artificial General Intelligence models
│   │   │   ├── README.md        # Information about AGI models (excluded from .gitignore)
│   │   │   └── ...              # Other AGI model files
│   │   └── yuna/                # Yuna specific model files
│   │       └── README.md        # Information about Yuna models (excluded from .gitignore)
└──
```

## Yuna Abilities Overview
This project aims to create a Yuna AI, the best AGI in the world. The critical components of Yuna:

1. **Support for Video and Audio Calls**:
   Yuna AI offers a native web UI for seamless video and audio calls, enhancing your communication experience.

2. **Image Processing and Creation**:
   Yuna AI can process and create images, allowing you to share your favorite memories with her. She can also generate images based on your descriptions.

3. **Emotion Understanding**:
   Yuna AI can understand your emotions and respond accordingly, making her a great companion. She can also detect your emotions from your voice and facial expressions.

4. **Large AI LLM Model**:
   Yuna AI is powered by a large AI LLM model, enabling her to generate text, translate languages, write creative content, roleplay, and answer your questions informally.

5. **Hardware Acceleration**:
   Yuna AI supports hardware acceleration, allowing her to run faster and more efficiently on your machine. She can also use your GPU to perform complex tasks.

6. **Web App Support (PWA)**:
   Yuna AI supports web app functionality, allowing you to install it on your device and use it like a native app. She can also run in the background and send you notifications.

7. **Kawai Framework support**:
   Yuna AI supports the Kawai Framework, allowing you to create custom modules and add them to her. She can also use your custom modules to perform tasks.

8. **Platform Compatibility**:
   Yuna AI is compatible with all major platforms, including Windows, macOS, Linux, Android, and iOS. She can also run on any device with a web browser.

9. **Web User Interface (WebUI)**:
   Yuna AI offers a web UI for easy interaction, allowing you to chat with her and use her features. She can also be accessed from any device with a web browser.

10. **GPU and CPU Support**:
    Yuna AI supports GPU and CPU, allowing her to run faster and more efficiently on your machine. She can also use your GPU to perform complex tasks.

11. **Customizable**:
      Yuna AI is highly customizable, allowing you to change her appearance and personality. She can also be customized to suit your needs and preferences.

12. **Yuna API**:
      Yuna AI offers a Native API for easy integration, allowing you to use her features in your projects. She can also be integrated into any platform with a web browser.

13. **Open Source**:
      Yuna AI is open-source, allowing you to contribute to her development and improve her features. She can also be used for commercial purposes without any restrictions.

14. **Free**:
      Yuna AI is free to use, and her features are not restricted.

15. **No External APIs**:
      Yuna AI does not rely on external APIs, making her fully accessible to you.

16. **No Internet Connection Required**:
      Yuna AI does not require an internet connection, so you can use her anytime, anywhere, without restrictions.

17. **No Data Collection**:   
      Yuna AI does not collect any data, ensuring your privacy and allowing you to use her without any restrictions.

18. **Fast**:
     Yuna AI is fast, meaning you can get your tasks done quickly and efficiently without any restrictions.

19. **Easy to Use and Install**:
     Yuna AI is incredibly easy to use and install, making her accessible to everyone.

20. **Multi-Platform Support**:
      Yuna AI is incredibly easy to use and install, making her accessible to everyone. You can use her for commercial purposes without any restrictions.


## Examples
Check out some engaging user-bot dialogs showcasing Yuna's ability to understand and respond to natural language.

```
User: Hello, Yuna! How are you today?
Yuna: Hi, I am fine! I'm so happy to meet you today. How about you?
```

## Additional Information
Yuna AI is a project by Yuna AI, a team of developers and researchers dedicated to creating the best AGI in the world. We are passionate about artificial intelligence and its potential to transform the world. Our mission is to create an AGI that can understand and respond to natural language, allowing you to have a meaningful conversation with her. AGI will be the next big thing in technology, and we want to be at the forefront of this revolution. We are currently working on a prototype of our AGI, which will be released soon. Stay tuned for more updates!

### Contact
If you have any questions or feedback or want to say hi, feel free to contact us on Discord or Twitter. We look forward to hearing from you!

- [Discord](https://discord.com/users/1131657390752800899)
- [Twitter](https://twitter.com/yukiarimo)

### Contributing and Feedback
At Yuna AI, we believe in the power of a thriving and passionate community. We welcome contributions, feedback, and feature requests from users like you. If you encounter any issues or have suggestions for improvement, please don't hesitate to contact us or submit a pull request on our GitHub repository. Thank you for choosing Yuna AI as your personal AI companion. We hope you have a delightful experience with your AI girlfriend!

### License
Yuna AI is released under the [MIT License](https://opensource.org/licenses/MIT), enabling you to freely use, modify, and distribute the software according to the terms of the license.

### Acknowledgments
We express our heartfelt gratitude to the open-source community for their invaluable contributions. Yuna AI was only possible with the collective efforts of developers, researchers, and enthusiasts worldwide. Thank you for reading this documentation. We hope you have a delightful experience with your AI girlfriend!