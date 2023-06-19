from transformers import pipeline
from flask import Flask, request

summarizer = pipeline("summarization", model="yuna-core/classifier")

app = Flask(__name__)

@app.route('/classify', methods=['POST'])
def receive_data_enru():
    data = request.get_json()['json']
    print(data)

    story = summarizer(data)
    return story[0]['summary_text']

if __name__ == '__main__':
    app.run(port=3008)