from flask import Flask, request, render_template, jsonify
from flask_csp import csp
from generate import generate  # Import the generate function from generate.py
import os
import json

app = Flask(__name__)
app.config['CSP_DEFAULT_SRC'] = "'self'"

# Define your CSP policy
csp.policy = ({
    'default-src': "'self'",
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'static/'],
    'style-src': "'self'",
    'img-src': "'self'",
    'font-src': "'self'",
    'connect-src': "'self'",
})

# Define the path to the chat history JSON file
history_file = 'static/db/history.json'

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

    # Append the message to the chat history
    chat_history.append({"name": "Yuki", "message": message})

    # Save the updated chat history to the JSON file
    save_chat_history(chat_history)

    # Call the generate function to get a response
    response = generate(message)

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
    app.run(port=4848)