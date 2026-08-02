from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from app.schemas.message import MessageOut

class ConversationCreate(BaseModel):
    title: Optional[str] = Field(default="New Consultation", description="Custom title of the session")

class ConversationUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="New title of the session")

class ConversationOut(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationDetail(ConversationOut):
    messages: List[MessageOut] = []
