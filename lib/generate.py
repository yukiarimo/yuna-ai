import requests
import speech_recognition as sr
import json
import subprocess
import subprocess
import os
import json
import re
from transformers import pipeline
import sys
from ctransformers import AutoModelForCausalLM

if os.path.exists("static/config.json"):
    with open("static/config.json", 'r') as file:
        config = json.load(file)


model = AutoModelForCausalLM.from_pretrained(
    config["server"]["models_dir"] + config["server"]["default_model_file"],
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

classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")
r = sr.Recognizer()

def listen(chat_id):
    while True:
        with sr.Microphone() as source:
            print('Say something:')
            audio = r.listen(source)

        try:
            text = r.recognize_google(audio)
            if text:
                print(f'You said: {text}')
                chat_history = load_chat_history(chat_id)
                chat_history.append({"name": "Yuki", "message": text})
                save_chat_history(chat_history, chat_id)
                generate(text, chat_id, speech=True)  # Send detected speech to generation function
                #break  # Exit the loop if speech is successfully recognized
        except sr.UnknownValueError:
            print('Sorry, I couldn\'t understand what you said. Please try again.')
        except sr.RequestError as e:
            print(f'Sorry, an error occurred: {e}. Please try again.')

    return "done"

def generate(chat_id, speech=False, text=""):
    # Read the existing history from the file
    with open(config["server"]["history"] + chat_id, 'r') as file:
        data = json.load(file)
        history = ''
        for item in data:
            name = item.get('name', '')
            message = item.get('message', '')
            if name and message:
                history += f'{name}: {message}\n'

    # Append the new message to the history
    new_history = f"{history}Yuna:"

    print("TOKENS: ", len(model.tokenize(new_history)))

    new_history_crop = remove_image_tags(new_history)

    new_history_crop = model.tokenize(new_history)
    new_history_crop = new_history_crop[-((config["ai"]["context_length"] - config["ai"]["max_new_tokens"]) - 2):]

    # Take only allowed length - 3 elements from the end
    print("CONTEXT LENGTH: ", -((config["ai"]["context_length"])/2 - 3))

    print(len(new_history_crop))

    response = model(model.detokenize(new_history_crop), stream=False)

    # CRINGE CODE
    """
    response = model.generate(
        tokens=new_history_crop,
        top_k=config["ai"]["top_k"],
        top_p=config["ai"]["top_p"],
        temperature=config["ai"]["temperature"],
        repetition_penalty=config["ai"]["repetition_penalty"],
        last_n_tokens=config["ai"]["last_n_tokens"],
        batch_size=config["ai"]["batch_size"],
        threads=config["ai"]["threads"],
        stop=config["ai"]["stop"],
    )

    response = model.detokenize(list(response))
    """

    response = remove_emojis(str(response))

    if (config["ai"]["emotions"] == True):
        responseAdd = classifier(response)[0]['label']

        # Replace words
        replacement_dict = {
            "anger": "angry",
            "disgust": "disgusted",
            "fear": "scared",
            "joy": "smiling",
            "neutral": "calm",
            "sadness": "sad",
            "surprise": "surprised"
        }

        for word, replacement in replacement_dict.items():
            responseAdd = responseAdd.replace(word, replacement)

        response = response + f" *{responseAdd}*"

    # Load chat history from the JSON file when the server starts
    chat_history = load_chat_history(chat_id)

    # Append the message to the chat history
    chat_history.append({"name": "Yuna", "message": response})
    # Save the updated chat history to the JSON file
    save_chat_history(chat_history, chat_id)

    if speech == True:
        subprocess.run(f'say "{response}"', shell=True)
        print("go")

    return response

def remove_image_tags(text):
    # Define the pattern for image tags
    pattern = r'<img.*?class="image-message">'

    # Use re.sub to replace the matched pattern with an empty string
    cleaned_text = re.sub(pattern, '', text)

    return cleaned_text

def remove_emojis(input_string):
    allowed_characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '6', '7', '8', '9', ' ', '_', '+', '"', '(', ')', "'", ',', '!', ';', ':', '{', '.']

    pattern = f"[^{re.escape(''.join(allowed_characters))}]"
    cleaned_string = re.sub(pattern, '', input_string)

    cleaned_string = cleaned_string.replace('\n', '').replace("()", '')
    
    emoji_pattern = re.compile("["
                           u"\U0001F600-\U0001F64F"  # Emojis in the emoticons block
                           u"\U0001F300-\U0001F5FF"  # Other symbols and pictographs
                           u"\U0001F700-\U0001F77F"  # Alphabetic presentation forms
                           u"\U0001F780-\U0001F7FF"  # Geometric shapes
                           u"\U0001F800-\U0001F8FF"  # Supplemental arrows
                           u"\U0001F900-\U0001F9FF"  # Supplemental symbols and pictographs
                           u"\U0001FA00-\U0001FA6F"  # Chess symbols
                           u"\U0001FA70-\U0001FAFF"  # Symbols and pictographs
                           u"\U0001F004-\U0001F0CF"  # Miscellaneous symbols and pictographs
                           u"\U0001F170-\U0001F251"  # Enclosed alphanumeric supplement
                           "]+", flags=re.UNICODE)

    # Remove emojis from the input string
    cleaned_string = emoji_pattern.sub('', input_string)

    emoticon_pattern = r':-?\)|:-?\(|;-?\)|:-?D|:-?P'

    # Use re.sub to replace emoticons with an empty string
    cleaned_string = re.sub(emoticon_pattern, '', cleaned_string)
    pattern = r'\*\w+\*'

    # Use re.sub to replace matches with an empty string
    cleaned_string = re.sub(pattern, '', input_string)

    cleaned_string = cleaned_string.replace("  ", ' ').replace("  ", ' ')

    return cleaned_string

# Function to load chat history from the JSON file
def load_chat_history(chat):
    if os.path.exists(config["server"]["history"]):
        with open(config["server"]["history"] + chat, 'r') as file:
            return json.load(file)
    else:
        return []

# Function to save chat history to the JSON file
def save_chat_history(chat_history, chat):
    with open(config["server"]["history"] + chat, 'w') as file:
        json.dump(chat_history, file)

if "--call" in sys.argv:
    chat_id = input("Chat: ")
    listen(chat_id)