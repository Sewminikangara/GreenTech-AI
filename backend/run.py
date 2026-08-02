import uvicorn
from app.config.settings import settings

if __name__ == "__main__":
    # Start the FastAPI server using the configurations parsed from the environment
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True
    )
