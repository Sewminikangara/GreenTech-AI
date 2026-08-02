from pydantic import BaseModel, Field
from datetime import datetime

class MessageBase(BaseModel):
    sender_type: str = Field(..., pattern="^(user|assistant)$", description="Type of sender: user or assistant")
    message_content: str = Field(..., min_length=1, description="Text content of the message")

class MessageCreate(MessageBase):
    conversation_id: str

class MessageOut(MessageBase):
    id: str
    conversation_id: str
    timestamp: datetime

    class Config:
        from_attributes = True
