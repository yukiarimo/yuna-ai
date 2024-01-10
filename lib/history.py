import json
import os
import shutil
import subprocess
from cryptography.fernet import Fernet
from cryptography.fernet import InvalidToken

class ChatHistoryManager:
    def __init__(self, config):
        self.config = config
    
    def create_chat_history_file(self, chat_id):
        history_starting_template = [{"name": "Yuki", "message": "Hi"}, {"name": "Yuna", "message": "Hello"},{"name": "Yuki", "message": "How are you doing?"}, {"name": "Yuna", "message": "I'm doing great! Thanks for asking!"}]
        chat_history_json = json.dumps(history_starting_template)
        encrypted_chat_history = self.encrypt_data(chat_history_json)
        with open(os.path.join(self.config["server"]["history"], chat_id), 'wb') as file:
            file.write(encrypted_chat_history)

    def delete_chat_history_file(self, chat_id):
        os.remove(os.path.join(self.config["server"]["history"], chat_id))

    def rename_chat_history_file(self, chat_id, new_chat_id):
        os.rename(
            os.path.join(self.config["server"]["history"], chat_id),
            os.path.join(self.config["server"]["history"], new_chat_id)
        )

    def list_history_files(self):
        history_files = [f for f in os.listdir(self.config["server"]["history"]) if os.path.isfile(os.path.join(self.config["server"]["history"], f))]

        # Place main_history_file first and then sort alphabetically
        history_files.sort(key=lambda x: (x != self.config["server"]["default_history_file"], x.lower()))

        return history_files

    def generate_speech(self, response):
        subprocess.run(f'say "{response}" -o output', shell=True)
        shutil.move("output.aiff", "/audio/output.aiff")
        subprocess.run(f"ffmpeg -y -i '/audio/output.aiff' -b:a 192K -f mp3 static/audio/output.mp3", shell=True)

    def get_encryption_key(self):
        if 'encryption_key' not in self.config['security'] or not self.config['security']['encryption_key']:
            new_key = Fernet.generate_key()
            self.config['security']['encryption_key'] = new_key.decode()
            self.save_config()
        key = self.config['security']['encryption_key']
        return key.encode()

    def save_config(self):
        with open('static/config.json', 'w') as config_file:
            json.dump(self.config, config_file, indent=4)

    def encrypt_data(self, data):
        key = self.get_encryption_key()
        fernet = Fernet(key)
        encrypted_data = fernet.encrypt(data.encode())
        return encrypted_data

    def decrypt_data(self, encrypted_data):
        try:
            key = self.get_encryption_key()
            fernet = Fernet(key)
            decrypted_data = fernet.decrypt(encrypted_data)
        except InvalidToken:
            raise ValueError("Cannot decrypt data with the current encryption key")
        return decrypted_data

    def save_chat_history(self, chat_history, chat):
        history_path = os.path.join(self.config["server"]["history"], chat)
        chat_history_json = json.dumps(chat_history)
        encrypted_chat_history = self.encrypt_data(chat_history_json)
        with open(history_path, 'wb') as file:
            file.write(encrypted_chat_history)

    def load_chat_history(self, chat_id):
        history_path = os.path.join(self.config["server"]["history"], chat_id)
        with open(history_path, 'rb') as file:
            encrypted_chat_history = file.read()
        if not encrypted_chat_history:
            # The file is empty, create a new chat history file
            self.create_chat_history_file(chat_id)
            with open(history_path, 'rb') as file:
                encrypted_chat_history = file.read()
        try:
            decrypted_chat_history = self.decrypt_data(encrypted_chat_history)
        except InvalidToken:
            # The file is not encrypted, create a new chat history file
            self.create_chat_history_file(chat_id)
            with open(history_path, 'rb') as file:
                encrypted_chat_history = file.read()
            decrypted_chat_history = self.decrypt_data(encrypted_chat_history)
        return json.loads(decrypted_chat_history)
