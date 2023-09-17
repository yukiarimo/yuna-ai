import requests
import speech_recognition as sr
from os import system
import json

history_file = "static/db/history.json"
r = sr.Recognizer()

def listen():
    while True:
        with sr.Microphone() as source:
            print('Say something:')
            audio = r.listen(source)

        try:
            text = r.recognize_google(audio)
            if text:
                print(f'You said: {text}')
                generate(text, speech=True)  # Send detected speech to generation function
                break  # Exit the loop if speech is successfully recognized
        except sr.UnknownValueError:
            print('Sorry, I couldn\'t understand what you said. Please try again.')
        except sr.RequestError as e:
            print(f'Sorry, an error occurred: {e}. Please try again.')

    return "done"

def generate(text, speech=False):
    # Read the existing history from the file
    with open(history_file, 'r') as file:
        data = json.load(file)
        history = ''
        for item in data:
            name = item.get('name', '')
            message = item.get('message', '')
            if name and message:
                history += f'{name}: {message}\n'

    # Append the new message to the history
    new_history = f"{history}Yuki: {text}\nYuna:"
    print(new_history)

    # Define the URL
    url = 'http://localhost:5001/api/v1/generate'

    # Define the request payload
    payload = {
        "n": 1,
        "max_context_length": 1024,
        "max_length": 64,
        "rep_pen": 1.1,
        "temperature": 0.6,
        "top_p": 1,
        "top_k": 0,
        "top_a": 0,
        "typical": 1,
        "tfs": 1,
        "rep_pen_range": 320,
        "rep_pen_slope": 0.7,
        "sampler_order": [6, 0, 1, 3, 4, 2, 5],
        "prompt": new_history,  # Use the updated history here
        "quiet": True,
        "stop_sequence": ["Yuki:",  "\nYuki: ", "\nYou:", "\nYou: ", "\nYuna: ", "\nYuna:", "Yuuki: ", "\n"],
        "use_default_badwordsids": True
    }

    # Send a POST request to the endpoint
    response = requests.post(url, json=payload)
    responsesay = response.json()['results'][0]['text']

    print('response = ', responsesay)

    if speech == True:
        system(f'say "{responsesay}"')

    return responsesay