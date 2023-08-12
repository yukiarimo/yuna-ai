import torch
import pytorch_lightning as pl
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

# Load tokenizer from the specified directory
tokenizer = load_tokenizer_file(os.path.join(script_dir, config["tokenizer_dir"]))

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

# Load the training data from a text file
with open(os.path.join(script_dir, config["train_data_dir"]), 'r', encoding='utf-8') as f:
    text = f.read()

# Tokenize the text and split into train and validation data
data = torch.tensor(tokenize_text(os.path.join(script_dir, config["tokenizer_dir"]), text))
n = int(0.9 * len(data))
train_data = data[:n]
val_data = data[n:]

from torch.utils.data import Dataset

class GPTDataset(Dataset):
    def __init__(self, data, block_size):
        self.data = data
        self.block_size = block_size

    def __len__(self):
        return len(self.data) - self.block_size

    def __getitem__(self, idx):
        x = self.data[idx:idx+self.block_size]
        y = self.data[idx+1:idx+self.block_size+1]
        return x, y

class GPTLightning(pl.LightningModule):
    def __init__(self):
        super().__init__()
        self.model = GPTLanguageModel(device=device)

    def forward(self, idx, targets=None):
        return self.model(idx, targets)

    def training_step(self, batch, batch_idx):
        x, y = batch
        logits, loss = self(x, y)
        self.log('train_loss', loss)
        return loss

    def validation_step(self, batch, batch_idx):
        x, y = batch
        logits, loss = self(x, y)
        self.log('val_loss', loss)

    def configure_optimizers(self):
        return torch.optim.AdamW(self.parameters(), lr=float(learning_rate))

train_dataset = GPTDataset(train_data, block_size)
val_dataset = GPTDataset(val_data, block_size)

train_data_loader = torch.utils.data.DataLoader(train_dataset, batch_size=int(batch_size))
val_data_loader = torch.utils.data.DataLoader(val_dataset, batch_size=int(batch_size))

gpt_lightning = GPTLightning()

trainer = pl.Trainer(max_epochs=int(num_epochs))
trainer.fit(gpt_lightning, train_data_loader, val_data_loader)

# Save the final trained model
torch.save(gpt_lightning.model.state_dict(), os.path.join(script_dir, f"{config['model_train_dir']}finish.pth"))
