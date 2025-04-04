import json
import os
import base64
import re
from flask import Flask, request, send_from_directory, redirect, url_for, jsonify, Response
from flask_login import LoginManager, UserMixin, login_required, logout_user, login_user, login_manager, current_user
from flask_cors import CORS
from itsdangerous import URLSafeTimedSerializer
from flask_compress import Compress
from aiflow import agi, history
from pywebpush import webpush
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
config =  agi.get_config()
secret_key = config['security']['secret_key']
serializer = URLSafeTimedSerializer(secret_key)
login_manager = LoginManager()
subscriptions = []
VAPID_PRIVATE_KEY = "x32JRDsKvbQC3VwkKqYymupvlyccXBKkrwWk1vdb88U"
VAPID_PUBLIC_KEY = "BLAWDkBakXLWfyQP5zAXR5Dyv4-W1nsRDkUk9Kw9MqKppQCdbsP-yfz7kEpAPvDMy2lszg_SZ9QEC9Uda8mpKSg"
VAPID_CLAIMS = {"sub": "mailto:yukiarimo@gmail.com"}

class YunaServer:
    def __init__(self):
        self.app = Flask(__name__, static_folder='static')
        self.app.config.update({
            'WTF_CSRF_ENABLED': False,
            'SECRET_KEY': 'Yuna_Ai_Secret_Key',
            'COMPRESS_MIMETYPES': ['text/html', 'text/css', 'text/xml', 'application/json', 'application/javascript', 'text/javascript', 'application/x-javascript'],
            'COMPRESS_LEVEL': 9,
            'COMPRESS_MIN_SIZE': 0
        })
        Compress(self.app)
        login_manager.init_app(self.app)
        login_manager.login_view = 'main'
        login_manager.user_loader(self.user_loader)
        CORS(self.app, resources={r"/*": {"origins": "*"}})
        self.configure_routes()
        self.chat_history_manager = history.ChatHistoryManager(config=config, use_file=True)
        self.worker = agi.AGIWorker(config)
        self.worker.start()
        self.app.errorhandler(404)(self.page_not_found)
        self.users_cache = None

        @self.app.after_request
        def add_cors_headers(response):
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            return response

        @self.app.after_request
        def add_cache_headers(response):
            #if request.path.startswith('/static/'): response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
            return response

    @staticmethod
    def page_not_found(self): return f'This page does not exist.', 404

    # User model
    class User(UserMixin):
        def __init__(self, id=None):
            self.id = id

    @login_manager.user_loader
    def user_loader(self, user_id):
        if user_id in self.read_users(): return self.User(id=user_id)
        return None

    def read_users(self):
        if self.users_cache is not None: return self.users_cache
        users_file = 'db/admin/users.json'
        self.users_cache = json.load(open(users_file, 'r')) if os.path.exists(users_file) else {}
        return self.users_cache

    def write_users(self, users):
        self.users_cache = users
        json.dump(users, open('db/admin/users.json', 'w'))

    def configure_routes(self):
        self.app.route('/', methods=['GET', 'POST'])(self.main)
        self.app.route('/<path:filename>')(self.custom_static)
        self.app.route('/yuna')(self.yuna_server)
        self.app.route('/yuna.html')(self.yuna_server)
        self.app.route('/apple-touch-icon.png')(self.image_pwa)
        self.app.route('/history', methods=['POST'], endpoint='history')(lambda: handle_history_request(self.chat_history_manager))
        self.app.route('/message', methods=['POST'], endpoint='message')(lambda: handle_message_request(self.worker, self.chat_history_manager, config))
        self.app.route('/image', methods=['POST'], endpoint='image')(lambda: handle_image_request(self.worker, self.chat_history_manager, config))
        self.app.route('/audio', methods=['GET', 'POST'], endpoint='audio')(lambda: handle_audio_request(self.worker))
        self.app.route('/analyze', methods=['POST'], endpoint='textfile')(lambda: handle_textfile_request(self.chat_generator))
        self.app.route('/logout', methods=['GET'])(self.logout)
        self.app.route('/search', methods=['POST'], endpoint='search')(lambda: handle_search_request(self.worker))
        self.app.route('/subscribe', methods=['POST'], endpoint='subscribe')(lambda: subscribe())
        self.app.route('/send-notification', methods=['POST'], endpoint='send_notification')(lambda: send_notification())

    def custom_static(self, filename): return send_from_directory(self.app.static_folder, 'static/' + filename if not filename.startswith(('static/', '/favicon.ico', '/manifest.json')) else filename)
    def image_pwa(self): return send_from_directory(self.app.static_folder, 'img/yuna-ai.png')

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
            if users.get(username) != password and action != 'register':
                print('Invalid username or password')
                return send_from_directory('.', 'index.html')

            if action == 'register':
                if username in users:
                    print('Username already exists')
                else:
                    users[username] = password
                    self.write_users(users)
                    os.makedirs(f'db/history/{username}', exist_ok=True)
                    print('Registered successfully')
            elif action == 'login':
                user = self.User()
                user.id = username
                login_user(user)
                return redirect(url_for('yuna_server'))
            elif action == 'change_password':
                new_password = request.form['new_password']
                users[username] = new_password
                self.write_users(users)
                print('Password changed successfully')
            elif action == 'change_username':
                new_username = request.form['new_username']
                users[new_username] = password
                del users[username]
                self.write_users(users)
                os.rename(f'db/history/{username}', f'db/history/{new_username}')
                print('Username changed successfully')
            elif action == 'delete_account':
                del users[username]
                self.write_users(users)
                logout_user()
                os.rmdir(f'db/history/{username}')
                print('Account deleted successfully')

        return send_from_directory('.', 'index.html')

    @login_required
    def yuna_server(self): return send_from_directory('.', 'yuna.html')

