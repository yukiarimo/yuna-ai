import random
from flask import Flask, get_flashed_messages, request, jsonify, send_from_directory, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_required, logout_user, login_user, current_user
from lib.generate import ChatGenerator, ChatHistoryManager
from lib.router import handle_history_request, handle_image_request, handle_message_request, handle_audio_request, services, pricing
from flask_cors import CORS
import json
import os
from itsdangerous import URLSafeTimedSerializer
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
        self.app.route('/flash-messages')(self.flash_messages)
        self.app.route('/main', methods=['GET', 'POST'])(self.main)
        self.app.route('/history', methods=['POST'], endpoint='history')(lambda: handle_history_request(self.chat_history_manager))
        self.app.route('/message', methods=['POST'], endpoint='message')(lambda: handle_message_request(self.chat_generator, self.chat_history_manager))
        self.app.route('/image', methods=['POST'], endpoint='image')(lambda: handle_image_request(self))
        self.app.route('/audio', methods=['POST'], endpoint='audio')(lambda: handle_audio_request(self))
        self.app.route('/logout', methods=['POST'])(self.logout)
        self.app.route('/services', methods=['GET'], endpoint='services')(lambda: services(self))
        self.app.route('/pricing', methods=['GET'], endpoint='pricing')(lambda: pricing(self))

    def custom_static(self, filename):
        return send_from_directory(app.static_folder, filename)

    @login_required
    def logout(self):
        logout_user()
        return redirect(url_for('main'))

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

    def flash_messages(self):
        messages = get_flashed_messages()
        return jsonify(messages)
    
    @login_required
    def yuna_server(self):
        # generate a random number and set it as a flash message
        random_number = random.randint(1, 100)
        flash(f'Random number: {random_number}')
        
        # send flash message "Hello, {username}!"
        flash(f'Hello, {current_user.get_id()}!')
        return send_from_directory('.', 'yuna.html')

yuna_server = YunaServer()
app = yuna_server.app

if __name__ == '__main__':
    if yuna_server.config["server"]["port"] != "":
        app.run(host='0.0.0.0', port=yuna_server.config["server"]["port"])
    else:
        app.run(host='0.0.0.0', port=4848)