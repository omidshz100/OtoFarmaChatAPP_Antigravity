import json
import os
from pydantic import BaseModel
from typing import Optional

CONFIG_FILE = os.path.join(os.path.dirname(__file__), '..', 'config', 'settings.json')

class LLMSettings(BaseModel):
    provider: str = "openai" # "openai", "claude", "gemini", "ollama", "lmstudio"
    model: str = "gpt-3.5-turbo"
    api_key: Optional[str] = ""
    base_url: Optional[str] = "http://localhost:11434" # For ollama/lmstudio
    system_prompt: Optional[str] = "You are a helpful AI assistant."

def get_settings() -> LLMSettings:
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            try:
                data = json.load(f)
                return LLMSettings(**data)
            except json.JSONDecodeError:
                pass
    return LLMSettings()

def save_settings(settings: LLMSettings):
    os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
    with open(CONFIG_FILE, 'w') as f:
        json.dump(settings.dict(), f, indent=4)
