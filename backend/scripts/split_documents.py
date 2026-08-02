import os
import sys

# Add parent directory to path to enable app imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def split_documents(documents, chunk_size=600, chunk_overlap=120):
    """
    Splits document contents into semantic chunks based on paragraph and character size limits.
    Ensures that each chunk maintains reference metadata back to the source document.
    """
    chunks = []
    
    print(f"Splitting {len(documents)} documents...")
    
    for doc in documents:
        content = doc["content"]
        paragraphs = content.split("\n\n")
        
        current_chunk = ""
        chunk_index = 0
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # Check length limits
            if len(current_chunk) + len(para) > chunk_size and current_chunk:
                chunks.append({
                    "doc_id": doc["id"],
                    "chunk_index": chunk_index,
                    "text": current_chunk.strip(),
                    "title": doc["title"],
                    "category": doc["category"],
                    "research_factor": doc["research_factor"],
                    "source": doc["source"],
                    "keywords": doc["keywords"]
                })
                chunk_index += 1
                
                # Carry over overlap characters to maintain semantic context
                overlap_text = current_chunk[-chunk_overlap:] if len(current_chunk) > chunk_overlap else current_chunk
                current_chunk = overlap_text + "\n\n" + para
            else:
                if current_chunk:
                    current_chunk += "\n\n" + para
                else:
                    current_chunk = para
                    
        # Append residual text block
        if current_chunk:
            chunks.append({
                "doc_id": doc["id"],
                "chunk_index": chunk_index,
                "text": current_chunk.strip(),
                "title": doc["title"],
                "category": doc["category"],
                "research_factor": doc["research_factor"],
                "source": doc["source"],
                "keywords": doc["keywords"]
            })
            
    print(f"Successfully generated {len(chunks)} text chunks.")
    return chunks
