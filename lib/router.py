from flask import jsonify, request

def handle_history_request(chat_history_manager):
    data = request.get_json()
    chat_id = data.get('chat')
    task = data.get('task') 

    if task == 'load':
        return jsonify(chat_history_manager.load_chat_history(chat_id))
    elif task == 'list':
        return jsonify(chat_history_manager.list_history_files())
    elif task == 'edit':
        history = data.get('history')
        chat_history_manager.save_chat_history(history, chat_id)
        return jsonify({'response': 'History edited successfully'})
    elif task == 'create':
        chat_history_manager.create_chat_history_file(chat_id)
        return jsonify({'response': 'History created successfully'})
    elif task == 'delete':
        chat_history_manager.delete_chat_history_file(chat_id)
        return jsonify({'response': 'History deleted successfully'})
    elif task == 'rename':
        new_chat_id_name = data.get('name')
        chat_history_manager.rename_chat_history_file(chat_id, new_chat_id_name)
        return jsonify({'response': 'History renamed successfully'})
    else:
        return jsonify({'error': 'Invalid task parameter'}), 400
        
def handle_message_request(chat_generator, chat_history_manager):
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

    return jsonify({'response': response})