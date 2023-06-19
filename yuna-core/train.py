import torch
from transformers import BlenderbotTokenizer, BlenderbotForConditionalGeneration
import json
import os
os.environ["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = "0.0"

# Load the model and tokenizer
model_path = "./epoch_1/" #other/text/blenderbot/175M/
model = BlenderbotForConditionalGeneration.from_pretrained(model_path)
tokenizer = BlenderbotTokenizer.from_pretrained(model_path)
question = input("Do you wanna train model? [y/n]: ")
device = torch.device('mps' if torch.backends.mps.is_available() else 'cpu')
print(device)

if question == "n":
    while True:
        input_text = input("Enter your message: ")
        input_ids = tokenizer.encode(input_text, return_tensors='pt')
        bot_response = model.generate(input_ids, max_new_tokens=120)
        bot_text = tokenizer.decode(bot_response[0], skip_special_tokens=True)
        print("Bot response:", bot_text)

        # Ask if user is satisfied with the response
        satisfied = input("Are you satisfied with the response? [y/n]: ")
        if satisfied == "n":
            # Collect user input for new response
            new_response = input("Enter a better response: ")

            # Set up the input and target text
            input_text = [input_text]
            target_text = [new_response]

            # Tokenize the input and target text
            input_ids = tokenizer(input_text, return_tensors='pt', padding=True, truncation=True).input_ids
            target_ids = tokenizer(target_text, return_tensors='pt', padding=True, truncation=True).input_ids

            # Set up the optimizer with a small learning rate
            optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-5)

            # Define the training loop
            def train(model, tokenizer, optimizer, input_ids, target_ids):
                model.train()
                optimizer.zero_grad()
                loss = model(input_ids=input_ids, labels=target_ids).loss
                loss.backward()
                optimizer.step()
                return loss.item()

            # Set up the device
            model.to(device)
            input_ids = input_ids.to(device)
            target_ids = target_ids.to(device)

            # Train the model on the example data
            for i in range(10):
                loss = train(model, tokenizer, optimizer, input_ids, target_ids)
                print('Iteration', i+1, 'Loss:', loss)

            model_path = "yuna-trained/"
            model.save_pretrained(model_path)
            tokenizer.save_pretrained(model_path)

            model = BlenderbotForConditionalGeneration.from_pretrained(model_path)
            tokenizer = BlenderbotTokenizer.from_pretrained(model_path)

if question == "y":
    # Set up the input and target text
    # Load data from train.json file
    with open('./train.json') as f:
        data = json.load(f)

    # Extract main_text and target_text fields
    input_text = [d['main_text'] for d in data]
    target_text = [d['target_text'] for d in data]
    # Tokenize the input and target text
    input_ids = tokenizer(input_text, return_tensors='pt', padding=True, truncation=True).input_ids
    target_ids = tokenizer(target_text, return_tensors='pt', padding=True, truncation=True).input_ids

    # Set up the optimizer with a small learning rate
    optimizer = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=4e-4)

    # Define the training loop
    def train(model, tokenizer, optimizer, input_ids, target_ids):
        model.train()
        optimizer.zero_grad()
        loss = model(input_ids=input_ids, labels=target_ids).loss
        loss.backward()
        optimizer.step()
        return loss.item()

    # Set up the device
    model.to(device)
    input_ids = input_ids.to(device)
    target_ids = target_ids.to(device)

    epochs = 100
    save_frequency = 10

    for epoch in range(epochs):
        loss = train(model, tokenizer, optimizer, input_ids, target_ids)
        print('Iteration', epoch+1, 'Loss:', loss)

        if (epoch + 1) % save_frequency == 0:
            model_path = "./yuna-checkpoint/epoch_" + str(epoch + 1)
            model.save_pretrained(model_path)
            tokenizer.save_pretrained(model_path)
            print("done")

    model_path = "./yuna-trained-final/"
    model.save_pretrained(model_path)
    tokenizer.save_pretrained(model_path)