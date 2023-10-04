from flask import Flask, request, render_template, jsonify, send_from_directory
import shutil
import subprocess
from generate import generate  # Import the generate function from generate.py
import os
import json
import re
from transformers import pipeline

classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")

app = Flask(__name__)

# Define the path to the chat history JSON file
history_file = 'static/db/'

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
    if os.path.exists(history_file):
        with open(history_file + chat, 'r') as file:
            return json.load(file)
    else:
        return []

# Function to save chat history to the JSON file
def save_chat_history(chat_history, chat):
    with open(history_file + chat, 'w') as file:
        json.dump(chat_history, file)

# Your existing route for rendering the HTML page
@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

# New route for sending and receiving messages
@app.route('/send_message', methods=['POST'])
def send_message():
    message = request.form.get('message')  # Get the message from the request
    chat_id = request.form.get('chat')

    # Load chat history from the JSON file when the server starts
    chat_history = load_chat_history(chat_id)

    messageOriginal = message
    message = message.replace("<tts>", "")

    # Append the message to the chat history
    chat_history.append({"name": "Yuki", "message": message})
    # Save the updated chat history to the JSON file
    save_chat_history(chat_history, chat_id)
    # Call the generate function to get a response
    response = generate(message, chat_id)
    response = remove_emojis(response)
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
    # Append the message to the chat history
    chat_history.append({"name": "Yuna", "message": response})
    # Save the updated chat history to the JSON file
    save_chat_history(chat_history, chat_id)

    if "<tts>" in messageOriginal:
        subprocess.run(f'say "{response}" -o output', shell=True)
        shutil.move("output.aiff", "static/audio/output.aiff")
        subprocess.run(f"ffmpeg -y -i 'static/audio/output.aiff' -b:a 192K -f mp3 static/audio/output.mp3", shell=True)

    return jsonify({'response': response})

# New route for sending and receiving messages
@app.route('/edit_history', methods=['POST'])
def edit_history():
    history = json.loads(request.form.get('history'))  # Get the message from the request
    chat_id = request.form.get('chat')
    save_chat_history(history, chat_id)

    return jsonify({'response': "response"})

# New route for uploading a captured image
@app.route('/upload_captured_image', methods=['POST'])
def upload_captured_image():
    data = request.get_json()
    if 'image' in data:
        image_data_url = data['image']

        # Decode the base64 image data URL and process it as needed
        # You can use a library like Pillow to save or manipulate the image

        # Respond with a success message
        print('ok')
        return jsonify({'message': 'Captured image received and processed successfully'})

    print('shit')
    # If something goes wrong or no image data is provided
    return jsonify({'error': 'Image upload failed'}), 400

# New route to list available chat history files
@app.route('/list_history_files', methods=['GET'])
def list_history_files():
    history_dir = 'static/db/'
    history_files = [f for f in os.listdir(history_dir) if os.path.isfile(os.path.join(history_dir, f))]
    return jsonify(history_files)

# New route to load a specific chat history file
@app.route('/load_history_file/<filename>', methods=['GET'])
def load_history_file(filename):
    history_dir = 'static/db/'
    history_file = os.path.join(history_dir, filename)

    if os.path.exists(history_file):
        with open(history_file, 'r') as file:
            return json.load(file)
    else:
        return []

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4848)