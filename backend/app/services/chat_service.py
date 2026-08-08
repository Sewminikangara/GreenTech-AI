from sqlalchemy.orm import Session
from typing import Optional, List, Dict
from app.models.conversation import Conversation
from app.models.message import Message
from app.services.ai_service import AIService
from app.ai.response_generator import generate_ai_response

def process_chat_message(
    db: Session,
    message: str,
    conversation_id: Optional[str],
    user_id: str
) -> dict:
    """Processes chat message, performs RAG retrieval, and generates a response."""
    # Session handling
    if not conversation_id:
        new_conv = Conversation(user_id=user_id)
        db.add(new_conv)
        db.commit()
        db.refresh(new_conv)
        conversation_id = new_conv.id
    else:
        conv = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()
        if not conv:
            raise ValueError("Conversation session not found or access denied.")
            
    # Load history
    history_records = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.timestamp.asc())
        .all()
    )
    
    history: List[Dict] = []
    for rec in history_records:
        history.append({
            "sender": rec.sender_type,
            "text": rec.message_content
        })
        
    # Document retrieval
    retrieved_chunks = AIService.retrieve_chunks(message, top_k=3)
    
    # Extract citations
    sources = []
    seen_sources = set()
    for chunk in retrieved_chunks:
        src_name = chunk.get("source", "Unknown Source")
        doc_title = chunk.get("title", "Reference Document")
        citation = f"{doc_title} ({src_name})"
        if citation not in seen_sources:
            seen_sources.add(citation)
            sources.append(citation)
            
    # Generate response
    ai_reply = generate_ai_response(message, retrieved_chunks, history)
    
    # Store messages
    user_msg = Message(
        conversation_id=conversation_id,
        sender_type="user",
        message_content=message
    )
    assistant_msg = Message(
        conversation_id=conversation_id,
        sender_type="assistant",
        message_content=ai_reply
    )
    
    db.add(user_msg)
    db.add(assistant_msg)
    db.commit()
    
    return {
        "response": ai_reply,
        "sources": sources,
        "conversation_id": conversation_id
    }
