from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config.settings import settings
from app.database.connection import get_db
from app.models.user import User

# Configure password context for secure password hashing and verification
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme extraction for authorization token retrieval
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login", auto_error=False)

def hash_password(password: str) -> str:
    """Hashes a plain-text password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies that a plain-text password matches a hashed bcrypt password."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """Encodes a payload dictionary into a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """Decodes a JWT access token and returns the subject (user ID) if valid."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Dependency to fetch the authenticated user from the database.
    Raises 401 Unauthorized if token validation fails.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    user_id = verify_token(token)
    if user_id is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_current_user_or_guest(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Retrieves the current authenticated user via Bearer JWT, 
    or falls back to creating/fetching a Guest User via X-User-ID header.
    """
    # 1. Try JWT validation if token is present
    if token:
        user_id = verify_token(token)
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user
                
    # 2. Try X-User-ID header fallback
    x_user_id = request.headers.get("x-user-id")
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token or X-User-ID header missing."
        )
        
    # Check/Create Guest User in PostgreSQL
    user = db.query(User).filter(User.id == x_user_id).first()
    if not user:
        user = User(
            id=x_user_id,
            name="Guest User",
            email=f"{x_user_id}@guest.local",
            password_hash=hash_password("guest_secret_placeholder")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user
