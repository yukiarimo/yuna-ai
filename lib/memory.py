import numpy as np
from llama_cpp import Llama

class MemoryManager:
    FIXED_SIZE = 512  # Set to a realistic fixed size based on your model's embedding output

    def __init__(
        self, 
        model_path, 
        n_ctx=1400, 
        seed=-1, 
        n_batch=512, 
        n_gpu_layers=-1, 
        n_threads=8, 
        use_mlock=True, 
        flash_attn=True, 
        verbose=False, 
        embedding=True
    ):
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
        print(f"Original embedding shape: {embedding.shape}")

        # Ensure fixed size embeddings using aggregation (e.g., averaging)
        if len(embedding) != self.FIXED_SIZE:
            if len(embedding) > self.FIXED_SIZE:
                # Truncate the embedding
                embedding = embedding[:self.FIXED_SIZE]
            else:
                # Pad the embedding with zeros
                embedding = np.pad(embedding, (0, self.FIXED_SIZE - len(embedding)), 'constant')
            print(f"Adjusted embedding shape: {embedding.shape}")
        
        # Normalize the embedding
        norm = np.linalg.norm(embedding)
        if norm == 0:
            normalized_embedding = embedding
        else:
            normalized_embedding = embedding / norm
        return normalized_embedding

    def add_memory(self, key, text):
        response = self.model.create_embedding(text)
        embedding = self.get_embedding(response)
        self.memory_bank[key] = embedding
        print(f"Memory '{key}' added.")

    def delete_memory(self, key):
        if key in self.memory_bank:
            del self.memory_bank[key]
            print(f"Memory '{key}' deleted.")

    def edit_memory(self, key, new_text):
        if key in self.memory_bank:
            response = self.model.create_embedding(new_text)
            embedding = self.get_embedding(response)
            self.memory_bank[key] = embedding
            print(f"Memory '{key}' edited.")

    def retrieve_memory(self, query):
        response = self.model.create_embedding(query)
        query_embedding = self.get_embedding(response)

        if not self.memory_bank:
            print("Memory bank is empty.")
            return None

        # Compute cosine similarities using dot product (since embeddings are normalized)
        similarities = {key: np.dot(query_embedding, emb) for key, emb in self.memory_bank.items()}
        
        # Debug: Print similarities as percentages
        for key, similarity in similarities.items():
            print(f"{key}: {similarity * 100:.2f}%")

        # Retrieve the most similar memory
        most_relevant = max(similarities, key=similarities.get)
        print(f"Most relevant memory: {most_relevant}")
        return most_relevant

    @staticmethod
    def cosine_similarity(a, b):
        return np.dot(a, b)  # Assuming a and b are already normalized

# Example usage
if __name__ == "__main__":
    memory_manager = MemoryManager(model_path="lib/utils/models/yuna/yuna-ai-v4-q6_k.gguf")
    memory_manager.add_memory("fact1", "The capital of France is Paris, which is known for its rich history, iconic landmarks such as the Eiffel Tower, and its vibrant culture and cuisine.")
    memory_manager.add_memory("fact2", "Water freezes at 0 degrees Celsius, a temperature at which it transitions from its liquid state to a solid state, forming ice.")
    memory_manager.add_memory("fact3", "The Earth orbits around the Sun in an elliptical path, completing one full revolution approximately every 365.25 days, which constitutes a year.")
    memory_manager.add_memory("fact4", "I like to eat pizza, especially when it is topped with a variety of ingredients such as pepperoni, mushrooms, and extra cheese, and baked to perfection.")
    memory_manager.add_memory("fact5", "The sky is blue during the day due to the scattering of sunlight by the atmosphere, a phenomenon known as Rayleigh scattering, which is more effective at shorter wavelengths of light.")
    memory_manager.add_memory("fact6", "I have a dog named Max, who is a friendly and energetic Labrador Retriever that loves to play fetch and go for long walks in the park.")
    
    while True:
        query = input("Enter a query: ")
        if not query:
            break
        relevant_memory = memory_manager.retrieve_memory(query)
        if relevant_memory:
            print(f"Most relevant memory: {relevant_memory}")
        else:
            print("No relevant memory found.")