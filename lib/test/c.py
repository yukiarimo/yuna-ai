from ctransformers import AutoModelForCausalLM

llm = AutoModelForCausalLM.from_pretrained(
  "lib/yunacpp/models/pygmalion-2-7b.Q5_K_M.gguf",
  model_type='llama2',
  top_k=40,
  top_p=0.1,
  temperature=0.7,
  repetition_penalty=1.18,
  last_n_tokens=64,
  seed=123,
  batch_size=64,
  context_length=8192,
  max_new_tokens=300,
  gpu_layers=1
)

while True:
    test = input("YUKI: ")

    print("Yuna: ", end="")
    for text in llm("Yuki: " + test + "\nYuna:", stream=True):
        print(text, end="", flush=True)
    print()