from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from flask import Flask, request
import torch

device = "mps" if torch.backends.mps.is_available() else "cpu"
torch.device(device)

model_name_en_ru = "./en-ru/"
model_name_ru_en = "./ru-en/"

tokenizer_en_ru = AutoTokenizer.from_pretrained(model_name_en_ru)
model_en_ru = AutoModelForSeq2SeqLM.from_pretrained(model_name_en_ru)

tokenizer_ru_en = AutoTokenizer.from_pretrained(model_name_ru_en)
model_ru_en = AutoModelForSeq2SeqLM.from_pretrained(model_name_ru_en)

app = Flask(__name__)

@app.route('/enru', methods=['POST'])
def receive_data_enru():
    data = request.get_json()['json']
    print(data)

    input_ids = tokenizer_en_ru.encode(data, return_tensors='pt')
    output_ids = model_en_ru.generate(input_ids)
    output_text = tokenizer_en_ru.decode(output_ids[0], skip_special_tokens=True)

    print(f"Input text: {data}")
    print(f"Translated text: {output_text}")

    return output_text.replace("'", "")

@app.route('/ruen', methods=['POST'])
def receive_data_ruen():
    data = request.get_json()['json']
    print(data)

    input_ids = tokenizer_ru_en.encode(data, return_tensors='pt')
    output_ids = model_ru_en.generate(input_ids)
    output_text = tokenizer_ru_en.decode(output_ids[0], skip_special_tokens=True)

    print(f"Input text: {data}")
    print(f"Translated text: {output_text}")

    return output_text.replace("'", "")

if __name__ == '__main__':
    app.run(port=3006)