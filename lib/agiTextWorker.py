from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import GPT4AllEmbeddings
from langchain.chains import RetrievalQA
from langchain_community.llms import LlamaCpp

class agiTextWorker:
    def __init__(self, config=None):
        self.config = config

    def processTextFile(self, text_file, question, temperature=0.6, max_new_tokens=128, context_window=2048):
        # Load text file data
        loader = TextLoader(text_file)
        data = loader.load()

        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
        docs = text_splitter.split_documents(data)

        # Generate embeddings locally using GPT4All
        gpt4all_embeddings = GPT4AllEmbeddings()
        vectorstore = Chroma.from_documents(documents=docs, embedding=gpt4all_embeddings)

        # Load GPT4All model for inference  
        llm = LlamaCpp(
            model_path='/Users/yuki/Documents/Github/yuna-ai/lib/models/yuna/yuna-ai-v2-q6_k.gguf',
            temperature=temperature, # 0.4
            max_new_tokens=max_new_tokens, # 256
            context_window=context_window, # 2048
            verbose=False,
        )

        # Create retrieval QA chain
        qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=vectorstore.as_retriever())

        # Ask a question 
        result = qa.invoke(question)
        return result