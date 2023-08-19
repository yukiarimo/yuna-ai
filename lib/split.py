import csv

# Replace 'input_file.txt' with the path to your dataset text file
input_file = 'lib/datasets/yuna/dialog/yuna-dialog-3.txt'

# Replace 'output_file.csv' with the desired name for the output CSV file
output_file = 'output_file.csv'

# Initialize an empty list to store the rows of the CSV
csv_data = []

# Read data from the input file and split the lines at the '<endoftext>' token
with open(input_file, 'r', encoding='utf-8') as file:
    lines = file.read().split('\n')

    for line in lines:
        if line:
            parts = line.split('🤖', 1)  # Split only on the first occurrence of 🤖
            if len(parts) == 2:
                user, bot = parts
                csv_data.append([user + '🤖', bot])

# Write the CSV data to the output file
with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    csv_writer = csv.writer(csvfile)
    csv_writer.writerow(['User', 'Bot'])
    csv_writer.writerows(csv_data)

print(f"CSV file '{output_file}' has been created successfully.")
