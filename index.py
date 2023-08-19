import torch
from flask import Flask, request, render_template, Response
from flask_cors import CORS
from tokenizer import load_tokenizer_file
from generate import generate
from model import GPTLanguageModel
from train import train
import os
import json
import sys

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret_key'

# Get the absolute path to the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(sys.argv[0]))

with open(os.path.join(script_dir, "config.json"), 'r') as f:
    config = json.load(f)

model_base_dir = config["model_base_dir"]
tokenizer_dir = config["tokenizer_dir"]

os.environ["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = "0.0"
tokenizer = load_tokenizer_file(os.path.join(script_dir, tokenizer_dir))

device = torch.device("cpu")
model = GPTLanguageModel()
model.to(device)
#model.load_state_dict(torch.load(os.path.join(script_dir, model_base_dir), map_location=device))
model.eval()

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        print()
        user_input = request.form['input_text'].replace("\r", "")
        print("Yuki: " + request.form['input_text'])

        generate(user_input, model)
                
        return Response(generate(user_input, model), mimetype='text/event-stream')
    else:
        return render_template('index.html')
    
@app.route('/train', methods=['GET', 'POST'])
def training():
    if request.method == 'POST':

        training_options = request.form
        num_epochs = int(training_options.get("num_epochs", 1))
        learning_rate = float(training_options.get("learning_rate", 0.001))

        train()

        return Response(train(), mimetype='text/event-stream')
    else:
        return render_template('index.html')

if __name__ == '__main__':
    app.run(port=4848)