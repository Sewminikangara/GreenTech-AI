import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_type = Column(String, nullable=False) # "user" | "assistant"
    message_content = Column(Text, nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
    
    # Relationship back to conversation
    conversation = relationship("Conversation", back_populates="messages")
