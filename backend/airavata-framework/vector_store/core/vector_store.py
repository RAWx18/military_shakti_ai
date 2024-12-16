import numpy as np
import torch
import faiss
from datetime import datetime
from typing import Optional, Dict, Any, List, Union
from config import VectorStoreConfig
from faiss_handler import FAISSHandler  # Assuming FAISSHandler is a class that handles FAISS indexing and search



# vector_store/core/vector_store.py
class MPLUGVectorStore:
    def __init__(self, config: VectorStoreConfig):
        self.config = config
        self.text_index = FAISSHandler(config.hidden_dim, config)
        self.vision_index = FAISSHandler(config.vision_dim, config)
        self.combined_index = FAISSHandler(config.hidden_dim * 2, config)
        
        self.metadata = {}
        self.id_counter = 0
        self._cache = {}

    def _normalize_embedding(self, embedding: Union[np.ndarray, torch.Tensor]) -> np.ndarray:
        if isinstance(embedding, torch.Tensor):
            embedding = embedding.detach().cpu().numpy()
        return embedding / (np.linalg.norm(embedding) + 1e-8)

    def _combine_embeddings(self, text_emb: np.ndarray, vision_emb: np.ndarray) -> np.ndarray:
        text_emb_norm = self._normalize_embedding(text_emb)
        vision_emb_norm = self._normalize_embedding(vision_emb)
        return np.concatenate([text_emb_norm, vision_emb_norm])

    def add_entry(
        self,
        text_embedding: Optional[np.ndarray] = None,
        vision_embedding: Optional[np.ndarray] = None,
        combined_embedding: Optional[np.ndarray] = None,
        metadata: Dict[str, Any] = None,
        entry_type: str = "combined"
    ) -> int:
        vector_id = self.id_counter
        self.id_counter += 1

        timestamp = datetime.now().isoformat()
        
        if text_embedding is not None:
            text_embedding = self._normalize_embedding(text_embedding)
            self.text_index.add_vectors(text_embedding.reshape(1, -1))
            
        if vision_embedding is not None:
            vision_embedding = self._normalize_embedding(vision_embedding)
            self.vision_index.add_vectors(vision_embedding.reshape(1, -1))
            
        if combined_embedding is not None:
            combined_embedding = self._normalize_embedding(combined_embedding)
            self.combined_index.add_vectors(combined_embedding.reshape(1, -1))
        elif text_embedding is not None and vision_embedding is not None:
            combined_embedding = self._combine_embeddings(text_embedding, vision_embedding)
            self.combined_index.add_vectors(combined_embedding.reshape(1, -1))

        self.metadata[vector_id] = {
            "metadata": metadata or {},
            "type": entry_type,
            "timestamp": timestamp
        }

        return vector_id

    def search_similar(
        self,
        query_embedding: np.ndarray,
        k: int = 5,
        index_type: str = "combined",
        time_range: Optional[tuple] = None,
        metadata_filter: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        # Check cache first
        cache_key = (query_embedding.tobytes(), k, index_type)
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Select appropriate index
        if index_type == "text":
            index = self.text_index
        elif index_type == "vision":
            index = self.vision_index
        else:
            index = self.combined_index

        D, I = index.search(self._normalize_embedding(query_embedding), k)
        
        results = []
        for dist, idx in zip(D[0], I[0]):
            if idx == -1:
                continue
                
            meta = self.metadata[idx]
            
            # Apply filters
            if time_range:
                timestamp = datetime.fromisoformat(meta["timestamp"])
                if not (time_range[0] <= timestamp <= time_range[1]):
                    continue
                    
            if metadata_filter:
                if not all(meta["metadata"].get(k) == v for k, v in metadata_filter.items()):
                    continue
                    
            results.append({
                "id": idx,
                "similarity": float(dist),
                "metadata": meta["metadata"],
                "timestamp": meta["timestamp"]
            })

        # Cache results
        self._cache[cache_key] = results
        if len(self._cache) > self.config.cache_size:
            self._cache.pop(next(iter(self._cache)))

        return results

    def update_metadata(self, vector_id: int, new_metadata: Dict):
        if vector_id in self.metadata:
            self.metadata[vector_id]["metadata"].update(new_metadata)
            self.metadata[vector_id]["timestamp"] = datetime.now().isoformat()
            # Clear cache since metadata changed
            self._cache.clear()

    def delete_entry(self, vector_id: int):
        if vector_id in self.metadata:
            # FAISS doesn't support direct deletion, so we mark as deleted in metadata
            self.metadata[vector_id]["metadata"]["deleted"] = True
            self.metadata[vector_id]["timestamp"] = datetime.now().isoformat()
            # Clear cache
            self._cache.clear()

    def export_data(self, filepath: str):
        import json
        export_data = {
            "metadata": self.metadata,
            "config": self.config.__dict__,
            "id_counter": self.id_counter
        }
        
        with open(f"{filepath}.json", 'w') as f:
            json.dump(export_data, f)
            
        # Save FAISS indexes
        faiss.write_index(self.text_index.index, f"{filepath}_text.index")
        faiss.write_index(self.vision_index.index, f"{filepath}_vision.index")
        faiss.write_index(self.combined_index.index, f"{filepath}_combined.index")

    @classmethod
    def import_data(cls, filepath: str) -> 'MPLUGVectorStore':
        import json
        with open(f"{filepath}.json", 'r') as f:
            data = json.load(f)
            
        config = VectorStoreConfig(**data["config"])
        store = cls(config)
        store.metadata = data["metadata"]
        store.id_counter = data["id_counter"]
        
        # Load FAISS indexes
        store.text_index.index = faiss.read_index(f"{filepath}_text.index")
        store.vision_index.index = faiss.read_index(f"{filepath}_vision.index")
        store.combined_index.index = faiss.read_index(f"{filepath}_combined.index")
        
        return store