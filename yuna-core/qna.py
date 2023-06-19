from transformers import DistilBertTokenizer, DistilBertModel, pipeline
from flask import Flask, request
import torch

device = "mps" if torch.backends.mps.is_available() else "cpu"
torch.device(device)

tokenizer2 = DistilBertTokenizer.from_pretrained('./qna/')
model2 = DistilBertModel.from_pretrained('./qna/')

app = Flask(__name__)

@app.route('/qna', methods=['POST'])
def qna_data():
    question = request.get_json()['q']
    text = request.get_json()['txt']

    question_answerer = pipeline("question-answering", model='qna')

    context = """What you """

    result = question_answerer(question="a doubts?", context=context)
    print(result['answer'])
    return result['answer']

if __name__ == '__main__':
    app.run(port=3005)