import asyncio
import websockets
import json
from flask import jsonify, request, send_from_directory
from flask_login import current_user
from pydub import AudioSegment
import whisper
from lib.vision import capture_image, create_image

def handle_history_request(chat_history_manager):
    data = request.get_json()
    chat_id = data.get('chat')
    task = data.get('task') 

    if task == 'load':
        return jsonify(chat_history_manager.load_chat_history(list({current_user.get_id()})[0], chat_id))
    elif task == 'list':
        return jsonify(chat_history_manager.list_history_files({current_user.get_id()}))
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
        
async def handle_message_request(chat_generator, chat_history_manager, chat_id=None, speech=None, text=None, template=None, conn=None):
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

    response = chat_generator.generate(chat_id, speech, text, template, chat_history_manager, conn)

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
    
async def handle_image_request(self, websocket):
    data = request.get_json()

    if 'image' in data and 'task' in data and data['task'] == 'caption':
        image_caption = capture_image(data)
        await websocket.send(json.dumps({'message': image_caption}))

    elif 'prompt' in data and 'chat' in data and data['task'] == 'generate':
        prompt = data['prompt']
        chat_id = data['chat']

        chat_history = self.chat_history_manager.load_chat_history(chat_id)
        chat_history.append({"name": self.config['ai']['names'][0], "message": prompt})

        created_image = create_image(prompt)
        chat_history.append({"name": self.config['ai']['names'][1], "message": f"Sure, here you go! <img src='img/art/{created_image}' class='image-message'>"})

        self.chat_history_manager.save_chat_history(chat_history, chat_id)
        yuna_image_message = f"Sure, here you go! <img src='img/art/{created_image}' class='image-message'>"

        await websocket.send(json.dumps({'message': f"Image created: {created_image}"}))
    else:
        return jsonify({'error': 'Invalid task parameter'}), 400
    
def services(self):
    return send_from_directory('.', 'services.html')
    
def pricing(self):
    return send_from_directory('.', 'pricing.html')