def update_chat_history(chat_history_manager, user_id, chat_id, text, response, config, messageId):
    """Helper function to update chat history."""

    chat_history = chat_history_manager.load_chat_history(user_id, chat_id)
    chat_history.append({"name": config['ai']['names'][0], "text": text, "data": None, "type": "text", "id": messageId})
    chat_history.append({"name": config['ai']['names'][1], "text": response, "data": None, "type": "text", "id": messageId})
    chat_history_manager.save_chat_history(chat_history, user_id, chat_id)

@login_required
def handle_history_request(chat_history_manager):
    data = request.get_json()
    chat_id = data.get('chat')
    task = data.get('task')
    user_id = current_user.get_id()

    responses = {
        'load': lambda: chat_history_manager.load_chat_history(user_id, chat_id),
        'list': lambda: chat_history_manager.list_history_files(user_id),
        'edit': lambda: {'response': 'History edited successfully'} if chat_history_manager.save_chat_history(data.get('history'), user_id, chat_id) is None else None,
        'save': lambda: {'response': 'History saved successfully'} if chat_history_manager.save_chat_history(data.get('history'), user_id, chat_id) is None else None,
        'create': lambda: {'response': 'History created successfully'} if chat_history_manager.create_chat_history_file(user_id, chat_id) is None else None,
        'delete': lambda: {'response': 'History deleted successfully'} if chat_history_manager.delete_chat_history_file(user_id, chat_id) is None else None,
        'rename': lambda: {'response': 'History renamed successfully'} if chat_history_manager.rename_chat_history_file(user_id, chat_id, data.get('name')) is None else None,
        'delete_message': lambda: {'response': 'Message deleted successfully'} if chat_history_manager.delete_message(user_id, chat_id, data.get('text')) is None else None,
        'edit_message': lambda: {'response': 'Message edited successfully'} if chat_history_manager.edit_message(user_id, chat_id, data.get('text'), data.get('new_text')) is None else None
    }

    if task in responses: return jsonify(responses[task]())
    return jsonify({'error': 'Invalid task parameter'}), 400

