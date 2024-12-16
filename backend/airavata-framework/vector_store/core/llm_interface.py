import torch
import numpy as np
from typing import Optional, Dict, Any
from datetime import datetime
from vector_store.core.faiss_store import FAISSVectorStore  # Assuming this is the vector store you want to use
from vector_store.core.vector_store import MPLUGVectorStore

# vector_store/core/llm_interface.py
class MPLUGVectorInterface:
    def __init__(
        self,
        vector_store: MPLUGVectorStore,
        model,
        processor,
        tokenizer,
        device: str = "cuda"
    ):
        self.vector_store = vector_store
        self.model = model
        self.processor = processor
        self.tokenizer = tokenizer
        self.device = device
        self._cache = {}

    def get_embeddings(
        self, 
        text: Optional[str] = None,
        image: Optional[torch.Tensor] = None
    ) -> tuple:
        with torch.no_grad():
            text_embedding = None
            vision_embedding = None
            
            if text is not None:
                # Get text embedding using mPLUG OWL 3's text encoder
                text_tokens = self.tokenizer(text, return_tensors="pt").to(self.device)
                text_embedding = self.model.language_model.get_input_embeddings()(text_tokens.input_ids)
                text_embedding = text_embedding.mean(dim=1).cpu().numpy()

            if image is not None:
                # Get vision embedding using mPLUG OWL 3's vision encoder
                vision_embedding = self.model.vision_model(image.to(self.device)).last_hidden_state
                vision_embedding = vision_embedding.mean(dim=1).cpu().numpy()

            return text_embedding, vision_embedding

    def generate_response(
        self,
        query_text: str,
        image: Optional[torch.Tensor] = None,
        max_new_tokens: int = 100,
        num_history: int = 3
    ) -> Dict[str, Any]:
        # Get embeddings
        text_emb, vision_emb = self.get_embeddings(query_text, image)
        
        # Get relevant context from history
        context = self.get_chat_context(text_emb, vision_emb, k=num_history)
        
        # Prepare input for mPLUG OWL 3
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuery: {query_text}"}
        ]
        
        if image is not None:
            inputs = self.processor(messages, images=[image], videos=None)
        else:
            inputs = self.processor(messages, images=None, videos=None)
            
        inputs = inputs.to(self.device)
        inputs.update({
            'max_new_tokens': max_new_tokens,
            'tokenizer': self.tokenizer,
            'decode_text': True
        })
        
        # Generate response
        output = self.model.generate(**inputs)
        response = output[0] if isinstance(output, list) else output
        
        # Store in vector database
        metadata = {
            "query_text": query_text,
            "response": response,
            "has_image": image is not None,
            "timestamp": datetime.now().isoformat()
        }
        
        if vision_emb is not None:
            combined_emb = self.vector_store._combine_embeddings(text_emb, vision_emb)
        else:
            combined_emb = text_emb
            
        vector_id = self.vector_store.add_entry(
            text_embedding=text_emb,
            vision_embedding=vision_emb,
            combined_embedding=combined_emb,
            metadata=metadata
        )
        
        return {
            "response": response,
            "context_used": context,
            "vector_id": vector_id
        }

    def get_chat_context(
        self,
        text_emb: Optional[np.ndarray],
        vision_emb: Optional[np.ndarray],
        k: int = 3
    ) -> str:
        if vision_emb is not None:
            query_emb = self.vector_store._combine_embeddings(text_emb, vision_emb)
        else:
            query_emb = text_emb
            
        similar = self.vector_store.search_similar(
            query_emb,
            k=k,
            metadata_filter={"deleted": False}
        )
        
        context_parts = []
        for entry in similar:
            meta = entry["metadata"]
            context_parts.extend([
                f"Previous query: {meta.get('query_text', '')}",
                f"Previous response: {meta.get('response', '')}",
                f"Similarity score: {entry['similarity']:.2f}"
            ])
            
        return "\n".join(context_parts)