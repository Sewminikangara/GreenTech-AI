from pydantic import BaseModel, Field
from typing import List, Optional

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt message to GreenTech Advisor AI")
    conversation_id: Optional[str] = Field(None, description="Optional conversation UUID to continue history")

class ChatResponse(BaseModel):
    response: str = Field(..., description="AI generated response text")
    sources: List[str] = Field(default=[], description="List of unique cited reference materials")
    conversation_id: str = Field(..., description="UUID of the chat session")
