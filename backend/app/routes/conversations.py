from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.schemas.conversation import ConversationOut, ConversationDetail, ConversationUpdate, ConversationCreate
from app.schemas.message import MessageOut
from app.services.auth_service import get_current_user_or_guest

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])

@router.post("", response_model=ConversationOut, status_code=status.HTTP_201_CREATED)
def create_conversation(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_or_guest)):
    """Creates a new chat session linked to the authenticated user or guest ID."""
    new_conv = Conversation(user_id=current_user.id, title="New Consultation")
    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)
    return new_conv

@router.get("", response_model=List[ConversationOut])
def list_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_or_guest)):
    """Retrieves all chat histories for the authenticated user or guest."""
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )

@router.get("/{id}", response_model=ConversationDetail)
def get_conversation_details(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_or_guest)):
    """Fetches full metadata and historical messages for a specific conversation."""
    conv = db.query(Conversation).filter(Conversation.id == id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
    return conv

@router.patch("/{id}", response_model=ConversationOut)
def rename_conversation(
    id: str,
    payload: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest)
):
    """Updates the custom title of a target conversation session."""
    conv = db.query(Conversation).filter(Conversation.id == id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
    conv.title = payload.title
    db.commit()
    db.refresh(conv)
    return conv

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest)
):
    """Deletes a conversation and cascades all messages records from PostgreSQL."""
    conv = db.query(Conversation).filter(Conversation.id == id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
    db.delete(conv)
    db.commit()
    return None

@router.get("/{id}/messages", response_model=List[MessageOut])
def get_conversation_messages(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_or_guest)):
    """Lists all message records belonging to a target conversation ID."""
    conv = db.query(Conversation).filter(Conversation.id == id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or access denied."
        )
    return conv.messages
