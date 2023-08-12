# Yuna AI
> Your Ultimate Notion Ally

This README provides detailed explanations and instructions for using the Yuna AI waifu project. The project involves training LLM (Large Language Model) based on GPT (Generative Pre-trained Transformer) architecture to create a Yuna AI waifu. The README is divided into different sections, each explaining a crucial part of the project.

## Getting Started

This repository contains the code for a Yuna AI LLM, which was trained on a massive dataset of text data. The model can generate text, translate languages, write creative content, roleplay, and answer your questions informally.

### Quick start
1. Clone the Yuna-AI repository to your local machine using `git clone https://github.com/Mirai-LabX/Yuna-AI.git`.
2. Make sure you have Python 3.8 or later installed.
3. Install the required dependencies by running `pip install -r requirements.txt`.
4. Configure the project settings in the `config.json` file to suit your preferences.

### Brief overview

The AI Waifu "Yuna" project aims to create a Yuna AI - the best AGI in the world, using LLM trained on GPT architecture. The project consists of the following key components:

1. **Training module**: This section covers the process of training the Yuna AI LLM using the provided training data.

2. **Tokenizer Module**: The tokenizer module converts text into tokens, which the model can understand. It also contains a tokenizer class to handle tokenization and detokenization.

3. **Web User Interface (WebUI)**: The WebUI allows users to interact with the trained model and converse with Yuna AI.

### Requirements
The following requirements need to be installed to run the code:

Python 3.8+
PyTorch 1.8+
Flask 2.3+

