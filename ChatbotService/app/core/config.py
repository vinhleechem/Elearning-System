from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

# Load .env explicitly
load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    DEBUG: bool = True
    
    # Cloudflare Workers AI
    CLOUDFLARE_ACCOUNT_ID: str = os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
    CLOUDFLARE_API_TOKEN: str = os.getenv("CLOUDFLARE_API_TOKEN", "")
    CLOUDFLARE_MODEL: str = os.getenv("CLOUDFLARE_MODEL", "@cf/meta/llama-3.3-70b-instruct-fp8-fast")
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:12345@localhost:5432/eLearning"
    
    # Spring Boot Backend
    SPRING_BOOT_BASE_URL: str = "http://localhost:8080"
    SPRING_BOOT_API_KEY: str = ""
    
    # Vector Database
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    
    # Chatbot Configuration
    MAX_CONVERSATION_HISTORY: int = 10
    MAX_TOKENS: int = 4000
    TEMPERATURE: float = 0.7
    
    # MCP (Model Context Protocol)
    ENABLE_MCP: bool = True  # Bật/tắt MCP - cho phép AI gọi tools
    
    # Advanced AI Concepts
    ENABLE_ADVANCED_AI: bool = True  # Bật/tắt CoT, ReAct, Self-Reflection
    
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

# Log provider being used
import logging
logger = logging.getLogger(__name__)
if settings.CLOUDFLARE_ACCOUNT_ID and settings.CLOUDFLARE_API_TOKEN:
    logger.info(f"✅ Cloudflare Workers AI configured (account: {settings.CLOUDFLARE_ACCOUNT_ID[:8]}...)")
else:
    logger.error("❌ CLOUDFLARE_ACCOUNT_ID hoặc CLOUDFLARE_API_TOKEN đang trống!")
