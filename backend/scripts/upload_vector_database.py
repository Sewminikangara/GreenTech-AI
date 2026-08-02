import os
import sys
import json

# Add parent directory to path to enable app imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def store_vectors(chunks, output_path="data/vector_store.json"):
    """
    Writes the chunks list (incorporating text, metadata, and embeddings) 
    into a local JSON file, simulating a production ChromaDB collection.
    """
    # Determine the directory path
    dir_name = os.path.dirname(output_path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
        
    print(f"Writing chunks and vectors to index: {output_path}")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully indexed {len(chunks)} vector records.")
