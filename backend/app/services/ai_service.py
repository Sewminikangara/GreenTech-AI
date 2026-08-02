import os
import json
from app.utils.embeddings import get_mock_embedding

class AIService:
    @staticmethod
    def retrieve_chunks(query: str, top_k: int = 3) -> list:
        """
        Loads the local mock vector database, calculates cosine similarity 
        between the query and each indexed chunk, and returns top K matches.
        Since vector embeddings are L2-normalized, similarity is the simple dot product.
        """
        # Resolve the absolute path to backend/data/vector_store.json
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        db_path = os.path.join(base_dir, "data", "vector_store.json")
        
        if not os.path.exists(db_path):
            print(f"Mock Vector database not found at path: {db_path}")
            return []
            
        try:
            with open(db_path, "r", encoding="utf-8") as f:
                chunks = json.load(f)
        except Exception as e:
            print(f"Failed to read vector store: {e}")
            return []
            
        # Generate normalized 128-dimensional query embedding
        query_vector = get_mock_embedding(query)
        
        # Calculate cosine similarity dot product scores
        matches = []
        for chunk in chunks:
            chunk_vector = chunk.get("embedding", [])
            if len(chunk_vector) == len(query_vector):
                # Calculate dot product
                score = sum(q * c for q, c in zip(query_vector, chunk_vector))
                matches.append((score, chunk))
                
        # Sort chunks by similarity score in descending order
        matches.sort(key=lambda x: x[0], reverse=True)
        
        # Extract and return top K matching chunks
        return [match[1] for match in matches[:top_k]]

    @staticmethod
    def generate_response(message: str) -> str:
        """
        Calculates user intent, runs local vector retrieval against the knowledge base,
        and constructs a response using the most relevant retrieved chunk.
        """
        retrieved = AIService.retrieve_chunks(message, top_k=1)
        
        if retrieved:
            best_chunk = retrieved[0]
            # Format output response with source citations and research factor variables
            response = (
                f"{best_chunk['text']}\n\n"
                f"*[Source: {best_chunk['source']} | "
                f"Research Factor: {best_chunk['research_factor'].replace('_', ' ').title()} | "
                f"Category: {best_chunk['category'].replace('_', ' ').title()}*"
            )
            return response
            
        # Fallback response if database has no matches
        return (
            "Hello! I am GreenTech Advisor AI. I am here to help you make sustainable decisions regarding "
            "electronics, understand E-waste management, and explore eco-labeled products. Feel free to "
            "ask about laptops, smartphones, energy ratings, or recycling centers in Sri Lanka."
        )
