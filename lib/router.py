import base64
import datetime
import json
import re
from flask import jsonify, request, send_from_directory
from flask_login import current_user, login_required
from pydub import AudioSegment
import whisper
from lib.vision import capture_image, create_image

@login_required
def handle_history_request(chat_history_manager):
    data = request.get_json()
    chat_id = data.get('chat')
    task = data.get('task')

    if task == 'load':
        return jsonify(chat_history_manager.load_chat_history(list({current_user.get_id()})[0], chat_id))
    elif task == 'list':
        return jsonify(chat_history_manager.list_history_files(current_user.get_id()))
    elif task == 'edit':
        history = data.get('history')
        chat_history_manager.save_chat_history(history, list({current_user.get_id()})[0], chat_id)
        return jsonify({'response': 'History edited successfully'})
    elif task == 'create':
        chat_history_manager.create_chat_history_file(list({current_user.get_id()})[0], chat_id)
        return jsonify({'response': 'History created successfully'})
    elif task == 'delete':
        chat_history_manager.delete_chat_history_file(list({current_user.get_id()})[0], chat_id)
        return jsonify({'response': 'History deleted successfully'})
    elif task == 'rename':
        new_chat_id_name = data.get('name')
        chat_history_manager.rename_chat_history_file(list({current_user.get_id()})[0], chat_id, new_chat_id_name)
        return jsonify({'response': 'History renamed successfully'})
    else:
        return jsonify({'error': 'Invalid task parameter'}), 400
        
def handle_message_request(chat_generator, chat_history_manager, chat_id=None, speech=None, text=None, template=None):
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

    response = chat_generator.generate(chat_id, speech, text, template, chat_history_manager)

    print('response -> ', response)

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
    
def handle_image_request(chat_history_manager, self):
    data = request.get_json()
    chat_id = data.get('chat')

    if 'image' in data and 'task' in data and data['task'] == 'caption':
        image_data_url = data['image']
        # Remove the MIME type and encoding from the start of the Data URL
        image_base64_str = re.sub('^data:image/.+;base64,', '', image_data_url)
        # Decode the base64 string
        image_raw_data = base64.b64decode(image_base64_str)
        # Save the image with the current time in milliseconds as the name
        current_time_milliseconds = data['name']
        image_path = f"static/img/call/{current_time_milliseconds}.png"
        with open(image_path, "wb") as file:
            file.write(image_raw_data)
        image_data = capture_image(image_path, data.get('message'), use_cpu=False)

        chat_history = chat_history_manager.load_chat_history(list({current_user.get_id()})[0], chat_id)
        chat_history.append({"name": self.config['ai']['names'][0], "message": f"{data.get('prompt')}<img src='/static/img/call/{current_time_milliseconds}.png' class='image-message'>"})
        chat_history.append({"name": self.config['ai']['names'][1], "message": image_data[0]})

        # Save the chat history
        chat_history_manager.save_chat_history(chat_history, list({current_user.get_id()})[0], chat_id)

        return jsonify({'message': image_data[0], 'path': image_data[1]})

    elif 'prompt' in data and 'chat' in data and data['task'] == 'generate':
        prompt = data['prompt']
        chat_id = data['chat']

        chat_history = chat_history_manager.load_chat_history(chat_id)
        chat_history.append({"name": self.config['ai']['names'][0], "message": prompt})

        created_image = create_image(prompt)
        chat_history.append({"name": self.config['ai']['names'][1], "message": f"Sure, here you go! <img src='img/art/{created_image}' class='image-message'>"})

        chat_history_manager.save_chat_history(chat_history, chat_id)
        yuna_image_message = f"Sure, here you go! <img src='img/art/{created_image}' class='image-message'>"

        return jsonify({'message': yuna_image_message})
    else:
        return jsonify({'error': 'Invalid task parameter'}), 400
    
def services(self):
    return send_from_directory('.', 'services.html')