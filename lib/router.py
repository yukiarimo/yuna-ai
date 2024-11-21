import base64
import json
import os
import re
import uuid
from flask import jsonify, request, send_from_directory, Response
from flask_login import current_user, login_required
from lib.vision import capture_image
from lib.audio import stream_generate_speech, transcribe_audio, speak_text
from lib.generate import get_config
from pydub import AudioSegment
from pywebpush import webpush
config = get_config()
subscriptions = []
VAPID_PRIVATE_KEY = "x32JRDsKvbQC3VwkKqYymupvlyccXBKkrwWk1vdb88U"
VAPID_PUBLIC_KEY = "BLAWDkBakXLWfyQP5zAXR5Dyv4-W1nsRDkUk9Kw9MqKppQCdbsP-yfz7kEpAPvDMy2lszg_SZ9QEC9Uda8mpKSg"
VAPID_CLAIMS = {
    "sub": "mailto:yukiarimo@gmail.com"  # Change this to your email
}

if config.get("ai", {}).get("search"):
    from lib.himitsu import get_html, search_web

def get_user_id():
    """Helper function to retrieve the current user's ID."""
    return current_user.get_id()

def update_chat_history(chat_history_manager, user_id, chat_id, text, response, config):
    """Helper function to update chat history."""
    chat_history = chat_history_manager.load_chat_history(user_id, chat_id)
    chat_history.append({
        "name": config['ai']['names'][0],
        "message": text
    })
    chat_history.append({
        "name": config['ai']['names'][1],
        "message": response
    })
    chat_history_manager.save_chat_history(chat_history, user_id, chat_id)

@login_required
def handle_history_request(chat_history_manager):
    data = request.get_json()
    chat_id = data.get('chat')
    task = data.get('task')
    user_id = get_user_id()

    if task == 'load':
        history = chat_history_manager.load_chat_history(user_id, chat_id)
        return jsonify(history)
    elif task == 'list':
        histories = chat_history_manager.list_history_files(user_id)
        return jsonify(histories)
    elif task in {'edit', 'save'}:
        history = data.get('history')
        chat_history_manager.save_chat_history(history, user_id, chat_id)
        return jsonify({'response': f'History {"edited" if task == "edit" else "saved"} successfully'})
    elif task == 'create':
        chat_history_manager.create_chat_history_file(user_id, chat_id)
        return jsonify({'response': 'History created successfully'})
    elif task == 'delete':
        chat_history_manager.delete_chat_history_file(user_id, chat_id)
        return jsonify({'response': 'History deleted successfully'})
    elif task == 'rename':
        new_name = data.get('name')
        chat_history_manager.rename_chat_history_file(user_id, chat_id, new_name)
        return jsonify({'response': 'History renamed successfully'})
    elif task == 'delete_message':
        text = data.get('text')
        chat_history_manager.delete_message(user_id, chat_id, text)
        return jsonify({'response': 'Message deleted successfully'})
    else:
        return jsonify({'error': 'Invalid task parameter'}), 400

def read_users():
    """Function to read users. Currently returns a static admin user."""
    return {'admin': 'admin'}

@login_required
def handle_message_request(chat_generator, chat_history_manager, config):
    data = request.get_json()
    chat_id = data.get('chat')
    speech = data.get('speech')
    text = data.get('text')
    kanojo = data.get('kanojo')
    use_history = data.get('useHistory', True)
    yuna_config = chat_generator.config if data.get('yunaConfig') else None
    stream = data.get('stream', False)
    user_id = get_user_id()

    response = chat_generator.generate(
        chat_id,
        speech,
        text,
        kanojo,
        chat_history_manager,
        use_history,
        yuna_config,
        stream
    )

    if stream:
        def generate_stream():
            response_text = ''
            for chunk in response:
                response_text += chunk
                yield chunk
            print("Response text:", response_text)
            if use_history:
                update_chat_history(chat_history_manager, user_id, chat_id, text, response_text, config)
                if speech:
                    if kanojo:
                        chat_history_manager.generate_speech(response_text)
                    else:
                        speak_text(response_text)
        return Response(generate_stream(), mimetype='text/plain')
    else:
        if use_history:
            update_chat_history(chat_history_manager, user_id, chat_id, text, response, config)
            if speech:
                speak_text(response)
        print("Response:", response)
        return jsonify({'response': response})

