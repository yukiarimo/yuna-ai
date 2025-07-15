#!/bin/bash

# Function to display a welcome message
info() {
    clear
    echo -e "Welcome to Yuna Management Script!\n"
    echo "================================"
    echo "Yuna is an open source AI assistant to help with daily tasks."
    echo "This script installs the necessary dependencies and models."
    echo "Read more in the README.md file."
    echo "================================"
    echo "1. Go back"

    read -p "> " choice
    case $choice in
        1) return ;;
        *) echo "Invalid choice. Please try again." && sleep 2 ;;
    esac
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

# Function to install dependencies
install_dependencies() {
    clear
    while true; do
        echo "========== Installation =========="
        echo "1. CPU"
        echo "2. NVIDIA GPU"
        echo "3. AMD GPU"
        echo "4. Metal"
        echo "5. Go back"

        read -p "> " choice
        case $choice in
            1) install_cpu ;;
            2) install_nvidia ;;
            3) install_amd ;;
            4) install_metal ;;
            5) return ;;
            *) echo "Invalid choice. Please try again." && sleep 2 ;;
        esac
    done
}

install_cpu() {
    echo "Installing CPU dependencies..."
    pip install -r requirements.txt --break-system-packages
    echo "CPU dependencies installed."
    sleep 2
}

install_nvidia() {
    echo "Installing NVIDIA dependencies..."
    CMAKE_ARGS="-DLLAMA_CUBLAS=on" pip install llama-cpp-python
    pip install -r requirements-nvidia.txt --break-system-packages
    echo "NVIDIA dependencies installed."
    sleep 2
}

install_amd() {
    echo "Installing AMD dependencies..."
    CMAKE_ARGS="-DLLAMA_HIPBLAS=ON -DCMAKE_C_COMPILER=/opt/rocm/llvm/bin/clang -DCMAKE_CXX_COMPILER=/opt/rocm/llvm/bin/clang++ -DCMAKE_PREFIX_PATH=/opt/rocm -DAMDGPU_TARGETS=gfx1100" FORCE_CMAKE=1 pip install llama-cpp-python
    pip install -r requirements-amd.txt --break-system-packages
    echo "AMD dependencies installed."
    sleep 2
}

install_metal() {
    echo "Installing Metal dependencies..."
    CMAKE_ARGS="-DLLAMA_METAL=on" pip install llama-cpp-python
    pip install -r requirements-macos.txt --break-system-packages
    echo "Metal dependencies installed."
    sleep 2
}

# Function to install models
install_models() {
    clear
    while true; do
        echo "========== Install Models =========="
        echo "1. All"
        echo "2. AGI"
        echo "3. Vision"
        echo "4. Art"
        echo "5. Himitsu"
        echo "6. Talk"
        echo "7. Yuna"
        echo "8. Go back"
        echo "9. Exit"

        read -p "Enter your choice: " choice
        case $choice in
            1) install_all_models ;;
            2) install_all_agi_models ;;
            3) install_vision_model ;;
            4) echo "Art model not implemented yet." && sleep 2 ;;
            5) echo "Himitsu model not implemented yet." && sleep 2 ;;
            6) install_talk_model ;;
            7) install_yuna_model ;;
            8) return ;;
            9) goodbye; exit ;;
            *) echo "Invalid choice. Please try again." && sleep 2 ;;
        esac
    done
}

install_all_models() {
    install_all_agi_models
    install_yuna_model
}

install_all_agi_models() {
    echo "Installing all AGI models..."
    install_vision_model
    echo "AGI models installed."
    sleep 2
}

install_vision_model() {
    echo "Installing Vision model..."
    wget https://huggingface.co/yukiarimo/yuna-ai-vision-v2/resolve/main/yuna-ai-miru-v0.gguf -P lib/utils/models/agi/miru/
    wget https://huggingface.co/yukiarimo/yuna-ai-vision-v2/resolve/main/yuna-ai-miru-eye-v0.gguf -P lib/utils/models/agi/miru/
    echo "Vision model installed."
    sleep 2
}

