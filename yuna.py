import torch
from transformers import BlenderbotTokenizer, BlenderbotForConditionalGeneration
from flask import Flask, request
import json

# Load the model and tokenizer
model_path = "./yuna-core/Yuna/"
model = BlenderbotForConditionalGeneration.from_pretrained(model_path)
tokenizer = BlenderbotTokenizer.from_pretrained(model_path)
device = torch.device('mps' if torch.backends.mps.is_available() else 'cpu')
print(device)

app = Flask(__name__)

@app.route('/yuna', methods=['POST'])
def receive_data_enru():
    data = request.get_json()['json']
    print(data)

    input_text = data
    input_ids = tokenizer.encode(input_text, return_tensors='pt')
    bot_response = model.generate(input_ids, max_new_tokens=120)
    bot_text = tokenizer.decode(bot_response[0], skip_special_tokens=True)

    return bot_text

if __name__ == '__main__':
    app.run(port=3001)