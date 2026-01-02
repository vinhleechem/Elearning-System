from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class Conversation(Base):
    """Lưu cuộc hội thoại"""
    __tablename__ = "chat_conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationship
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """Lưu tin nhắn trong cuộc hội thoại"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    extra_data = Column(JSON, nullable=True)  # Lưu thêm context, source, etc.
    
    # Relationship
    conversation = relationship("Conversation", back_populates="messages")


class KnowledgeBase(Base):
    """Lưu kiến thức về khóa học để RAG"""
    __tablename__ = "chatbot_knowledge_base"
    
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String(50), nullable=False)  # course, lesson, faq, policy
    content_id = Column(Integer, nullable=True)  # ID của course, lesson nếu có
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    embedding_id = Column(String(255), nullable=True)  # ID trong vector DB
    extra_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class ChatbotContext(Base):
    """Lưu context hiện tại của user (đang xem khóa học nào, v.v.)"""
    __tablename__ = "chatbot_context"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, unique=True, index=True)
    current_course_id = Column(Integer, nullable=True)
    current_page = Column(String(255), nullable=True)
    preferences = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
