import base64
import os
from transformers import BlipProcessor, BlipForConditionalGeneration
from diffusers import StableDiffusionPipeline
from PIL import Image
from datetime import datetime
import torch

processor = BlipProcessor.from_pretrained("./lib/models/agi/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("./lib/models/agi/blip-image-captioning-base")

art = StableDiffusionPipeline.from_single_file('./lib/models/agi/sd/any_loli.safetensors', safety_checker=None, load_safety_checker=None)
art.to('mps')

def capture_image(data):
    image_data_url = data['image']
    image_name = data['name']

    # Decode the base64 image data URL and process it as needed
    image_data = base64.b64decode(image_data_url.split(',')[1])
    image_path = os.path.join('static', 'img', 'call', f'{image_name}.jpg')
    with open(image_path, 'wb') as image_file:
        image_file.write(image_data)

    img_path = f'static/img/call/{image_name}.jpg' 
    raw_image = Image.open(img_path).convert('RGB')

    # unconditional image captioning
    inputs = processor(raw_image, return_tensors="pt")

    out = model.generate(**inputs, max_length=150)
    image_caption = str(processor.decode(out[0], skip_special_tokens=True))
    print("Image caption: " + image_caption)

    # Respond with a success message
    return image_caption

def create_image(prompt):
    prompt_beautifier = ", high resolution, 4k, 8k, hd, uhd, best quality, highres, high quality"
    negative_prompt = "worst quality, low quality, blurry, deformed iris, deformed pupils, bad eyes, cross eyed, poorly drawn face, cloned face, extra fingers, mutated hands, fused fingers, too many fingers, missing arms, missing legs, extra arms, extra legs, poorly drawn hands, bad anatomy, bad proportions, cropped, lowres, long neck"

    prompt = prompt + prompt_beautifier
    image = art(prompt=prompt, negative_prompt=negative_prompt, num_inference_steps=20).images[0]

    # Get the current time in milliseconds
    current_time_milliseconds = int((datetime.utcnow() - datetime(1970, 1, 1)).total_seconds() * 1000)
    image_name = str(current_time_milliseconds) + '-art' + '.png'

    image.save(f"static/img/art/{image_name}")
    print('image_name: ' + image_name)

    return image_name