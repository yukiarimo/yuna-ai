from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import GPT4AllEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms import LlamaCpp
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

# Load and split your document
loader = TextLoader("text.txt")  # Replace "my_document.txt" with the path to your document
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)

# Download the GPT4All embeddings locally and create a vector store
vectorstore = Chroma.from_documents(documents=all_splits, embedding=GPT4AllEmbeddings())

# Initialize the LLaMA2 model
llm = LlamaCpp(
    model_path="lib/models/yuna/tinyllama-1.1b-chat-v1.0.Q5_K_M.gguf",
    n_gpu_layers=1,
    n_batch=512,
    n_ctx=2048,
    f16_kv=True,
    verbose=True,
)

# Define the prompt template with your instruction, file data, and question
instruction = "You are a helpful assistant."
file_data = "\n\n".join(doc.page_content for doc in all_splits)  # This includes the file data in the prompt
question = "What are the name and age in the important data?"  # Replace with your question
template_str = f"### Instruction:\n{instruction}\n\n### File Data:\n{file_data}\n\n### Question:\n{question}\n\n### Output:\n{{output}}"
template = PromptTemplate.from_template(template_str)

# Chain setup
chain = template | llm | StrOutputParser()

# Run the chain
output = chain.invoke({})

# If there are no answers in the document, let the model talk using its own knowledge
if not output:
    output = llm.invoke("Let's have a conversation based on what you know.")

print(output)