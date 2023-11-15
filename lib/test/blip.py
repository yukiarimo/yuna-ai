"""
import requests
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration

processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

input("CON: ")
if(True):
    img_path = 'static/img/yuna.png' 
    raw_image = Image.open(img_path).convert('RGB')

    # unconditional image captioning
    inputs = processor(raw_image, return_tensors="pt")

    out = model.generate(**inputs, max_length=150)
    print(processor.decode(out[0], skip_special_tokens=True))

"""

import os
import json

if os.path.exists("config.json"):
    with open("config.json", 'r') as file:
        config = json.load(file)

print(config["request"]["use_default_badwordsids"] == False)