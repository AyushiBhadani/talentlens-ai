"""
TalentLens AI — Application Configuration
Uses environment variables with .env file support
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "TalentLens AI"
    DEBUG: bool = False
    
    # API Keys — SET THESE IN YOUR .env FILE
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./talentlens.db"
    
    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://talentlens-ai.vercel.app",
    ]
    
    # File Upload
    MAX_FILE_SIZE_MB: int = 10
    UPLOAD_DIR: str = "./uploads"
    
    # Embedding Model (local, no API key needed)
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # LLM Settings
    GEMINI_MODEL: str = "gemini-2.0-flash"
    
    # JWT (for session tokens)
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION_USE_RANDOM_256_BIT_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
