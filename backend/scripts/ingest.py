import os
import sys

# Add parent directory to path to enable app imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.load_documents import load_documents
from scripts.split_documents import split_documents
from scripts.create_embeddings import create_embeddings
from scripts.upload_vector_database import store_vectors

def run_ingestion():
    """
    Main orchestrator triggering the RAG data injection workflow:
    1. Loads Markdown documents and syncs meta to PostgreSQL.
    2. Chunks files using semantic splits and character overlaps.
    3. Builds 128D cosine-ready TF-IDF mock vector embeddings.
    4. Index outputs to the local JSON vector store.
    """
    print("=========================================================")
    # Resolve absolute paths relative to backend root
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    kb_dir = os.path.join(base_dir, "knowledge_base")
    vector_db_path = os.path.join(base_dir, "data", "vector_store.json")
    
    print("STARTING GREENTECH ADVISOR AI RAG INGESTION WORKFLOW")
    print(f"Base Directory: {base_dir}")
    print(f"Knowledge Base: {kb_dir}")
    print("=========================================================")
    
    # Step 1: Load and parse frontmatter, upserting to PostgreSQL
    docs = load_documents(kb_dir)
    if not docs:
        print("Error: No documents parsed. Aborting ingestion.")
        return
        
    # Step 2: Split text content into semantic overlaps
    chunks = split_documents(docs)
    
    # Step 3: Compute mathematical mock vector weights
    chunks_with_vectors = create_embeddings(chunks)
    
    # Step 4: Index chunks and vectors to database storage
    store_vectors(chunks_with_vectors, vector_db_path)
    
    print("=========================================================")
    print("RAG INGESTION CHAIN PIPELINE EXECUTED SUCCESSFULLY!")
    print("=========================================================")

if __name__ == "__main__":
    run_ingestion()
