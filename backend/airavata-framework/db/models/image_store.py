from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, JSON
from sqlalchemy.sql import func
from config.db_config import Base

class ImageStore(Base):
    __tablename__ = "image_store"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, unique=True)
    image_blob = Column(LargeBinary)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    image_metadata = Column(JSON)  # Changed from metadata to image_metadata