@login_required
def handle_audio_request():
    task = request.form.get('task')
    text = request.form.get('text')

    if task == 'transcribe':
        audio_file = request.files.get('audio')
        if not audio_file:
            print("No audio file in request")
            return jsonify({'error': 'No audio file'}), 400
        audio_path = 'static/audio/audio.wav'
        audio_file.save(audio_path)
        transcribed_text = transcribe_audio(audio_path)
        return jsonify({'text': transcribed_text})
    elif task == 'tts':
        speak_text(text)
        return jsonify({'response': 'Text-to-speech executed'})
    else:
        return jsonify({'error': 'Invalid task'}), 400

@login_required
def handle_image_request(chat_history_manager, config):
    data = request.get_json()
    chat_id = data.get('chat')
    use_history = data.get('useHistory', True)
    speech = data.get('speech', False)

    if data.get('task') == 'caption' and 'image' in data:
        image_data_url = data['image']
        # Remove the MIME type and encoding from the start of the Data URL
        image_base64 = re.sub('^data:image/.+;base64,', '', image_data_url)
        # Decode the base64 string
        image_raw_data = base64.b64decode(image_base64)
        # Save the image with the provided name
        timestamp = data.get('name')
        image_path = f"static/img/call/{timestamp}.png"
        with open(image_path, "wb") as file:
            file.write(image_raw_data)
        image_message, image_path_resp = capture_image(image_path, data.get('message'), use_cpu=False, speech=speech)

        response = {
            'message': image_message,
            'path': image_path_resp
        }

        if use_history:
            user_id = get_user_id()
            chat_history_message = f"{data.get('message')}<img src='/static/img/call/{timestamp}.png' class='image-message'>"
            update_chat_history(chat_history_manager, user_id, chat_id, chat_history_message, image_message, config)
            if speech:
                speak_text(image_message)

        return jsonify(response)
    else:
        return jsonify({'error': 'Invalid task parameter'}), 400

@login_required
def handle_search_request():
    data = request.json
    task = data.get('task')

    if task == 'html':
        return jsonify({'response': get_html(data.get('url'))})
    
    search_query = data.get('query')
    url = data.get('url')
    process_data = data.get('processData', False)
    answer, search_results, image_urls = search_web(search_query, url, process_data)

    return jsonify({
        'message': [answer, search_results],
        'images': image_urls
    })

@login_required
def handle_textfile_request(chat_generator):
    text_file = request.files.get('text')
    if not text_file:
        return jsonify({'error': 'No text file'}), 400

    query = request.form.get('query', '')
    text_file.save('static/text/content.txt')
    result = chat_generator.processTextFile('static/text/content.txt', query, 0.6)

    return jsonify({'response': result})

@login_required
def services():
    """Serves the services.html file."""
    return send_from_directory('.', 'services.html')

#@login_required
def create_project_directory():
    data = request.get_json()
    project_id = data.get('project_id')
    if not project_id:
        return jsonify({'error': 'No project ID provided'}), 400

    project_path = os.path.join('static', 'audio', 'audiobooks', project_id)
    try:
        os.makedirs(project_path, exist_ok=True)
        return jsonify({'success': True, 'path': project_path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_audiobook():
    data = request.get_json()
    text = data['text']
    id = data.get('id', str(uuid.uuid4()))
    project_path = data.get('projectPath', '')
    
    output_path = os.path.join('static', 'audio', project_path)
    os.makedirs(output_path, exist_ok=True)
    
    return Response(stream_generate_speech(text, id, output_path), mimetype='text/event-stream')

def merge_audiobook():
    data = request.json
    audio_paths = data.get('audio_paths', [])
    project_id = data.get('project_id')
    
    if not audio_paths or not project_id:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    try:
        output_path = os.path.join('static', 'audio', 'audiobooks', project_id)
        os.makedirs(output_path, exist_ok=True)
        
        combined = AudioSegment.empty()
        for path in audio_paths:
            combined += AudioSegment.from_mp3(path)
        
        merged_path = os.path.join(output_path, 'merged_audiobook.mp3')
        combined.export(merged_path, format='mp3')
        return jsonify({'merged_path': '/' + merged_path})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def subscribe():
    subscription = request.json
    if subscription not in subscriptions:
        subscriptions.append(subscription)
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
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})