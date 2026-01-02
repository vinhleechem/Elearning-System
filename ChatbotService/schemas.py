from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessageRequest(BaseModel):
    """Request gửi tin nhắn"""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[int] = None
    user_id: int
    context: Optional[Dict[str, Any]] = None  # course_id, page, etc.


class ChatMessageResponse(BaseModel):
    """Response trả về tin nhắn"""
    conversation_id: int
    message: str
    role: MessageRole
    sources: Optional[List[Dict[str, Any]]] = None  # Nguồn từ RAG
    timestamp: datetime
    cached: bool = False  # Indicates if response is from cache
    
    class Config:
        from_attributes = True


class FeedbackRequest(BaseModel):
    """User feedback request"""
    user_id: int
    conversation_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)  # 1-5 stars
    feedback: Optional[str] = Field(None, max_length=1000)


class ConversationResponse(BaseModel):
    """Response cuộc hội thoại"""
    id: int
    user_id: int
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    
    class Config:
        from_attributes = True


class KnowledgeBaseItem(BaseModel):
    """Item trong knowledge base"""
    content_type: str
    content_id: Optional[int]
    title: str
    content: str
    metadata: Optional[Dict[str, Any]] = None


class AIProvider(str, Enum):
    OPENAI = "openai"
    GEMINI = "gemini"
    ANTHROPIC = "anthropic"


class ChatbotConfig(BaseModel):
    """Cấu hình chatbot"""
    ai_provider: AIProvider = AIProvider.GEMINI
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=1000, ge=100, le=4000)
    use_rag: bool = True
