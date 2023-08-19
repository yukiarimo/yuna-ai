import json

class Tokenizer:
    def __init__(self):
        # Initialize tokenizer attributes
        self.stoi = {}            # Dictionary for character-to-index mapping
        self.itos = {}            # Dictionary for index-to-character mapping
        self.vocab_size = 0       # Total number of unique characters in the tokenizer
        self.hyperparameters = {} # Dictionary to store hyperparameters for the tokenizer

    def create_tokenizer(self, text):
        # Create a tokenizer based on the input text
        chars = sorted(list(set(text)))    # Get unique characters from the text
        self.vocab_size = len(chars)       # Update vocabulary size
        self.stoi = {ch: i for i, ch in enumerate(chars)}  # Character-to-index mapping
        self.itos = {i: ch for i, ch in enumerate(chars)}  # Index-to-character mapping

    def save_tokenizer(self, tokenizer_file):
        # Save tokenizer data to a JSON file
        tokenizer_data = {
            "stoi": self.stoi,
            "itos": self.itos,
            "vocab_size": self.vocab_size,
            "hyperparameters": self.hyperparameters
        }
        with open(tokenizer_file, 'w') as f:
            json.dump(tokenizer_data, f)

    def load_tokenizer(self, tokenizer_file):
        # Load tokenizer data from a JSON file
        with open(tokenizer_file, 'r') as f:
            tokenizer_data = json.load(f)
        self.stoi = tokenizer_data["stoi"]              # Restore character-to-index mapping
        self.itos = tokenizer_data["itos"]              # Restore index-to-character mapping
        self.vocab_size = tokenizer_data["vocab_size"]  # Restore vocabulary size
        self.hyperparameters = tokenizer_data["hyperparameters"]  # Restore hyperparameters

    def encode(self, s):
        # Convert a string to a list of corresponding character indices
        return [self.stoi[c] for c in s]

    def decode(self, l):
        # Convert a list of character indices to a string
        return ''.join([self.itos[i] for i in l])

    def set_hyperparameters(self, **kwargs):
        # Update hyperparameters of the tokenizer
        self.hyperparameters.update(kwargs)

def create_tokenizer_file(text_file, tokenizer_file, hyperparameters):
    # Create and save a tokenizer from the input text file
    with open(text_file, 'r') as f:
            text_file = f.read()
    tokenizer = Tokenizer()
    tokenizer.create_tokenizer(text_file)
    tokenizer.set_hyperparameters(**hyperparameters)
    tokenizer.save_tokenizer(tokenizer_file)

def load_tokenizer_file(tokenizer_file):
    # Load a tokenizer from a saved JSON file and return the tokenizer object
    tokenizer = Tokenizer()
    tokenizer.load_tokenizer(tokenizer_file)
    return tokenizer

def tokenize_text(tokenizer_file, text):
    # Tokenize the input text using a loaded tokenizer and return the encoded text
    tokenizer = load_tokenizer_file(tokenizer_file)
    encoded_text = tokenizer.encode(text)
    return encoded_text

def detokenize_text(tokenizer_file, encoded_text):
    # Detokenize the input encoded text using a loaded tokenizer and return the original text
    tokenizer = load_tokenizer_file(tokenizer_file)
    decoded_text = tokenizer.decode([str(i) for i in encoded_text])
    return decoded_text

if __name__ == "__main__":
    # Usage from console
    command = input("Enter a command (create/load/use): ")

    if command == "--create":
        # Create a new tokenizer from a text file and save it
        text_file = input("Enter the text file: ")
        tokenizer_file = input("Enter the tokenizer file path: ")
        hyperparameters = {
            # Define hyperparameters for the tokenizer
            "batch_size": 64,
            "block_size": 256,
            "max_iters": 1000,
            "eval_interval": 500,
            "learning_rate": 5e-4,
            "device": "mps",
            "eval_iters": 10,
            "n_embd": 384,
            "n_head": 6,
            "n_layer": 6,
            "dropout": 0.1,
            "num_epochs": 1000
        }
        create_tokenizer_file(text_file, tokenizer_file, hyperparameters)
        print("Tokenizer file created.")

    elif command == "--load":
        # Load a tokenizer from a JSON file and display its details
        tokenizer_file = input("Enter the tokenizer file path: ")
        tokenizer = load_tokenizer_file(tokenizer_file)
        print("Tokenizer loaded.")
        print("Vocabulary Size:", tokenizer.vocab_size)
        print("Hyperparameters:", tokenizer.hyperparameters)

    elif command == "--tokenize_text":
        # Tokenize the input text using a loaded tokenizer
        tokenizer_file = input("Enter the tokenizer file path: ")
        text = input("Enter the text to encode/decode: ")
        print(tokenize_text(tokenizer_file, text))

    elif command == "--detokenize_text":
        # Detokenize the input encoded text using a loaded tokenizer
        tokenizer_file = input("Enter the tokenizer file path: ")
        encoded_text = input("Enter the text to encode/decode: ")
        detokenize_text(tokenizer_file, encoded_text)

    else:
        print("Invalid command.")