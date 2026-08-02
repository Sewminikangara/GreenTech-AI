import uuid
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.sql import func
from app.models.base import Base

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String, nullable=False)
    category = Column(String, nullable=False)
    research_factor = Column(String, nullable=False)
    keywords = Column(String, nullable=False) # comma-separated keywords
    created_at = Column(DateTime, server_default=func.now())