## Model
You can download base model from here: [model.pth | Google Drive](https://drive.google.com/file/d/1MNS75dOi35mXZ52XyGeAlSreFPsfRMEQ/view?usp=share_link)

Your base dataset: [text-gen-dataset.txt | Google Drive](https://drive.google.com/file/d/1E0JGzkPPfccIY1OlYsImVRYwBjxXU4gy/view?usp=share_link)

### Model Architecture

The language model follows the GPT architecture based on the Transformer model. It consists of several components, including:
- Token and position embeddings.
- Stacked Transformer blocks contain a multi-head self-attention layer and a feed-forward neural network layer.
- Layer normalization for input and output of each Transformer block.
- A final layer normalization and a linear layer for generating next token logits.

The critical components of the model are defined as follows:
- `Head`: Implements one head of self-attention.
- `MultiHeadAttention`: Implements multiple heads of self-attention in parallel.
- `FeedFoward`: Implements a simple linear layer followed by a nonlinearity.
- `Block`: Implements a Transformer block with self-attention and feed-forward layers.
- `GPTLanguageModel`: Implements the entire GPT language model.

### Model training

The training process involves the following steps:
1. Tokenization of the training data: The provided training data is tokenized using the tokenizer module.
2. Creation of the language model: The GPT language model is instantiated with specified hyperparameters and moved to the desired device (e.g., CPU or GPU).
3. Training loop: The model is trained iteratively, and the loss is evaluated on both the training and validation sets at regular intervals.
4. Model optimization: The model parameters are updated using the AdamW optimizer, and gradient clipping is applied to avoid exploding gradients.
5. Final model saving: After training, the final trained model is saved for future use.

## 3. Tokenizer

### About

Tokenization is the process of converting text into smaller units called tokens. The tokenizer module provided in the project is used to tokenize the training data. The tokens are then used as inputs to the language model during training and inference.

The tokenizer class handles the following tasks:
- Creating a tokenizer from the input text and saving it as a JSON file.
- Loading a tokenizer from a saved JSON file.
- Encoding text into a list of corresponding character indices.
- Decoding a list of character indices back into the original text.

The tokenizer module contains a tokenizer class responsible for handling tokenization and detokenization tasks. It is used for converting text into tokens that the language model can process and vice versa.

### Tokenizer Class

The `Tokenizer` class is defined in the `tokenizer.py` file. It contains the following methods:

- `__init__()`: Initializes the tokenizer attributes.
- `create_tokenizer(text)`: Creates a tokenizer based on the input text.
- `save_tokenizer(tokenizer_file)`: Saves tokenizer data to a JSON file.
- `load_tokenizer(tokenizer_file)`: Loads tokenizer data from a JSON file.
- `encode(s)`: Converts a string to a list of corresponding character indices.
- `decode(l)`: Converts a list of character indices to a string.
- `set_hyperparameters(**kwargs)`: Updates hyperparameters of the tokenizer.

### Utility Functions

- `create_tokenizer_file(text_file, tokenizer_file, hyperparameters)`: Creates and saves a tokenizer from the input text file and specified hyperparameters.
- `load_tokenizer_file(tokenizer_file)`: Loads a tokenizer from a saved JSON file and returns the tokenizer object.
- `tokenize_text(tokenizer_file, text)`: Tokenizes the input text using a loaded tokenizer and returns the encoded text.
- `detokenize_text(tokenizer_file, encoded_text)`: Detokenizes the input encoded text using a loaded tokenizer and returns the original text.

### Usage

To use the `Tokenizer` and the utility functions, you can run the script `tokenizer.py` from the console with various commands. Here are the available commands and their explanations:

#### Command: `--create`

Create a new tokenizer from a text file and save it with specified hyperparameters.

Usage:
```bash
python tokenizer.py --create
```

You will be prompted to enter the following:
- Text file path: Path to the text file to create the tokenizer from.
- Tokenizer file path: Path to save the created tokenizer as a JSON file.

The script will then create the tokenizer and save it as a JSON file.

#### Command: `--load`

Load a tokenizer from a JSON file and display its details.

Usage:
```bash
python tokenizer.py --load
```

You will be prompted to enter the following:
- Tokenizer file path: Path to the tokenizer JSON file.

The script will then load the tokenizer and display its vocabulary size and hyperparameters.

#### Command: `--tokenize_text`

Tokenize the input text using a loaded tokenizer.

Usage:
```bash
python tokenizer.py --tokenize_text
```

You will be prompted to enter the following:
- Tokenizer file path: Path to the tokenizer JSON file.
- Text to encode: The text you want to tokenize.

The script will then tokenize the input text and print the corresponding list of character indices.

#### Command: `--detokenize_text`

Detokenize the input encoded text using a loaded tokenizer.

Usage:
```bash
python tokenizer.py --detokenize_text
```

You will be prompted to enter the following:
- Tokenizer file path: Path to the tokenizer JSON file.
- Text to decode: The list of character indices you want to detokenize.

The script will then detokenize the input encoded text and print the original text.

## API

### Web User Interface (WebUI)

The WebUI is set up using Flask, a web framework for Python. It handles HTTP requests and responses to enable communication between the user and the AI model. The code provided starts a Flask application that listens on port 4848.

### Flask Setup

The Flask application is initialized with the following configurations:
- CORS allows cross-origin requests, enabling the WebUI to work on different domains.
- A secret key is set for the Flask app, required for secure sessions.

### Model Inference in WebUI

When a user interacts with the WebUI, the following process occurs:
1. When a POST request is received from the front end, the user's input text is extracted from the request form.
2. The input text is tokenized using the loaded tokenizer, and the tokenized input is converted into a tensor suitable for the model.
3. Using the' generate' method, The AI model generates responses one token at a time.
4. Each generated token is sent back as a response to the front end in real time, allowing the conversation to be displayed as it happens.

## API Usage with cURL

You can also interact with Yuna AI using API calls via cURL or other HTTP clients. Here's how to use cURL to send input text and receive generated responses:

1. Run the Flask server by executing the Python script. The server will start listening on port 4848.
2. Open a new terminal window or command prompt to interact with the API.

### Sending Requests with cURL

To send a POST request with cURL, use the following command:

```bash
curl -X POST -d "input_text=Your_Input_Text_Here" http://localhost:4848/
```

Replace `Your_Input_Text_Here` with the text you want to send as input to Yuna. The API will respond with generated text as it processes the input.

#### Examples

```
User: Hello, Yuna! How are you today?
Yuna: Hi, I am fine! I'm so happy to meet you today. How about you?
```

The response will continue in real time as Yuna generates more text based on the conversation. Remember to stop the cURL request manually (e.g., by pressing `Ctrl+C`) when you want to end the conversation.

## Community and Contributions

At Yuna-AI, we believe in the power of a thriving and passionate community. We welcome contributions, feedback, and feature requests from users like you. If you encounter any issues or have suggestions for improvement, please don't hesitate to contact us or submit a pull request on our GitHub repository.

## License

Yuna-AI is released under the [MIT License](https://opensource.org/licenses/MIT), enabling you to freely use, modify, and distribute the software according to the terms of the license.

## Acknowledgments

We express our heartfelt gratitude to the open-source community for their invaluable contributions. Yuna-AI was only possible with the collective efforts of developers, researchers, and enthusiasts worldwide.
