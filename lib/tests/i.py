import csv
import json
import re

def parse_file(file_path):
    data = []
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
        blocks = re.split(r'\n\n+', content.strip())
        
        for block in blocks:
            lines = block.strip().split('\n')
            if len(lines) == 3:
                item = {}
                for line in lines:
                    print(line)
                    key, value = line.split(':', 1)
                    item[key.strip()] = value.strip()
                data.append(item)
    return data

def create_csv(data, output_file):
    with open(output_file, 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['Question', 'Wrong', 'Right'])
        writer.writeheader()
        writer.writerows(data)

def create_json(data, output_file):
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=2, ensure_ascii=False)

# Main execution
input_file = 'dpo.txt'  # Replace with your input file name
csv_output = 'output.csv'
json_output = 'output.json'

parsed_data = parse_file(input_file)
create_csv(parsed_data, csv_output)
create_json(parsed_data, json_output)

print(f"CSV file created: {csv_output}")
print(f"JSON file created: {json_output}")