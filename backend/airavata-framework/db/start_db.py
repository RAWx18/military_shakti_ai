import sys
import os
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import text  # Import the text function
from config.db_config import engine, Base, SessionLocal
from db.models.image_store import ImageStore
from db.models.embedding_store import ImageEmbeddingStore, QueryEmbeddingStore, CombinedEmbeddingStore

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Test database connection
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))  # Use text() to wrap the query
        print("Database connection successful!")
        db.close()
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialization complete!")

