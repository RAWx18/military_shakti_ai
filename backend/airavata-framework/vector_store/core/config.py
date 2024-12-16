# vector_store/core/config.py
from dataclasses import dataclass
from typing import Dict, List, Optional, Any, Union
import torch
import faiss
import numpy as np
from datetime import datetime

@dataclass
class VectorStoreConfig:
    embedding_dim: int = 4096  # mPLUG OWL 3's embedding dimension
    vision_dim: int = 4096     # Vision embedding dimension
    hidden_dim: int = 1536     # Hidden state dimension
    index_type: str = "IVFFlat"
    n_lists: int = 100
    n_probes: int = 10
    metric_type: str = faiss.METRIC_INNER_PRODUCT
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    cache_size: int = 1000