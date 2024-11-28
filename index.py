import shutil
from flask import Flask, request, jsonify, send_from_directory, redirect, url_for
from flask_login import LoginManager, UserMixin, login_required, logout_user, login_user, current_user, login_manager
from lib.router import handle_history_request, handle_image_request, handle_message_request, handle_audio_request, services, handle_search_request, handle_textfile_request, subscribe, send_notification, get_projects, create_project, get_chapters, create_chapter, get_chapter, update_paragraph, delete_paragraph, speak, create_paragraph, download_paragraph, download_chapter, download_project, delete_project, rename_project, delete_chapter, rename_chapter
from lib.history import ChatHistoryManager
from flask_cors import CORS
import json
import os
from itsdangerous import URLSafeTimedSerializer
from flask_compress import Compress
from aiflow import agi
config =  agi.get_config()
secret_key = config['security']['secret_key']
serializer = URLSafeTimedSerializer(secret_key)
login_manager = LoginManager()

class YunaServer:
    def __init__(self):
        self.app = Flask(__name__, static_folder='static')
        self.app.config.update({
            'WTF_CSRF_ENABLED': False,
            'SECRET_KEY': 'Yuna_AI_Secret_Key',
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
        self.chat_history_manager = ChatHistoryManager(config)
        self.worker = agi.AGIWorker(config)
        self.worker.start()
        self.app.errorhandler(404)(self.page_not_found)

        @self.app.after_request
        def add_cors_headers(response):
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            return response

        def add_cache_headers(response): response.headers['Cache-Control'] = 'public, max-age=300' if response.status_code < 400 else response.headers.get('Cache-Control', ''); return response

    @staticmethod
    def page_not_found(self): return f'This page does not exist.', 404

    # User model
    class User(UserMixin): pass

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
    def read_users(self): return json.load(open('db/admin/users.json', 'r')) if os.path.exists('db/admin/users.json') else {}

    # Write users to JSON file
    def write_users(self, users): json.dump(users, open('db/admin/users.json', 'w'))

    def configure_routes(self):
        self.app.route('/')(self.render_index)
        self.app.route('/<path:filename>')(self.custom_static)
        self.app.route('/yuna')(self.yuna_server)
        self.app.route('/yuna.html')(self.yuna_server)
        self.app.route('/services.html', methods=['GET'], endpoint='services')(lambda: services(self))
        self.app.route('/apple-touch-icon.png')(self.image_pwa)
        self.app.route('/main', methods=['GET', 'POST'])(self.main)
        #self.app.route('/speak', methods=['POST'], endpoint='generate_audio')(generate_audio)
        self.app.route('/history', methods=['POST'], endpoint='history')(lambda: handle_history_request(self.chat_history_manager))
        self.app.route('/message', methods=['POST'], endpoint='message')(lambda: handle_message_request(self.worker, self.chat_history_manager, config))
        self.app.route('/image', methods=['POST'], endpoint='image')(lambda: handle_image_request(self.worker, self.chat_history_manager, config))
        self.app.route('/audio', methods=['GET', 'POST'], endpoint='audio')(lambda: handle_audio_request())
        self.app.route('/projects', methods=['GET'], endpoint='get_project')(lambda: get_projects())
        self.app.route('/projects', methods=['POST'], endpoint='create_project')(lambda: create_project())
        self.app.route('/projects/<project_name>/chapters', methods=['GET'], endpoint='get_chapters')(lambda project_name: get_chapters(project_name))
        self.app.route('/projects/<project_name>/chapters', methods=['POST'], endpoint='create_chapter')(lambda project_name: create_chapter(project_name))
        self.app.route('/projects/<project_name>/chapters/<chapter_name>', methods=['GET'], endpoint='get_chapter')(lambda project_name, chapter_name: get_chapter(project_name, chapter_name))
        self.app.route('/projects/<project_name>/chapters/<chapter_name>/paragraphs/<int:index>', methods=['PUT'], endpoint='update_paragraph')(lambda project_name, chapter_name, index: update_paragraph(project_name, chapter_name, index))
        self.app.route('/projects/<project_name>/chapters/<chapter_name>/paragraphs/<int:index>', methods=['DELETE'], endpoint='delete_paragraph')(lambda project_name, chapter_name, index: delete_paragraph(project_name, chapter_name, index))
        self.app.route('/projects/<project_name>/chapters/<chapter_name>/paragraphs', methods=['POST'], endpoint='create_paragraph')(lambda project_name, chapter_name: create_paragraph(project_name, chapter_name))
        self.app.route('/download/paragraph/<project>/<chapter>/<int:index>', methods=['GET'], endpoint='download_paragraph')(lambda project, chapter, index: download_paragraph(project, chapter, index))
        self.app.route('/download/chapter/<project>/<chapter>', methods=['GET'], endpoint='download_chapter')(lambda project, chapter: download_chapter(project, chapter))
        self.app.route('/download/project/<project>', methods=['GET'], endpoint='download_project')(lambda project: download_project(project))
        self.app.route('/projects/<project_name>', methods=['DELETE'], endpoint='delete_project')(lambda project_name: delete_project(project_name))
        self.app.route('/projects/<project_name>', methods=['PUT'], endpoint='rename_project')(lambda project_name: rename_project(project_name))
        self.app.route('/projects/<project_name>/chapters/<chapter_name>', methods=['DELETE'], endpoint='delete_chapter')(lambda project_name, chapter_name: delete_chapter(project_name, chapter_name))
        self.app.route('/projects/<project_name>/chapters/<chapter_name>', methods=['PUT'], endpoint='rename_chapter')(lambda project_name, chapter_name: rename_chapter(project_name, chapter_name))
        self.app.route('/speak', methods=['POST'], endpoint='speak')(lambda: speak())        
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
                return send_from_directory('.', 'login.html')

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
                shutil.rmtree(f'db/history/{username}')
                print('Account deleted successfully')

        return send_from_directory('.', 'login.html')

    def render_index(self): return send_from_directory('.', 'index.html')
    
    @login_required
    def yuna_server(self): return send_from_directory('.', 'yuna.html')

app = YunaServer().app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4848 if config["server"]["port"] == "" else config["server"]["port"], ssl_context=('lib/utils/cert.pem', 'lib/utils/key.pem'))