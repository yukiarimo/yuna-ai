import json
import re
from flask_login import current_user
from llama_cpp import Llama

def get_config(config=None):
    if config is None:
        with open('static/config.json', 'r') as config_file:
            return json.load(config_file)
    else:
        with open('static/config.json', 'w') as config_file:
            json.dump(config, config_file, indent=4)

from lib import router
from lib.history import ChatHistoryManager
import requests

# load config.json
config_agi = get_config()

if config_agi["ai"]["agi"] == True:
    from langchain_community.document_loaders import TextLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import Chroma
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain.chains import RetrievalQA
    from langchain_community.llms import LlamaCpp

class ChatGenerator:
    def __init__(self, config):
        self.config = config
        self.model = Llama(
            model_path="lib/models/yuna/" + config["server"]["yuna_default_model"],
            n_ctx=config["ai"]["context_length"],
            last_n_tokens_size=config["ai"]["last_n_tokens_size"],
            seed=config["ai"]["seed"],
            n_batch=config["ai"]["batch_size"],
            n_gpu_layers=config["ai"]["gpu_layers"],
            n_threads=config["ai"]["threads"],
            use_mmap=config["ai"]["use_mmap"],
            use_mlock=config["ai"]["use_mlock"],
            flash_attn=config["ai"]["flash_attn"],
            offload_kqv=config["ai"]["offload_kqv"],
            verbose=False
        ) if config["server"]["yuna_text_mode"] == "native" else ""

    def generate(self, chat_id=None, speech=False, text="", kanojo=None, chat_history_manager=None, useHistory=True, yunaConfig=None, stream=False):
        # print all the parameters
        print('chat_id -> ', chat_id)
        print('speech -> ', speech)
        print('text -> ', text)
        print('kanojo -> ', kanojo)
        print('chat_history_manager -> ', chat_history_manager)
        print('useHistory -> ', useHistory)
        print('yunaConfig -> ', yunaConfig)
        print('stream -> ', stream)

        if yunaConfig is not None:
            self.config = yunaConfig
        else:
            yunaConfig = self.config

        chat_history = chat_history_manager.load_chat_history(list({current_user.get_id()})[0], chat_id)
        response = ''

        if self.config["server"]["yuna_text_mode"] == "native":
            if kanojo is not None:
                # Step 1: Tokenize kanojo
                tokens_kanojo = self.model.tokenize(kanojo.encode('utf-8'))
                num_tokens_kanojo = len(tokens_kanojo)

                # Step 2: Prepare history + message
                history_text = self.get_history_text(chat_history, text, useHistory, yunaConfig)
                tokens_history_message = self.model.tokenize(history_text.encode('utf-8'))
                num_tokens_history_message = len(tokens_history_message)

                # Step 3: Calculate max tokens for history + message
                max_length_all_input_and_output = yunaConfig["ai"]["context_length"]
                max_length_history_message = max_length_all_input_and_output - num_tokens_kanojo - yunaConfig["ai"]["max_new_tokens"]

                # Step 4: Crop history + message if necessary
                if len(tokens_history_message) > max_length_history_message:
                    tokens_history_message = tokens_history_message[-max_length_history_message:]
                    history_text = self.model.detokenize(tokens_history_message).decode('utf-8')

                # Step 5: Detokenize kanojo and history + message
                final_prompt = self.model.detokenize(tokens_kanojo).decode('utf-8') + history_text
            else:
                # Naked prompt without kanojo
                final_prompt = text

            print('into the model -> ', final_prompt)
            response = self.model(
                final_prompt,
                stream=stream,
                top_k=yunaConfig["ai"]["top_k"],
                top_p=yunaConfig["ai"]["top_p"],
                temperature=yunaConfig["ai"]["temperature"],
                repeat_penalty=yunaConfig["ai"]["repetition_penalty"],
                max_tokens=yunaConfig["ai"]["max_new_tokens"],
                stop=yunaConfig["ai"]["stop"],
            )
            if stream:
                return (chunk['choices'][0]['text'] for chunk in response)
            else:
                response = response['choices'][0]['text']
                response = self.clearText(str(response))
                return response
        elif self.config["server"]["yuna_text_mode"] == "fast":
            if kanojo is not None:
                # Step 1: Tokenize kanojo
                tokens_kanojo = self.model.tokenize(kanojo.encode('utf-8'))
                num_tokens_kanojo = len(tokens_kanojo)

                # Step 2: Prepare history + message
                history_text = self.get_history_text(chat_history, text, useHistory, yunaConfig)
                tokens_history_message = self.model.tokenize(history_text.encode('utf-8'))
                num_tokens_history_message = len(tokens_history_message)

                # Step 3: Calculate max tokens for history + message
                max_length_all_input_and_output = yunaConfig["ai"]["context_length"]
                max_length_history_message = max_length_all_input_and_output - num_tokens_kanojo - yunaConfig["ai"]["max_new_tokens"]

                # Step 4: Crop history + message if necessary
                if len(tokens_history_message) > max_length_history_message:
                    tokens_history_message = tokens_history_message[-max_length_history_message:]
                    history_text = self.model.detokenize(tokens_history_message).decode('utf-8')

                # Step 5: Detokenize kanojo and history + message
                final_prompt = self.model.detokenize(tokens_kanojo).decode('utf-8') + history_text
            else:
                # Naked prompt without kanojo
                final_prompt = text

            messages = self.get_messages(chat_history, text, yunaConfig)
            dataSendAPI = {
                "model": "/Users/yuki/Documents/Github/yuna-ai/lib/models/yuna/yukiarimo/yuna-ai/yuna-ai-v3-q6_k.gguf",
                "messages": messages,
                "temperature": yunaConfig["ai"]["temperature"],
                "max_tokens": -1,
                "stop": yunaConfig["ai"]["stop"],
                "top_p": yunaConfig["ai"]["top_p"],
                "top_k": yunaConfig["ai"]["top_k"],
                "min_p": 0,
                "presence_penalty": 0,
                "frequency_penalty": 0,
                "logit_bias": {},
                "repeat_penalty": yunaConfig["ai"]["repetition_penalty"],
                "seed": yunaConfig["ai"]["seed"]
            }

            url = "http://localhost:1234/v1/chat/completions"
            headers = {"Content-Type": "application/json"}

            response = requests.post(url, headers=headers, json=dataSendAPI, stream=False)

            if response.status_code == 200:
                response_json = json.loads(response.text)
                response = response_json.get('choices', [{}])[0].get('message', {}).get('content', '')
            else:
                print(f"Request failed with status code: {response.status_code}")

            print('response -> ', response)
            if stream:
                return ''.join(response) if isinstance(response, (list, type((lambda: (yield))()))) else response
            return response

    def processTextFile(self, text_file, question, temperature):
        # Load text file data
        loader = TextLoader(text_file)
        data = loader.load()

        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=0)
        docs = text_splitter.split_documents(data)

        # Generate embeddings using HuggingFaceEmbeddings
        huggingface_embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectorstore = Chroma.from_documents(documents=docs, embedding=huggingface_embeddings)

        # Load GPT4All model for inference  
        llm = LlamaCpp(
            model_path="lib/models/yuna/yuna-ai-v3-q5_k_m.gguf",
            temperature=temperature,
            verbose=False,
        )

        # Create retrieval QA chain
        qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=vectorstore.as_retriever())

        # Ask a question 
        result = qa.invoke(question)
        return result['result']

    def get_history_text(self, chat_history, text, useHistory, yunaConfig):
        history = ''

        if useHistory:
            for item in chat_history:
                name = item.get('name', '')
                message = item.get('message', '')
                if name and message:
                    history += f'<{name.lower()}>{message}</{name.lower()}>\n'

        return f"{history}<yuki>{text}</yuki>\n<yuna>"

    def get_messages(self, chat_history, text, yunaConfig):
        messages = []

        for item in chat_history:
            name = item.get('name', '')
            message = item.get('message', '')
            if name and message:
                role = "user" if name.lower() == yunaConfig['ai']['names'][0].lower() else "assistant"
                messages.append({
                    "role": role,
                    "content": f"<{name.lower()}>{message}</{name.lower()}>"
                })

        messages.append({
            "role": "user",
            "content": f"<yuki>{text}</yuki>\n<yuna>:"
        })

        return messages

    def clearText(self, text):
        TAG_RE = re.compile(r'<[^>]+>')
        text = TAG_RE.sub('', text)

        emoji_pattern = re.compile("["
                               u"\U0001F600-\U0001F64F"  # Emojis in the emoticons block
                               u"\U0001F300-\U0001F5FF"  # Other symbols and pictographs
                               "]+", flags=re.UNICODE)

        text = emoji_pattern.sub('', text)

        emoticon_pattern = r':-?\)|:-?\(|;-?\)|:-?D|:-?P'
        text = re.sub(emoticon_pattern, '', text)

        pattern = r'\*\w+\*'
        text = re.sub(pattern, '', text)

        text = text.replace("  ", ' ').replace("  ", ' ')

        # Remove the last newline character
        if text and text[-1] == '\n':
            text = text[:-1]

        # If the last character is a space, remove it
        if text and text[-1] == ' ':
            text = text[:-1]

        # if the first character is a space, remove it
        if text and text[0] == ' ':
            text = text[1:]

        return text