@login_required
def handle_message_request(worker, chat_history_manager, config):
    data = request.get_json()
    chat_id, speech, text, kanojo, useHistory, stream, messageId = (data.get(key) for key in ('chat', 'speech', 'text', 'kanojo', 'useHistory', 'stream', 'messageId'))
    yuna_config = worker.config if data.get('yunaConfig') else None
    user_id = current_user.get_id()
    chat_history = chat_history_manager.load_chat_history(current_user.get_id(), chat_id)
    response = worker.generate_text(text, kanojo, chat_history, useHistory, yuna_config, stream)

    if stream:
        def generate_stream():
            response_text = ''
            for chunk in response:
                response_text += chunk
                yield chunk
            print("Response text:", response_text)
            if useHistory:
                update_chat_history(chat_history_manager, user_id, chat_id, text, response_text, config, messageId)
                if speech: worker.speak_text(response_text)
        return Response(generate_stream(), mimetype='text/plain')
    else:
        if useHistory:
            update_chat_history(chat_history_manager, user_id, chat_id, text, response, config, messageId)
            if speech: worker.speak_text(response)
        print("Response:", response)
        return jsonify({'response': response})

@login_required
def handle_audio_request(worker):
    task = request.form.get('task')

    if task == 'transcribe':
        audio_file = request.files.get('audio')
        audio_path = 'static/audio/audio.wav'
        audio_file.save(audio_path)
        return jsonify({'text': worker.transcribe_audio(audio_path)})
    elif task == 'tts':
        worker.speak_text(request.form.get('text'))
        return jsonify({'response': 'Text-to-speech executed'})

    return jsonify({'error': 'Invalid task'}), 400

@login_required
def handle_image_request(worker, chat_history_manager, config):
    data = request.get_json()
    chat_id, use_history, speech, message_id = (data.get(key) for key in ('chat', 'useHistory', 'speech', 'messageId'))

    if data.get('task') == 'caption' and 'image' in data:
        image_path = f"static/img/call/{data.get('name')}.png"
        with open(image_path, "wb") as file: file.write(base64.b64decode(re.sub('^data:image/.+;base64,', '', data['image'])))
        image_message, image_path_resp = worker.capture_image(image_path=image_path, prompt=data.get('message'))

        if use_history:
            update_chat_history(chat_history_manager, current_user.get_id(), chat_id, f"{data.get('message')}<img src='/static/img/call/{data.get('name')}.png' class='image-message'>", image_message, config, message_id)
            if speech: worker.speak_text(image_message)

        return jsonify({'message': image_message, 'path': image_path_resp})
    return jsonify({'error': 'Invalid task parameter'}), 400

@login_required
def handle_search_request(worker):
    data = request.json
    task = data.get('task')
    if task == 'html': return jsonify({'response': worker.scrape_webpage(data.get('url'))})

    search_query = data.get('query')
    process_data = data.get('processData', False)
    answer, search_results, image_urls = worker.web_search(search_query)

    return jsonify({'message': [answer, search_results], 'images': image_urls})

@login_required
def handle_textfile_request(chat_generator):
    text_file = request.files.get('text')
    if not text_file: return jsonify({'error': 'No text file'}), 400

    query = request.form.get('query', '')
    text_file.save('static/text/content.txt')
    result = chat_generator.processTextFile('static/text/content.txt', query, 0.6)

    return jsonify({'response': result})

def subscribe():
    subscription = request.json
    if subscription not in subscriptions: subscriptions.append(subscription)
    return jsonify({'success': True})

def send_notification():
    try:
        data = request.json
        print(data)
        for subscription in subscriptions:
            webpush(
                subscription_info=subscription,
                data=json.dumps(data),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
        return jsonify({'success': True})
    except Exception as e: return jsonify({'success': False, 'error': str(e)})

app = YunaServer().app
if __name__ == '__main__': app.run(host='0.0.0.0', port=4848, ssl_context=('lib/cert.pem', 'lib/key.pem'))