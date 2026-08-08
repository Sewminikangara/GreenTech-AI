import os
import json
from app.utils.embeddings import get_mock_embedding

class AIService:
    @staticmethod
    def retrieve_chunks(query: str, top_k: int = 3) -> list:
        """Retrieves top K matching document chunks from the local vector index."""
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        db_path = os.path.join(base_dir, "data", "vector_store.json")
        
        if not os.path.exists(db_path):
            print(f"Vector store not found: {db_path}")
            return []
            
        try:
            with open(db_path, "r", encoding="utf-8") as f:
                chunks = json.load(f)
        except Exception as e:
            print(f"Failed to read vector store: {e}")
            return []
            
        # Get query embedding
        query_vector = get_mock_embedding(query)
        
        # Calculate similarity scores
        matches = []
        for chunk in chunks:
            chunk_vector = chunk.get("embedding", [])
            if len(chunk_vector) == len(query_vector):
                score = sum(q * c for q, c in zip(query_vector, chunk_vector))
                matches.append((score, chunk))
                
        # Sort and return top K
        matches.sort(key=lambda x: x[0], reverse=True)
        return [match[1] for match in matches[:top_k]]

    @staticmethod
    def generate_response(message: str) -> str:
        """Helper to generate a fallback response with basic document metadata."""
        retrieved = AIService.retrieve_chunks(message, top_k=1)
        if retrieved:
            best_chunk = retrieved[0]
            return (
                f"{best_chunk['text']}\n\n"
                f"*[Source: {best_chunk['source']} | "
                f"Research Factor: {best_chunk['research_factor'].replace('_', ' ').title()} | "
                f"Category: {best_chunk['category'].replace('_', ' ').title()}*"
            )
        return (
            "Hello! I am GreenTech Advisor AI. I am here to help you make sustainable decisions regarding "
            "electronics, understand E-waste management, and explore eco-labeled products. Feel free to "
            "ask about laptops, smartphones, energy ratings, or recycling centers in Sri Lanka."
        )
