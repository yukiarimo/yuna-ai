import base64
from flask import Flask, request, jsonify,render_template, send_from_directory, make_response
from lib.generate import ChatGenerator, ChatHistoryManager
from lib.vision import capture_image, create_image
from pydub import AudioSegment
from flask_cors import CORS
import whisper
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash

class YunaServer:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app, resources={r"/*": {"origins": "*"}})
        self.configure_routes()
        self.load_config()
        self.chat_generator = ChatGenerator(self.config)
        self.chat_history_manager = ChatHistoryManager(self.config)

    def load_config(self):
        if os.path.exists("static/config.json"):
            with open("static/config.json", 'r') as file:
                self.config = json.load(file)

    def configure_routes(self):
        self.app.route('/')(self.render_index)
        self.app.route('/history', methods=['POST'])(self.handle_history_request)
        self.app.route('/image', methods=['POST'])(self.handle_image_request)
        self.app.route('/message', methods=['POST'])(self.handle_message_request)
        self.app.route('/audio', methods=['POST'])(self.handle_audio_request)
        self.app.route('/login', methods=['POST'])(self.handle_login)
        self.app.route('/register', methods=['POST'])(self.handle_register)
        self.app.route('/check_login', methods=['GET'])(self.check_login)

    def render_index(self):
        return send_from_directory('.', 'index.html')

    def run(self):
        self.app.run(host='0.0.0.0', port=self.config["server"]["port"])

    def handle_history_request(self):
        data = request.get_json()
        chat_id = data.get('chat')
        task = data.get('task')

        if task == 'load':
            return jsonify(self.chat_history_manager.load_chat_history(chat_id))
        elif task == 'list':
            return jsonify(self.chat_history_manager.list_history_files())
        elif task == 'edit':
            history = data.get('history')
            self.chat_history_manager.save_chat_history(history, chat_id)
            return jsonify({'response': 'History edited successfully'})
        elif task == 'create':
            self.chat_history_manager.create_chat_history_file(chat_id)
            return jsonify({'response': 'History created successfully'})
        elif task == 'delete':
            self.chat_history_manager.delete_chat_history_file(chat_id)
            return jsonify({'response': 'History deleted successfully'})
        elif task == 'rename':
            new_chat_id_name = data.get('name')
            self.chat_history_manager.rename_chat_history_file(chat_id, new_chat_id_name)
            return jsonify({'response': 'History renamed successfully'})
        else:
            return jsonify({'error': 'Invalid task parameter'}), 400

    def handle_image_request(self):
        data = request.get_json()

        if 'image' in data and 'task' in data and data['task'] == 'caption':
            image_caption = capture_image(data)
            return jsonify({'message': f'{image_caption}'})
        elif 'prompt' in data and 'chat' in data and data['task'] == 'generate':
            prompt = data['prompt']
            chat_id = data['chat']

            chat_history = self.chat_history_manager.load_chat_history(chat_id)
            chat_history.append({"name": "Yuki", "message": prompt})

            created_image = create_image(prompt)
            chat_history.append({"name": "Yuna", "message": f"Sure, here you go! <img src='static/img/art/{created_image}' class='image-message'>"})

            self.chat_history_manager.save_chat_history(chat_history, chat_id)
            yuna_image_message = f"Sure, here you go! <img src='static/img/art/{created_image}' class='image-message'>"

            return jsonify({'message': yuna_image_message})
        else:
            return jsonify({'error': 'Invalid task parameter'}), 400
        
    def handle_message_request(self):
        data = request.get_json()
        chat_id = data.get('chat')
        speech = data.get('speech')
        text = data.get('text')
        naked = data.get('naked')

        response = self.chat_generator.generate(chat_id, speech, text, naked)

        return jsonify({'response': response})
    
    def handle_audio_request(self):
        audio_data = request.files['audio']
        
        try:
            # Save the audio file
            audio_path = 'audio.wav'
            audio_data.save(audio_path)

            # Convert the audio to MP3
            mp3_path = 'audio.mp3'
            sound = AudioSegment.from_wav(audio_path)
            sound.export(mp3_path, format='mp3')

            print('Audio saved')

            result = whisper.transcribe("audio.mp3")

            return jsonify({'message': result["text"]})
        except Exception as e:
            return jsonify({'error': str(e)}), 500



    def handle_register(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        password_hash = generate_password_hash(password)
        users = self.load_users()
        if username in users:
            return jsonify({'error': 'Username already exists'}), 400
        users[username] = password_hash
        self.save_users(users)
        return jsonify({'response': 'User created successfully'})


    def handle_login(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        users = self.load_users()
        if username not in users:
            return jsonify({'error': 'Username does not exist'}), 400
        if not check_password_hash(users[username], password):
            return jsonify({'error': 'Invalid password'}), 401

        resp = make_response(jsonify({'response': 'Login successful'}))
        resp.set_cookie('login', 'true', max_age=60*60*24*7)  # Set cookie for 7 days
        return resp

    def load_users(self):
        users_file_path = os.path.join('auth', 'auth.json')
        try:
            if os.path.exists(users_file_path):
                with open(users_file_path, 'r') as file:
                    return json.load(file)
            else:
                return {}
        except json.JSONDecodeError:
            return {}

    def save_users(self, users):
        users_file_path = os.path.join('auth', 'auth.json')
        os.makedirs(os.path.dirname(users_file_path), exist_ok=True)
        with open(users_file_path, 'w') as file:
            json.dump(users, file, indent=4)


    def check_login(self):
        login_cookie = request.cookies.get('login')
        if login_cookie:
            return jsonify({'logged_in': True})
        else:
            users_file_path = os.path.join('auth', 'auth.json')
            users_exist = os.path.exists(users_file_path) and os.stat(users_file_path).st_size > 0
            return jsonify({'logged_in': False, 'users_exist': users_exist})

if __name__ == '__main__':
    yuna_server = YunaServer()
    yuna_server.run()
