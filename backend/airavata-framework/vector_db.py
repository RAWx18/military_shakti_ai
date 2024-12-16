from vector_store.core.base import VectorStoreConfig
from vector_store.core.faiss_store import FAISSVectorStore
from vector_store.core.llm_interface import LLMVectorInterface

# Initialize configuration
config = VectorStoreConfig(
    embedding_dim=1536,  # Adjust based on your model's embedding size
    index_type="IVFFlat",
    n_lists=100,
    n_probes=10
)

# Initialize vector store
vector_store = FAISSVectorStore(config)

# Initialize LLM interface
llm_interface = LLMVectorInterface(
    vector_store=vector_store,
    model=your_model,  # Your existing model
    tokenizer=your_tokenizer,  # Your existing tokenizer
    device="cuda"
)

# Example usage for text-only query
response = llm_interface.generate_response(
    query_text="What's the weather like?",
    max_new_tokens=100
)

# Example usage for multi-modal query
response = llm_interface.generate_response(
    query_text="What's in this image?",
    image_input=your_image_tensor,
    max_new_tokens=100
)

# Search similar entries
similar = vector_store.search_similar(
    query_embedding=your_embedding,
    k=5,
    embedding_type="combined",
    time_range=(start_date, end_date)
)

# Export data for backup
vector_store.export_data("vector_store_backup.json")

# Import data
restored_store = FAISSVectorStore.import_data("vector_store_backup.json")