import shutil
from flask import Flask, request, jsonify, send_from_directory, redirect, url_for, make_response
from flask_login import LoginManager, UserMixin, login_required, logout_user, login_user, current_user, login_manager
from lib.generate import ChatGenerator, ChatHistoryManager, get_config
from lib.router import create_project_directory, generate_audiobook, handle_history_request, handle_image_request, handle_message_request, handle_audio_request, services, handle_search_request, handle_textfile_request, merge_audiobook
from flask_cors import CORS
import json
import os
from itsdangerous import URLSafeTimedSerializer
from flask_compress import Compress
import pywebpush
from cryptography.hazmat.primitives import serialization

vapid = pywebpush.Vapid()
vapid.generate_keys()

public_key = vapid.public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo
).decode('utf-8')

private_key = vapid.private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
).decode('utf-8')

print(f"Public key: {public_key}")
print(f"Private key: {private_key}")


config =  get_config()
secret_key = config['security']['secret_key']
serializer = URLSafeTimedSerializer(secret_key)
login_manager = LoginManager()

class YunaServer:
    def __init__(self):
        self.app = Flask(__name__, static_folder='static')
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.app.secret_key = 'Yuna_AI_Secret_Key'
        self.app.config['COMPRESS_MIMETYPES'] = [
            'text/html', 
            'text/css', 
            'text/xml', 
            'application/json', 
            'application/javascript',
            'text/javascript',
            'application/x-javascript'
        ]
        self.VAPID_PRIVATE_KEY = vapid.private_key
        self.VAPID_PUBLIC_KEY = vapid.public_key
        self.VAPID_CLAIMS = {
            "sub": "mailto:your-email@himitsu.dev"
        }
        self.app.config['COMPRESS_LEVEL'] = 9 # Gzip compression level (1-9)
        self.app.config['COMPRESS_MIN_SIZE'] = 0
        Compress(self.app)
        login_manager.init_app(self.app)
        login_manager.login_view = 'main'
        login_manager.user_loader(self.user_loader)
        CORS(self.app, resources={r"/*": {"origins": "*"}})
        self.configure_routes()
        self.app.route('/subscribe', methods=['POST'])(self.subscribe)
        self.app.route('/send-notification', methods=['POST'])(self.send_notification)
        self.chat_generator = ChatGenerator(config)
        self.chat_history_manager = ChatHistoryManager(config)
        self.app.errorhandler(404)(self.page_not_found)

        @self.app.after_request
        def add_cors_headers(response):
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            return response
    
        def add_cache_headers(response):
            # Don't cache if the response is an error
            if response.status_code < 400:
                # Cache for 5 minutes (300 seconds)
                response.headers['Cache-Control'] = 'public, max-age=300'
            return response

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

    def configure_routes(self):
        self.app.route('/')(self.render_index)
        self.app.route('/<path:filename>')(self.custom_static)
        self.app.route('/yuna')(self.yuna_server)
        self.app.route('/yuna.html')(self.yuna_server)
        self.app.route('/services.html', methods=['GET'], endpoint='services')(lambda: services(self))
        self.app.route('/apple-touch-icon.png')(self.image_pwa)
        self.app.route('/main', methods=['GET', 'POST'])(self.main)
        self.app.route('/history', methods=['POST'], endpoint='history')(lambda: handle_history_request(self.chat_history_manager))
        self.app.route('/message', methods=['POST'], endpoint='message')(lambda: handle_message_request(self.chat_generator, self.chat_history_manager, config))
        self.app.route('/image', methods=['POST'], endpoint='image')(lambda: handle_image_request(self.chat_history_manager, config))
        self.app.route('/audio', methods=['GET', 'POST'], endpoint='audio')(lambda: handle_audio_request())
        self.app.route('/generate_audiobook', methods=['POST'], endpoint='generate_audiobook')(lambda: generate_audiobook())
        self.app.route('/merge_audiobook', methods=['POST'], endpoint='merge_audiobook')(lambda: merge_audiobook())
        self.app.route('/create_project_directory', methods=['POST'], endpoint='create_project')(lambda: create_project_directory())
        self.app.route('/analyze', methods=['POST'], endpoint='textfile')(lambda: handle_textfile_request(self.chat_generator))
        self.app.route('/logout', methods=['GET'])(self.logout)
        self.app.route('/search', methods=['POST'], endpoint='search')(lambda: handle_search_request())

    @staticmethod
    def pem_to_key(pem_str):
        # Remove headers and newlines
        lines = pem_str.replace('-----BEGIN PRIVATE KEY-----', '')
        lines = lines.replace('-----END PRIVATE KEY-----', '')
        lines = lines.replace('-----BEGIN PUBLIC KEY-----', '')
        lines = lines.replace('-----END PUBLIC KEY-----', '')
        return ''.join(lines.split('\n')).strip()

    def subscribe(self):
        try:
            subscription = request.json
            print("Received subscription:", subscription)  # Debug log
            
            user_id = current_user.get_id() if current_user.is_authenticated else 'anonymous'
            subscription_path = os.path.join('db', 'subscriptions', f'{user_id}.json')
            
            os.makedirs(os.path.dirname(subscription_path), exist_ok=True)
            
            with open(subscription_path, 'w') as f:
                json.dump(subscription, f)
                
            return jsonify({'success': True, 'message': 'Subscription saved'}), 200
            
        except Exception as e:
            print(f"Subscription error: {e}")  # Debug log
            return jsonify({'error': str(e)}), 500

    def send_notification(self):
        try:
            subscription = request.json.get('subscription')
            message = request.json.get('message', 'Hello from Yuna!')
            
            print(f"Sending notification to subscription: {subscription}")  # Debug log
            
            payload = json.dumps({
                'title': 'Yuna AI',
                'body': message,
                'icon': '/static/img/yuna-ai.png',
                'badge': '/static/img/yuna-girl-head.webp'
            })

            response = pywebpush(
                subscription_info=subscription,
                data=payload,
                vapid_private_key=self.VAPID_PRIVATE_KEY,
                vapid_claims=self.VAPID_CLAIMS
            )
            
            print(f"Webpush response: {response}")  # Debug log
            
            return jsonify({'success': True, 'message': 'Notification sent'}), 200
            
        except Exception as e:
            print(f"Notification error: {e}")  # Debug log
            return jsonify({'error': str(e)}), 500

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
                    print('Username already exists')
                else:
                    users[username] = password
                    self.write_users(users)
                    print('Registered successfully')
                    os.makedirs(f'db/history/{username}', exist_ok=True)
            elif action == 'login':
                if users.get(username) == password:
                    user = self.User()
                    user.id = username
                    login_user(user)
                    return redirect(url_for('yuna_server'))
                else:
                    print('Invalid username or password')
            elif action == 'change_password':
                new_password = request.form['new_password']
                if users.get(username) == password:
                    users[username] = new_password
                    self.write_users(users)
                    print('Password changed successfully')
                else:
                    print('Invalid username or password')
            elif action == 'chane_username':
                new_username = request.form['new_username']
                if users.get(username) == password:
                    users[new_username] = password
                    del users[username]
                    self.write_users(users)
                    print('Username changed successfully')
                else:
                    print('Invalid username or password')
            elif action == 'delete_account':
                if users.get(username) == password:
                    del users[username]
                    self.write_users(users)
                    print('Account deleted successfully')
                    logout_user()
                    shutil.rmtree(f'db/history/{username}')
                else:
                    print('Invalid username or password')

        # return html from the file
        return send_from_directory('.', 'login.html')

    def render_index(self):
        return send_from_directory('.', 'index.html')
    
    @login_required
    def yuna_server(self):        
        print(f'Hello, {current_user.get_id()}!')
        return send_from_directory('.', 'yuna.html')

yuna_server = YunaServer()
app = yuna_server.app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4848 if config["server"]["port"] == "" else config["server"]["port"], ssl_context=('cert.pem', 'key.pem'))