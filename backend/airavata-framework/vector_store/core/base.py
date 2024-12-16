# vector_store/core/base.py
from dataclasses import dataclass
from typing import Dict, List, Optional, Any
import numpy as np
import torch
import faiss
import json
from datetime import datetime

@dataclass
class VectorStoreConfig:
    embedding_dim: int = 1536
    index_type: str = "IVFFlat"  # or "HNSW" for different FAISS indexes
    n_lists: int = 100  # For IVF indexes
    n_probes: int = 10  # For IVF search
    metric_type: str = faiss.METRIC_INNER_PRODUCT
    device: str = "cuda" if torch.cuda.is_available() else "cpu"

class BaseVectorStore:
    def __init__(self, config: VectorStoreConfig):
        self.config = config
        self.index = self._create_index()
        self.metadata = {}  # Store metadata for each vector
        self.id_counter = 0  # For generating unique IDs

    def _create_index(self):
        if self.config.index_type == "IVFFlat":
            quantizer = faiss.IndexFlatIP(self.config.embedding_dim)
            index = faiss.IndexIVFFlat(
                quantizer, 
                self.config.embedding_dim,
                self.config.n_lists,
                self.config.metric_type
            )
            if self.config.device == "cuda":
                index = faiss.index_cpu_to_gpu(
                    faiss.StandardGpuResources(),
                    0,
                    index
                )
            return index
        else:
            raise ValueError(f"Unsupported index type: {self.config.index_type}")
