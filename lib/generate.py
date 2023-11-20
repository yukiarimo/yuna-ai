import requests
import speech_recognition as sr
import json
import subprocess
import shutil
import subprocess
import os
import json
import re
from transformers import pipeline
import sys

if os.path.exists("static/config.json"):
    with open("static/config.json", 'r') as file:
        config = json.load(file)

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

def generate(text, chat_id, speech=False):
    # Read the existing history from the file
    with open(config["history"] + chat_id, 'r') as file:
        data = json.load(file)
        history = ''
        for item in data:
            name = item.get('name', '')
            message = item.get('message', '')
            if name and message:
                history += f'{name}: {message}\n'

    # Append the new message to the history
    new_history = f"{history}Yuki: {text}\nYuna:"

    # Define the URL
    url = 'http://localhost:5001/api/v1/generate'

    # Define the request payload
    payload = {
        "n": 1,
        "max_context_length": config["request"]["max_context_length"],
        "max_length": config["request"]["max_length"],
        "rep_pen": config["request"]["rep_pen"],
        "temperature": config["request"]["temperature"],
        "top_p": config["request"]["top_p"],
        "top_k": config["request"]["top_k"],
        "top_a": config["request"]["top_a"],
        "typical": config["request"]["typical"],
        "tfs": config["request"]["tfs"],
        "rep_pen_range": config["request"]["rep_pen_range"],
        "rep_pen_slope": config["request"]["rep_pen_slope"],
        "sampler_order": config["request"]["sampler_order"],
        "prompt": new_history,  # Use the updated history here
        "quiet": config["request"]["quiet"],
        "stop_sequence": config["request"]["stop_sequence"],
        "use_default_badwordsids": config["request"]["use_default_badwordsids"]
    }

    # Send a POST request to the endpoint
    response = requests.post(url, json=payload)
    response = response.json()['results'][0]['text']
    response = response.replace('\n', '')

    response = remove_emojis(str(response))

    if (config["emotions"] == False):
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

# Function to load chat history from the JSON file
def load_chat_history(chat):
    if os.path.exists(config["history"]):
        with open(config["history"] + chat, 'r') as file:
            return json.load(file)
    else:
        return []

# Function to save chat history to the JSON file
def save_chat_history(chat_history, chat):
    with open(config["history"] + chat, 'w') as file:
        json.dump(chat_history, file)

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

if "--call" in sys.argv:
    chat_id = input("Chat: ")
    listen(chat_id)