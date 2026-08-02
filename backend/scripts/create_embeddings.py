import os
import sys
import math

# Add parent directory to path to enable app imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.embeddings import get_mock_embedding

def create_embeddings(chunks):
    """
    Generates 128-dimensional embedding vectors for a list of text chunks.
    """
    print(f"Generating embeddings for {len(chunks)} chunks...")
    for chunk in chunks:
        chunk["embedding"] = get_mock_embedding(chunk["text"], chunk["keywords"])
    print("Embeddings generation complete.")
    return chunks
