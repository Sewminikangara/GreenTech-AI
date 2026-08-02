from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.auth_service import get_current_user_or_guest
from app.services.chat_service import process_chat_message

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
def post_chat_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_or_guest)
):
    """
    Handles user prompts, retrieves RAG documents, invokes LLM response generation 
    combining context/history, logs sessions, and returns answers with cited sources.
    """
    try:
        result = process_chat_message(
            db=db,
            message=request.message,
            conversation_id=request.conversation_id,
            user_id=current_user.id
        )
        return ChatResponse(
            response=result["response"],
            sources=result["sources"],
            conversation_id=result["conversation_id"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        print(f"Chat route handler exception: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat execution failed: {str(e)}"
        )
