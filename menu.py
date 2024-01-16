import subprocess
import os
import sys

try:
    import pytermgui as ptg
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pytermgui"])
    import pytermgui as ptg

def _define_layout() -> ptg.Layout:
    layout = ptg.Layout()
    layout.add_slot(name='Header', height=1)
    layout.add_break()
    layout.add_slot(name='Body')
    layout.add_slot(name='Body right', width=0.4)
    layout.add_break()
    layout.add_slot(name='Footer', height=1)
    return layout

windows = {}
manager = ptg.WindowManager()
header = ptg.Window(
            "[210 bold] Yuna Management Script",
            box="EMPTY",
        )
footer = ptg.Window(ptg.Button("Quit", lambda *_: manager.stop()), box="EMPTY")
layout_ = _define_layout()
manager.layout = layout_

def info(event):
    os.system('clear')
    print("Welcome to Yuna Management Script!")
    print("This script is used to manage Yuna.")
    print("You can install or update dependencies, install models, configure Yuna, and more.")
    print("This script is still under development.")
    pass

def goodbye(event):
    os.system('clear')
    print("Thank you for using Yuna Management Script. Goodbye!")
    exit()

def start_yuna(event):
    print("Starting Yuna...")
    subprocess.check_call([sys.executable, 'index.py'])

def install_update_dependencies(event):
    windows['configure_gpu'] = ptg.Window(
        ptg.Label("[210 bold]========== Install =========="),
        ptg.Button("CPU", onclick=install_cpu),
        ptg.Button("NVIDIA GPU", onclick=install_nvidia),
        ptg.Button("AMD GPU", onclick=install_amd),
        ptg.Button("Metal", onclick=install_metal),
        ptg.Button("Back", onclick=lambda event: manager.remove(windows['configure_gpu']))
    )
    manager.add(windows['configure_gpu'], assign=True)
    manager.focus(windows['configure_gpu'])

def install_cpu(event):
    print("Installing CPU dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print("CPU dependencies installed!")
    if 'configure_gpu' in windows:
        manager.remove(windows['configure_gpu'])
    manager.focus(main_menu)

def install_nvidia(event):
    print("Installing NVIDIA dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-nvidia.txt"])
    print("NVIDIA dependencies installed!")
    if 'configure_gpu' in windows:
        manager.remove(windows['configure_gpu'])
    manager.focus(main_menu)

def install_amd(event):
    print("Installing AMD dependencies...")
    subprocess.check_call("CT_HIPBLAS=1", [sys.executable, "-m", "pip", "install", "ctransformers", "--no-binary", "ctransformers"])
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-amd.txt"])
    print("AMD dependencies installed!")
    if 'configure_gpu' in windows:
        manager.remove(windows['configure_gpu'])
    manager.focus(main_menu)

def install_metal(event):
    print("Installing Metal dependencies...")
    subprocess.check_call("CT_METAL=1", [sys.executable, "-m", "pip", "install", "ctransformers", "--no-binary", "ctransformers"])
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements-macos.txt"])
    print("Metal dependencies installed!")
    if 'configure_gpu' in windows:
        manager.remove(windows['configure_gpu'])
    manager.focus(main_menu)


def configure_submenu(event):
    windows['configure_menu'] = ptg.Window(
        ptg.Label("[210 bold]========== Install =========="),
        ptg.Button("Install models", onclick=install_models),
        ptg.Button("Clear models", onclick=clear_models),
        ptg.Button("Backup", onclick=backup),
        ptg.Button("Restore", onclick=restore),
        ptg.Button("Back", onclick=lambda event: manager.remove(windows['configure_menu']))
    )
    manager.add(windows['configure_menu'], assign=True)
    manager.focus(windows['configure_menu'])

def install_models(event):
    windows['configure_model'] = ptg.Window(
        ptg.Label("[210 bold]========== Install =========="),
        ptg.Button("All Models", onclick=install_all_models),
        ptg.Button("All AGI Models", onclick=install_agi),
        ptg.Button("Vision", onclick=install_vision),
        ptg.Button("Art", onclick=install_art),
        ptg.Button("Emotion", onclick=install_emotion),
        ptg.Button("Yuna", onclick=install_yuna),
        ptg.Button("Back", onclick=lambda event: manager.remove(windows['configure_model']))
    )

    manager.add(windows['configure_model'], assign=True)
    manager.focus(windows['configure_model'])
    
def install_all_models(event):
    install_agi(event)
    install_yuna(event)

def install_agi(event):
    print("Installing AGI models...")
    install_vision(event)
    install_art(event)
    install_emotion(event)

def install_vision(event):
    print("Installing Vision models...")
    subprocess.check_call(["git", "clone", "https://huggingface.co/yukiarimo/yuna-vision", "lib/models/agi/yuna-vision/"])

def install_art(event):
    print("Installing Art models...")
    subprocess.check_call(["wget", "https://huggingface.co/yukiarimo/anyloli/resolve/main/any_loli.safetensors", "-P", "lib/models/agi/art/"])

def install_emotion(event):
    print("Installing Vision model...")
    subprocess.check_call(["git", "clone", "https://huggingface.co/yukiarimo/yuna-emotion", "lib/models/agi/yuna-emotion/"])

def install_yuna(event):
    print("Installing Yuna model...")
    subprocess.check_call(["wget", "https://huggingface.co/yukiarimo/yuna-ai/resolve/main/yuna-ggml-q5.gguf", "-P", "lib/models/yuna/"])

def clear_models(event):
    windows['clear_models'] = ptg.Window(
        ptg.Label("[210 bold]========== Clear =========="),
        ptg.Label("This will delete all models inside 'lib/models/'."),
        ptg.Label("Do you want to proceed?"),
        ptg.Button("Yes", onclick=clear_models_confirm),
        ptg.Button("No", onclick=lambda event: manager.remove(windows['clear_models'])),
    )
    manager.add(windows['clear_models'], assign=True)
    manager.focus(windows['clear_models'])

def clear_models_confirm(event):
    print("Clearing models...")
    subprocess.check_call(["rm", "-rf", "lib/models/*"])
    print("Models cleared")
    manager.remove(windows['clear_models'])
    if 'configure_model' in windows:
        manager.focus(windows['configure_model'])
    else:
        manager.focus(main_menu)

def backup(event):
    print("Coming Soon...")
    return

def restore(event):
    print("Coming Soon...")
    return
        
def OneClickInstall(event):
    install_update_dependencies(event)
    install_models(event)

main_menu = ptg.Window(
    ptg.Label("[210 bold]========== Menu =========="),
    ptg.Button("Start Yuna", onclick=start_yuna),
    ptg.Button("Install or Update dependencies", onclick=install_update_dependencies),
    ptg.Button("One Click Install", onclick=OneClickInstall),
    ptg.Button("Configure", onclick=configure_submenu),
    ptg.Button("Reset", onclick=clear_models),
    ptg.Button("Exit", onclick=goodbye),
    ptg.Button("Info", onclick=info),
)
manager.add(header)
manager.add(main_menu)
#manager.add(footer)
manager.run()