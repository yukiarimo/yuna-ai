import base64
import re
from flask import jsonify, request, send_from_directory, Response
from flask_login import current_user, login_required
from lib.vision import capture_image, create_image
from lib.search import get_html, search_web
from lib.audio import transcribe_audio, speak_text
from pydub import AudioSegment

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

def read_users():
    return {'admin': 'admin'}

@login_required
def handle_message_request(chat_generator, chat_history_manager, chat_id=None, speech=None, text=None, template=None):
    data = request.get_json()
    chat_id = data.get('chat')
    speech = data.get('speech')
    text = data.get('text')
    template = data.get('template')
    useHistory = data.get('useHistory', True)
    yunaConfig = data.get('yunaConfig')
    stream = data.get('stream', False)
    response = ""
    user_id = list({current_user.get_id()})[0]

    if yunaConfig is not None:
        yunaConfig = chat_generator.config

    response = chat_generator.generate(chat_id, speech, text, template, chat_history_manager, useHistory, yunaConfig, stream)

    if stream:
        def generate():
            response_text = ''

            for chunk in response:
                response_text += chunk
                yield chunk

            print("Response text: ", response_text)

            if template is not None and useHistory is not False:
                # Save chat history after streaming response
                chat_history = chat_history_manager.load_chat_history(user_id, chat_id)
                chat_history.append({"name": "Yuki", "message": text})
                chat_history.append({"name": "Yuna", "message": response_text})
                chat_history_manager.save_chat_history(chat_history, user_id, chat_id)

                if speech == True:
                    chat_history_manager.generate_speech(response)
    
        return Response(generate(), mimetype='text/plain')
    else:
        if template is not None and useHistory is not False:
            # Save chat history after non-streaming response
            chat_history = chat_history_manager.load_chat_history(user_id, chat_id)
            chat_history.append({"name": "Yuki", "message": text})
            chat_history.append({"name": "Yuna", "message": response})
            chat_history_manager.save_chat_history(chat_history, user_id, chat_id)

            if speech == True:
                speak_text(response)
        
        return jsonify({'response': response})

def check_audio_file(file_path):
    try:
        audio = AudioSegment.from_file(file_path)
        print(f"Audio file duration: {audio.duration_seconds} seconds")
        print(f"Audio file channels: {audio.channels}")
        print(f"Audio file frame rate: {audio.frame_rate}")
        return True
    except Exception as e:
        print(f"Error loading audio file: {e}")
        return False

@login_required
def handle_audio_request(self):
    print("Handling audio request...")
    task = request.form.get('task')
    text = request.form.get('text')
    result = ""

    print(f"Task: {task}")
    print(f"Text: {text}")
    print(f"Request files: {request.files}")
    print(f"Request form: {request.form}")
    print(f"Request data: {request.data}")
    
    if task == 'transcribe':
        if 'audio' not in request.files:
            print("No audio file in request")
            return jsonify({'error': 'No audio file'}), 400

        audio_file = request.files['audio']
        save_dir_audio = 'static/audio/audio.wav'
        audio_file.save(save_dir_audio)

        # Example usage
        if check_audio_file('static/audio/audio.wav'):
            print("Audio file is valid")
        else:
            print("Audio file is corrupted")
            
        result = transcribe_audio(save_dir_audio)
        return jsonify({'text': result})

    elif task == 'tts':
        print("Running TTS...")
        result = speak_text(text)

    return jsonify({'response': result})


@login_required
def handle_image_request(chat_history_manager, self):
    data = request.get_json()
    chat_id = data.get('chat')
    useHistory = data.get('useHistory', True)
    speech = data.get('speech', False)

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
        image_data = capture_image(image_path, data.get('message'), use_cpu=False, speech=speech)
        
        if useHistory is not False:
                # Save chat history after streaming response
                chat_history = chat_history_manager.load_chat_history(list({current_user.get_id()})[0], chat_id)
                chat_history.append({"name": self.config['ai']['names'][0], "message": f"{data.get('message')}<img src='/static/img/call/{current_time_milliseconds}.png' class='image-message'>"})
                chat_history.append({"name": self.config['ai']['names'][1], "message": image_data[0]})

                if speech == True:
                    speak_text(image_data[0])

        # Save the chat history
        chat_history_manager.save_chat_history(chat_history, list({current_user.get_id()})[0], chat_id)

        return jsonify({'message': image_data[0], 'path': image_data[1]})

    elif 'prompt' in data and 'chat' in data and data['task'] == 'generate':
        prompt = data['prompt']
        chat_id = data['chat']

        chat_history = chat_history_manager.load_chat_history(list({current_user.get_id()})[0]. chat_id)
        chat_history.append({"name": self.config['ai']['names'][0], "message": prompt})

        created_image = create_image(prompt)
        chat_history.append({"name": self.config['ai']['names'][1], "message": f"Sure, here you go! <img src='img/art/{created_image}' class='image-message'>"})

        chat_history_manager.save_chat_history(chat_history, list({current_user.get_id()})[0], chat_id)
        yuna_image_message = f"Sure, here you go! <img src='img/art/{created_image}' class='image-message'>"

        return jsonify({'message': yuna_image_message})
    else:
        return jsonify({'error': 'Invalid task parameter'}), 400

@login_required
def handle_search_request(self):
    data = request.json
    search_query = data.get('query')
    processData = data.get('processData', False)
    url = data.get('url')
    task = data.get('task')
    query = data.get('query')

    if task == 'html':
        # processing does here
        return jsonify({'response': get_html(url)})
    else:
        answer, search_results, image_urls = search_web(search_query, url, processData)

        response = {
            'message': [answer, search_results],
            'images': image_urls
        }

        return jsonify(response)

@login_required
def handle_textfile_request(chat_generator, self):
    if 'text' not in request.files:
        return jsonify({'error': 'No text file'}), 400

    text_file = request.files['text']
    query = request.form['query']
    text_file.save('static/text/content.txt')

    result = chat_generator.processTextFile('static/text/content.txt', query)

    return jsonify({'response': result})

def services(self):
    return send_from_directory('.', 'services.html')