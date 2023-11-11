from flask import Flask, request, jsonify
import shutil
import subprocess
from generate import generate  # Import the generate function from generate.py
import os
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

if os.path.exists("static/config.json"):
    with open("static/config.json", 'r') as file:
        config = json.load(file)

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
    history_files = [f for f in os.listdir(config["history"]) if os.path.isfile(os.path.join(config["history"], f))]
    return jsonify(history_files)

# New route to load a specific chat history file
@app.route('/load_history_file/<filename>', methods=['GET'])
def load_history_file(filename):
    history_file = os.path.join(config["history"], filename)

    if os.path.exists(history_file):
        with open(history_file, 'r') as file:
            return json.load(file)
    else:
        return []

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4848)