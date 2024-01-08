from flask import Flask, request, jsonify
from lib.generate import ChatGenerator, ChatHistoryManager
from lib.vision import capture_image, create_image
from pydub import AudioSegment
from flask_cors import CORS
import whisper
import json
import os

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
        self.app.route('/history', methods=['POST'])(self.handle_history_request)
        self.app.route('/image', methods=['POST'])(self.handle_image_request)
        self.app.route('/message', methods=['POST'])(self.handle_message_request)
        self.app.route('/audio', methods=['POST'])(self.handle_audio_request)
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
        template = data.get('template')

        # Print all the data received from the client in the terminal for debugging in the table format
        print(f"""
        chat_id: {chat_id}
        speech: {speech}
        text: {text}
        template: {template}
        """)

        response = self.chat_generator.generate(chat_id, speech, text, template)

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

if __name__ == '__main__':
    yuna_server = YunaServer()
    yuna_server.run()
