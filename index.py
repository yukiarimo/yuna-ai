import shutil
from flask import Flask, get_flashed_messages, request, jsonify, send_from_directory, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_required, logout_user, login_user, current_user
from lib.generate import ChatGenerator, ChatHistoryManager
from lib.router import handle_history_request, handle_image_request, handle_message_request, handle_audio_request, services
from flask_cors import CORS
import json
import os
from itsdangerous import URLSafeTimedSerializer
from flask_login import login_manager
from flask_compress import Compress

with open('static/config.json', 'r') as config_file:
    config = json.load(config_file)
secret_key = config['security']['secret_key']
serializer = URLSafeTimedSerializer(secret_key)
login_manager = LoginManager()

class YunaServer:
    def __init__(self):
        self.app = Flask(__name__, static_folder='static')
        self.app.secret_key = 'Yuna_AI_Secret_Key'
        self.app.config['COMPRESS_ALGORITHM'] = ['br', 'gzip']
        self.app.config['COMPRESS_LEVEL'] = 6
        self.app.config['COMPRESS_MIMETYPES'] = ['text/html', 'text/css', 'text/xml', 'application/json', 'application/javascript']
        Compress(self.app)
        login_manager.init_app(self.app)
        login_manager.login_view = 'main'
        login_manager.user_loader(self.user_loader)
        CORS(self.app, resources={r"/*": {"origins": "*"}})
        self.configure_routes()
        self.load_config()
        self.chat_generator = ChatGenerator(self.config)
        self.chat_history_manager = ChatHistoryManager(self.config, self)
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
        users = self.read_users()
        if user_id in users:
            user = self.User()
            user.id = user_id
            print(f"User {user_id} found in users.")  # Debugging line
            return user
        return None

    # Read users from JSON file
    def read_users(self):
        if os.path.exists('db/admin/users.json'):
            with open('db/admin/users.json', 'r') as f:
                users = json.load(f)
        else:
            users = {}
        return users

    # Write users to JSON file
    def write_users(self, users):
        with open('db/admin/users.json', 'w') as f:
            json.dump(users, f)
            
    def load_config(self):
        if os.path.exists("static/config.json"):
            with open("static/config.json", 'r') as file:
                self.config = json.load(file)

    def configure_routes(self):
        self.app.route('/')(self.render_index)
        self.app.route('/<path:filename>')(self.custom_static)
        self.app.route('/yuna')(self.yuna_server)
        self.app.route('/yuna.html')(self.yuna_server)
        self.app.route('/apple-touch-icon.png')(self.image_pwa)
        self.app.route('/flash-messages')(self.flash_messages)
        self.app.route('/main', methods=['GET', 'POST'])(self.main)
        self.app.route('/history', methods=['POST'], endpoint='history')(lambda: handle_history_request(self.chat_history_manager))
        self.app.route('/message', methods=['POST'], endpoint='message')(lambda: handle_message_request(self.chat_generator, self.chat_history_manager))
        self.app.route('/image', methods=['POST'], endpoint='image')(lambda: handle_image_request(self.chat_history_manager, self))
        self.app.route('/audio', methods=['POST'], endpoint='audio')(lambda: handle_audio_request(self))
        self.app.route('/logout', methods=['GET'])(self.logout)
        self.app.route('/services.html', methods=['GET'], endpoint='services')(lambda: services(self))

    def custom_static(self, filename):
        if not filename.startswith('static/') and not filename.startswith('/favicon.ico') and not filename.startswith('/manifest.json'):
            filename = 'static/' + filename
        return send_from_directory(self.app.static_folder, filename)
    
    def image_pwa(self):
        return send_from_directory(self.app.static_folder, 'img/yuna-ai.png')

    @login_required
    def logout(self):
        logout_user()
        print('User logged out')
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
                    os.makedirs(f'db/history/{username}', exist_ok=True)
            elif action == 'login':
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
                    logout_user()
                    shutil.rmtree(f'db/history/{username}')
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