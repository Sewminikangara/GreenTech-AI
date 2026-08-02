from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the user")
    email: str = Field(..., description="Email address of the user")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100, description="Password (min 6 characters)")

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(UserBase):
    id: str
    created_at: datetime

    class Config:
        # Pydantic v2 configuration to allow ORM model reading
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
