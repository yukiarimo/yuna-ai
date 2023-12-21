import json
import os
import re
from transformers import pipeline
from ctransformers import AutoModelForCausalLM
from lib.history import ChatHistoryManager

class ChatGenerator:
    def __init__(self, config):
        self.config = config
        self.model = AutoModelForCausalLM.from_pretrained(
            config["server"]["yuna_model_dir"] + config["server"]["yuna_default_model"],
            model_type='llama2',
            max_new_tokens=config["ai"]["max_new_tokens"],
            context_length=config["ai"]["context_length"],
            temperature=config["ai"]["temperature"],
            repetition_penalty=config["ai"]["repetition_penalty"],
            last_n_tokens=config["ai"]["last_n_tokens"],
            seed=config["ai"]["seed"],
            top_k=config["ai"]["top_k"],
            top_p=config["ai"]["top_p"],
            stop=config["ai"]["stop"],
            batch_size=config["ai"]["batch_size"],
            gpu_layers=config["ai"]["gpu_layers"]
        )
        self.classifier = pipeline("text-classification", model=f"{config['server']['agi_model_dir']}yuna-emotion")

    def generate(self, chat_id, speech=False, text="", template=None):
        if template == "dialog":
            prompt_dir = os.path.join(self.config["server"]["prompts"] + 'dialog.txt')
            with open(prompt_dir, 'r') as file:
                prompt = file.read()

            history = ''
            with open(os.path.join(self.config["server"]["history"], chat_id), 'r') as file:
                data = json.load(file)
                history = ''
                for item in data:
                    name = item.get('name', '')
                    message = item.get('message', '')
                    if name and message:
                        history += f'{name}: {message}\n'

            history = f"{history}Yuki: {text}\nYuna:"

            # calculate the length of the prompt variable
            prompt_length = len(self.model.tokenize(prompt))

            # Calculate the maximum length for the history
            max_length = self.config["ai"]["context_length"] - self.config["ai"]["max_new_tokens"]

            # Crop the history to fit within the max_length and prompt_length combined, counting from the end of the text
            cropped_history = history[-(max_length - prompt_length):]

            # replace string {user_msg} in the prompt with the history
            response = prompt.replace('{user_msg}', cropped_history)

            print(len(self.model.tokenize(response)), '<- response length')

            # inject prompt variable from dialog into new_history
        elif template != "dialog" and template != None:
            prompt_dir = os.path.join(self.config["server"]["prompts"] + f'{template}.txt')
            with open(prompt_dir, 'r') as file:
                prompt = file.read()

            # calculate the length of the prompt variable
            prompt_length = len(self.model.tokenize(prompt))

            # Calculate the maximum length for the history
            max_length = self.config["ai"]["context_length"] - self.config["ai"]["max_new_tokens"]

            # Crop the history to fit within the max_length and prompt_length combined, counting from the end of the text
            cropped_history = text[:(max_length - prompt_length)]

            # replace string {user_msg} in the prompt with the history
            response = prompt.replace('{user_msg}', cropped_history)

            print(len(self.model.tokenize(response)), '<- response length')
        elif template == None:
            print('template is none')

        response = self.model(response, stream=False)
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

        chat_history = ChatHistoryManager.load_chat_history(self, chat_id)
        chat_history.append({"name": "Yuki", "message": text})
        chat_history.append({"name": "Yuna", "message": response})
        ChatHistoryManager.save_chat_history(self, chat_history, chat_id)

        if speech==True:
            self.generate_speech(response)

        return response
    
    def clearText(self, text):
        text = self.remove_image_tags(text)
        text = self.remove_emojis(text)
        return text

    def remove_image_tags(self, text):
        pattern = r'<img.*?class="image-message">'
        cleaned_text = re.sub(pattern, '', text)
        return cleaned_text

    def remove_emojis(self, input_string):
        emoji_pattern = re.compile("["
                               u"\U0001F600-\U0001F64F"  # Emojis in the emoticons block
                               u"\U0001F300-\U0001F5FF"  # Other symbols and pictographs
                               # ... (other emoji ranges)
                               "]+", flags=re.UNICODE)

        cleaned_string = emoji_pattern.sub('', input_string)

        emoticon_pattern = r':-?\)|:-?\(|;-?\)|:-?D|:-?P'
        cleaned_string = re.sub(emoticon_pattern, '', cleaned_string)

        pattern = r'\*\w+\*'
        cleaned_string = re.sub(pattern, '', input_string)

        cleaned_string = cleaned_string.replace("  ", ' ').replace("  ", ' ')

        return cleaned_string

class ChatHistoryManager:
    def __init__(self, config):
        self.config = config

    def create_chat_history_file(self, chat_id):
        history_starting_template = [{"name": "Yuki", "message": "Hi"}, {"name": "Yuna", "message": "Hello"}]
        with open(os.path.join(self.config["server"]["history"], chat_id), 'w') as file:
            json.dump(history_starting_template, file)

    def delete_chat_history_file(self, chat_id):
        os.remove(os.path.join(self.config["server"]["history"], chat_id))

    def rename_chat_history_file(self, chat_id, new_chat_id):
        os.rename(
            os.path.join(self.config["server"]["history"], chat_id),
            os.path.join(self.config["server"]["history"], new_chat_id)
        )

    def list_history_files(self):
        history_files = [f for f in os.listdir(self.config["server"]["history"]) if os.path.isfile(os.path.join(self.config["server"]["history"], f))]

        # Place main_history_file first and then sort alphabetically
        history_files.sort(key=lambda x: (x != self.config["server"]["default_history_file"], x.lower()))

        return history_files

    def load_chat_history(self, chat):
        print(self.config["server"]["history"], chat)
        print(chat)
        history_path = os.path.join(self.config["server"]["history"], chat)
        if os.path.exists(history_path):
            with open(history_path, 'r') as file:
                return json.load(file)
        else:
            return []

    def save_chat_history(self, chat_history, chat):
        history_path = os.path.join(self.config["server"]["history"], chat)
        with open(history_path, 'w') as file:
            json.dump(chat_history, file)

    def generate_speech(self, response):
        subprocess.run(f'say "{response}" -o output', shell=True)
        shutil.move("output.aiff", "static/audio/output.aiff")
        subprocess.run(f"ffmpeg -y -i 'static/audio/output.aiff' -b:a 192K -f mp3 static/audio/output.mp3", shell=True)

if __name__ == '__main__':
    with open("static/config.json", 'r') as file:
        config = json.load(file)

    chat_generator = ChatGenerator(config)
    chat_history_manager = ChatHistoryManager(config)

    # Example usage:
    chat_id = "example_chat"
    chat_history_manager.create_chat_history_file(chat_id)
    chat_generator.generate(chat_id, speech=True, text="Hello, how are you?")
