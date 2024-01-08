import subprocess
import os
import sys

def info():
    os.system('clear')
    print("Welcome to Yuna Management Script!")

def goodbye():
    os.system('clear')
    print("Thank you for using Yuna Management Script. Goodbye!")

def start_yuna():
    print("Starting Yuna...")
    if os.path.exists('index.py'):
        subprocess.check_call([sys.executable, 'index.py'])
    else:
        print("Yuna not found!")
    return

def install_update_dependencies():
    while True:
        os.system('clear')

        print("========== Installation... ==========")
        print("1. CPU")
        print("2. NVIDIA GPU")
        print("3. AMD GPU")
        print("4. Back")

        platform = input("> ")

        if platform == '1':
            install_cpu()
        elif platform == '2':
            install_nvidia()
        elif platform == '3':
            install_amd()
        elif platform == '4':
            return
        else: 
            print("Invalid option!")

def install_cpu():
    print("Installing CPU dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-cpu.txt"])
    print("CPU dependencies installed!")

def install_nvidia():
    print("Installing NVIDIA dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-nvidia.txt"])
    print("NVIDIA dependencies installed!")

def install_amd():
    print("Installing AMD dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-amd.txt"])
    print("AMD dependencies installed!")

def configure_submenu():
    while True:
        os.system('clear')

        print("========== Menu ==========")
        print("1. Install models")
        print("2. Clear models")
        print("3. Backup")
        print("4. Restore")
        print("5. Back")


        choice = input("> ")

        if choice == '1':
            install_models()
        elif choice == '2':
            clear_models()
        elif choice == '3':
            backup()
        elif choice == '4':
            restore()
        elif choice == '5':
            return
        else: 
            print("Invalid option!")

def configure():
    configure_submenu()

def install_models():
    print("========== Install Models Menu ==========")
    print("1. All models")
    print("2. All AGI")
    print("3. Vision")
    print("4. Art")
    print("5. Emotion")
    print("6. Yuna")
    print("7. Back")

    model = input("> ")

    if model == '1':
        install_all_models()
    elif model == '2':
        install_agi()
    elif model == '3':
        install_vision()
    elif model == '4':
        install_art()
    elif model == '5':
        install_emotion()
    elif model == '6':
        install_yuna()
    elif model == '7':
        return
    else:
        print("Invalid option!")

def install_all_models():
    install_agi()
    install_yuna()

def install_agi():
    print("Installing AGI models...")
    install_vision()
    install_art()
    install_emotion()

def install_vision():
    print("Installing Vision models...")
    subprocess.check_call(["git", "clone", "https://huggingface.co/yukiarimo/yuna-vision", "lib/models/agi/yuna-vision/"])

def install_art():
    print("Installing Art models...")
    subprocess.check_call(["wget", "https://huggingface.co/yukiarimo/anyloli/resolve/main/any_loli.safetensors", "-P", "lib/models/agi/art/"])

def install_emotion():
    print("Installing Vision model...")
    subprocess.check_call(["git", "clone", "https://huggingface.co/yukiarimo/yuna-emotion", "lib/models/agi/yuna-emotion/"])

def install_yuna():
    print("Installing Yuna model...")
    subprocess.check_call(["wget", "https://huggingface.co/yukiarimo/yuna-ai/resolve/main/yuna-ggml-q5.gguf", "-P", "lib/models/yuna/"])

def clear_models():
    print("========== Clear Models Menu ==========")
    print("This will delete all models inside 'lib/models/'.")
    print("Do you want to proceed? (y/n): ")

    delete = input("> ")
    if delete == 'y':
        print("Clearing models...")
        subprocess.check_call(["rm", "-rf", "lib/models/*"])
        print("Models cleared")
    if delete == 'no':
        return

def backup():
    print("Coming Soon...")
    return

def restore():
    print("Coming Soon...")
    return
        
def OneClickInstall():
    install_update_dependencies()
    install_models()

    print("Do you want to start Yuna? (y/n): ")
    start = input("> ")
    if start == 'y':
        start_yuna()
    elif start == 'n':
        return
    else :
        print("Invalid option!")
    
while True:
    os.system('clear')

    print("========== Menu ==========")
    print("1. Start Yuna")
    print("2. Install or Update dependencies")
    print("3. One Click Install")
    print("4. Configure")
    print("5. Reset")
    print("6. Exit")
    print("7. Info")

    mainmenu = input("> ")

    if mainmenu == '1':
        start_yuna()
    elif mainmenu == '2':
        install_update_dependencies()
    elif mainmenu == '3':
        OneClickInstall()
    elif mainmenu == '4':
        configure()
    elif mainmenu == '5':
        clear_models()
    elif mainmenu == '6':
        goodbye()
        break
    elif mainmenu == '7':
        info()
    else: 
        print("Invalid option!")