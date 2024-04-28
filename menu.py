import subprocess
import os
import sys
import webbrowser

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
    windows['info'] = ptg.Window(
    ptg.Label("[210 bold]========== Info =========="),
    ptg.Label("Welcome to Yuna Management Script"),
    ptg.Label("This script is used to manage Yuna."),
    ptg.Label("You can install or update dependencies, install models, configure Yuna, and more."),
    ptg.Label("This script is still under development."),
    ptg.Label("For more information, refer to the README.md file."),
    ptg.Label("You can support the development of Yuna by donating:"),
    ptg.Button("Patreon", onclick=patreon),
    ptg.Button("Back", onclick=lambda event: manager.remove(windows['info'])),
    )
    manager.add(windows['info'], assign=True)
    manager.focus(windows['info'])

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
        ptg.Label("Make sure to install torch before running the script."),
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
    env = os.environ.copy()
    env["CMAKE_ARGS"] = "-DLLAMA_CUBLAS=on"
    subprocess.check_call([sys.executable, "-m", "pip", "install", "llama-cpp-python"], env=env)
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print("NVIDIA dependencies installed!")
    if 'configure_gpu' in windows:
        manager.remove(windows['configure_gpu'])
    manager.focus(main_menu)

def install_amd(event):
    print("Installing AMD dependencies...")
    env = os.environ.copy()
    # YOU NEED TO SPECIFY THE CORRECT GFX NUMBER FOR YOUR GPU
    # THE DEFAULT IS GFX1100 - which was used since I have a  RX7600
    # Check the Shader ISA Instruction Set for your GPU
    env["CMAKE_ARGS"] = "-DLLAMA_HIPBLAS=ON -DCMAKE_C_COMPILER=/opt/rocm/llvm/bin/clang -DCMAKE_CXX_COMPILER=/opt/rocm/llvm/bin/clang++ -DCMAKE_PREFIX_PATH=/opt/rocm -DAMDGPU_TARGETS=gfx1100"
    env["FORCE_CMAKE"] = "1"
    subprocess.check_call([sys.executable, "-m", "pip", "install", "llama-cpp-python"], env=env)
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print("AMD dependencies installed!")
    if 'configure_gpu' in windows:
        manager.remove(windows['configure_gpu'])
    manager.focus(main_menu)

def install_metal(event):
    print("Installing Metal dependencies...")
    env = os.environ.copy()
    env["CMAKE_ARGS"] = "-DLLAMA_METAL=on"
    subprocess.check_call([sys.executable, "-m", "pip", "install", "llama-cpp-python"], env=env)
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
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
    subprocess.check_call(["wget", "https://huggingface.co/yukiarimo/yuna-ai-v2/resolve/main/yuna-ai-v2-q6_k.gguf", "-P", "lib/models/yuna/"])

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

def patreon(event):
    webbrowser.open('https://www.patreon.com/yukiarimo')

def kofi(event):
    webbrowser.open('https://ko-fi.com/yukiarimo')

def donate(event):
    windows['donate'] = ptg.Window(
    ptg.Label("[210 bold]========== Donate =========="),
    ptg.Label("Yuna is an open source project. You can support the development of Yuna by donating"),
    ptg.Button("Patreon", onclick=patreon),
    ptg.Button("Ko-Fi", onclick=kofi),
    ptg.Button("Back", onclick=lambda event: manager.remove(windows['donate'])),
    )
    manager.add(windows['donate'], assign=True)
    manager.focus(windows['donate'])

main_menu = ptg.Window(
    ptg.Label("""
██    ██ ██    ██ ███   ██ ███████   ███████ ██
 ██  ██  ██    ██ ████  ██ ██   ██   ██   ██ ██
  ████   ██    ██ ██ ██ ██ ███████   ███████ ██
   ██    ██    ██ ██  ████ ██   ██   ██   ██ ██
   ██    ████████ ██   ███ ██   ██   ██   ██ ██
    """),
    ptg.Label("[210 bold]========== Menu =========="),
    ptg.Button("Start Yuna", onclick=start_yuna),
    ptg.Button("Install or Update dependencies", onclick=install_update_dependencies),
    ptg.Button("One Click Install", onclick=OneClickInstall),
    ptg.Button("Configure", onclick=configure_submenu),
    ptg.Button("Reset", onclick=clear_models),
    ptg.Button("Donate", onclick=donate),
    ptg.Button("Exit", onclick=goodbye),
    ptg.Button("Info", onclick=info),
)
manager.add(header)
manager.add(main_menu)
manager.run()