import base64
from flask import Flask, request, jsonify
import shutil
import subprocess
from lib.generate import generate
from lib.generate import load_chat_history, save_chat_history
import os
import json
from flask_cors import CORS
from lib.vision import capture_image, create_image

app = Flask(__name__)
CORS(app)

if os.path.exists("static/config.json"):
    with open("static/config.json", 'r') as file:
        config = json.load(file)

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
    response = generate(chat_id)

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

        image_caption = capture_image(data)
        return jsonify({'message': f'{image_caption}'})

    # If something goes wrong or no image data is provided
    return jsonify({'error': 'Image upload failed'}), 400

@app.route('/text_to_image', methods=['POST'])
def text_to_image():
    data = request.get_json()

    prompt = data.get('prompt')
    chat_id = data.get('chat')

    # Load chat history from the JSON file when the server starts
    chat_history = load_chat_history(chat_id)

    chat_history.append({"name": "Yuki", "message": prompt})

    created_image = create_image(prompt)
    chat_history.append({"name": "Yuna", "message": f"Sure, here you go! <img src='static/img/art/{created_image}' class='image-message'>"})

    save_chat_history(chat_history, chat_id)
    yunaImageMessage = f"Sure, here you go! <img src='static/img/art/{created_image}' class='image-message'>"

    return jsonify({'message': yunaImageMessage})

# New route to list available chat history files
@app.route('/list_history_files', methods=['GET'])
def list_history_files():
    history_files = [f for f in os.listdir(config["server"]["history"]) if os.path.isfile(os.path.join(config["server"]["history"], f))]

    # Place main_history_file first and then sort alphabetically
    history_files.sort(key=lambda x: (x != config["server"]["default_history_file"], x.lower()))

    return jsonify(history_files)

# New route to load a specific chat history file
@app.route('/load_history_file/<filename>', methods=['GET'])
def load_history_file(filename):
    history_file = os.path.join(config["server"]["history"], filename)

    if os.path.exists(history_file):
        with open(history_file, 'r') as file:
            return json.load(file)
    else:
        return []

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=config["server"]["port"], debug=True)