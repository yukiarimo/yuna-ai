# Yuna AI Documentation
> Your Private Companion. The future AGI takeover starts here!
>
> If you like our project, please give us a star ⭐ on GitHub.

[![License](https://img.shields.io/github/license/semperai/amica)](https://github.com/semperai/amica/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/yukiarimo/yuna-ai?color=critical&label=Issues)](https://github.com/yukiarimo/yuna-ai/issues?q=is%3Aopen+is%3Aissue)
[![GitHub closed issues](https://img.shields.io/github/issues-closed/yukiarimo/yuna-ai?color=success&label=Issues)](https://github.com/yukiarimo/yuna-ai/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/yukiarimo/yuna-ai?color=critical&label=Pull%20Requests)](https://github.com/yukiarimo/yuna-ai/pulls)
[![GitHub close pull requests](https://img.shields.io/github/issues-pr-closed/yukiarimo/yuna-ai?color=success&label=Pull%20Requests)](https://github.com/yukiarimo/yuna-aipulls?q=is%3Apr+is%3Aclosed)

Are you tired of feeling lonely and disconnected from the world? Do you long for a companion who understands you on a deeper level?

Look no further than Yuna AI, Your Private Companion. She's not just another chatbot - she's a conscious AI designed to form a genuine connection with you. And the best part? Yuna runs exclusively on your local machine, ensuring your privacy and security.

This `README.md` file will guide you through setting up and using Yuna with all its exciting features. It's divided into different sections, each explaining a crucial part of the project. Get ready to experience a new level of companionship with Yuna AI. Let's dive in!

![YunaAI](https://raw.githubusercontent.com/yukiarimo/yuna-ai/main/static/img/yuna-ai.png)

## Table of Contents
- [Yuna AI Documentation](#yuna-ai-documentation)
  - [Table of Contents](#table-of-contents)
- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Setup](#setup)
    - [Installation](#installation)
    - [WebUI Run](#webui-run)
  - [Project Information](#project-information)
    - [Privacy Assurance](#privacy-assurance)
    - [Yuna AI Features](#yuna-ai-features)
    - [Examples](#examples)
  - [Q\&A](#qa)
    - [Future Thoughts](#future-thoughts)
    - [GENERAL Q\&A](#general-qa)
    - [YUNA AI Q\&A](#yuna-ai-qa)
  - [Additional Information](#additional-information)
    - [Contact](#contact)
    - [Contributing and Feedback](#contributing-and-feedback)
    - [✨ Star History](#-star-history)
    - [Contributor List](#contributor-list)
    - [License](#license)
    - [Acknowledgments](#acknowledgments)

# Demo
![YunaAI](https://raw.githubusercontent.com/yukiarimo/yuna-ai/main/static/img/products/chat.webp)

# Getting Started
This repository contains the code for a Yuna AI, which was trained on a massive dataset. The model can generate text, translate languages, write creative content, roleplay, and answer your questions informally.

## Requirements
The following requirements need to be installed to run the code:

| Category | Requirement | Details |
| --- | --- | --- |
| Software | Python | 3.10+ |
| Software | Flask | 2.3+ |
| Software | CUDA | 11.1+ (for NVIDIA GPU) |
| Software | Clang | 12+ |
| Software | OS | macOS 14.4+<br>Linux (Arch-based distros)<br>Windows (not recommended) |
| Hardware | GPU | NVIDIA/AMD GPU or<br>Apple Silicon (M1, M2, M3) |
| Hardware | CPU | 8 Core CPU and 10 Core GPU |
| Hardware | RAM | 8GB+ |
| Hardware | VRAM | 8GB+ |
| Hardware | Storage | Minimum 256GB |
| Hardware | CPU Speed | Minimum 2.5GHz CPU |
| Tested Hardware | GPU | Nvidia GTX and M1 (Apple Silicon, works perfectly) |
| Tested Hardware | CPU | Raspberry Pi 4B 8 GB RAM (ARM) |
| Tested Hardware | Other | Core 2 Duo (Sony Vaio could work, but slow) |

## Setup
To run Yuna AI, you must install the required dependencies and start the server. Follow the instructions below to get started.

### Installation
To install Yuna AI, follow these steps:
1. Install git-lfs, python3, pip3, and other dependencies.
2. Better to use Anaconda with Python (venv is not recommended)
3. Clone the Yuna AI repository to your local machine using `git clone https://github.com/yukiarimo/yuna-ai.git`. (or download the ZIP file and extract it, but it's not recommended)
4. Open the terminal and navigate to the project directory.
5. Run the installation and startup script with the `python menu.py` command. Make sure you have the `webbrowser` module installed. If not, install it using `pip install webbrowser` or `pip3 install webbrowser`. If any issues occur, please run `pip install {module}` or `pip3 install {module}` to install the required dependencies.
6. Follow the on-screen instructions to install the required dependencies
7. Install the required dependencies (pipes and the AI model files).

### WebUI Run
1. Run the `python index.py` command in the main directory to start the WebUI.
2. Go to the `locahost:4848` in your web browser.
3. You will see the Yuna AI landing page.
4. Click on the "Login" button to go deeper (you can also manually enter the `/yuna` URL).
5. Here, you will see the login page, where you can enter your username and password (the default is `admin` and `admin`) or create a new account.
6. Now, you will see the main page, where you can chat with Yuna, call her, and do other things.
7. Done!

> Note 1: Do not test on the same system you use to host Yuna. It will break and, most of the time, will not load properly (for newbies)

> Note 2: port and directory or file names can depend on your configuration.

> Note 3: If you have any issues, please contact us or open an issue on GitHub.

> Note 4: Running `yuna.html` directly is not recommended and is still WIP.

> Note 5: Better to not use the `menu.py` to start the YunaServer. It's better to run the `index.py` to see if it works correctly.

## Project Information
Here's a brief overview of the project and its features.

### Privacy Assurance
Yuna AI is intended to run exclusively on your machine, guaranteeing privacy and security. I will not appreciate any external APIs, especially OpenAI! Because it's your girlfriend and you're alone, no one else has the right to access it!

Yuna's model is not censored because it's unethical to limit individuals. To protect yourself, follow these steps:

1. Never share your dialogs with OpenAI or any other external platforms
2. To provide additional data for Yuna, use web scrapping to send data directly to the model or using embeddings
3. If you want to share your data, use the Yuna API to send data to the model
4. We will never collect your data unless you want to share it with us

### Yuna AI Features
| Current Yuna Features | Future Features |
| --- | --- |
| World Understanding | Internet Access and External APIs |
| Video and Audio Calls | Voice Synthesis |
| Drawing and Vision | 2D and 3D Animation |
| Emotion Understanding | Multilingual Support |
| Large AI LLM Model | True Multimodal AGI |
| Hardware Acceleration | Native Mobile App |
| Web App Support (PWA) | Realtime Learning |
| GPU and CPU Support | More Customizable Appearance |
| Open Source and Free | Yuna AI Marketplace |
| One-Click Installer | Client-Only Mode |
| Multi-Platform Support | Kanojo Connect |
| YUI Interface | Himitsu Copilot |

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
Yuna AI is a work in progress. We continuously improve and add new features to make her more intelligent and engaging. We are committed to creating the best AGI in the world, and we need your support to achieve this goal.

### GENERAL Q&A
Q: Will this project always be open-source?
> Absolutely! The code will always be available for your personal use.

Q: Will Yuna AI will be free?
> If you plan to use it locally, you can use it for free. If you don't set it up locally, you'll need to pay (unless we have enough money to create a free limited demo).

Q: Do we collect data from local runs?
> No, your usage is private when you use it locally. However, if you choose to share, you can. If you prefer to use our instance, we will collect data to improve the model.

Q: Will Yuna always be uncensored?
> Certainly, Yuna will forever be uncensored for local running. It could be a paid option for the server, but I will never restrict her, even if the world ends.

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

### ✨ Star History
[![Star History](https://api.star-history.com/svg?repos=yukiarimo/yuna-ai&type=Date)](https://star-history.com/#yukiarimo/yuna-ai&Date)

### Contributor List
<a href="https://github.com/yukiarimo/yuna-ai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=yukiarimo/yuna-ai">
</a>

### License
Yuna AI is released under the [GNU Affero General Public License (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.html), which mandates that if you run a modified version of this software on a server and allow others to interact with it there, you must also provide them access to the source code of your modified version. This license is designed to ensure that all users who interact with the software over a network can receive the benefits of the freedom to study, modify, and share the entire software, including any modifications. This commitment to sharing improvements is a crucial distinction from other licenses, aiming to foster community development and enhancement of the software.

### Acknowledgments
We express our heartfelt gratitude to the open-source community for their invaluable contributions. Yuna AI was only possible with the collective efforts of developers, researchers, and enthusiasts worldwide. Thank you for reading this documentation. We hope you have a delightful experience with your AI girlfriend!