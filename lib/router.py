import base64
import json
import os
import re
import shutil
import uuid
from flask import jsonify, request, send_file, send_from_directory, Response
from flask_login import current_user, login_required
from lib.audio import transcribe_audio, speak_text
from pydub import AudioSegment
from pywebpush import webpush
subscriptions = []
VAPID_PRIVATE_KEY = "x32JRDsKvbQC3VwkKqYymupvlyccXBKkrwWk1vdb88U"
VAPID_PUBLIC_KEY = "BLAWDkBakXLWfyQP5zAXR5Dyv4-W1nsRDkUk9Kw9MqKppQCdbsP-yfz7kEpAPvDMy2lszg_SZ9QEC9Uda8mpKSg"
VAPID_CLAIMS = {
    "sub": "mailto:yukiarimo@gmail.com"  # Change this to your email
}
AUDIOBOOKS_FILE = 'db/audiobooks.json'

def load_projects():
    if os.path.exists(AUDIOBOOKS_FILE):
        with open(AUDIOBOOKS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_projects(projects_data):
    os.makedirs(os.path.dirname(AUDIOBOOKS_FILE), exist_ok=True)
    with open(AUDIOBOOKS_FILE, 'w') as f:
        json.dump(projects_data, f, indent=2)

# Replace the global projects variable with:
projects = load_projects()

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
                        speak_text(response_text)
        return Response(generate_stream(), mimetype='text/plain')
    else:
        if useHistory:
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
                speak_text(image_message)

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

@login_required
def services():
    """Serves the services.html file."""
    return send_from_directory('.', 'services.html')

#@login_required
def get_projects():
    return jsonify({'projects': list(projects.keys())}), 200

def create_project():
    project_name = request.json.get('name')
    if project_name in projects:
        return jsonify({'message': 'Project already exists.'}), 400
    projects[project_name] = {'chapters': {}}
    save_projects(projects)
    return jsonify({'message': 'Project created successfully.'}), 201

def get_chapters(project_name):
    if project_name not in projects:
        return jsonify({'message': 'Project does not exist.'}), 404
    chapters = list(projects[project_name]['chapters'].keys())
    return jsonify({'chapters': chapters}), 200

def create_chapter(project_name):
    chapter_name = request.json.get('name')
    if project_name not in projects:
        return jsonify({'message': 'Project does not exist.'}), 404
    if chapter_name in projects[project_name]['chapters']:
        return jsonify({'message': 'Chapter already exists.'}), 400
    projects[project_name]['chapters'][chapter_name] = []
    save_projects(projects)
    return jsonify({'message': 'Chapter created successfully.'}), 201

def get_chapter(project_name, chapter_name):
    if project_name not in projects or chapter_name not in projects[project_name]['chapters']:
        return jsonify({'message': 'Chapter does not exist.'}), 404
    paragraphs = projects[project_name]['chapters'][chapter_name]
    return jsonify({'paragraphs': paragraphs}), 200

# router.py
def update_paragraph(project_name, chapter_name, index):
    if project_name not in projects or chapter_name not in projects[project_name]['chapters']:
        return jsonify({'message': 'Chapter does not exist.'}), 404
        
    paragraphs = projects[project_name]['chapters'][chapter_name]
    if index - 1 >= len(paragraphs):
        return jsonify({'message': 'Paragraph does not exist.'}), 404
        
    text = request.json.get('text')
    paragraph_id = f"{project_name}_{chapter_name}_{index}"
    
    # Generate new audio
    audio_url = speak_text(text, project_name, chapter_name, index)
    
    paragraphs[index - 1] = {
        'id': paragraph_id,
        'text': text,
        'audio_url': audio_url,
        'number': index
    }
    
    save_projects(projects)  # Save after modification
    return jsonify({'paragraphs': paragraphs}), 200

def delete_paragraph(project_name, chapter_name, index):
    if project_name not in projects or chapter_name not in projects[project_name]['chapters']:
        return jsonify({'message': 'Chapter does not exist.'}), 404
        
    paragraphs = projects[project_name]['chapters'][chapter_name]
    if index - 1 >= len(paragraphs):
        return jsonify({'message': 'Paragraph does not exist.'}), 404
    
    # Delete associated audio file
    paragraph = paragraphs[index - 1]
    audio_path = f"static/audio/audiobooks/{project_name}/{chapter_name}/paragraph_{index}.mp3"
    if os.path.exists(audio_path):
        os.remove(audio_path)
    
    paragraphs.pop(index - 1)
    
    # Renumber remaining paragraphs
    for i, p in enumerate(paragraphs):
        p['number'] = i + 1
        p['id'] = f"{project_name}_{chapter_name}_{i + 1}"
    
    save_projects(projects)  # Save after modification
    return jsonify({'paragraphs': paragraphs}), 200

def speak():
    text = request.json.get('text')
    project = request.json.get('project')
    chapter = request.json.get('chapter')
    paragraph = request.json.get('paragraph')
    
    audio_url = speak_text(text, project, chapter, paragraph)
    return jsonify({'audio_url': audio_url}), 200

def create_paragraph(project_name, chapter_name):
    if project_name not in projects or chapter_name not in projects[project_name]['chapters']:
        return jsonify({'message': 'Chapter does not exist.'}), 404
        
    text = request.json.get('text')
    paragraphs = projects[project_name]['chapters'][chapter_name]
    
    # Split text by newlines
    texts = [t.strip() for t in text.split('\n') if t.strip()]
    
    for text in texts:
        paragraph_number = len(paragraphs) + 1
        paragraph_id = f"{project_name}_{chapter_name}_{paragraph_number}"
        
        # Generate audio
        audio_url = speak_text(text, project_name, chapter_name, paragraph_number)
        
        paragraphs.append({
            'id': paragraph_id,
            'text': text,
            'audio_url': audio_url,
            'number': paragraph_number
        })
    
    save_projects(projects)  # Save after modification
    return jsonify({'paragraphs': paragraphs}), 201

def merge_audio_files(files, output_file):
    """Merge multiple audio files into one"""
    if not files:
        return None
    
    combined = AudioSegment.from_mp3(files[0])
    for audio_file in files[1:]:
        combined += AudioSegment.from_mp3(audio_file)
    
    combined.export(output_file, format="mp3")
    return '/' + output_file

def get_merged_chapter_audio(project, chapter):
    """Merge all paragraph audio files in a chapter"""
    audio_dir = f"static/audio/audiobooks/{project}/{chapter}"
    if not os.path.exists(audio_dir):
        return None
        
    output_file = f"{audio_dir}/full_chapter.mp3"
    paragraph_files = sorted(
        [f"{audio_dir}/{f}" for f in os.listdir(audio_dir) if f.startswith("paragraph_")],
        key=lambda x: int(x.split("_")[-1].split(".")[0])
    )
    
    return merge_audio_files(paragraph_files, output_file)

def get_merged_project_audio(project):
    """Merge all chapter audio files in a project"""
    project_dir = f"static/audio/audiobooks/{project}"
    if not os.path.exists(project_dir):
        return None
        
    output_file = f"{project_dir}/full_project.mp3"
    chapter_files = []
    
    for chapter in sorted(os.listdir(project_dir)):
        chapter_path = f"{project_dir}/{chapter}/full_chapter.mp3"
        if os.path.exists(chapter_path):
            chapter_files.append(chapter_path)
        else:
            chapter_audio = get_merged_chapter_audio(project, chapter)
            if chapter_audio:
                chapter_files.append(chapter_audio.lstrip('/'))
    
    return merge_audio_files(chapter_files, output_file)

def download_paragraph(project, chapter, index):
    audio_path = f"static/audio/audiobooks/{project}/{chapter}/paragraph_{index}.mp3"
    if os.path.exists(audio_path):
        return send_file(
            audio_path,
            mimetype="audio/mp3",
            as_attachment=True,
            download_name=f"{project}_{chapter}_paragraph_{index}.mp3"
        )
    return jsonify({'error': 'Audio file not found'}), 404

def download_chapter(project, chapter):
    audio_url = get_merged_chapter_audio(project, chapter)
    if audio_url:
        return send_file(
            audio_url.lstrip('/'),
            mimetype="audio/mp3",
            as_attachment=True,
            download_name=f"{project}_{chapter}.mp3"
        )
    return jsonify({'error': 'Could not create chapter audio'}), 404

def download_project(project):
    audio_url = get_merged_project_audio(project)
    if audio_url:
        return send_file(
            audio_url.lstrip('/'),
            mimetype="audio/mp3",
            as_attachment=True,
            download_name=f"{project}.mp3"
        )
    return jsonify({'error': 'Could not create project audio'}), 404

def delete_project(project_name):
    if project_name not in projects:
        return jsonify({'message': 'Project does not exist.'}), 404
    
    # Delete project directory and all its contents
    project_dir = f"static/audio/audiobooks/{project_name}"
    if os.path.exists(project_dir):
        shutil.rmtree(project_dir)
    
    del projects[project_name]
    save_projects(projects)
    return jsonify({'message': 'Project deleted successfully.'}), 200

def rename_project(project_name):
    new_name = request.json.get('name')
    if project_name not in projects:
        return jsonify({'message': 'Project does not exist.'}), 404
    if new_name in projects:
        return jsonify({'message': 'Project with new name already exists.'}), 400
    
    # Rename project directory
    old_dir = f"static/audio/audiobooks/{project_name}"
    new_dir = f"static/audio/audiobooks/{new_name}"
    if os.path.exists(old_dir):
        os.rename(old_dir, new_dir)
    
    projects[new_name] = projects.pop(project_name)
    save_projects(projects)
    return jsonify({'message': 'Project renamed successfully.'}), 200

def delete_chapter(project_name, chapter_name):
    if project_name not in projects or chapter_name not in projects[project_name]['chapters']:
        return jsonify({'message': 'Chapter does not exist.'}), 404
    
    # Delete chapter directory
    chapter_dir = f"static/audio/audiobooks/{project_name}/{chapter_name}"
    if os.path.exists(chapter_dir):
        shutil.rmtree(chapter_dir)
    
    del projects[project_name]['chapters'][chapter_name]
    save_projects(projects)
    return jsonify({'message': 'Chapter deleted successfully.'}), 200

def rename_chapter(project_name, chapter_name):
    new_name = request.json.get('name')
    if project_name not in projects or chapter_name not in projects[project_name]['chapters']:
        return jsonify({'message': 'Chapter does not exist.'}), 404
    if new_name in projects[project_name]['chapters']:
        return jsonify({'message': 'Chapter with new name already exists.'}), 400
    
    # Rename chapter directory
    old_dir = f"static/audio/audiobooks/{project_name}/{chapter_name}"
    new_dir = f"static/audio/audiobooks/{project_name}/{new_name}"
    if os.path.exists(old_dir):
        os.rename(old_dir, new_dir)
    
    projects[project_name]['chapters'][new_name] = projects[project_name]['chapters'].pop(chapter_name)
    save_projects(projects)
    return jsonify({'message': 'Chapter renamed successfully.'}), 200

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