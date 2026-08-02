from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.connection import get_db

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    """Verifies that the API server is healthy and the PostgreSQL connection is active."""
    try:
        # Perform a fast select query to verify active PostgreSQL connection
        db.execute(text("SELECT 1"))
        return {
            "status": "OK",
            "services": {
                "server": "HEALTHY",
                "database": "CONNECTED"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(e)}"
        )
