import os
import shutil
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .settings import get_settings, save_settings, LLMSettings
from .engine import get_chat_engine, clear_cache, DATA_DIR, INDEX_DIR_BASE

app = FastAPI()

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    document_ids: Optional[List[str]] = None

@app.get("/api/settings")
def api_get_settings():
    return get_settings()

@app.post("/api/settings")
def api_save_settings(settings: LLMSettings):
    save_settings(settings)
    clear_cache()
    return {"status": "success"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    os.makedirs(DATA_DIR, exist_ok=True)
    file_path = os.path.join(DATA_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    if os.path.exists(INDEX_DIR_BASE):
        shutil.rmtree(INDEX_DIR_BASE)
        clear_cache()
        
    return {"filename": file.filename, "status": "uploaded"}

@app.get("/api/files")
def list_files():
    if not os.path.exists(DATA_DIR):
        return []
    files = os.listdir(DATA_DIR)
    # Filter out hidden files
    return [{"name": f} for f in files if not f.startswith('.')]

@app.delete("/api/files/{filename}")
def delete_file(filename: str):
    file_path = os.path.join(DATA_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        if os.path.exists(INDEX_DIR_BASE):
            shutil.rmtree(INDEX_DIR_BASE)
            clear_cache()
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="File not found")

@app.post("/api/process")
async def process_documents():
    try:
        from .engine import get_index
        clear_cache()
        # This forces the index to rebuild if it was deleted during upload
        get_index(force_rebuild=True)
        return {"status": "processed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        engine = get_chat_engine(request.document_ids)
        if not engine:
            return {"response": "No documents uploaded. Please upload a document first."}
            
        response = engine.chat(request.message)
        
        sources = []
        if hasattr(response, 'source_nodes'):
            for node_with_score in response.source_nodes:
                if hasattr(node_with_score, 'node') and hasattr(node_with_score.node, 'metadata'):
                    file_name = node_with_score.node.metadata.get('file_name')
                    if file_name:
                        sources.append(file_name)
        
        unique_sources = list(set(sources))
        
        return {"response": str(response), "sources": unique_sources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chunks")
def get_all_chunks():
    try:
        from .engine import get_index
        index = get_index()
        if not index:
            return []
            
        nodes = index.docstore.docs.values()
        chunks = []
        for node in nodes:
            chunks.append({
                "id": node.node_id,
                "text": node.get_content(),
                "file_name": node.metadata.get("file_name", "Unknown Document")
            })
        return chunks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
