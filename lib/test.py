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

"""
from ctransformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "lib/models/yuna/pygmalion-2-7b.Q5_K_M.gguf",
    model_type='llama2',
    max_new_tokens=512,
    context_length=4096,
    temperature=0.3, # less better to intruction following
    repetition_penalty=1.2,
    last_n_tokens=128,
    seed=-1,
    top_k=40,
    top_p=0.92,
    batch_size=256,
    gpu_layers=1,
    reset=True
    )

# function to read text from a file
def read_text_file():
    with open("test.txt", 'r') as f:
        text = f.read()

    new_history_crop = model.tokenize(text)
    new_history_crop = new_history_crop[:1024]

    print(model.detokenize(new_history_crop))
    return text

while True:
    input("Press Enter to continue...")
    text = read_text_file()

    for text in model(text, stream=True):
        print(text, end="", flush=True)

    print("done")
"""