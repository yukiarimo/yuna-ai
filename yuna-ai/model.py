import torch
import torch.nn as nn
import json
from torch.nn import functional as F
from tokenizer import load_tokenizer_file
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

class Head(nn.Module):
    # Implementation of one head of self-attention
    def __init__(self, head_size):
        super().__init__()
        # Linear transformations for key, query, and value
        self.key = nn.Linear(n_embd, head_size, bias=False)
        self.query = nn.Linear(n_embd, head_size, bias=False)
        self.value = nn.Linear(n_embd, head_size, bias=False)

        # Register a buffer 'tril' containing a lower triangular matrix with ones on the diagonal
        self.register_buffer('tril', torch.tril(torch.ones(block_size, block_size)))

        # Dropout layer for regularization
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # Forward pass through the head
        B, T, C = x.shape
        k = self.key(x)   # Compute keys (B, T, hs)
        q = self.query(x) # Compute queries (B, T, hs)

        # Compute attention scores ("affinities")
        wei = q @ k.transpose(-2, -1) * k.shape[-1]**-0.5  # (B, T, hs) @ (B, hs, T) -> (B, T, T)
        wei = wei.masked_fill(self.tril[:T, :T] == 0, float('-inf'))  # Mask out upper triangular part
        wei = F.softmax(wei, dim=-1)  # Apply softmax along the last dimension (B, T, T)
        wei = self.dropout(wei)

        # Perform weighted aggregation of the values
        v = self.value(x)  # Compute values (B, T, hs)
        out = wei @ v  # (B, T, T) @ (B, T, hs) -> (B, T, hs)
        return out

class MultiHeadAttention(nn.Module):
    # Implementation of multiple heads of self-attention in parallel
    def __init__(self, num_heads, head_size):
        super().__init__()
        # Create a ModuleList containing multiple Head instances
        self.heads = nn.ModuleList([Head(head_size) for _ in range(num_heads)])

        # Linear layer for combining the multiple heads
        self.proj = nn.Linear(head_size * num_heads, n_embd)

        # Dropout layer for regularization
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # Forward pass through the multiple heads
        out = torch.cat([h(x) for h in self.heads], dim=-1)  # Concatenate the outputs of all heads
        out = self.dropout(self.proj(out))  # Apply dropout and linear projection
        return out

class FeedFoward(nn.Module):
    # Implementation of a simple linear layer followed by a non-linearity
    def __init__(self, n_embd):
        super().__init__()
        # Define a sequential network with two linear layers and ReLU activation in between
        self.net = nn.Sequential(
            nn.Linear(n_embd, 4 * n_embd),
            nn.ReLU(),
            nn.Linear(4 * n_embd, n_embd),
            nn.Dropout(dropout),
        )

    def forward(self, x):
        # Forward pass through the network
        return self.net(x)

class Block(nn.Module):
    # Implementation of a Transformer block: communication followed by computation
    def __init__(self, n_embd, n_head):
        # n_embd: embedding dimension, n_head: the number of heads we'd like
        super().__init__()
        head_size = n_embd // n_head

        # Multi-head self-attention layer
        self.sa = MultiHeadAttention(n_head, head_size)

        # Feed-forward neural network layer
        self.ffwd = FeedFoward(n_embd)

        # Layer normalization for input and output
        self.ln1 = nn.LayerNorm(n_embd)
        self.ln2 = nn.LayerNorm(n_embd)

    def forward(self, x):
        # Forward pass through the Transformer block
        x = x + self.sa(self.ln1(x))  # Add residual connection and apply layer normalization
        x = x + self.ffwd(self.ln2(x))  # Add another residual connection and layer normalization
        return x

class GPTLanguageModel(nn.Module):
    # Implementation of the GPT language model
    def __init__(self, device='cpu'):
        super().__init__()
        # Token and position embeddings
        self.token_embedding_table = nn.Embedding(vocab_size, n_embd)
        self.position_embedding_table = nn.Embedding(block_size, n_embd)

        # Stacked Transformer blocks
        self.blocks = nn.Sequential(*[Block(n_embd, n_head=n_head) for _ in range(n_layer)])

        # Final layer normalization
        self.ln_f = nn.LayerNorm(n_embd)

        # Linear layer for generating next token logits
        self.lm_head = nn.Linear(n_embd, vocab_size)

        # Device setting
        self.device = device

        # Weight initialization using normal distribution
        self.apply(self._init_weights)

    def _init_weights(self, module):
        # Custom weight initialization for linear and embedding layers
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def forward(self, idx, targets=None):
        # Forward pass through the GPT language model
        B, T = idx.shape

        # Token and position embeddings
        tok_emb = self.token_embedding_table(idx)  # (B, T, C)
        pos_emb = self.position_embedding_table(torch.arange(T, device=self.device))  # (T, C)
        x = tok_emb + pos_emb  # (B, T, C)

        # Stacked Transformer blocks
        x = self.blocks(x)  # (B, T, C)

        # Final layer normalization and linear layer for generating logits
        x = self.ln_f(x)  # (B, T, C)
        logits = self.lm_head(x)  # (B, T, vocab_size)

        if targets is None:
            loss = None
        else:
            # Compute loss if targets are provided
            B, T, C = logits.shape
            logits = logits.view(B * T, C)
            targets = targets.view(B * T)
            loss = F.cross_entropy(logits, targets)

        return logits, loss

    def generate(self, idx, max_new_tokens):
        # Generate new tokens iteratively using sliding window
        B, T = idx.shape

        for _ in range(max_new_tokens):
            if T <= block_size:
                # If the current context fits within the block_size,
                # use it as is for generating the next token
                idx_cond = idx
            else:
                # Crop the last block_size tokens as the context for generating the next token
                idx_cond = idx[:, -block_size:]

            # Get the predictions for the next token
            logits, loss = self(idx_cond)

            # Focus only on the last time step
            logits = logits[:, -1, :]  # becomes (B, C)

            # Apply softmax to get probabilities
            probs = F.softmax(logits, dim=-1)  # (B, C)

            # Sample from the distribution
            idx_next = torch.multinomial(probs, num_samples=1)  # (B, 1)

            # Append the sampled index to the running sequence
            idx = torch.cat((idx, idx_next), dim=1)  # (B, T+1)

            # Update the total length of the sequence
            T += 1

        return idx