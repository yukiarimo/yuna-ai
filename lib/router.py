import base64
import json
import re
from flask import jsonify, request, Response
from flask_login import current_user, login_required
from pywebpush import webpush
subscriptions = []
VAPID_PRIVATE_KEY = "x32JRDsKvbQC3VwkKqYymupvlyccXBKkrwWk1vdb88U"
VAPID_PUBLIC_KEY = "BLAWDkBakXLWfyQP5zAXR5Dyv4-W1nsRDkUk9Kw9MqKppQCdbsP-yfz7kEpAPvDMy2lszg_SZ9QEC9Uda8mpKSg"
VAPID_CLAIMS = {
    "sub": "mailto:yukiarimo@gmail.com"  # Change this to your email
}

def update_chat_history(chat_history_manager, user_id, chat_id, text, response, config):
    """Helper function to update chat history."""

    chat_history = chat_history_manager.load_chat_history(user_id, chat_id)
    chat_history.append({
        "name": config['ai']['names'][0],
        "text": text['text'],
        "data": None,
        "type": "text"
    })
    chat_history.append({
        "name": config['ai']['names'][1],
        "text": response,
        "data": None,
        "type": "text"
    })
    chat_history_manager.save_chat_history(chat_history, user_id, chat_id)

@login_required
def handle_history_request(chat_history_manager):
    data = request.get_json()
    chat_id = data.get('chat')
    task = data.get('task')
    user_id = current_user.get_id()

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
def handle_message_request(worker, chat_history_manager, config):
    data = request.get_json()
    chat_id, speech, text, kanojo, useHistory, stream = (data.get(key) for key in ('chat', 'speech', 'text', 'kanojo', 'useHistory', 'stream'))
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
                update_chat_history(chat_history_manager, user_id, chat_id, text, response_text, config)
                if speech:
                    if kanojo:
                        chat_history_manager.generate_speech(response_text)
                    else:
                        worker.speak_text(response_text)
        return Response(generate_stream(), mimetype='text/plain')
    else:
        if useHistory:
            update_chat_history(chat_history_manager, user_id, chat_id, text, response, config)
            if speech:
                worker.speak_text(response)
        print("Response:", response)
        return jsonify({'response': response})

@login_required
def handle_audio_request(worker):
    task = request.form.get('task')
    text = request.form.get('text')

    if task == 'transcribe':
        audio_file = request.files.get('audio')
        if not audio_file:
            print("No audio file in request")
            return jsonify({'error': 'No audio file'}), 400
        audio_path = 'static/audio/audio.wav'
        audio_file.save(audio_path)
        transcribed_text = worker.transcribe_audio(audio_path)
        return jsonify({'text': transcribed_text})
    elif task == 'tts':
        worker.speak_text(text)
        return jsonify({'response': 'Text-to-speech executed'})
    else:
        return jsonify({'error': 'Invalid task'}), 400

@login_required
def handle_image_request(worker, chat_history_manager, config):
    data = request.get_json()
    chat_id, use_history, speech = (data.get(key) for key in ('chat', 'useHistory', 'speech'))

    if data.get('task') == 'caption' and 'image' in data:
        image_base64 = re.sub('^data:image/.+;base64,', '', data['image'])
        image_path = f"static/img/call/{data.get('name')}.png"
        with open(image_path, "wb") as file:
            file.write(base64.b64decode(image_base64))
        image_message, image_path_resp = worker.capture_image(image_path=image_path, prompt=data.get('message'))

        response = {'message': image_message, 'path': image_path_resp}

        if use_history:
            user_id = current_user.get_id()
            chat_history_message = f"{data.get('message')}<img src='/static/img/call/{data.get('name')}.png' class='image-message'>"
            update_chat_history(chat_history_manager, user_id, chat_id, chat_history_message, image_message, config)
            if speech:
                worker.speak_text(image_message)

        return jsonify(response)
    return jsonify({'error': 'Invalid task parameter'}), 400

@login_required
def handle_search_request(worker):
    data = request.json
    task = data.get('task')

    if task == 'html':
        return jsonify({'response': worker.scrape_webpage(data.get('url'))})
    
    search_query = data.get('query')
    process_data = data.get('processData', False)
    answer, search_results, image_urls = worker.web_search(search_query)

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