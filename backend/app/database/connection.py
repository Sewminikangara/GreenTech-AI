from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config.settings import settings

# Initialize SQLAlchemy engine targeting PostgreSQL
engine = create_engine(settings.DATABASE_URL)

# Session local class representing database transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency generator yielding db sessions to routes,
    ensuring connection release after requests finish.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
