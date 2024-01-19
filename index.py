import random
from flask import Flask, get_flashed_messages, make_response, request, jsonify, send_from_directory, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_required, logout_user, login_user, current_user
from lib.generate import ChatGenerator, ChatHistoryManager
from lib.vision import capture_image, create_image
from lib.router import handle_history_request, handle_message_request
from pydub import AudioSegment
from flask_cors import CORS
import whisper
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from flask_login import login_manager

with open('static/config.json', 'r') as config_file:
    config = json.load(config_file)
secret_key = config['security']['secret_key']
serializer = URLSafeTimedSerializer(secret_key)
login_manager = LoginManager()

class YunaServer:
    def __init__(self):
        self.app = Flask(__name__, static_folder='static')
        self.app.secret_key = 'Yuna_AI_Secret_Key'
        login_manager.init_app(self.app)
        login_manager.login_view = 'main'
        login_manager.user_loader(self.user_loader)
        CORS(self.app, resources={r"/*": {"origins": "*"}})
        self.configure_routes()
        self.load_config()
        self.chat_generator = ChatGenerator(self.config)
        self.chat_history_manager = ChatHistoryManager(self.config)
        self.app.errorhandler(404)(self.page_not_found)

    @staticmethod
    def page_not_found(self):
        return f'This page does not exist.', 404

    # User model
    class User(UserMixin):
        pass

    # User loader function
    @login_manager.user_loader
    def user_loader(self, user_id):
        print(f"User loader is running. User ID: {user_id}")  # Debugging line
        users = self.read_users()
        if user_id in users:
            user = self.User()
            user.id = user_id
            print(f"User {user_id} found in users.")  # Debugging line
            return user
        print(f"User {user_id} not found in users.")  # Debugging line
        return None

    # Read users from JSON file
    def read_users(self):
        if os.path.exists('static/db/admin/users.json'):
            with open('static/db/admin/users.json', 'r') as f:
                users = json.load(f)
        else:
            users = {}
        return users

    # Write users to JSON file
    def write_users(self, users):
        with open('static/db/admin/users.json', 'w') as f:
            json.dump(users, f)
            
    def load_config(self):
        if os.path.exists("static/config.json"):
            with open("static/config.json", 'r') as file:
                self.config = json.load(file)

    def configure_routes(self):
        self.app.route('/')(self.render_index)
        self.app.route('/<path:filename>')(self.custom_static)
        self.app.route('/yuna')(self.yuna_server)
        self.app.route('/check_login_and_redirect')(self.check_login_and_redirect)
        self.app.route('/flash-messages')(self.flash_messages)
        self.app.route('/main', methods=['GET', 'POST'])(self.main)
        self.app.route('/history', methods=['POST'], endpoint='history')(lambda: handle_history_request(self.chat_history_manager))
        self.app.route('/message', methods=['POST'], endpoint='message')(lambda: handle_message_request(self.chat_generator, self.chat_history_manager))
        self.app.route('/image', methods=['POST'])(self.handle_image_request)
        self.app.route('/audio', methods=['POST'])(self.handle_audio_request)
        self.app.route('/login', methods=['POST'])(self.handle_login)
        self.app.route('/register', methods=['POST'])(self.handle_register)
        self.app.route('/check_login', methods=['GET'])(self.check_login)
        self.app.route('/services', methods=['GET'])(self.services)
        self.app.route('/pricing', methods=['GET'])(self.pricing)

    def custom_static(self, filename):
        print(app.static_folder, "---", filename)
        return send_from_directory(app.static_folder, filename)

    @login_required
    def logout(self):
        logout_user()
        return redirect(url_for('main'))
    
    def services(self):
        return send_from_directory('.', 'services.html')
    
    def pricing(self):
        return send_from_directory('.', 'pricing.html')

    def main(self):
        if request.method == 'POST':
            action = request.form['action']
            username = request.form['username']
            password = request.form['password']

            print(action, username, password)

            users = self.read_users()
            if action == 'register':
                if username in users:
                    flash('Username already exists')
                else:
                    users[username] = password
                    self.write_users(users)
                    flash('Registered successfully')
            elif action == 'login':
                print('login action triggered for')
                if users.get(username) == password:
                    user = self.User()
                    user.id = username
                    login_user(user)
                    return redirect(url_for('yuna_server'))
                else:
                    flash('Invalid username or password')
            elif action == 'change_password':
                new_password = request.form['new_password']
                if users.get(username) == password:
                    users[username] = new_password
                    self.write_users(users)
                    flash('Password changed successfully')
                else:
                    flash('Invalid username or password')
            elif action == 'chane_username':
                new_username = request.form['new_username']
                if users.get(username) == password:
                    users[new_username] = password
                    del users[username]
                    self.write_users(users)
                    flash('Username changed successfully')
                else:
                    flash('Invalid username or password')
            elif action == 'delete_account':
                if users.get(username) == password:
                    del users[username]
                    self.write_users(users)
                    flash('Account deleted successfully')
                else:
                    flash('Invalid username or password')

        # return html from the file
        return send_from_directory('.', 'login.html')

    def render_index(self):
        return send_from_directory('.', 'index.html')
    
    def check_login_and_redirect(self):
        if current_user.is_authenticated:
            print("User is logged in")
            return redirect(url_for('yuna_server'))
        else:
            print("User is not logged in")
            return redirect(url_for('main'))
        
    def flash_messages(self):
        messages = get_flashed_messages()
        return jsonify(messages)
    
    @login_required
    def yuna_server(self):
        # generate a random number and set it as a flash message
        random_number = random.randint(1, 100)
        flash(f'Random number: {random_number}')
        return send_from_directory('.', 'yuna.html')
        #return 'Hello, {}!'.format(current_user.get_id())

    def handle_image_request(self):
        data = request.get_json()

        if 'image' in data and 'task' in data and data['task'] == 'caption':
            image_caption = capture_image(data)
            return jsonify({'message': f'{image_caption}'})
        elif 'prompt' in data and 'chat' in data and data['task'] == 'generate':
            prompt = data['prompt']
            chat_id = data['chat']

            chat_history = self.chat_history_manager.load_chat_history(chat_id)
            chat_history.append({"name": self.config['ai']['names'][0], "message": prompt})

            created_image = create_image(prompt)
            chat_history.append({"name": self.config['ai']['names'][1], "message": f"Sure, here you go! <img src='img/art/{created_image}' class='image-message'>"})

            self.chat_history_manager.save_chat_history(chat_history, chat_id)
            yuna_image_message = f"Sure, here you go! <img src='img/art/{created_image}' class='image-message'>"

            return jsonify({'message': yuna_image_message})
        else:
            return jsonify({'error': 'Invalid task parameter'}), 400

    
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
            
        session_token = serializer.dumps({'username': username})
        resp = make_response(jsonify({'response': 'Login successful'}))
        resp.set_cookie('session_token', session_token, max_age=60*60*24*7, httponly=True, secure=True)
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
        session_token = request.cookies.get('session_token')
        users_file_path = os.path.join('auth', 'auth.json')
        users_exist = os.path.exists(users_file_path) and os.stat(users_file_path).st_size > 0
        if session_token:
            try:
                session_data = serializer.loads(session_token, max_age=60*60*24*7)
                username = session_data['username']
                return jsonify({'logged_in': True, 'username': username})
            except (BadSignature, SignatureExpired):
                return jsonify({'logged_in': False, 'users_exist': users_exist})
        else:
            return jsonify({'logged_in': False, 'users_exist': users_exist})

    def handle_change_password(self):
        data = request.get_json()
        username = request.cookies.get('username')
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        users = self.load_users()
        if not check_password_hash(users[username], current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401
        users[username] = generate_password_hash(new_password)
        self.save_users(users)
        return jsonify({'response': 'Password changed successfully'})

    def handle_logout(self):
        resp = make_response(jsonify({'response': 'Logout successful'}))
        resp.set_cookie('session_token', '', expires=0)
        return resp

yuna_server = YunaServer()
app = yuna_server.app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=yuna_server.config["server"]["port"])