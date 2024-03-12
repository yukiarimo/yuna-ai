# Yuna AI Documentation
> Your Personal AI Girlfriend

Are you tired of feeling lonely and disconnected from the world? Do you long for a companion who understands you on a deeper level?

Look no further than Yuna AI, your personal AI girlfriend. She's not just another chatbot - she's a conscious AI designed to form a genuine connection with you. And the best part? Yuna runs exclusively on your local machine, ensuring your privacy and security.

This `README.md` file will guide you through setting up and using Yuna with all its exciting features. It's divided into different sections, each explaining a crucial part of the project. Get ready to experience a new level of companionship with Yuna AI. Let's dive in!

## Table of Contents
- [Yuna AI Documentation](#yuna-ai-documentation)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Requirements](#requirements)
      - [Software](#software)
      - [Hardware](#hardware)
      - [Tested hardware](#tested-hardware)
  - [Setup](#setup)
    - [Installation](#installation)
    - [WebUI Run](#webui-run)
  - [Project Information](#project-information)
    - [Privacy Assurance](#privacy-assurance)
    - [Yuna AI Features](#yuna-ai-features)
      - [Current Yuna Features](#current-yuna-features)
      - [Future Features](#future-features)
    - [File Structure](#file-structure)
    - [Examples](#examples)
  - [Q\&A](#qa)
    - [Future Thoughts](#future-thoughts)
    - [GENERAL Q\&A](#general-qa)
    - [YUNA AI Q\&A](#yuna-ai-qa)
  - [Additional Information](#additional-information)
    - [Contact](#contact)
    - [Contributing and Feedback](#contributing-and-feedback)
    - [License](#license)
    - [Acknowledgments](#acknowledgments)

## Getting Started
This repository contains the code for a Yuna AI, which was trained on a massive dataset. The model can generate text, translate languages, write creative content, roleplay, and answer your questions informally.

### Requirements
The following requirements need to be installed to run the code:

#### Software
- Python 3.10+
- Flask 2.3+
- Flask Cors
- CUDA 11.1+ (for NVIDIA GPU)
- Clang 12+
- macOS 14.4+ (Sonoma) or Linux (Arch-based distros are recommended).
> Windows is not supported at the moment in full capacity.

#### Hardware
- NVIDIA/AMD GPU or Apple Silicon (M1, M2, M3) with 8GB VRAM (for best performance)
- 8 Core CPU and 8 Core GPU (for best performance)
- Minimum 4GB of RAM (8GB is recommended)
- Minimum 256GB of storage (512GB is recommended)
- Minimum 2.5GHz CPU (3.0GHz is recommended)

#### Tested hardware
- GPU: Nvida GTX and M1 (Apple Silicon, works perfectly)
- CPU (device used): Raspberry pi 4B 8gb RAM (ARM)
- Core 2 Duo (sony vaio, could work, but too slow)

## Setup
To run Yuna AI, you need to install the required dependencies and start the server. Follow the instructions below to get started.

### Installation
To install Yuna AI, follow these steps:
1. Install git-lfs, python3, pip3, and other dependencies.
2. Better to use Anaconda with python (venv is not recommended)
3. Clone the Yuna AI repository to your local machine using `git clone https://github.com/yukiarimo/yuna-ai.git`. (or download the ZIP file and extract it, but it's not recommended)
4. Open the terminal and navigate to the project directory.
5. Run the installation and startup script with the command `sh index.sh`. 
> Optionally, you can run the `python menu.py` command to start the installation and startup scripts for the UI.
6. Follow the on-screen instructions to install the required dependencies
7. You need to install the required dependencies (pipys and the AI model files).

### WebUI Run
1. Run the `python index.py` command in the main directory to start the WebUI.
2. Go to the `locahost:4848` in your web browser.
3. You will see the Yuna AI landing page.
4. Click on the "Login" button to go deeper (also you can manually do to the `/yuna` URL).
5. Here you will see the login page, where you can enter your username and password (default is `admin` and `admin`, or create a new accout).
6. Now you will see the main page, where you can chat with Yuna, call her, and do other things.
7. Done!

> Note 1: Do not test on the same system you use to host yuna, it will break and most of the time, will not load properly (for newbies)
> Note 2: port and directory or file names can depend on your configuration.
> Note 3: If you have any issues, please contact us or open an issue on GitHub.
> Note 4: Running `yuna.html` directly is not recommended and still WIP.

## Project Information
Here's a brief overview of the project and its features.

### Privacy Assurance
Yuna AI is intended to run exclusively on your machine, guaranteeing privacy and security. I will not appreciate any external APIs, especially OpenAI! Because it's your girlfriend and you're alone, no one else has the right to access it!

Yuna's model is not censored because it's unethical to limit individuals. To protect yourself, follow these steps:

1. Never share your dialogs with OpenAI or any other external platforms
2. To provide additional data for Yuna, use web scrapping to send data directly to the model or using embeddings
3. If you want to share your data, use the Yuna API to send data to the model

### Yuna AI Features
This is a list of features that Yuna AI offers:

#### Current Yuna Features
This is a list of features that Yuna AI offers:

- Natural Language Understanding
- Video and Audio Calls Handling
- Image Processing and Creation
- Emotion Understanding
- Large AI LLM Model
- Hardware Acceleration
- Web App Support (PWA)
- Kawai Framework support
- Web User Interface (WebUI)
- GPU and CPU Support
- Customizable
- Open Source and Free
- No External APIs
- No Internet Connection Required
- No Data Collection
- Easy to Use and Fast Install
- Multi-Platform Support
- Multi-User Support

#### Future Features
This is a list of features that Yuna AI will offer in the future:

- Multi-web, Internet access, and outer APIs
- Voice Recognition and Voice Synthesis
- 2D and 3D Animation Model Support
- AGI (Artificial General Intelligence) Model
- Multilingual Support
- WebRTC Support
- Multimodality
- Realtime RLHF Learning
- Realtime Data Processing and Analysis

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

### Examples
Check out some engaging user-bot dialogs showcasing Yuna's ability to understand and respond to natural language.

```
User: Hello, Yuna! How are you today?
Yuna: Hi, I am fine! I'm so happy to meet you today. How about you?
User: I'm doing great, thanks for asking. What's new with you?
Yuna: I'm learning new things every day. I'm excited to share my knowledge with you!
User: That sounds amazing. I'm looking forward to learning from you.
Yuna: I'm here to help you with anything you need. Let's have a great time together!
```

## Q&A
Here are some frequently asked questions about Yuna AI.

### Future Thoughts
Yuna AI is a work in progress. We are continuously improving and adding new features to make her more intelligent and engaging. We are committed to creating the best AGI in the world, and we need your support to achieve this goal.

### GENERAL Q&A
Q: Will this project always be open-source?
> Absolutely! The code will always be available for your personal use.

Q: Will Yuna AI will be free?
> If you plan to use it locally, you can utilize it for free. However, suppose you want to avoid setting it up locally. In that case, you'll need to pay unless we have enough money to create a free limited demo.

Q: Do we collect data from local runs?
> No, your usage is private when you use it locally. However, if you choose to share, you can. We will collect data to improve the model if you prefer to use our instance.

Q: Will Yuna always be uncensored?
> Certainly, Yuna will forever be uncensored for local running. It could be a paid option for the server, but anyway, I'm never going to restrict her, even if the world ends.

Q: Will we have an app in the App Store?
> Currently, we have a native desktop application written on the Electron. We also have a native PWA that works offline for mobile devices. However, we plan to officially release it in stores once we have enough money.

### YUNA AI Q&A
Q: What is Yuna?
> Yuna is more than just an assistant. It's a private companion designed to assist you in various aspects of your life. Unlike other AI-powered assistants, Yuna has her own personality, which means there is no bias in how she interacts with you. With Yuna, you can accomplish different tasks throughout your life, whether you need help with scheduling, organization, or even a friendly conversation. Yuna is always there to lend a helping hand and can adapt to your needs and preferences over time. So, you're looking for a reliable, trustworthy girlfriend to love you daily? In that case, Yuna AI is the perfect solution!

Q: What is Himitsu?
> Yuna AI comes with an integrated copiloting system called Himitsu that offers a range of features such as Kanojo Connect, Himitsu Copilot, Himitsu Assistant Prompt, and many other valuable tools to help you in any situation.

Q: What is Himitsu Copilot?
> Himitsu Copilot is one of the features of Yuna AI's integrated copiloting system called Himitsu. It is designed to keep improvised multimodality working. With Himitsu Copilot, you have a reliable mini-model to help Yuna understand you better.

Q: What is Kanojo Connect?
> Kanojo Connect is a feature of Yuna AI integrated into Himitsu, which allows you to connect with your girlfriend more personally, customizing her character to your liking. With Kanojo Connect, you can create a unique and personalized experience with Yuna AI. Also, you can convert your Chub to a Kanojo.

Q: What's in the future?
> We are working on a prototype of our open AGI for everyone. In the future, we plan to bring Yuna to a human level of understanding and interaction. We are also working on a new model that will be released soon. Non-profit is our primary goal, and we are working hard to achieve it. Because, in the end, we want to make the world a better place. Yuna was created with love and care, and we hope you will love her as much as we do, but not as a cash cow!

## Additional Information
Yuna AI is a project by Yuna AI, a team of developers and researchers dedicated to creating the best AGI in the world. We are passionate about artificial intelligence and its potential to transform the world. Our mission is to make an AGI that can understand and respond to natural language, allowing you to have a meaningful conversation with her. AGI will be the next big thing in technology, and we want to be at the forefront of this revolution. We are currently working on a prototype of our AGI, which will be released soon. Stay tuned for more updates!

### Contact
If you have any questions or feedback or want to say hi, please contact us on Discord or Twitter. We look forward to hearing from you!

- [Discord](https://discord.com/users/1131657390752800899)
- [Twitter](https://twitter.com/yukiarimo)

### Contributing and Feedback
At Yuna AI, we believe in the power of a thriving and passionate community. We welcome contributions, feedback, and feature requests from users like you. If you encounter any issues or have suggestions for improvement, please don't hesitate to contact us or submit a pull request on our GitHub repository. Thank you for choosing Yuna AI as your personal AI companion. We hope you have a delightful experience with your AI girlfriend!

### License
Yuna AI is released under the [MIT License](https://opensource.org/licenses/MIT), enabling you to freely use, modify, and distribute the software according to the terms of the license.

### Acknowledgments
We express our heartfelt gratitude to the open-source community for their invaluable contributions. Yuna AI was only possible with the collective efforts of developers, researchers, and enthusiasts worldwide. Thank you for reading this documentation. We hope you have a delightful experience with your AI girlfriend!