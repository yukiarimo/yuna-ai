import torch
from tokenizer import load_tokenizer_file, tokenize_text, detokenize_text
import os
import json
import sys

# Get the absolute path to the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(sys.argv[0]))

with open(os.path.join(script_dir, "config.json"), 'r') as f:
    config = json.load(f)

model_base_dir = config["model_base_dir"]
tokenizer_dir = config["tokenizer_dir"]
os.environ["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = "0.0"

tokenizer = load_tokenizer_file(os.path.join(script_dir, tokenizer_dir))
device = torch.device("cpu")

def generate(user_input, model):
    input_tokens = tokenize_text(os.path.join(script_dir, tokenizer_dir), f"<|user|>{user_input}<|bot|>")
    input_tensor = torch.tensor(input_tokens, dtype=torch.long).unsqueeze(0).to(device)

    response = ""
    history = ""

    with torch.no_grad():
        print("Yuna: ", end="", flush=True)
        while True:
            # Generate one token at a time
            generated_tokens = model.generate(input_tensor, max_new_tokens=1)

            # Convert generated token back to text
            generated_text = detokenize_text(os.path.join(script_dir, tokenizer_dir), generated_tokens.squeeze().tolist())

            token = generated_text[-1]
            print(token, end="", flush=True)
            yield token
            
            # Append the generated token to the response
            response += token

            # Break the loop if "<end>" is in the history
            if "<" in response:
                break

            # Update the input tensor with the generated token
            input_tensor = torch.cat([input_tensor, generated_tokens[:, -1:]], dim=1)

            if "<" in response:
                break