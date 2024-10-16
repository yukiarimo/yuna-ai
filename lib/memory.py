from llama_cpp import Llama
import numpy as np

class MemoryManager:
    FIXED_SIZE = 100000  # Define a fixed size for all embeddings

    def __init__(self, model_path, n_ctx=1400, seed=-1, n_batch=512, n_gpu_layers=-1, n_threads=8, use_mlock=True, flash_attn=True, verbose=False, embedding=True):
        self.model = Llama(
            model_path=model_path,
            n_ctx=n_ctx,
            seed=seed,
            n_batch=n_batch,
            n_gpu_layers=n_gpu_layers,
            n_threads=n_threads,
            use_mlock=use_mlock,
            flash_attn=flash_attn,
            verbose=verbose,
            embedding=embedding,
        )
        self.memory_bank = {}

    def get_embedding(self, response):
        embedding = np.array(response['data'][0]['embedding']).flatten()
        print(f"Embedding shape: {embedding.shape}")
        return embedding

    def adjust_embedding_size(self, embedding, size=FIXED_SIZE):
        if embedding.shape[0] > size:
            return embedding[:size]
        else:
            return np.pad(embedding, (0, size - embedding.shape[0]))

    def add_memory(self, key, text):
        embedding = self.get_embedding(self.model.create_embedding(text))
        adjusted_embedding = self.adjust_embedding_size(embedding)
        self.memory_bank[key] = adjusted_embedding

    def delete_memory(self, key):
        if key in self.memory_bank:
            del self.memory_bank[key]

    def edit_memory(self, key, new_text):
        if key in self.memory_bank:
            embedding = self.get_embedding(self.model.create_embedding(new_text))
            adjusted_embedding = self.adjust_embedding_size(embedding)
            self.memory_bank[key] = adjusted_embedding

    def retrieve_memory(self, query):
        query_embedding = self.adjust_embedding_size(self.get_embedding(self.model.create_embedding(query)))
        similarities = {
            key: self.cosine_similarity(query_embedding, emb)
            for key, emb in self.memory_bank.items()
        }
        # Retrieve the most similar memory
        most_relevant = max(similarities, key=similarities.get)
        
        # Print similarities as percentages
        for key, similarity in similarities.items():
            print(f"{key}: {similarity * 100:.2f}%")
        
        return most_relevant

    def cosine_similarity(self, a, b):
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Example usage
memory_manager = MemoryManager(model_path="lib/models/yuna/yuna-ai-v3-q5_k_m.gguf")
memory_manager.add_memory("fact1", "The capital of France is Paris, which is known for its rich history, iconic landmarks such as the Eiffel Tower, and its vibrant culture and cuisine.")
memory_manager.add_memory("fact2", "Water freezes at 0 degrees Celsius, a temperature at which it transitions from its liquid state to a solid state, forming ice.")
memory_manager.add_memory("fact3", "The Earth orbits around the Sun in an elliptical path, completing one full revolution approximately every 365.25 days, which constitutes a year.")
memory_manager.add_memory("fact4", "I like to eat pizza, especially when it is topped with a variety of ingredients such as pepperoni, mushrooms, and extra cheese, and baked to perfection.")
memory_manager.add_memory("fact5", "The sky is blue during the day due to the scattering of sunlight by the atmosphere, a phenomenon known as Rayleigh scattering, which is more effective at shorter wavelengths of light.")
memory_manager.add_memory("fact6", "I have a dog named Max, who is a friendly and energetic Labrador Retriever that loves to play fetch and go for long walks in the park.")

query = "What is your favorite food?"
relevant_memory = memory_manager.retrieve_memory(query)
print(f"Most relevant memory: {relevant_memory}")