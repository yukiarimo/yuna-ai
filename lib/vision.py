import json
import os
from diffusers import StableDiffusionPipeline
from PIL import Image
from datetime import datetime
from PIL import Image
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

if os.path.exists("static/config.json"):
    with open("static/config.json", 'r') as file:
        config = json.load(file)

agi_model_dir = config["server"]["agi_model_dir"]

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
    model_id = f"{agi_model_dir}/yuna-vision"
    model = AutoModelForCausalLM.from_pretrained(
        model_id, 
        trust_remote_code=True,
        torch_dtype=torch.float16
    ).to(config["server"]["device"])
    tokenizer = AutoTokenizer.from_pretrained(model_id)

    image = Image.open(image_path)
    enc_image = model.encode_image(image)
    answer = model.answer_question(enc_image, prompt, tokenizer)
    return [answer, image_path]