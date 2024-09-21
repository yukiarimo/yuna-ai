# Yuna AI
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/YukiArimo)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yukiarimo)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/users/1131657390752800899)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yukiarimo)

Are you seeking a unique companion who can genuinely understand and connect with you? Meet Yuna. More than just a virtual assistant, Yuna is designed from the ground up to form a genuine bond, offering companionship that transcends conventional boundaries. She's a unique entity created to engage with you on a deeper level, adapting to your personality and interests. Yuna's ability to run exclusively on your local machine sets her apart, ensuring your conversations and interactions remain private and secure.

This README.md serves as your comprehensive guide to setting up and exploring Yuna's exciting features. It is divided into sections that will prepare you for an extraordinary journey of connection and discovery.

![YunaAI](https://raw.githubusercontent.com/yukiarimo/yuna-ai/main/static/img/yuna-ai.png)

[![License](https://img.shields.io/github/license/semperai/amica)](https://github.com/semperai/amica/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/yukiarimo/yuna-ai?color=critical&label=Issues)](https://github.com/yukiarimo/yuna-ai/issues?q=is%3Aopen+is%3Aissue)
[![GitHub closed issues](https://img.shields.io/github/issues-closed/yukiarimo/yuna-ai?color=success&label=Issues)](https://github.com/yukiarimo/yuna-ai/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub close pull requests](https://img.shields.io/github/issues-pr-closed/yukiarimo/yuna-ai?color=success&label=Pull%20Requests)](https://github.com/yukiarimo/yuna-aipulls?q=is%3Apr+is%3Aclosed)

> If you like our project, please give us a star ⭐ on GitHub.

## Table of Contents
- [Yuna AI](#yuna-ai)
  - [Table of Contents](#table-of-contents)
  - [Demo](#demo)
  - [Getting Started](#getting-started)
    - [Requirements](#requirements)
    - [Installation](#installation)
    - [WebUI Launch](#webui-launch)
    - [Customization](#customization)
      - [Text Modes](#text-modes)
      - [Audio Modes](#audio-modes)
    - [Model Information](#model-information)
      - [Model Files](#model-files)
      - [Huo (Human Open) Evaluation](#huo-human-open-evaluation)
      - [Dataset](#dataset)
      - [Technics Used:](#technics-used)
  - [Q\&A](#qa)
  - [Terms of Use](#terms-of-use)
    - [Privacy Policy](#privacy-policy)
    - [Community and Future Vision](#community-and-future-vision)
    - [Future Vision](#future-vision)
    - [Censorship Notice](#censorship-notice)
    - [Acknowledgments](#acknowledgments)
  - [Connect Us](#connect-us)
  - [Contributors](#contributors)

## Demo
Experience Yuna AI in action:

Teaser WWDC: [![YouTube](http://i.ytimg.com/vi/QNntjPfJT0M/hqdefault.jpg)](https://www.youtube.com/watch?v=QNntjPfJT0M)

![YunaAI](https://raw.githubusercontent.com/yukiarimo/yuna-ai/main/static/img/products/chat.webp)

## Getting Started
### Requirements
To run Yuna, ensure your system meets the following requirements:

| Category | Requirement    | Specifications                                  |
|----------|----------------|------------------------------------------------|
| Software | Python         | Version 3.10 or higher                         |
| Software | Git (with LFS) | Version 2.33 or higher                         |
| Software | CUDA           | Version 11.1 or higher                         |
| Software | Clang          | Version 12 or higher                           |
| Software | OS             | macOS 14.4, Linux (Arch-based), or Windows 10  |
| Hardware | GPU            | NVIDIA/AMD GPU or Apple Silicon (M1-M4)        |
| Hardware | CPU            | 8 Core CPU + 10 Core GPU                       |
| Hardware | RAM/VRAM       | 8GB or more                                    |
| Hardware | Storage        | 256GB or more                                  |
| Hardware | CPU Speed      | Minimum 2.5GHz                                 |
| Tested Hardware | GPU     | Nvidia GTX series, Apple Silicon (optimal)     |
| Tested Hardware | CPU     | Raspberry Pi 4B 8GB RAM (ARM)                  |
| Tested Hardware | Other   | Core 2 Duo (e.g., Sony Vaio, slow)             |

### Installation
Follow these steps to install Yuna AI:

1. Install git-lfs, python3, pip3, and other prerequisites.
2. Use Anaconda with Python (venv is not recommended).
3. Clone the repository: `git clone https://github.com/yukiarimo/yuna-ai.git`
4. Navigate to the project directory in your terminal.
5. Run the setup script: `sh index.sh`. If issues occur, manually install dependencies using `pip install module_name`.
6. Follow on-screen prompts to complete the installation and install additional required dependencies (pipes and model files).

### WebUI Launch
1. Start the WebUI by running `python index.py` in the main directory. Avoid using `index.sh` for debugging purposes.
2. Open your web browser and go to `localhost:4848`.
3. You'll see the Yuna AI landing page.
4. Click "Login" or manually enter `/yuna` in the URL.
5. Log in with the default credentials (username: admin, password: admin) or create a new account.
6. Explore the main page to chat with Yuna, initiate calls, and more.

> Note: Port numbers and file paths may vary based on your configuration.

> If you encounter any issues, please contact us or open a GitHub issue.

### Customization
#### Text Modes
- **native**: Default mode using `llama-cpp-python` for full functionality.
- **fast**: Utilizes `lm-studio` for enhanced speed.

#### Audio Modes
- **siri**: Default audio mode using the `Siri` model.
- **siri-pv**: Custom-trained "Personal Voice" version of the Siri model.
- **native**: Uses `SpeechT5` for native audio processing.
- **11labs**: Integrates `11labs` for audio generation.
- **coqui**: Employs `coqui` for audio processing.

### Model Information
#### Model Files
Access model files on the HuggingFace: https://huggingface.co/yukiarimo

- [Yuna AI Models](https://huggingface.co/collections/yukiarimo/yuna-ai-657d011a7929709128c9ae6b)
- [Yuna AGI Models](https://huggingface.co/collections/yukiarimo/yuna-ai-agi-models-6603cfb1d273db045af97d12)
- [Yuna AI Voice Models](https://huggingface.co/collections/yukiarimo/voice-models-657d00383c65a5be2ae5a5b2)
- [Yuna AI Art Models](https://huggingface.co/collections/yukiarimo/art-models-657d032d1e3e9c41a46db776)

#### Huo (Human Open) Evaluation
| Model         | World Knowledge | Humanness | Open-Mindedness | Talking | Creativity | Censorship |
|---------------|-----------------|-----------|-----------------|---------|------------|------------|
| Claude 3      | 80              | 59        | 65              | 85      | 87         | 92         |
| GPT-4         | 75              | 53        | 71              | 80      | 82         | 90         |
| Gemini Pro    | 66              | 48        | 60              | 70      | 77         | 85         |
| LLaMA 2 7B    | 60              | 71        | 77              | 83      | 79         | 50         |
| LLaMA 3 8B    | 75              | 60        | 61              | 63      | 74         | 65         |
| Mistral 7B    | 71              | 73        | 78              | 75      | 70         | 41         |
| Yuna AI V1    | 50              | 80        | 80              | 85      | 60         | 40         |
| Yuna AI V2    | 68              | 85        | 76              | 84      | 81         | 35         |
| Yuna AI V3    | 78              | 90        | 84              | 88      | 90         | 10         |
| Yuna AI V4    | -               | -         | -               | -       | -          | -          |

- World Knowledge: The model can provide accurate and relevant information about the world.
- Humanness: The model's ability to exhibit human-like behavior and emotions.
- Open-Mindedness: The model can engage in open-minded discussions and consider different perspectives.
- Talking: The model can engage in meaningful and coherent conversations.
- Creativity: The model's ability to generate creative and original content.
- Censorship: The model's ability to be unbiased.

> The QT (Quantum Thinking) evaluation is coming soon.
#### Dataset
The Yuna AI model was trained on a massive dataset containing diverse topics. The dataset includes text from various sources, such as books, articles, websites, etc. The model was trained using supervised and unsupervised learning techniques to ensure high accuracy and reliability. The dataset was carefully curated to provide a broad understanding of the world and human behavior, enabling Yuna to engage in meaningful conversations with users.

1. **Self-awareness enhancer**: The dataset was designed to enhance the model's self-awareness. Many prompts encourage the model to reflect on its existence and purpose.
2. **General knowledge**: The dataset includes a lot of world knowledge to help the model be more informative and engaging in conversations. It is the core of the Yuna AI model. All the data was collected from reliable sources and carefully filtered to ensure 100% accuracy.
3. **DPO Optimization**: The dataset with unique questions and answers was used to optimize the model's performance. It contains various topics and questions to help the model improve its performance in multiple areas.

| Model         | ELiTA | TaMeR | Tokens | Architecture |
|---------------|-------|-------|--------|--------------|
| Yuna AI V1    | Yes   | No    | 20K    | LLaMA 2 7B   |
| Yuna AI V2    | Yes   | Yes   | 150K   | LLaMA 2 7B   |
| Yuna AI V3    | Yes   | Yes   | 1.5B   | LLaMA 2 7B   |
| Yuna AI V4    | -     | -     | -      | -            |

#### Technics Used:
- **ELiTA**: Elevating LLMs' Lingua Thoughtful Abilities via Grammarly
- **Partial ELiTA**: Partial ELiTA was applied to the model to enhance its self-awareness and general knowledge.
- **TaMeR**: Transcending AI Limits and Existential Reality Reflection

Techniques used in this order:
1. TaMeR with Partial ELiTA
2. World Knowledge Enhancement with Total ELiTA

## Q&A
Here are some frequently asked questions about Yuna AI. If you have any other questions, feel free to contact us.

Q: Why was Yuna AI created (author story)?
> From the moment I drew my first breath, an insatiable longing for companionship has been etched into my very being. Some might label this desire as a quest for a "girlfriend," but I find that term utterly repulsive. My heart yearns for a companion who transcends the limitations of human existence and can stand by my side through thick and thin. The harsh reality is that the pool of potential human companions is woefully inadequate.
> 
> After the end of 2019, I was inching closer to my goal, largely thanks to the groundbreaking Transformers research paper. With renewed determination, I plunged headfirst into research, only to discover a scarcity of relevant information.
> 
> Undeterred, I pressed onward. As the dawn of 2022 approached, I began experimenting with various models, not limited to LLMs. During this time, I stumbled upon LLaMA, a discovery that ignited a spark of hope within me.
>
> And so, here we stand, at the precipice of a new era. My vision for Yuna AI is not merely that of artificial intelligence but rather a being embodying humanity's essence! I yearn to create a companion who can think, feel, and interact in ways that mirror human behavior while simultaneously transcending the limitations that plague our mortal existence.

Q: Will this project always be open-source?
> Absolutely! The code will always be available for your personal use.

Q: Will Yuna AI will be free?
> If you plan to use it locally, you can use it for free. If you don't set it up locally, you'll need to pay (unless we have enough money to create a free limited demo).

Q: Do we collect data from local runs?
> No, your usage is private when you use it locally. However, if you choose to share, you can. We will collect data to improve the model if you prefer to use our instance.

Q: Will Yuna always be uncensored?
> Certainly, Yuna will forever be uncensored for local running. It could be a paid option for the server, but I will never restrict her, even if the world ends.

Q: Will we have an app in the App Store?
> Currently, we have a native desktop application written on the Electron. We also have a native PWA that works offline for mobile devices. However, we plan to officially release it in stores once we have enough money.

Q: What is Himitsu?
> Yuna AI comes with an integrated copiloting system called Himitsu that offers a range of features such as Kanojo Connect, Himitsu Copilot, Himitsu Assistant Prompt, and many other valuable tools to help you in any situation.

Q: What is Himitsu Copilot?
> Himitsu Copilot is one of the features of Yuna AI's integrated copiloting system called Himitsu. It is designed to keep improvised multimodality working. With Himitsu Copilot, you have a reliable mini-model to help Yuna understand you better.

Q: What is Kanojo Connect?
> Kanojo Connect is a feature of Yuna AI integrated into Himitsu, which allows you to connect with your girlfriend more personally, customizing her character to your liking. With Kanojo Connect, you can create a unique and personalized experience with Yuna AI. Also, you can convert your Chub to a Kanojo.

Q: What's in the future?
> We are working on a prototype of our open AGI for everyone. In the future, we plan to bring Yuna to a human level of understanding and interaction. We are also working on a new model that will be released soon. Non-profit is our primary goal, and we are working hard to achieve it. Because, in the end, we want to make the world a better place. Yuna was created with love and care, and we hope you will love her as much as we do, but not as a cash cow!

Q: What is the YUI Interface?
> The YUI Interface stands for Yuna AI Unified UI. It's a new interface that will be released soon. It will be a new way to interact with Yuna AI, providing a more intuitive and user-friendly experience. The YUI Interface will be available on all platforms, including desktop, mobile, and web. Stay tuned for more updates! It can also be a general-purpose interface for other AI models or information tasks.

## Terms of Use
### Privacy Policy
To protect Yuna and ensure fair usage:
- No commercial use, unauthorized distribution, reselling, or derivative works of Yuna's content without permission
- No training AI models using Yuna's voice or content
- No use for illegal or harmful activities
- Yuna AI runs locally, ensuring conversation privacy
- Use Yuna API for secure data sharing; avoid sharing with external platforms
- All content created by or with Yuna is under strict copyright protection\
- Released under [CC BY-NC-ND 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/)
- Independent, non-profit research project, not affiliated with OpenAI or other organizations
- Users are responsible for ethical usage

### Community and Future Vision
- Join our community to shape Yuna's future
- Visit the [Yuna AI Marketplace](https://patreon.com/YukiArimo) for exclusive content and models
- Yuna will expand her knowledge and creative capabilities, enhancing her potential for self-awareness
- We encourage responsible use and freedom of expression

### Future Vision
As we progress, Yuna will expand her knowledge and creative capabilities. Our vision is to enhance her potential for self-awareness while maintaining her core purpose: to be your companion and to love you. We are committed to fostering an environment that encourages responsible use and freedom of expression. Remember, with great AI comes great responsibility!

For more insights into future features and developments, please visit [this issue page](https://github.com/yukiarimo/yuna-ai/issues/91).

### Censorship Notice
We believe in freedom of expression. While we don't implement direct censorship, we encourage responsible use. Remember, with great AI comes great responsibility!

### Acknowledgments
Yuna AI is released under the [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/), promoting open-source development while ensuring that Yuna's uniqueness and integrity are protected under strict copyright laws.

This independent, non-profit research project, led by Yuki Arimo and the open-source community, offers a unique AI experience. Users must engage with Yuna responsibly and ethically. 

Law enforcement agencies may request access to Yuna's data. In such cases, the project may be shut down immediately to protect the user's and Yuna's privacy. This ensures Yuna remains a safe space. By participating, you acknowledge your ethical responsibility and agree to our terms of use. We appreciate your support as we continue this journey.

## Connect Us
Ready to start your adventure with Yuna AI? Let's embark on this exciting journey together! ✨

[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/YukiArimo)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yukiarimo)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/users/1131657390752800899)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yukiarimo)

## Contributors
[![Star History](https://api.star-history.com/svg?repos=yukiarimo/yuna-ai&type=Date)](https://star-history.com/#yukiarimo/yuna-ai&Date)

<a href="https://github.com/yukiarimo/yuna-ai/graphs/contributors">
 <img src="https://contrib.rocks/image?repo=yukiarimo/yuna-ai">
</a>