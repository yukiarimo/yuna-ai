#!/bin/bash

# Function to display a welcome message
info() {
    clear
    echo "Welcome to Yuna Management Script!"
}

# Function to display a goodbye message
goodbye() {
    echo "Thank you for using Yuna Management Script. Goodbye!"
}

# Function to start Yuna
start_yuna() {
    echo "Starting Yuna..."
    python index.py
}

# Function to install or update dependencies
install_update_dependencies() {
    clear
    while true; do
    echo "========== Installation... =========="
    echo "1. CPU"
    echo "2. NVIDIA GPU"
    echo "3. AMD GPU"
    echo "4. Go back" 

    read -p "> " install_choice

    case $install_choice in
        1) install_cpu;;
        2) install_nvidia;;
        3) install_amd;;
        4) return;;
        *) echo "Invalid choice. Please enter a number between 1 and 4.";;
    esac
    done
}

install_cpu() {
    echo "Installing CPU dependencies..."
    pip install -r requirements.txt
    echo "CPU dependencies installed."
    
}

install_nvidia() {
    echo "Installing NVIDIA dependencies..."
    pip install -r requirements-nvidia.txt
    echo "NVIDIA dependencies installed."
    
}

install_amd() {
    echo "Installing AMD dependencies..."
    CT_HIPBLAS=1 pip install ctransformers --no-binary ctransformers
    pip install -r requirements-amd.txt
    echo "AMD dependencies installed."
    
}

# Submenu for configure()
configure_submenu() {
    while true; do
        clear

        echo "========== Configure Menu =========="
        echo "1. Install models"
        echo "2. Clear models"
        echo "3. Backup"
        echo "4. Restore"
        echo "5. Go back"
        echo "6. Exit"

        # Read user input
        read -p "> " config_choice

        # Execute the corresponding function based on user input
        case $config_choice in
            1) install_models;;
            2) clear_models;;
            3) backup;;
            4) restore;;
            5) break;; # Go back
            6) goodbye; exit;; # Exit
            *) echo "Invalid choice. Please enter a number between 1 and 6.";;
        esac

        # Add a newline for better readability
        echo
    done
}

# Function to configure
configure() {
    configure_submenu
}

# Function to install models
install_models() {
    clear
    echo "========== Install Models Menu =========="
    echo " 1. All"
    echo " 2. All AGI"
    echo " 3. Vision"
    echo " 4. Art"
    echo " 5. Emotion"
    echo " 6. Yuna"
    echo " 7. Go back"
    echo " 8. Exit"

    # Read user input
    read -p "Enter your choice (1-6): " install_choice

    case $install_choice in
        1) install_all_models;;
        2) install_all_agi_models;;
        3) install_vision_model;;
        4) install_art_model;;
        5) install_emotion_model;;
        6) install_yuna_model;;
        7) return;;
        8) goodbye; exit;;
        *) echo "Invalid choice. Please enter a number between 1 and 6.";;
    esac
}

# Function to install all models
install_all_models() {
    install_all_agi_models
    install_yuna_model
}

# Function to install all AGI models
install_all_agi_models() {
    echo "Installing all AGI models..."
    install_vision_model
    install_art_model
    install_emotion_model
}

# Function to install Vision model
install_vision_model() {
    echo "Installing Vision model..."
    git clone https://huggingface.co/yukiarimo/yuna-vision lib/models/agi/yuna-vision/
}

# Function to install Art model
install_art_model() {
    echo "Installing Art model..."
    wget https://huggingface.co/yukiarimo/anyloli/resolve/main/any_loli.safetensors -P lib/models/agi/art/
}

# Function to install Vision model
install_emotion_model() {
    echo "Installing Vision model..."
    git clone https://huggingface.co/yukiarimo/yuna-emotion lib/models/agi/yuna-emotion/
}

# Function to install Yuna model
install_yuna_model() {
    echo "Installing Yuna model..."
    wget https://huggingface.co/yukiarimo/yuna-ai/resolve/main/yuna-ggml-q5.gguf -P lib/models/yuna/
}

# Function to clear models
clear_models() {
    clear
    echo "========== Clear Models Menu =========="
    echo "This will delete all models inside 'lib/models/'."
    read -p "Do you want to proceed? (y/n): " confirm_clear

    case $confirm_clear in
        [Yy])
            echo "Clearing models..."
            rm -rf lib/models/*
            echo "Models cleared."
            ;;
        [Nn])
            echo "Operation canceled. No models were cleared."
            ;;
        *)
            echo "Invalid choice. Please enter 'y' or 'n'."
            ;;
    esac
}

# Function to backup
backup() {
    clear
    echo "Backing up..."
    # Add your code here for backup
}

# Function to restore
restore() {
    clear
    echo "Restoring..."
    # Add your code here for restore
}

oneClickInstall() {
    install_update_dependencies
    install_models

    read -p "Do you want to start Yuna? (y/n): " confirm_start

    case $confirm_start in
        [Yy])
            start_yuna
            ;;
        [Nn])
            echo "Operation canceled. Everything is installed."
            ;;
        *)
            echo "Invalid choice. Please enter 'y' or 'n'."
            ;;
    esac
}

# Display the main menu
while true; do
    clear

    echo "========== Main Menu =========="
    echo "1. Start Yuna"
    echo "2. Install or Update dependencies"
    echo "3. One click install"
    echo "4. Configure"
    echo "5. Reset"
    echo "6. Exit"
    echo "7. Info"

    # Read user input
    read -p "> " choice

    # Execute the corresponding function based on user input
    case $choice in
        1) start_yuna;;
        2) install_update_dependencies;;
        3) oneClickInstall;;
        4) configure;;
        5) reset;;
        6) goodbye; exit;;
        7) info;;
        *) echo "Invalid choice. Please enter a number between 1 and 5.";;
    esac

    # Add a newline for better readability.
    echo
done
