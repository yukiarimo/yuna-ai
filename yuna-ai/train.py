import torch
from tokenizer import load_tokenizer_file, tokenize_text
from model import GPTLanguageModel
import os
import json
import sys

# Set PyTorch environment variable to optimize memory usage
os.environ["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = "0.0"

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(sys.argv[0]))

# Load configuration from config.json file
with open(os.path.join(script_dir, "config.json"), 'r') as f:
    config = json.load(f)

# Extract configuration parameters
model_base_dir = config["model_base_dir"]
model_train_dir = config["model_train_dir"]
tokenizer_dir = config["tokenizer_dir"]
train_data_dir = config["train_data_dir"]

# Load tokenizer from the specified directory
tokenizer = load_tokenizer_file(os.path.join(script_dir, tokenizer_dir))

# Extract hyperparameters from the tokenizer
batch_size = tokenizer.hyperparameters['batch_size']
block_size = tokenizer.hyperparameters['block_size']
max_iters = tokenizer.hyperparameters['max_iters']
eval_interval = tokenizer.hyperparameters['eval_interval']
learning_rate = float(tokenizer.hyperparameters['learning_rate'])
device = torch.device(tokenizer.hyperparameters['device'])
eval_iters = tokenizer.hyperparameters['eval_iters']
n_embd = tokenizer.hyperparameters['n_embd']
n_head = tokenizer.hyperparameters['n_head']
n_layer = tokenizer.hyperparameters['n_layer']
dropout = tokenizer.hyperparameters['dropout']
vocab_size = tokenizer.vocab_size
num_epochs = tokenizer.hyperparameters["num_epochs"]

def load_dialogues(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    dialogues = text.strip().split("\n")
    return dialogues

def tokenize_dialogues(tokenizer, dialogues):
    tokenized_dialogues = [tokenizer.encode(dialogue) for dialogue in dialogues]
    return tokenized_dialogues

def pad_or_crop(tokens, block_size):
    if len(tokens) < block_size:
        tokens = tokens + [0] * (block_size - len(tokens))
    elif len(tokens) > block_size:
        tokens = tokens[:block_size]
    return tokens

# Load and tokenize the data
dialogues = load_dialogues("./output_file.csv")

# Calculate the split index
split_index = int(0.9 * len(dialogues))

# Split dialogues into training and test sets
train_dialogues = dialogues[:split_index]
test_dialogues = dialogues[split_index:]

def train():
    # Training loop
    def get_batch(split):
        data = train_dialogues if split == 'train' else test_dialogues
        selected_dialogue = data[torch.randint(len(data), (1,))]
        user_input, bot_response = selected_dialogue.split('🤖')
        user_input = user_input + '🤖'
        user_input = user_input.replace('"', "")
        bot_response = bot_response.replace('"', "").replace(",", "", 1)
        #print(user_input, bot_response)

        # Tokenize and pad the user input
        user_tokens = tokenizer.encode(user_input)
        user_tokens = pad_or_crop(user_tokens, block_size)
        x = torch.tensor(user_tokens).unsqueeze(0).to(device)

        # Tokenize and pad the bot response
        bot_tokens = tokenizer.encode(bot_response)
        bot_tokens = pad_or_crop(bot_tokens, block_size)
        y = torch.tensor(bot_tokens).unsqueeze(0).to(device)

        x, y = x.to(device), y.to(device)

        return x, y

    # Function to estimate the loss on the training and validation sets
    @torch.no_grad()
    def estimate_loss():
        out = {}
        model.eval()
        for split in ['train', 'val']:
            losses = torch.zeros(eval_iters)
            for k in range(eval_iters):
                X, Y = get_batch(split)
                X = X.to(device, dtype=torch.long)
                Y = Y.to(device, dtype=torch.long)
                logits, loss = model(X, Y)
                losses[k] = loss.item()
                print(f"Split: {split}, Iteration: {k}, Loss: {loss.item()}")
            out[split] = losses.mean()
            print(f"{split} Mean Loss: {out[split]}")
        model.train()
        return out

    model = GPTLanguageModel(device=device)
    model.to(device)
    #model.load_state_dict(torch.load(os.path.join(script_dir, model_base_dir), map_location=device))
    
    # Create an AdamW optimizer for training the model
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)

    for iter in range(max_iters):
        if iter % eval_interval == 0:
            # Evaluate the loss on train and validation sets at regular intervals
            losses = estimate_loss()
            # Save the trained model at this iteration
            torch.save(model.state_dict(), os.path.join(script_dir, f"{model_train_dir}trained_iter-{iter}.pth"))
            print(f"step {iter}: train loss {losses['train']:.4f}, val loss {losses['val']:.4f}")
            yield f"step {iter}: train loss {losses['train']:.4f}, val loss {losses['val']:.4f}"

        # Sample a batch of data for training
        xb, yb = get_batch('train')

        # Print information about the current batch
        print('Input:', xb)
        print('Target:', yb)

        # Forward pass through the model and compute the loss
        logits, loss = model(xb, yb)

        # Print information about the current batch
        print('Logits:', logits)
        print('Loss:', loss)

        # Backpropagation and model optimization
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()

        yield str(loss)

    # Save the final trained model
    torch.save(model.state_dict(), os.path.join(script_dir, f"{model_train_dir}finish.pth"))

for loss in train():
    # Print the current loss for each iteration
    print("Current Loss:", loss)