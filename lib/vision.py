import json
import os
from diffusers import StableDiffusionPipeline
from PIL import Image
from datetime import datetime
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from .yvision.moondream import Moondream
from transformers import CodeGenTokenizerFast as Tokenizer

use_cpu = False

device = torch.device("cpu") if use_cpu else (torch.device("cuda") if torch.cuda.is_available() else (torch.device("mps") if torch.backends.mps.is_available() else torch.device("cpu")))
dtype = torch.float32 if use_cpu else (torch.float16 if torch.cuda.is_available() or torch.backends.mps.is_available() else torch.float32)

if device != torch.device("cpu"):
    print("Using device:", device)

if os.path.exists("static/config.json"):
    with open("static/config.json", 'r') as file:
        config = json.load(file)

agi_model_dir = config["server"]["agi_model_dir"]
model_id = f"{agi_model_dir}/yuna-vision"

if config["ai"]["vision"] == True:
    tokenizer = Tokenizer.from_pretrained(model_id)
    moondream = Moondream.from_pretrained(model_id).to(device=device, dtype=dtype)
    moondream.eval()

if config["ai"]["art"] == True:
    art = StableDiffusionPipeline.from_single_file(f'{agi_model_dir}art/{config["server"]["art_default_model"]}', safety_checker=None, load_safety_checker=None, guidance_scale=7.5, noise_scale=0.05, device=config["server"]["device"])
    art.to(config["server"]["device"])

def create_image(prompt):
    prompt_beautifier = ", high resolution, 4k, 8k, hd, uhd, best quality, highres, high quality"
    negative_prompt = "worst quality, low quality, blurry, deformed iris, deformed pupils, bad eyes, cross eyed, poorly drawn face, cloned face, extra fingers, mutated hands, fused fingers, too many fingers, missing arms, missing legs, extra arms, extra legs, poorly drawn hands, bad anatomy, bad proportions, cropped, lowres, long neck"

    prompt = prompt + prompt_beautifier
    image = art(prompt=prompt, negative_prompt=negative_prompt, num_inference_steps=20).images[0]

    # Get the current time in milliseconds
    current_time_milliseconds = int((datetime.utcnow() - datetime(1970, 1, 1)).total_seconds() * 1000)
    image_name = str(current_time_milliseconds) + '-art' + '.png'

    image.save(f"static/img/art/{image_name}")

    return image_name

def capture_image(image_path=None, prompt=None, use_cpu=False):
    image = Image.open(image_path)
    image_embeds = moondream.encode_image(image)
    answer = moondream.answer_question(image_embeds, prompt, tokenizer)
    return [answer, image_path]