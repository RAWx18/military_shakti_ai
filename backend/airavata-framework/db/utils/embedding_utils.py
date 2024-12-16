import torch
import numpy as np
from typing import List

class EmbeddingUtils:
    @staticmethod
    def get_image_embedding(model, image) -> List[float]:
        """Extract image embeddings using the vision model"""
        with torch.no_grad():
            image_embeds = model.forward_image(image)
            # Convert to numpy and flatten if needed
            return image_embeds.cpu().numpy().flatten().tolist()

    @staticmethod
    def get_text_embedding(model, text) -> List[float]:
        """Extract text embeddings from the query"""
        # Implement text embedding extraction using the model
        pass

    @staticmethod
    def combine_embeddings(image_embedding: List[float], text_embedding: List[float]) -> List[float]:
        """Combine image and text embeddings"""
        # Implement embedding combination logic
        pass