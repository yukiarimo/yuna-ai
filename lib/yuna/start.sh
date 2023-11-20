#!/bin/bash

# Set the directory path
models_dir="models/"

# List all files in the models directory
files=("$models_dir"/*)

# Prompt the user to select a file
echo "Select a model to build:"
select model_file in "${files[@]}"; do
  if [ -n "$model_file" ]; then
    echo "You selected: $model_file"
    
    # Run the Python script with the selected option
    python3 build-yuna/koboldcpp.py "$model_file"
    
    # Exit the loop
    break
  else
    echo "Invalid option. Please try again."
  fi
done