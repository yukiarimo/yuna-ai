from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
from flask import Flask, request, jsonify
import torch
import torchvision.transforms as transforms
from PIL import Image


device = "cpu"
torch.device(device)

model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
feature_extractor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")

app = Flask(__name__)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

@app.route('/vision', methods=['POST'])
def vision_data():
    image_file = request.json.get('file')
    print(image_file)
    image = Image.open(image_file)
    
    # Apply the transformation to the image
    image_tensor = transform(image)
    image_tensor = image_tensor.unsqueeze(0).to(device)
    
    # Generate the image caption
    with torch.no_grad():
        output_ids = model.generate(image_tensor)
        captions = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    
    return captions

if __name__ == '__main__':
    app.run(port=3004)
