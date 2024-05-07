import base64
import re
from flask import jsonify, request, send_from_directory
from flask_login import current_user, login_required
from lib.vision import capture_image, create_image
from lib.agiTextWorker import agiTextWorker
from lib.search import search_web
from lib.audio import transcribe_audio, load_model, speak_text

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
    elif task == 'save':
        history = data.get('history')
        chat_history_manager.save_chat_history(history, list({current_user.get_id()})[0], chat_id)
        return jsonify({'response': 'History saved successfully'})
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
    elif task == 'delete_message':
        text = data.get('text')
        chat_history_manager.delete_message(list({current_user.get_id()})[0], chat_id, text)
        return jsonify({'response': 'Message deleted successfully'})
    else:
        return jsonify({'error': 'Invalid task parameter'}), 400

@login_required
def handle_message_request(chat_generator, chat_history_manager, chat_id=None, speech=None, text=None, template=None):
    data = request.get_json()
    chat_id = data.get('chat')
    speech = data.get('speech')
    text = data.get('text')
    template = data.get('template')
    response = chat_generator.generate(chat_id, speech, text, template, chat_history_manager)
    return jsonify({'response': response})

@login_required
def handle_audio_request(self):
    task = request.form['task']

    if task == 'transcribe':
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file'}), 400

        audio_file = request.files['audio']
        save_dir_audio = 'static/audio/audio.wav'
        audio_file.save(save_dir_audio)

        result = transcribe_audio(save_dir_audio)
        return jsonify({'text': result})

    elif task == 'tts':
        xtts_checkpoint = "/Users/yuki/Documents/Github/yuna-ai/lib/models/agi/yuna-talk/yuna-talk.pth"
        xtts_config = "/Users/yuki/Documents/Github/yuna-ai/lib/models/agi/yuna-talk/config.json"
        xtts_vocab = "/Users/yuki/Documents/Github/yuna-ai/lib/models/agi/yuna-talk/vocab.json"
        load_model(xtts_checkpoint, xtts_config, xtts_vocab)

        print("Running TTS...")
        text = """Huh? Is this a mistake? I looked over at Mom and Dad. They looked…amazed. Was this for real? In the world of Oudegeuz, we have magic. I was surprised when I first awakened to it—there wasn’t any in my last world, after all."""
        result = speak_text(text, "/Users/yuki/Downloads/orig.wav", "response.wav")

    return jsonify({'response': result})

@login_required
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

@login_required
def handle_search_request(self):
    data = request.get_json()
    search_query = data.get('query')
    url = search_query
    processData = data.get('processData')

    if processData == True:
        url = data.get('url')

    result = search_web(search_query, url, processData) 

    return jsonify({'message': result})

@login_required
def handle_textfile_request(self):
    if 'text' not in request.files:
        return jsonify({'error': 'No text file'}), 400

    text_file = request.files['text']
    query = request.form['query']
    text_file.save('static/text/text.txt')

    textWorker = agiTextWorker()
    result = textWorker.processTextFile('static/text/text.txt', query)

    return jsonify({'response': result})

def services(self):
    return send_from_directory('.', 'services.html')

def about(self):
    return send_from_directory('.', 'about.html')