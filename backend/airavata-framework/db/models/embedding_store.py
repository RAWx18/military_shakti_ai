from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from config.db_config import Base

class ImageEmbeddingStore(Base):
    __tablename__ = "image_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("image_store.id"))
    embedding = Column(JSON)  # Changed from ARRAY(Float) to JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class QueryEmbeddingStore(Base):
    __tablename__ = "query_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(String)
    embedding = Column(JSON)  # Changed from ARRAY(Float) to JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CombinedEmbeddingStore(Base):
    __tablename__ = "combined_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("query_embeddings.id"))
    image_id = Column(Integer, ForeignKey("image_embeddings.id"))
    combined_embedding = Column(JSON)  # Changed from ARRAY(Float) to JSON
    generated_output = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())