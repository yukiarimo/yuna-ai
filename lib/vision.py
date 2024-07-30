import json
import os
from diffusers import StableDiffusionPipeline
from datetime import datetime
from llama_cpp import Llama
from llama_cpp.llama_chat_format import MoondreamChatHandler
from lib.audio import speak_text

if os.path.exists("static/config.json"):
    with open("static/config.json", 'r') as file:
        config = json.load(file)

agi_model_dir = config["server"]["agi_model_dir"] + "vision/"
model_id = f"{agi_model_dir}yuna-ai-miru-v0.gguf"
model_id_eyes = f"{agi_model_dir}yuna-ai-miru-eye-v0.gguf"

if config["ai"]["vision"] == True:
    chat_handler = MoondreamChatHandler(clip_model_path=model_id_eyes)
    llm = Llama(
        model_path=model_id,
        chat_handler=chat_handler,
        n_ctx=4096,
        seed=-1,
        n_batch=512,
        n_gpu_layers=-1,
        verbose=False,
    )

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

def capture_image(image_path=None, prompt=None, use_cpu=False, speech=False):
    # print the parameters
    print(f"image_path: {image_path}")
    print(f"prompt: {prompt}")

    # Get the absolute path to the image file
    abs_image_path = os.path.join(os.getcwd(), image_path)

    result = llm.create_chat_completion(
    messages = [
        {"role": "system", "content": "You are an assistant who perfectly describes images and answers questions about them."},
        {
            "role": "user",
            "content": [
                {"type" : "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": "file://" + abs_image_path } }
            ]
        }
        ]
    )

    answer = result['choices'][0]['message']['content']
    if speech:
        speak_text(answer)
    return [answer, image_path]