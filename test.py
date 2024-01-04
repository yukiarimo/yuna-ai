import os
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

# Replace the placeholder in the prompt with the cropped history

# Load the prompt template
prompt_dir = os.path.join("", 'dialog.txt')
with open(prompt_dir, 'r') as file:
    prompt = file.read()


# Append the latest message from Yuki
text = f"Yuki: Yuna:"

# Tokenize the history to calculate its length in tokens
tokenized_history = model.tokenize(text)

# Calculate the maximum length for the history in tokens
max_length_tokens = 1024 - 256

# Ensure we are cropping tokens, not characters
if len(tokenized_history) > max_length_tokens:
    tokenized_history = tokenized_history[-max_length_tokens:]

# Convert the cropped tokenized history back to a string
cropped_history = model.detokenize(tokenized_history)

# Replace the placeholder in the prompt with the cropped history
response = prompt.replace('{user_msg}', cropped_history)

# Output the combined prompt and history (for debugging or further processing)
print(response)
print(len(model.tokenize(response)), '<- response length')

"""
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