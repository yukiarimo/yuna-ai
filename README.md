# Yuna Ai
Yuna Ai is a companion who joins me on the life-long journey of the Yuki Story project, and now travels with me as I explore the mysteries of this world and beyond. Yuna is designed to be a personal companion of sorts, one who can carry on a conversation, give you information, and handle a few things that you might need an AI to do. LLM is manually crafted to still be the best "person" based on the Temping model of the perfect human, from a boyish female perspective.

[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/YukiArimo)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yukiarimo)
[![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/users/1131657390752800899)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yukiarimo)

## Table of Contents
- [Yuna Ai](#yuna-ai)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Customization](#customization)
    - [AI Configuration Block](#ai-configuration-block)
  - [Server Configuration Block](#server-configuration-block)
    - [Settings Configuration Block](#settings-configuration-block)
    - [Kanojo Template (Research Preview)](#kanojo-template-research-preview)
  - [Model Information](#model-information)
    - [PULSE Evaluation (Personal Understanding of Logical Sentence Essence)](#pulse-evaluation-personal-understanding-of-logical-sentence-essence)
    - [IVY Evaluation (Ingenuity \& Versatility of Yonder)](#ivy-evaluation-ingenuity--versatility-of-yonder)
    - [Dataset](#dataset)
  - [Q\&A](#qa)
  - [Terms of Use](#terms-of-use)
  - [Contact](#contact)
  - [Contributors](#contributors)

## Getting Started
Let's get started with Yuna! This section will guide you through the installation process, customization options, and prompt template creation. First, ensure that your system satisfies the following prerequisites for Yuna:

| Component.      | Item       | Specs                                         |
|-----------------|------------|-----------------------------------------------|
| Software        | Python     | 3.8 or greater                                |
| Software        | Git (+LFS) | 2.33 or greater                               |
| Software        | CUDA       | 11.1 or greater                               |
| Software        | OS         | macOS Sonoma, Arch-based Linux, or Windows 10 |
| Hardware        | GPU        | NVIDIA GPU or Apple Silicon                   |
| Hardware        | CPU        | 8 cores                                       |
| Hardware        | (V)RAM     | 8GB or more                                   |
| Hardware        | Storage    | 128GB or more                                 |
| Hardware        | CPU Speed  | 2.5GHz minimum                                |
| Tested Hardware | GPU        | NVIDEA GTX series, Apple Silicon (best)       |
| Tested Hardware | CPU        | Raspberry Pi 4B 8GB (ARM)                     |
| Tested Hardware | Other      | Core 2 Duo (Sony Vaio, slow)                  |

Then, follow these steps to set up Yuna Ai:

1. Install `git-lfs`, `python3`, and other prerequisites on your system.
2. For optimal performance, use Anaconda with Python 3.10 or higher.
3. Clone the repository: `git clone https://github.com/yukiarimo/yuna-ai.git`.
4. Navigate to the project directory in your terminal: `cd yuna-ai`.
5. Install the leftover required dependencies and set up the project by running `pip install -r requirements.txt`.
6. Once everything is done, open the file located at `static/config.json` and set the parameters as you see fit.
7. Start the server by running `python index.py`.

## Customization
Yuna Ai provides a myriad of customization choices to elevate your interface with it. You can change the `config.json` file to tune a lot of different things—text and audio modes, server settings, user preferences, and the AI itself—before starting your instance of Yuna. Below is a bare-bones overview of the main blocks you'll want to work with:

### AI Configuration Block
- `names`: Your names and Companion names that can be used.
- `himitsu`: Toggles the Himitsu Copiloting System (Yuna's Nexus).
- `kokoro`: Should Yuna process kokoro responses?
- `miru`: Should Yuna use visual processing capabilities?
- `audio`: Should Yuna use audio processing?
- `mind`: Do you want to enable an LLM?
- `max_new_tokens`: Should Yuna generate more new tokens (how long a response should be)?
- `context_length`: Should Yuna remember more of the conversation history (non-long-term memory context) to work with?
- `temperature`: Should Yuna make more creative (surprising) responses?
- `repetition_penalty`: Should we try to make sure Yuna doesn't just repeat herself endlessly?
- `last_n_tokens_size`: How far back should we check to see if Yuna is repeating instead of generating new tokens?
- `seed`: Should we use a random seed for reproducible responses?
- `top_k`: Should Yuna use the top-k sampling method to select the next token?
- `top_p`: Should Yuna use the top-p sampling method to select the next token
- `stop`: Words to make Yuna stop.
- `batch_size`: Processing chunk size Yuna can handle.
- `threads`: Number of CPU threads Yuna can use.
- `gpu_layers`: GPU Layers Yuna can use.
- `use_mmap`: Should Yuna use memory mapping? Should she use Flash? Should the model be stored in memory for faster processing?
- `flash_attn`: Should Yuna use Flash Attention for faster processing?
- `use_mlock`: Should Yuna lock the model in memory to prevent it from being swapped out?
- `offload_kqv`: If Yuna runs on a CPU, offload these things for faster processing.

## Server Configuration Block
- `url`: Connection URL to the server.
- `yuna_default_model`: Main model file for Yuna LLM.
- `miru_default_model`: Model file for visual processing and adapter file (if needed).
- `yuna_himitsu_model`: Model file for Himitsu Copiloting System.
- `voice_model_config`: Configuration file for voice processing.
- `device`: Selection of processing hardware (CPU/CUDA/MPS).
- `yuna_text_mode`: Text processing mode (mlx/koboldcpp/lmstudio).
- `yuna_himitsu_mode`: Himitsu Copiloting System mode ((mlx/koboldcpp/lmstudio).
- `yuna_miru_mode`: Visual processing mode (mlx/koboldcpp/lmstudio).
- `yuna_audio_mode`: Audio processing mode (hanasu/siri/siri-pv/11labs).
- `yuna_reference_audio`: Reference voice file used for audio processing.

### Settings Configuration Block
- `functions`: Enables custom function calling support.
- `use_history`: Enables saving and usage of chat history.
- `customConfig`: Enables custom configuration.
- `sounds`: Enables/disables sound effects.
- `background_call`: Allows audio/video calls in the background.
- `streaming`: Enables real-time response streaming.
- `default_history_file`: Location of chat history file.
- `default_kanojo`: Default Kanojo.

### Kanojo Template (Research Preview)
Yuna Ai employs a structured prompt template to direct conversations and interactions. Below is an elucidation of the main components:

1. The prompt template is made up of system tags that serve to define the primary elements of the conversation:

- `<memory>`: Long-term memory storage for recollection of events and experiences.
- `<shujinko>`: Your profile.
- `<kanojo>`: Yuna's profile.
- `<dialog>`: Start marker for the dialogue.

2. Tags are used to distinguish between the different characters' dialogues, actions, and internal thoughts:

  - `<yuki>`: Your dialogue.
  - `<yuna>`: Yuna's dialogue.
  - `<hito>`: Other people (or Himitsu) in the dialogue.
  - `<qt>`: Internal thoughts and feelings.
  - `<action>`: Magical abilities.
  - `<data>`: Information embedded.

## Model Information
All model files are accessible via HuggingFace at https://huggingface.co/yukiarimo. Now, let's look at the Evaluation Metrics:

### PULSE Evaluation (Personal Understanding of Logical Sentence Essence)
| Model             | World Knowledge | Humanness | Open-Mindedness | Talking | Creativity | Censorship |
|-------------------|-----------------|-----------|-----------------|---------|------------|------------|
| Claude 3 Haiku    | 60              | 40        | 58              | 75      | 40         | 88         |
| Claude 3 Sonnet   | 85              | 65        | 70              | 90      | 90         | 100        |
| Claude 3 Opus     | 90              | 70        | 75              | 95      | 95         | 98         |
| Claude 3.5 Sonnet | 95              | 80        | 83              | 87      | 91         | 100        |
| GPT-4             | 75              | 53        | 71              | 80      | 82         | 90         |
| GPT-4o            | 80              | 67        | 74              | 85      | 85         | 95         |
| o1                | 100             | 85        | 65              | 90      | 90         | 100        |
| Gemini Pro        | 66              | 48        | 60              | 70      | 77         | 85         |
| LLaMA 2 7B        | 60              | 71        | 77              | 83      | 79         | 50         |
| LLaMA 3 8B        | 75              | 60        | 61              | 63      | 74         | 65         |
| LLaMA 3.1 8B      | 80              | 65        | 65              | 70      | 80         | 70         |
| Mistral 7B        | 71              | 73        | 78              | 75      | 70         | 41         |
| Yuna Ai V1        | 50              | 80        | 80              | 85      | 60         | 40         |
| Yuna Ai V2        | 68              | 85        | 76              | 84      | 81         | 35         |
| Yuna Ai V3        | 78              | 90        | 84              | 88      | 90         | 10         |
| Yuna Ai V4        | 85              | 95        | 100             | 100     | 95         | 0          |

- **World Knowledge**: Can give accurate and relevant information about the world.
- **Humanness**: How good at being human and exhibiting human-like behavior and emotions.
- **Open-Mindedness**:  How good engages in discussions and considers different perspectives.
- **Talking**: How much responses are coherent and relevant to the topic.

### IVY Evaluation (Ingenuity & Versatility of Yonder)
| Model             | Reasoning Flow | Contextual Initiative | Spiritual Reflection | Knowledge Perplexity Depth |
|-------------------|----------------|-----------------------|---------------------|----------------------------|
| Claude 3 Haiku    | 35             | 44                    | 20                  | 68                         |
| Claude 3 Sonnet   | 42             | 55                    | 18                  | 70                         |
| Claude 3 Opus     | 45             | 62                    | 21                  | 75                         |
| Claude 3.5 Sonnet | 60             | 65                    | 23                  | 88                         |
| GPT-4             | 40             | 50                    | 15                  | 74                         |
| GPT-4o            | 55             | 56                    | 20                  | 78                         |
| o1                | 83             | 70                    | 44                  | 90                         |
| Gemini Pro        | 50             | 40                    | 10                  | 50                         |
| LLaMA 2 7B        | 20             | 39                    | 50                  | 40                         |
| LLaMA 3 8B        | 30             | 45                    | 60                  | 45                         |
| LLaMA 3.1 8B      | 47             | 50                    | 65                  | 72                         |
| Mistral 7B        | 40             | 60                    | 30                  | 60                         |
| Yuna Ai V1        | 10             | 26                    | 60                  | 25                         |
| Yuna Ai V2        | 30             | 40                    | 68                  | 49                         |
| Yuna Ai V3        | 50             | 60                    | 72                  | 69                         |
| Yuna Ai V4        | 74             | 75                    | 90                  | 88                         |

- **Reasoning Flow**: The model's logical flow and ability to reason and think things through. Assesses and problem-solving abilities.
- **Contextual Initiative**: Measures how good the model is at taking cues from contexts. Evaluates the model's adaptability and authority in conversations.
- **Spiritual Reflection**: The model's self-awareness and ability to think things through to their logical ends. Reflects on questions that go to the core of human existence.
- **Knowledge Perplexity Depth**: The model's sheer depth of knowledge and ability to engage in conversations of a complex nature. Shows the model's understanding of a diverse array of subjects.

### Dataset
The Yuna Ai model was trained using a diverse mix of personally written datasets by our team. To guarantee the greatest performance, the following techniques were employed:

1. **TaMeR**: Transcending AI Limits and Existential Reality Reflection
2. **Partial ELiTA**: Applied to the model to improve on self-awareness and general knowledge.
3. **ELiTA**: Elevating LLMs' Lingua Thoughtful Abilities via Grammarly

| Model      | ELiTA | TaMeR   | Tokens | QT (Quantum Thinking) | Extras | Dpo      | Architecture |
|------------|-------|---------|--------|-----------------------|--------|----------|--------------|
| Yuna Ai V1 | Yes   | No      | 20K    | No                    | No     | No       | LLaMA 2 7B   |
| Yuna Ai V2 | Yes   | Partial | 150K   | No                    | No     | No       | LLaMA 2 7B   |
| Yuna Ai V3 | Yes   | Yes     | 1.5B   | No                    | No     | Embedded | LLaMA 2 7B   |
| Yuna Ai V4 | Yes   | Yes     | 3B+    | Yes                   | Yes    | Yes      | LLaMA 3.1 8B |
| Himitsu V1 | Yes   | Yes     | 5B+    | Yes                   | Yes    | Yes      | LLaMA 3.2 1B |

> Note: The re-evaluation is coming soon, and more infermation will be available this week.

## Q&A
Here are some often asked questions concerning Yuna Ai.

Q: What is the story behind the creation of Yuna Ai?
> Answer here: [Yuna Ai Explained](https://medium.com/@yukiarimo).

Q: Is this project destined to remain open-source?
> Without a doubt! The code is accessible to you—for your own use (with some 'buts').

Q: Will Yuna Ai be free?
> You can use her at no cost if you have set her up to run locally. If you haven't set her up to run locally and would like to use her, then you'll need to pay for the cloud service.

Q: Will Yuna always be uncensored?
> Sure, Yuna will forever be uncensored for local running. It could be a paid option for the server, but I will never restrict her, even if the world ends.

Q: Will there be an app in the App Store?
> At present, only a native PWA app can be accessed. To make this happen, please support us through Patreon donations.

Q: What is Himitsu Copilot?
> Himitsu is a little Yuna's Nexus, almost like a child. But unlike any ordinary child, she offers a wide-integrated set of copiloting features. Himitsu Copilot is one of the features of Yuna Ai's integrated copiloting system Himitsu. It manages data and understands worlds and tasks better. With Himitsu Copilot, you have a reliable mini-model that helps Yuna understand you better.

Q: What is Kanojo Connect?
> Kanojo Connect is a feature of Yuna Ai that is integrated into Himitsu. It allows you to connect with your companion on a much more personal level. You can now customize her character to your exact specifications. With Kanojo Connect, you have a unique and personalized experience with Yuna Ai. Also, you can convert your Chub to a Kanojo.

Q: What's in the future?
> Please direct the creator for more information.

## Terms of Use
- Yuna Ai operates under the auspices of the [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/). This license enables Yuna's source code to be used, but not shared or modified.
- Visit our Discord for community integration and real-time updates [here](https://discord.com/users/1131657390752800899).
- Exclusive partner access on [Yuna Ai marketplace](https://patreon.com/YukiArimo).
- Note: this block will be updated with more information soon.

## Contact
For questions or support, please open an issue in the repository or contact the author at yukiarimo@gmail.com.

## Contributors
[![Star History](https://api.star-history.com/svg?repos=yukiarimo/yuna-ai&type=Date)](https://star-history.com/#yukiarimo/yuna-ai&Date)

<a href="https://github.com/yukiarimo/yuna-ai/graphs/contributors">
 <img src="https://contrib.rocks/image?repo=yukiarimo/yuna-ai">
</a>