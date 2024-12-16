from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from config.db_config import Base

class ChatStore(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    image_id = Column(Integer, ForeignKey("image_store.id"), nullable=True)
    query_id = Column(Integer, ForeignKey("query_embeddings.id"), nullable=True)
    chat_summary = Column(String)  # Store summarized context
    chat_keywords = Column(JSON)  # Store extracted keywords
    created_at = Column(DateTime(timezone=True), server_default=func.now())