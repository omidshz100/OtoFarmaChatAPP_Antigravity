import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings, StorageContext, load_index_from_storage
from llama_index.core.node_parser import SentenceSplitter
from .settings import get_settings

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
INDEX_DIR_BASE = os.path.join(os.path.dirname(__file__), '..', 'storage')

_cached_index = None
_cached_provider = None

def clear_cache():
    global _cached_index, _cached_provider
    _cached_index = None
    _cached_provider = None

def _configure_llm():
    settings = get_settings()
    
    # Configure LLM based on settings
    if settings.provider == "openai":
        from llama_index.llms.openai import OpenAI
        from llama_index.embeddings.openai import OpenAIEmbedding
        Settings.llm = OpenAI(model=settings.model, api_key=settings.api_key)
        Settings.embed_model = OpenAIEmbedding(api_key=settings.api_key)
    elif settings.provider == "claude":
        from llama_index.llms.anthropic import Anthropic
        Settings.llm = Anthropic(model=settings.model, api_key=settings.api_key)
    elif settings.provider == "gemini":
        from llama_index.llms.gemini import Gemini
        Settings.llm = Gemini(model=settings.model, api_key=settings.api_key)
    elif settings.provider == "ollama":
        from llama_index.llms.ollama import Ollama
        Settings.llm = Ollama(model=settings.model, base_url=settings.base_url)
    elif settings.provider == "lmstudio":
        # LM Studio exposes an OpenAI-compatible API
        from llama_index.llms.openai import OpenAI
        Settings.llm = OpenAI(
            model=settings.model, 
            api_key="not-needed", 
            api_base=settings.base_url
        )
    else:
        raise ValueError(f"Unknown LLM provider: {settings.provider}")
        
    # We will use the default embedding model for simplicity, 
    # but in a real scenario with local models, you might want to use a local embedding model too.
    # We can default to OpenAI embeddings if provider is OpenAI, otherwise use a local one.
    if settings.provider != "openai":
        from llama_index.embeddings.huggingface import HuggingFaceEmbedding
        # Requires: pip install llama-index-embeddings-huggingface
        # We'll use a small fast model by default for local setups
        Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

def get_index(force_rebuild=False):
    global _cached_index, _cached_provider
    settings = get_settings()
    
    # Return cached index if we haven't changed providers and aren't forcing a rebuild
    if not force_rebuild and _cached_index is not None and _cached_provider == settings.provider:
        return _cached_index

    _configure_llm()
    
    INDEX_DIR = os.path.join(INDEX_DIR_BASE, settings.provider)
    os.makedirs(INDEX_DIR, exist_ok=True)
    
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # Check if we have documents
    if not os.listdir(DATA_DIR):
        return None
        
    # Load from disk if it exists
    if os.path.exists(INDEX_DIR) and os.listdir(INDEX_DIR):
        try:
            storage_context = StorageContext.from_defaults(persist_dir=INDEX_DIR)
            return load_index_from_storage(storage_context)
        except Exception as e:
            print(f"Error loading index: {e}. Rebuilding...")
            
    # Otherwise rebuild from documents
    reader = SimpleDirectoryReader(input_dir=DATA_DIR)
    documents = reader.load_data()
    
    # Parse nodes and create index
    index = VectorStoreIndex.from_documents(
        documents,
        transformations=[SentenceSplitter(chunk_size=1024, chunk_overlap=20)]
    )
    
    # Persist the vector index to disk (in the storage folder)
    index.storage_context.persist(persist_dir=INDEX_DIR)
    
    _cached_index = index
    _cached_provider = settings.provider
    return index

def get_chat_engine(document_ids=None):
    index = get_index()
    if not index:
        return None
        
    # If document_ids is provided, we can filter nodes by metadata
    # LlamaIndex SimpleDirectoryReader adds file_name to metadata
    if document_ids:
        # Re-build index only with selected files if needed, 
        # or use a retriever with metadata filters. 
        # For simplicity, if a specific document is selected, we rebuild a temporary index
        # A more robust way is using VectorStore with metadata filters.
        _configure_llm()
        reader = SimpleDirectoryReader(
            input_dir=DATA_DIR, 
            required_exts=None, 
            exclude=None
        )
        documents = reader.load_data()
        
        # Filter documents by file_name
        filtered_docs = [doc for doc in documents if doc.metadata.get("file_name") in document_ids]
        if not filtered_docs:
            return None
            
        temp_index = VectorStoreIndex.from_documents(filtered_docs)
        settings = get_settings()
        return temp_index.as_chat_engine(chat_mode="condense_plus_context", system_prompt=settings.system_prompt, verbose=True)

    settings = get_settings()
    return index.as_chat_engine(chat_mode="condense_plus_context", system_prompt=settings.system_prompt, verbose=True)
