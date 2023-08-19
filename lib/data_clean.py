import string
from tokenizer import load_tokenizer_file

def tokenize_text(tokenizer_file, text):
    with open(text, 'r') as f:
        text = f.read()

    tokenizer = load_tokenizer_file(tokenizer_file)
    symbols = set(tokenizer.itos.values())
    symbols.update(string.ascii_letters + string.digits + string.whitespace)

    parsed_text = ''.join(c for c in text if c in symbols)
    
    with open("./test2.txt", 'w') as f:
        f.write(parsed_text)

tokenize_text("./tokenizer-new.json", "./lib/datasets/yuna/dialog/yuna-dialog-3.txt")