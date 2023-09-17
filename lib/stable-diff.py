import torch
from diffusers import StableDiffusionPipeline

device = "mps" if torch.backends.mps.is_available() else "cpu"
torch.device(device)

pipe = StableDiffusionPipeline.from_pretrained('./image-gen', torch_dtype=torch.float16)
pipe = pipe.to(device)

prompt = "Japanese girl with background of london bridge in color with text"
image = pipe(prompt).images[0]  
    
image.save("result.png")
