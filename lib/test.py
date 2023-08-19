from generate import generate
from model import GPTLanguageModel
import torch

# Define the user input and model
user_input = "Hello, how are you?"

model = GPTLanguageModel(device="cpu")
model.to("cpu")
model.load_state_dict(torch.load("./lib/models/trained/trained_iter-700.pth", map_location="cpu"))

while True:
    user_input = input("user: ")
    # Create a generator instance by calling the function
    generator = generate(user_input, model)

    # Iterate through the generated tokens
    for _ in range(50):
        token = next(generator)
        if "🛑" in token:
            break
