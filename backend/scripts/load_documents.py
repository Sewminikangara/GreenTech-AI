import os
import sys
import yaml

# Add parent directory to path to enable app imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.connection import SessionLocal
from app.models.document import KnowledgeDocument

def load_documents(directory: str):
    """
    Scans directory for Markdown files, extracts YAML frontmatter, 
    and registers/syncs documents with the PostgreSQL relational DB.
    """
    loaded_docs = []
    db = SessionLocal()
    
    print(f"Loading documents from folder: {directory}")
    
    try:
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(".md"):
                    filepath = os.path.join(root, file)
                    with open(filepath, "r", encoding="utf-8") as f:
                        text = f.read()
                    
                    # Split frontmatter metadata block
                    parts = text.split("---")
                    if len(parts) >= 3:
                        frontmatter_text = parts[1]
                        content_text = "---".join(parts[2:]).strip()
                        
                        try:
                            metadata = yaml.safe_load(frontmatter_text)
                        except Exception as e:
                            print(f"Failed to parse frontmatter in {filepath}: {e}")
                            continue
                        
                        title = metadata.get("title", file)
                        category = metadata.get("category", "general")
                        research_factor = metadata.get("research_factor", "general")
                        source = metadata.get("source", metadata.get("source_type", "Unknown"))
                        
                        # Format keyword list to csv format
                        keywords_list = metadata.get("keywords", [])
                        if isinstance(keywords_list, list):
                            keywords = ", ".join(keywords_list)
                        else:
                            keywords = str(keywords_list)
                            keywords_list = [k.strip() for k in keywords.split(",") if k.strip()]
                        
                        # Upsert check inside PostgreSQL
                        existing_doc = db.query(KnowledgeDocument).filter(
                            KnowledgeDocument.title == title,
                            KnowledgeDocument.category == category
                        ).first()
                        
                        if existing_doc:
                            existing_doc.content = content_text
                            existing_doc.source = source
                            existing_doc.research_factor = research_factor
                            existing_doc.keywords = keywords
                            db.commit()
                            db.refresh(existing_doc)
                            doc_id = existing_doc.id
                        else:
                            new_doc = KnowledgeDocument(
                                title=title,
                                content=content_text,
                                source=source,
                                category=category,
                                research_factor=research_factor,
                                keywords=keywords
                            )
                            db.add(new_doc)
                            db.commit()
                            db.refresh(new_doc)
                            doc_id = new_doc.id
                            
                        loaded_docs.append({
                            "id": doc_id,
                            "title": title,
                            "content": content_text,
                            "category": category,
                            "research_factor": research_factor,
                            "source": source,
                            "keywords": keywords_list
                        })
                        
        print(f"Successfully processed {len(loaded_docs)} documents.")
    finally:
        db.close()
        
    return loaded_docs

if __name__ == "__main__":
    load_documents("knowledge_base")
