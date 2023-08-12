import os
import json
import requests
from flask import Flask, request, jsonify, render_template
import shutil
from subprocess import check_output
import time

app = Flask(__name__)

# Load the OpenAI API key from the environment variables
open_ai_api_key = os.getenv("OPEN_AI_API_KEY")

# Set the view engine to EJS
app.jinja_env.add_extension("pyjade.ext.jinja.PyJadeExtension")

# Set the directory to store uploaded images
image_directory = "./public/img/vision"

# Helper function to execute commands in the terminal
def execute_command(command):
    return check_output(command, shell=True, text=True)

# Routes

@app.route('/')
def index():
    return render_template("index.jade")

@app.route('/ai', methods=['POST'])
def ai():
    try:
        data = request.json["data"]
        data_type = request.json["type"]
        result = ai_send(data, data_type)
        return jsonify(result)
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred"}), 500

@app.route('/tell', methods=['POST'])
def tell():
    try:
        data = request.json["data"].replace(" ", "+")
        response = requests.post("http://localhost:3003/tell", json={"json": data})
        return jsonify({"message": response.text})
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred"}), 500

@app.route('/request')
def request_data():
    current_time = int(time.time())
    response = {
        "time": current_time + 5,
        "text": "Hello"
    }
    print(response)
    return jsonify(response)

@app.route('/dialog')
def dialog():
    result = dialog_view("", 1)
    return jsonify(result)

@app.route('/upload', methods=['POST'])
def upload():
    try:
        image_file = request.files['image']
        if not image_file:
            return jsonify({"error": "No image file found"}), 400
        
        # Save the image with a unique name
        file_name = str(int(time.time())) + '_'
        image_path = os.path.join(image_directory, file_name)
        image_file.save(image_path)
        
        print('Image file saved')
        print(image_path)

        response = requests.post("http://localhost:3004/vision", json={"file": image_path})
        return jsonify({"message": response.text})
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred"}), 500

def dialog_view(data, work, user=""):
    if work == 1:
        with open('./public/db/dialog.json', 'r') as f:
            dialog = json.load(f)
        return dialog
    elif work == 2:
        with open('./public/db/dialog.json', 'r') as f:
            dialog = json.load(f)
        msg2dialog = {
            "sender": user,
            "content": data
        }
        dialog["messages"].append(msg2dialog)
        with open('./public/db/dialog.json', 'w') as f:
            json.dump(dialog, f)

def ai_send(data, data_type):
    dialog_view(data, 2, "user")
    if data_type == "general":
        try:
            command = f'curl -X POST -H "Content-Type: application/json" -d \'{{"json": "{data}"}}\' http://localhost:3008/classify'
            stdout = execute_command(command)
            print(stdout)
            if '<dialog>' in stdout:
                command = f'curl -X POST -H "Content-Type: application/json" -d \'{{"json": "{data}"}}\' http://localhost:3001/yuna'
                stdout = execute_command(command)
            else:
                command = f'curl -X POST -H "Content-Type: application/json" -d \'{{"json": "{data}"}}\' http://localhost:3007/generate'
                stdout = execute_command(command)
            print('return = ' + stdout)
            dialog_view(stdout, 2, "bot")
            return stdout
        except Exception as e:
            print(e)
            raise e
    elif data_type == "yuna":
        try:
            command = f'curl -X POST -H "Content-Type: application/json" -d \'{{"json": "{data}"}}\' http://localhost:3001/yuna'
            stdout = execute_command(command)
            dialog_view(stdout, 2, "bot")
            return stdout
        except Exception as e:
            print(e)
            raise e
    elif data_type == "search":
        try:
            command = f'curl -X POST -H "Content-Type: application/json" -d \'{{"json": "{data}"}}\' http://localhost:3003/search'
            stdout = execute_command(command)
            dialog_view(stdout, 2, "bot")
            return stdout
        except Exception as e:
            print(e)
            raise e
    elif data_type == "gpt":
        try:
            chat_gpt_result = yuna_gpt()
            dialog_view(str(chat_gpt_result), 2, "bot")
            return chat_gpt_result
        except Exception as e:
            print(f'yuna_gpt error: {e}')
            raise e

def yuna_gpt():
    def GPT35_turbo(message):
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {open_ai_api_key}"},
            json={"model": "gpt-3.5-turbo", "messages": message},
        )
        return response.json()["choices"][0]["message"]["content"]

    def get_chat_response(chat_history):
        response = GPT35_turbo(chat_history)
        chat_history.append({"role": "assistant", "content": response})
        return chat_history

    try:
        with open('./public/db/dialog.json', 'r') as f:
            dialog = json.load(f)
        
        chat_history = [
            {"role": "user", "content": message["content"]}
            for message in dialog["messages"]
            if message["sender"] == "user" or message["sender"] == "other"
        ]
        final_response = get_chat_response(chat_history)
        chat_gpt = final_response[-1]["content"]
        return chat_gpt
    except Exception as e:
        print(e)

if __name__ == '__main__':
    app.run(host='localhost', port=3000)
