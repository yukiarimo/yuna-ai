import json

# Open the input text file
with open('yuna-roleplay-2.txt', 'r') as file:
    lines = file.read()

# Split lines into variables
lines = lines.split("🛑\n")

# Open a new output file for writing the JSONL data
with open('output.jsonl', 'w') as output_file:
    for line in lines:
        parts = line.split("🤖")
        if len(parts) == 2:
            user_part = parts[0].replace("👤", "")
            bot_part = parts[1]

        # Create a dictionary in the desired format
        data = {
            "instruction": user_part,
            "context": "",
            "response": bot_part,
            "category": "open_qa"
        }

        # Write the JSON representation to the output file
        output_file.write(json.dumps(data) + '\n')

print("Conversion to JSONL format is complete!")