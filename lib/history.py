import json
import os
import shutil
import subprocess

class ChatHistoryManager:
    def __init__(self, config):
        self.config = config

    def create_chat_history_file(self, chat_id):
        history_starting_template = [{"name": "Yuki", "message": "Hi"}, {"name": "Yuna", "message": "Hello"}]
        with open(os.path.join(self.config["server"]["history"], chat_id), 'w') as file:
            json.dump(history_starting_template, file)

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

    def load_chat_history(self, chat):
        print(self.config["server"]["history"], chat)
        print(chat)
        history_path = os.path.join(self.config["server"]["history"], chat)
        if os.path.exists(history_path):
            with open(history_path, 'r') as file:
                return json.load(file)
        else:
            return []

    def save_chat_history(self, chat_history, chat):
        history_path = os.path.join(self.config["server"]["history"], chat)
        with open(history_path, 'w') as file:
            json.dump(chat_history, file)

    def generate_speech(self, response):
        subprocess.run(f'say "{response}" -o output', shell=True)
        shutil.move("output.aiff", "static/audio/output.aiff")
        subprocess.run(f"ffmpeg -y -i 'static/audio/output.aiff' -b:a 192K -f mp3 static/audio/output.mp3", shell=True)