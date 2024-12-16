import numpy as np
import json
from config.db_config import SessionLocal, engine
from models.image_store import ImageStore
from models.embedding_store import ImageEmbeddingStore, QueryEmbeddingStore, CombinedEmbeddingStore

class ShaktiDB:
    def __init__(self):
        self.engine = engine
        
    def _convert_embedding_to_json(self, embedding):
        """Convert numpy array or list to JSON-serializable format"""
        if isinstance(embedding, np.ndarray):
            return embedding.tolist()
        return list(embedding)

    def store_image_embedding(self, image_id: int, embedding) -> int:
        with SessionLocal() as db:
            db_embedding = ImageEmbeddingStore(
                image_id=image_id,
                embedding=self._convert_embedding_to_json(embedding)
            )
            db.add(db_embedding)
            db.commit()
            db.refresh(db_embedding)
            return db_embedding.id

    def store_query_embedding(self, query_text: str, embedding) -> int:
        with SessionLocal() as db:
            db_embedding = QueryEmbeddingStore(
                query_text=query_text,
                embedding=self._convert_embedding_to_json(embedding)
            )
            db.add(db_embedding)
            db.commit()
            db.refresh(db_embedding)
            return db_embedding.id

    def store_combined_embedding(self, query_id: int, image_id: int, 
                               combined_embedding, generated_output: str) -> int:
        with SessionLocal() as db:
            db_embedding = CombinedEmbeddingStore(
                query_id=query_id,
                image_id=image_id,
                combined_embedding=self._convert_embedding_to_json(combined_embedding),
                generated_output=generated_output
            )
            db.add(db_embedding)
            db.commit()
            db.refresh(db_embedding)
            return db_embedding.id

    def get_embedding_as_numpy(self, embedding_json):
        """Convert JSON embedding back to numpy array"""
        return np.array(embedding_json)

    def get_similar_embeddings(self, query_embedding, limit=5):
        """Get similar embeddings using cosine similarity"""
        with SessionLocal() as db:
            embeddings = db.query(CombinedEmbeddingStore).all()
            similarities = []
            query_embedding_np = np.array(self._convert_embedding_to_json(query_embedding))
            
            for emb in embeddings:
                stored_embedding = self.get_embedding_as_numpy(emb.combined_embedding)
                similarity = np.dot(query_embedding_np, stored_embedding) / (
                    np.linalg.norm(query_embedding_np) * np.linalg.norm(stored_embedding)
                )
                similarities.append((similarity, emb))
            
            # Sort by similarity and return top matches
            similarities.sort(key=lambda x: x[0], reverse=True)
            return similarities[:limit]