from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    DEBUG: bool = True
    
    # AI Provider - CHỈ GEMINI
    GEMINI_API_KEY: str = ""  # REQUIRED - Lấy tại https://makersuite.google.com/app/apikey
    DEFAULT_AI_PROVIDER: str = "gemini"  # Luôn là gemini
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/elearning"
    
    # Spring Boot Backend
    SPRING_BOOT_BASE_URL: str = "http://localhost:8080"
    SPRING_BOOT_API_KEY: str = ""
    
    # Vector Database
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # Chatbot Configuration
    MAX_CONVERSATION_HISTORY: int = 10
    MAX_TOKENS: int = 1000
    TEMPERATURE: float = 0.7
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()
