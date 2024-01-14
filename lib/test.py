from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import GPT4AllEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms import LlamaCpp
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

# Load and split an example document
loader = TextLoader("text.txt")
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
all_splits = text_splitter.split_documents(data)

# Download the GPT4All embeddings locally and create a vector store
vectorstore = Chroma.from_documents(documents=all_splits, embedding=GPT4AllEmbeddings())

# Initialize the LLaMA2 model
llm = LlamaCpp(
    model_path="lib/models/yuna/yuna-ai-q5.gguf",
    n_gpu_layers=1,  # Set to 1 for Apple Silicon GPU
    n_batch=512,
    n_ctx=2048,
    f16_kv=True,
    verbose=True,
)

# Define the prompt template
template = PromptTemplate.from_template(
    "### Instruction:\nYou're a helpfull assistant\n\nInput: {docs}\n\nOutput:"
)

# Chain setup
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

chain = {"docs": format_docs} | template | llm | StrOutputParser()

# Run the chain
question = "What are the name and age in the important data?"
docs = vectorstore.similarity_search(question)
output = chain.invoke(docs)

print(output)
