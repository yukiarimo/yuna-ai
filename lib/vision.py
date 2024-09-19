import os
from lib.audio import speak_text
from lib.generate import get_config

config = get_config()

if config["ai"]["miru"] == True:
    from llama_cpp import Llama
    from llama_cpp.llama_chat_format import MoondreamChatHandler

    llm = Llama(
        model_path="lib/models/agi/miru/" + config["server"]["miru_default_model"],
        chat_handler=MoondreamChatHandler(clip_model_path="lib/models/agi/miru/" + config["server"]["eyes_default_model"]),
        n_ctx=4096,
        last_n_tokens_size=config["ai"]["last_n_tokens_size"],
        seed=config["ai"]["seed"],
        n_batch=config["ai"]["batch_size"],
        n_gpu_layers=config["ai"]["gpu_layers"],
        n_threads=config["ai"]["threads"],
        use_mmap=config["ai"]["use_mmap"],
        use_mlock=config["ai"]["use_mlock"],
        flash_attn=config["ai"]["flash_attn"],
        offload_kqv=config["ai"]["offload_kqv"],
        verbose=False
    )

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