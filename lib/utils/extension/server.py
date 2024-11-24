import json
import os
import requests
from flask import Flask, Response, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

chat_history_data = []

@app.route('/extension-chat_history', methods=['GET', 'POST'])
def chat_history():
    global chat_history_data
    if request.method == 'GET':
        return Response(json.dumps(chat_history_data), mimetype='application/json')
    elif request.method == 'POST':
        new_data = request.json
        chat_history_data = new_data
        return 'Chat history updated', 200

@app.route('/extension-message', methods=['POST'])
def message():
    data = request.json
    message = data.get('message')

    url = "http://localhost:5001/api/extra/generate/stream/"
    payload = {
        "n": 1,
        "max_context_length": 2048,
        "max_length": 512,
        "rep_pen": 1.07,
        "temperature": 0.75,
        "top_p": 1,
        "top_k": 0,
        "top_a": 0,
        "typical": 1,
        "tfs": 0.99,
        "rep_pen_range": 360,
        "rep_pen_slope": 0,
        "sampler_order": [6, 5, 0, 2, 3, 1, 4],
        "memory": "<|begin_of_text|><kanojo>You're a cute know-it-all girl who helps understand the context provided.</kanojo>\n<dialog>\n",
        "trim_stop": True,
        "genkey": "KCPP6681",
        "min_p": 0,
        "dynatemp_range": 0,
        "dynatemp_exponent": 1,
        "smoothing_factor": 0,
        "banned_tokens": [],
        "render_special": True,
        "presence_penalty": 0,
        "logit_bias": {},
        "prompt": message,
        "quiet": False,
        "stop_sequence": ["###", "<dialog>", "<kanojo>", "<yuki>", "<yuna>", "</kanojo>", "</yuki>", "</yuna>"],
        "use_default_badwordsids": False,
        "bypass_eos": False
    }

    try:
        response = requests.post(
            url, 
            headers={"Content-Type": "application/json"}, 
            json=payload, 
            stream=True
        )
        
        if response.status_code == 200:
            def generate():
                for line in response.iter_lines():
                    if line:
                        decoded_line = line.decode('utf-8')
                        if decoded_line.startswith('data: '):
                            try:
                                data = json.loads(decoded_line[6:])
                                if 'token' in data:
                                    yield data['token']
                            except json.JSONDecodeError:
                                print(f"Failed to parse JSON: {decoded_line}")
                                continue

            return Response(generate(), content_type='text/plain')
        else:
            print(f"Request failed with status code: {response.status_code}")
            return Response('Error: API request failed', status=response.status_code)
            
    except requests.exceptions.RequestException as e:
        print(f"Request exception: {str(e)}")
        return Response('Error communicating with the API.', status=500)

@app.route('/waifu', methods=['GET'])
def waifu():
    file_path = os.path.join(os.path.dirname(__file__), 'waifu.jpg')
    return Response(open(file_path, 'rb').read(), mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(port=4848, ssl_context='adhoc')