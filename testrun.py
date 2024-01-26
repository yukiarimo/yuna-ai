from llama_cpp import Llama

# Assuming 'config' is a dictionary with all the necessary configurations
llm = Llama(
    model_path="lib/models/yuna/yuna-ai-q5.gguf",
    n_gpu_layers=1,
    n_ctx=512,
    n_batch=256,
    seed=-1,
)

response = llm(
    "Yuki: What is your name?\nYuna:",
    top_k=40,
    top_p=0.92,
    temperature=0.7,
    repeat_penalty=1.2,
    max_tokens=32,
    stop=["Q:"]
)

print(response)