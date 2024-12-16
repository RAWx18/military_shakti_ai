# vector_store/core/faiss_handler.py

import faiss
from config import VectorStoreConfig
import numpy as np 

class FAISSHandler:
    def __init__(self, dim: int, config: VectorStoreConfig):
        self.dim = dim
        self.config = config
        self.index = self._create_index()

    def _create_index(self):
        if self.config.index_type == "IVFFlat":
            quantizer = faiss.IndexFlatIP(self.dim)
            index = faiss.IndexIVFFlat(
                quantizer, 
                self.dim,
                self.config.n_lists,
                self.config.metric_type
            )
            
            if self.config.device == "cuda":
                res = faiss.StandardGpuResources()
                index = faiss.index_cpu_to_gpu(res, 0, index)
            
            return index
        else:
            raise ValueError(f"Unsupported index type: {self.config.index_type}")

    def add_vectors(self, vectors: np.ndarray):
        if not self.index.is_trained:
            self.index.train(vectors)
        self.index.add(vectors)

    def search(self, query: np.ndarray, k: int) -> tuple:
        if query.ndim == 1:
            query = query.reshape(1, -1)
        self.index.nprobe = self.config.n_probes
        return self.index.search(query, k)