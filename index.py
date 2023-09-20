from flask import Flask, request, render_template, jsonify, send_from_directory
import shutil
import subprocess
from generate import generate  # Import the generate function from generate.py
import os
import json
import re

app = Flask(__name__)

# Define the path to the chat history JSON file
history_file = 'static/db/history.json'

def remove_emojis(input_string):
    # Define a regular expression pattern to match emojis
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

    # Use the sub() method to remove emojis
    cleaned_string = emoji_pattern.sub(r'', input_string)

    return cleaned_string

# Function to load chat history from the JSON file
def load_chat_history():
    if os.path.exists(history_file):
        with open(history_file, 'r') as file:
            return json.load(file)
    else:
        return []

# Function to save chat history to the JSON file
def save_chat_history(chat_history):
    with open(history_file, 'w') as file:
        json.dump(chat_history, file)

# Your existing route for rendering the HTML page
@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

# New route for sending and receiving messages
@app.route('/send_message', methods=['POST'])
def send_message():
    # Load chat history from the JSON file when the server starts
    chat_history = load_chat_history()
    message = request.form.get('message')  # Get the message from the request

    if "<tts>" in message:
        message = message.replace("<tts>", "")
        # Append the message to the chat history
        chat_history.append({"name": "Yuki", "message": message})
        # Save the updated chat history to the JSON file
        save_chat_history(chat_history)
        # Call the generate function to get a response
        response = generate(message)
        response = remove_emojis(response)
        # Append the message to the chat history
        chat_history.append({"name": "Yuna", "message": response})
        # Save the updated chat history to the JSON file
        save_chat_history(chat_history)

        subprocess.run(f'say "{response}" -o output', shell=True)
        shutil.move("output.aiff", "static/audio/output.aiff")
    else:
        # Append the message to the chat history
        chat_history.append({"name": "Yuki", "message": message})
        # Save the updated chat history to the JSON file
        save_chat_history(chat_history)
        # Call the generate function to get a response
        response = generate(message)
        response = remove_emojis(response)
        # Append the message to the chat history
        chat_history.append({"name": "Yuna", "message": response})
        # Save the updated chat history to the JSON file
        save_chat_history(chat_history)

    return jsonify({'response': response})

# New route for fetching chat history
@app.route('/history', methods=['GET'])
def get_history():
    # Load chat history from the JSON file when the server starts
    chat_history = load_chat_history()
    return jsonify(chat_history)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4848)