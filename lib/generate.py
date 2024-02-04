import os
import re
from flask_login import current_user
from transformers import pipeline
from llama_cpp import Llama
from lib.history import ChatHistoryManager

class ChatGenerator:
    def __init__(self, config):
        self.config = config
        self.model = Llama(
            model_path=config["server"]["yuna_model_dir"] + config["server"]["yuna_default_model"],
            n_ctx=config["ai"]["context_length"],
            seed=config["ai"]["seed"],
            n_batch=config["ai"]["batch_size"],
            n_gpu_layers=1,
        )
        self.classifier = pipeline("text-classification", model=f"{config['server']['agi_model_dir']}yuna-emotion")

    def generate(self, chat_id, speech=False, text="", template=None, chat_history_manager=None):
        chat_history = chat_history_manager.load_chat_history(list({current_user.get_id()})[0], chat_id)

        if template == "dialog":
            max_length_all_input_and_output = self.config["ai"]["context_length"]
            max_length_of_generated_tokens = self.config["ai"]["max_new_tokens"]
            max_length_of_input_tokens = max_length_all_input_and_output - max_length_of_generated_tokens

            prompt_dir = os.path.join(self.config["server"]["prompts"], 'dialog.txt')
            with open(prompt_dir, 'r') as file:
                prompt = file.read()

            # Tokenize the history and prompt
            tokenized_prompt = self.model.tokenize(prompt.encode('utf-8'))

            # Load the chat history
            text_of_history = ''
            history = ''

            for item in chat_history:
                name = item.get('name', '')
                message = item.get('message', '')
                if name and message:
                    history += f'{name}: {message}\n'

            text_of_history = f"{history}Yuki: {text}\nYuna:"

            tokenized_history = self.model.tokenize(text_of_history.encode('utf-8'))

            # Calculate the maximum length for the history
            max_length_of_history_tokens = max_length_of_input_tokens - len(tokenized_prompt)

            # Crop the history to fit into the max_length_of_history_tokens counting from the end of the text
            cropped_history = tokenized_history[-max_length_of_history_tokens:]

            # Replace the placeholder in the prompt with the cropped history
            inserted_history = prompt.replace('{user_msg}', self.model.detokenize(cropped_history).decode('utf-8'))

            # Tokenize the everything_for_model_input to calculate its length in tokens
            print("input size: ", len(self.model.tokenize(inserted_history.encode('utf-8'))))

            response = inserted_history

            # inject prompt variable from dialog into new_history
        elif template != "dialog" and template != "himitsuCopilot" and template != "himitsuCopilotGen" and template != "summary" and template != None:
            prompt_dir = os.path.join(self.config["server"]["prompts"] + f'{template}.txt')
            with open(prompt_dir, 'r') as file:
                prompt = file.read()

            # calculate the length of the prompt variable
            prompt_length = len(self.model.tokenize(prompt.encode('utf-8')))

            # Calculate the maximum length for the history
            max_length = self.config["ai"]["context_length"] - self.config["ai"]["max_new_tokens"]

            # Crop the history to fit within the max_length and prompt_length combined, counting from the end of the text
            cropped_history = text[:(max_length - prompt_length)]

            # replace string {user_msg} in the prompt with the history
            response = prompt.replace('{user_msg}', cropped_history)

        elif template == "summary":
            import article_parser
            title, content = article_parser.parse(url="https://www.iphones.ru/iNotes/vyshla-ios-173-beta-2-no-ne-speshite-eyo-ustanavlivat-01-03-2024", output='markdown', timeout=50)
            print(title, content)
        
        elif template == "himitsuCopilot":
            prompt_dir = os.path.join(self.config["server"]["prompts"] + f'{template}.txt')
            with open(prompt_dir, 'r') as file:
                prompt = file.read()

            # calculate the length of the prompt variable
            prompt_length = len(self.model.tokenize(prompt.encode('utf-8')))

            # Calculate the maximum length for the history
            max_length = self.config["ai"]["context_length"] - self.config["ai"]["max_new_tokens"]

            # Crop the history to fit within the max_length and prompt_length combined, counting from the end of the text
            cropped_history = text[:(max_length - prompt_length)]

            # replace string {user_msg} in the prompt with the history
            response = prompt.replace('{user_msg}', cropped_history)

        elif template == "himitsuCopilotGen":
            prompt_dir = os.path.join(self.config["server"]["prompts"] + f'{template}.txt')
            with open(prompt_dir, 'r') as file:
                prompt = file.read()

            # calculate the length of the prompt variable
            prompt_length = len(self.model.tokenize(prompt.encode('utf-8')))

            # Calculate the maximum length for the history
            max_length = self.config["ai"]["context_length"] - self.config["ai"]["max_new_tokens"]

            # Crop the history to fit within the max_length and prompt_length combined, counting from the end of the text
            cropped_history = text[:(max_length - prompt_length)]

            # replace string {user_msg} in the prompt with the history
            response = prompt.replace('{user_msg}', cropped_history)

        elif template == None:
            print('template is none')

        response = self.model(
            response,
            stream=False,
            top_k=self.config["ai"]["top_k"],
            top_p=self.config["ai"]["top_p"],
            temperature=self.config["ai"]["temperature"],
            repeat_penalty=self.config["ai"]["repetition_penalty"],
            max_tokens=self.config["ai"]["max_new_tokens"],
            stop=self.config["ai"]["stop"],
            )
        
        # Assuming the dictionary is stored in a variable named 'response'
        response = response['choices'][0]['text']
        response = self.clearText(str(response))

        if self.config["ai"]["emotions"]:
            response_add = self.classifier(response)[0]['label']

            # Replace words
            replacement_dict = {
                "anger": "*angry*",
                "disgust": "*disgusted*",
                "fear": "*scared*",
                "joy": "*smiling*",
                "neutral": "",
                "sadness": "*sad*",
                "surprise": "*surprised*"
            }

            for word, replacement in replacement_dict.items():
                response_add = response_add.replace(word, replacement)

            response = response + f" {response_add}"

        # response = self.clearText(str(response))

        if template != "himitsuCopilot" and template != "himitsuCopilotGen" and template != "summary" and template != None:
            chat_history.append({"name": "Yuki", "message": text})
            chat_history.append({"name": "Yuna", "message": response})
            chat_history_manager.save_chat_history(chat_history, list({current_user.get_id()})[0], chat_id)

        if speech==True:
            chat_history_manager.generate_speech(response)
        return response
    
    def clearText(self, text):
        text = self.remove_image_tags(text)
        text = self.remove_emojis(text)

        pattern = r'<img.*?class="image-message">'
        text = re.sub(pattern, '', text)

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

        return text