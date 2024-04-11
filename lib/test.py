# LangChain:

from langchain.llms import LlamaCpp
from langchain import PromptTemplate, LLMChain
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.text_splitter import CharacterTextSplitter

model_path = "lib/models/yuna/yuna-ai-v2-q6_k.gguf"

# Updated template to include Memory, Character, and Question sections
template = """
### Memory:
{memory}

### Character:
You're a cute girl

### Question: 
{question}

### Answer:
"""

prompt = PromptTemplate(template=template, input_variables=["memory", "question"])

# Callbacks support token-wise streaming
callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])

n_gpu_layers = 40  # Change this value based on your model and your GPU VRAM pool.
n_batch = 512  # Should be between 1 and n_ctx, consider the amount of VRAM in your GPU.

llm = LlamaCpp(
    model_path=model_path,
    n_gpu_layers=n_gpu_layers,
    n_batch=n_batch,
    callback_manager=callback_manager,
    verbose=True,
    # temperature=1
)

llm_chain = LLMChain(prompt=prompt, llm=llm)

memory_content = ""
# load the text.txt file
with open("text.txt", "r") as file:
    memory_content = file.read()

# Split the memory content into chunks
text_splitter = CharacterTextSplitter(chunk_size=512, chunk_overlap=0)
texts = text_splitter.split_text(memory_content)

# User question
question = "Please summarize the memory. Then, Please give me three bullet points: 1. Who are you? 2. What was the question? 3. What is the answer?"

# Process each chunk separately and store the results
results = []
for text in texts:
    result = llm_chain.run({"memory": text, "question": question})
    results.append(result)

# Combine the results
combined_result = "\n".join(results)

# Print the combined result
print(combined_result)


# Novel Gen Example:
import re
import requests
import json
import os

systemPrompt = "You're a writer who has to write with confidence and accuracy. As a writer, your exceptional problem-solving skills, expertise in storytelling, unwavering dedication, curiosity, and eagerness to learn make you a versatile and adaptable writer who is always ready to take on new challenges. Write a precise and targeted text based on the user input."

class TextGenerator:
    def __init__(self):
        self.openai_api_key = 'sk-CPP3318'

    def generate_text(self, prompt, parameters="", max_tokens=512):
        data = {
            "n": 1,
            "max_context_length": 4096,
            "max_length": max_tokens,
            "rep_pen": 1.11,
            "temperature": 0.7,
            "top_p": 1,
            "top_k": 100,
            "top_a": 0,
            "typical": 1,
            "tfs": 1,
            "rep_pen_range": 320,
            "rep_pen_slope": 0.7,
            "sampler_order": [6, 0, 1, 3, 4, 2, 5],
            "memory": "",
            "genkey": "KCPP3318",
            "min_p": 0,
            "dynatemp_range": 0,
            "dynatemp_exponent": 1,
            "smoothing_factor": 0,
            "presence_penalty": 0,
            "logit_bias": {},
            "prompt": f"### System:\n{systemPrompt}\n\n### Instruction:\n{prompt}\n### Parameters:\n{parameters}\n\n### Response:\n",
            "quiet": True,
            "stop_sequence": ["#"],
            "use_default_badwordsids": False
        }

        print(f"Prompt: ", f"### System:\n{systemPrompt}\n\n### Instruction:\n{prompt}\n\n{parameters}\n\n### Response:\n")

        headers = {'Content-Type': 'application/json'}

        response = requests.post("http://localhost:5001/api/v1/generate", data=json.dumps(data), headers=headers)

        print(f"Response: {response.json()['results'][0]['text'].strip()}\n\n")

        return response.json()['results'][0]['text'].strip()

class NovelWriter:
    def __init__(self):
        self.text_generator = TextGenerator()

    def write_novel(self, parameters):
        # Generate a story plot
        plot = self.text_generator.generate_text("Generate a story plot based on the parameters provided.", parameters)
        
        # Check if plot points are in a numbered list format and split accordingly
        if re.search(r'\d+\.', plot):
            plot_points = re.split(r'\d+\.\s*', plot)
            plot_points = [point.strip() for point in plot_points if point.strip()]  # Remove empty strings and strip whitespace
        else:
            plot_points = plot.split('\n')

        # Create chapters for each plot point
        chapters = []
        table_of_contents = "Table of Contents:\n"
        for i, plot_point in enumerate(plot_points):
            chapter_title = self.text_generator.generate_text("Create a title for a chapter based on this plot point.", plot_point)
            chapter_content = self.text_generator.generate_text("Write a chapter based on this plot point.", plot_point)
            chapters.append((chapter_title, chapter_content))
            table_of_contents += f"Chapter {i+1}: {chapter_title}\n"

        # Ask for a book title
        book_title = self.text_generator.generate_text("Generate a book title based on the story plot.", plot)

        # Combine all chapters
        novel = f"Title: {book_title}\n\n{table_of_contents}\n\n"
        for i, (title, content) in enumerate(chapters):
            novel += f"Chapter {i+1}: {title}\n{content}\n\n"

        # Save the novel to a text file
        self._save_to_file(book_title, novel)

    def _save_to_file(self, title, content):
        if not os.path.exists('novels'):
            os.mkdir('novels')
        file_path = f'novels/novel.txt'
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Novel "{title}" has been written to {file_path}')

# Example usage
novel_writer = NovelWriter()
parameters = "A kingdom hidden in the deep caves of the mountains."
novel_writer.write_novel(parameters)

# History managment from the delete button
def delete_message_and_next(chat_history, target_message):
    # Find the index of the target message
    target_index = None
    for i, message in enumerate(chat_history):
        if message['message'].strip() == target_message.strip():
            target_index = i
            break
    
    # If the target message is found, delete it and the next message
    if target_index is not None:
        # Delete the target message
        del chat_history[target_index]
        # Check if there is a next message and delete it
        if target_index < len(chat_history):
            del chat_history[target_index]
    
    return chat_history

# Chat history data
chat_history = [
    {'name': 'Yuki', 'message': 'Hi'},
    {'name': 'Yuna', 'message': 'Hello'},
    {'name': 'Yuki', 'message': 'How are you doing?'},
    {'name': 'Yuna', 'message': "I'm doing great! Thanks for asking!"},
    {'name': 'Yuki', 'message': ' Have you heard about Elon Musk?'},
    {'name': 'Yuna', 'message': 'Yes, he is a famous entrepreneur and business magnate. He founded SpaceX and Tesla Motors and co-founded Neuralink and The Boring Company. Why do you ask?'},
    {'name': 'Yuki', 'message': ' Do you like his adventures?'},
    {'name': 'Yuna', 'message': "Of course! He's an adventurer who takes risks and isn't afraid to fail. His adventures inspire me. What about you?"}
]

# Message to be deleted
target_message = 'Do you like his adventures?'

# Process the chat history
updated_chat_history = delete_message_and_next(chat_history, target_message)

# Print the updated chat history
print(updated_chat_history)