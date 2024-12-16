# test_db.py
from database import ShaktiDB
import numpy as np

def test_embeddings():
    db = ShaktiDB()
    
    # Test storing embeddings
    test_embedding = np.random.rand(512)  # Example embedding size
    
    # Store image and its embedding
    image_id = db.store_image("test.jpg", b"test_image_bytes")
    image_emb_id = db.store_image_embedding(image_id, test_embedding)
    
    # Store query and its embedding
    query_text = "What's in this image?"
    query_emb_id = db.store_query_embedding(query_text, test_embedding)
    
    # Store combined embedding
    combined_emb = np.random.rand(512)
    combined_id = db.store_combined_embedding(
        query_emb_id, 
        image_emb_id,
        combined_emb,
        "Test generated output"
    )
    
    print("Successfully stored all embeddings!")
    
    # Test similarity search
    similar = db.get_similar_embeddings(test_embedding, limit=2)
    print(f"Found {len(similar)} similar embeddings!")

if __name__ == "__main__":
    test_embeddings()