install_talk_model() {
    echo "Installing Talk model..."
    read -p "Enter the Hugging Face model name (e.g., username/model): " model_name
    git clone https://huggingface.co/$model_name lib/utils/models/agi/voice
    echo "Talk model installed."
    sleep 2
}

install_yuna_model() {
    read -p "Select Yuna model version (V1, V2, V3, V3-atomic): " version
    read -p "Select model size (Q3_K_M, Q4_K_M, Q5_K_M, Q6_K): " size
    version=$(echo "$version" | tr '[:upper:]' '[:lower:]')
    size=$(echo "$size" | tr '[:upper:]' '[:lower:]')

    model_url="https://huggingface.co/yukiarimo/yuna-ai-${version}/resolve/main/yuna-ai-${version}-${size}.gguf"
    wget "$model_url" -P lib/utils/models/yuna/
    echo "Yuna model installed."
    sleep 2
}

# Function to clear models
clear_models() {
    clear
    echo "This will delete all models inside 'lib/utils/models/'."
    read -p "Proceed? (y/n): " confirm
    case $confirm in
        [Yy]) rm -rf lib/utils/models/* && echo "Models cleared." ;;
        [Nn]) echo "Operation canceled." ;;
        *) echo "Invalid choice." ;;
    esac
    sleep 2
}

# Submenu for configuration
configure_project() {
    while true; do
        clear
        echo "========== Configure Project =========="
        echo "1. Install models"
        echo "2. Clear models"
        echo "3. Dependencies Setup"
        echo "4. Info"
        echo "5. Go back"

        read -p "> " choice
        case $choice in
            1) install_models ;;
            2) clear_models ;;
            3) install_dependencies ;;
            4) info ;;
            5) break ;;
            *) echo "Invalid choice. Please try again." && sleep 2 ;;
        esac
    done
}

# Function for one-click install
one_click_install() {
    install_dependencies
    install_all_models
    read -p "Start Yuna? (y/n): " confirm
    case $confirm in
        [Yy]) start_yuna ;;
        [Nn]) echo "Installation complete." ;;
        *) echo "Invalid choice." ;;
    esac
}

# Function to contribute
contribute() {
    echo "Contributing to Yuna..."
    git fetch origin main
    git merge main
    git push origin dev:main
    echo "Contribution done."
    sleep 2
}

# Function to donate
donate() {
    while true; do
        clear
        echo "========== Donate =========="
        echo "Support Yuna development:"
        echo "1. Patreon"
        echo "2. Ko-fi"
        echo "3. Buy Me a Coffee"
        echo "4. Go back"

        read -p "> " choice
        case $choice in
            1) open https://www.patreon.com/YukiArimo ;;
            2) open https://ko-fi.com/yukiarimo ;;
            3) open https://www.buymeacoffee.com/yukiarimo ;;
            4) return ;;
            *) echo "Invalid choice. Please try again." && sleep 2 ;;
        esac
    done
}

# Display the main menu
while true; do
    clear
    echo "██    ██ ██    ██ ███   ██ ███████"
    echo " ██  ██  ██    ██ ████  ██ ██   ██"
    echo "  ████   ██    ██ ██ ██ ██ ███████"
    echo "   ██    ██    ██ ██  ████ ██   ██"
    echo "   ██    ████████ ██   ███ ██   ██"
    echo
    echo "========== Main Menu =========="
    echo "1. Start Yuna"
    echo "2. Dependencies Setup"
    echo "3. One Click Install"
    echo "4. Configure Project"
    echo "5. Contribute to Yuna"
    echo "6. Info"
    echo "7. Donate"
    echo "8. Exit"

    read -p "> " choice
    case $choice in
        1) start_yuna ;;
        2) install_dependencies ;;
        3) one_click_install ;;
        4) configure_project ;;
        5) contribute ;;
        6) info ;;
        7) donate ;;
        8) goodbye; exit ;;
        *) echo "Invalid choice. Please try again." && sleep 2 ;;
    esac
done
