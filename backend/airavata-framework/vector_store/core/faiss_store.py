# vector_store/core/faiss_store.py
import numpy as np
import faiss
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from config import VectorStoreConfig  # Assuming this class is in a module named 'config'
from base import BaseVectorStore  # Assuming 'BaseVectorStore' is defined in the 'base' module


class FAISSVectorStore(BaseVectorStore):
    def add_embedding(
        self,
        embedding: np.ndarray,
        metadata: Dict[str, Any],
        embedding_type: str
    ) -> int:
        """Add embedding to FAISS index with metadata"""
        if embedding.ndim == 1:
            embedding = embedding.reshape(1, -1)
            
        if not self.index.is_trained:
            self.index.train(embedding)
            
        # Generate ID and add to index
        vector_id = self.id_counter
        self.id_counter += 1
        
        self.index.add(embedding)
        
        # Store metadata
        self.metadata[vector_id] = {
            "metadata": metadata,
            "type": embedding_type,
            "timestamp": datetime.now().isoformat()
        }
        
        return vector_id

    def search_similar(
        self,
        query_embedding: np.ndarray,
        k: int = 5,
        embedding_type: Optional[str] = None,
        time_range: Optional[tuple] = None
    ) -> List[Dict[str, Any]]:
        """Search for similar embeddings with filtering"""
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
            
        # Set number of probes for IVF index
        if hasattr(self.index, 'nprobe'):
            self.index.nprobe = self.config.n_probes
            
        # Perform search
        D, I = self.index.search(query_embedding, k)
        
        results = []
        for dist, idx in zip(D[0], I[0]):
            if idx == -1:  # FAISS returns -1 for not enough results
                continue
                
            meta = self.metadata[idx]
            
            # Filter by embedding type if specified
            if embedding_type and meta["type"] != embedding_type:
                continue
                
            # Filter by time range if specified
            if time_range:
                timestamp = datetime.fromisoformat(meta["timestamp"])
                if not (time_range[0] <= timestamp <= time_range[1]):
                    continue
                    
            results.append({
                "id": idx,
                "similarity": float(dist),
                "metadata": meta["metadata"],
                "type": meta["type"],
                "timestamp": meta["timestamp"]
            })
            
        return results

    def remove_embedding(self, vector_id: int):
        """Remove embedding from index"""
        if vector_id in self.metadata:
            # FAISS doesn't support direct removal, so we need to rebuild the index
            # Get all vectors except the one to remove
            all_vectors = []
            all_metadata = {}
            
            for idx in self.metadata:
                if idx != vector_id:
                    D, I = self.index.search(
                        np.array([self.get_vector(idx)]),
                        1
                    )
                    all_vectors.append(self.get_vector(idx))
                    all_metadata[len(all_vectors)-1] = self.metadata[idx]
                    
            # Recreate index
            self.index = self._create_index()
            if all_vectors:
                self.index.train(np.vstack(all_vectors))
                self.index.add(np.vstack(all_vectors))
            
            self.metadata = all_metadata

    def update_embedding(
        self,
        vector_id: int,
        new_embedding: Optional[np.ndarray] = None,
        new_metadata: Optional[Dict] = None
    ):
        """Update embedding or its metadata"""
        if vector_id not in self.metadata:
            raise KeyError(f"Vector ID {vector_id} not found")
            
        if new_embedding is not None:
            # Remove and re-add with new embedding
            old_metadata = self.metadata[vector_id]
            self.remove_embedding(vector_id)
            self.add_embedding(
                new_embedding,
                old_metadata["metadata"],
                old_metadata["type"]
            )
            
        if new_metadata is not None:
            self.metadata[vector_id]["metadata"].update(new_metadata)
            self.metadata[vector_id]["timestamp"] = datetime.now().isoformat()

    def export_data(self, filepath: str):
        """Export metadata and vectors to file"""
        export_data = {
            "metadata": self.metadata,
            "config": self.config.__dict__
        }
        
        with open(filepath, 'w') as f:
            json.dump(export_data, f)
            
        # Save FAISS index separately
        faiss.write_index(self.index, f"{filepath}.index")

    @classmethod
    def import_data(cls, filepath: str) -> 'FAISSVectorStore':
        """Import data from file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
            
        config = VectorStoreConfig(**data["config"])
        store = cls(config)
        store.metadata = data["metadata"]
        store.index = faiss.read_index(f"{filepath}.index")
        
        return store
