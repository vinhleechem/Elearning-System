"""
Advanced Memory System cho Chatbot
- Short-term Memory: Conversation context hiện tại
- Long-term Memory: User preferences, facts, learning patterns
- Semantic Memory: Lưu trữ knowledge dạng vector
- Episodic Memory: Lưu trữ events và interactions
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import json

from app.models.sql_models import (
    Conversation,
    Message,
    ChatbotContext,
    KnowledgeBase
)
from app.rag.vector_store import vector_store

logger = logging.getLogger(__name__)


class ShortTermMemory:
    """
    Short-term memory: Context trong conversation hiện tại
    - Lưu 10-20 messages gần nhất
    - Tự động summarize khi quá dài
    - Clear sau khi conversation end
    """
    
    def __init__(self, max_messages: int = 20):
        self.max_messages = max_messages
        self.messages: List[Dict[str, str]] = []
        self.summary: Optional[str] = None
    
    def add_message(self, role: str, content: str):
        """Thêm message vào short-term memory"""
        self.messages.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        
        # Giới hạn số lượng messages
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
    
    def get_context(self, last_n: int = 10) -> List[Dict[str, str]]:
        """Lấy N messages gần nhất"""
        return self.messages[-last_n:] if self.messages else []
    
    def clear(self):
        """Clear short-term memory"""
        self.messages = []
        self.summary = None
    
    def get_summary(self) -> str:
        """Lấy tóm tắt conversation"""
        if not self.messages:
            return "No conversation yet"
        
        if self.summary:
            return self.summary
        
        # Simple summary - trong production có thể dùng AI để summarize
        user_messages = [m["content"] for m in self.messages if m["role"] == "user"]
        return f"User đã hỏi {len(user_messages)} câu hỏi về: {', '.join(user_messages[:3])}"


class LongTermMemory:
    """
    Long-term memory: User preferences, facts, patterns
    - Lưu vào database vĩnh viễn
    - Index bằng vector database để search semantic
    - Learn từ interactions
    """
    
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.preferences: Dict[str, Any] = {}
        self.facts: List[Dict[str, Any]] = []
        self._load_from_db()
    
    def _load_from_db(self):
        """Load long-term memory từ database"""
        context = self.db.query(ChatbotContext).filter(
            ChatbotContext.user_id == self.user_id
        ).first()
        
        if context and context.preferences:
            self.preferences = context.preferences
    
    def save_preference(self, key: str, value: Any):
        """Lưu user preference"""
        self.preferences[key] = value
        
        # Save to database
        context = self.db.query(ChatbotContext).filter(
            ChatbotContext.user_id == self.user_id
        ).first()
        
        if not context:
            context = ChatbotContext(
                user_id=self.user_id,
                preferences={}
            )
            self.db.add(context)
        
        if not context.preferences:
            context.preferences = {}
        
        context.preferences[key] = value
        self.db.commit()
        
        logger.info(f"💾 Saved preference for user {self.user_id}: {key} = {value}")
    
    def get_preference(self, key: str, default=None) -> Any:
        """Lấy user preference"""
        return self.preferences.get(key, default)
    
    def save_fact(self, fact: str, metadata: Dict[str, Any] = None):
        """
        Lưu fact về user
        Ví dụ: "User thích học Python", "User là developer"
        """
        fact_data = {
            "content": fact,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        self.facts.append(fact_data)
        
        # Save to vector database để search semantic
        try:
            vector_store.add_documents(
                documents=[fact],
                metadatas=[{
                    "type": "user_fact",
                    "user_id": self.user_id,
                    **fact_data["metadata"]
                }],
                ids=[f"user_{self.user_id}_fact_{len(self.facts)}"]
            )
            logger.info(f"💾 Saved fact for user {self.user_id}: {fact}")
        except Exception as e:
            logger.error(f"Error saving fact to vector store: {e}")
    
    def get_facts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Lấy facts về user"""
        return self.facts[-limit:]
    
    def search_facts(self, query: str, top_k: int = 5) -> List[str]:
        """Search facts bằng semantic search"""
        try:
            results = vector_store.search(
                query=query,
                n_results=top_k,
                filter_metadata={"type": "user_fact", "user_id": self.user_id}
            )
            
            return results.get("documents", [])
        except Exception as e:
            logger.error(f"Error searching facts: {e}")
            return []


class EpisodicMemory:
    """
    Episodic memory: Lưu trữ events và interactions
    - Lịch sử conversations
    - Patterns của user
    - Learning journey
    """
    
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
    
    def get_conversation_history(
        self,
        days: int = 30,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Lấy lịch sử conversations"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        conversations = self.db.query(Conversation).filter(
            Conversation.user_id == self.user_id,
            Conversation.created_at >= cutoff_date
        ).order_by(desc(Conversation.created_at)).limit(limit).all()
        
        return [
            {
                "id": conv.id,
                "title": conv.title,
                "created_at": conv.created_at.isoformat(),
                "message_count": len(conv.messages)
            }
            for conv in conversations
        ]
    
    def get_interaction_patterns(self) -> Dict[str, Any]:
        """Phân tích patterns từ interactions"""
        # Phân tích thời gian user hay chat
        messages = self.db.query(Message).join(Conversation).filter(
            Conversation.user_id == self.user_id
        ).all()
        
        if not messages:
            return {}
        
        # Count by hour
        hour_counts = {}
        for msg in messages:
            hour = msg.created_at.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        # Find peak hour
        peak_hour = max(hour_counts.items(), key=lambda x: x[1])[0] if hour_counts else 12
        
        # Count topics (từ extra_data)
        topics = {}
        for msg in messages:
            if msg.extra_data and "intent" in msg.extra_data:
                intent = msg.extra_data["intent"].get("intent", "unknown")
                topics[intent] = topics.get(intent, 0) + 1
        
        return {
            "total_messages": len(messages),
            "peak_hour": peak_hour,
            "favorite_topics": sorted(topics.items(), key=lambda x: x[1], reverse=True)[:5],
            "avg_message_length": sum(len(m.content) for m in messages) / len(messages)
        }
    
    def get_learning_journey(self) -> List[Dict[str, Any]]:
        """Theo dõi learning journey của user"""
        # Lấy courses user đã quan tâm
        contexts = self.db.query(ChatbotContext).filter(
            ChatbotContext.user_id == self.user_id
        ).all()
        
        course_ids = set()
        for ctx in contexts:
            if ctx.current_course_id:
                course_ids.add(ctx.current_course_id)
        
        return [{"course_id": cid} for cid in course_ids]


class AdvancedMemorySystem:
    """
    Tổng hợp tất cả memory systems
    Cung cấp unified interface để truy cập memories
    """
    
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        
        # Initialize các memory systems
        self.short_term = ShortTermMemory(max_messages=20)
        self.long_term = LongTermMemory(db, user_id)
        self.episodic = EpisodicMemory(db, user_id)
        
        logger.info(f"🧠 Initialized Advanced Memory System for user {user_id}")
    
    def remember_message(self, role: str, content: str):
        """Lưu message vào short-term memory"""
        self.short_term.add_message(role, content)
    
    def learn_preference(self, key: str, value: Any):
        """Learn và lưu user preference"""
        self.long_term.save_preference(key, value)
    
    def learn_fact(self, fact: str, metadata: Dict = None):
        """Learn fact về user"""
        self.long_term.save_fact(fact, metadata)
    
    def recall_context(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Recall relevant context từ tất cả memory systems
        
        Returns:
            {
                "short_term": [...],
                "long_term_facts": [...],
                "preferences": {...},
                "patterns": {...}
            }
        """
        return {
            "short_term": self.short_term.get_context(last_n=10),
            "long_term_facts": self.long_term.search_facts(query, top_k),
            "preferences": self.long_term.preferences,
            "patterns": self.episodic.get_interaction_patterns()
        }
    
    def get_full_context(self) -> Dict[str, Any]:
        """Lấy toàn bộ context của user"""
        return {
            "short_term_summary": self.short_term.get_summary(),
            "preferences": self.long_term.preferences,
            "facts": self.long_term.get_facts(),
            "conversation_history": self.episodic.get_conversation_history(),
            "patterns": self.episodic.get_interaction_patterns(),
            "learning_journey": self.episodic.get_learning_journey()
        }
    
    def auto_learn_from_conversation(self, user_message: str, ai_response: str, analysis: Dict):
        """
        Tự động học từ conversation
        Extract preferences, facts, patterns
        """
        intent = analysis.get("intent", {}).get("intent")
        sentiment = analysis.get("sentiment", {}).get("sentiment")
        
        # Learn preferences từ patterns
        if intent == "course_search":
            # Extract course interest
            keywords = ["python", "javascript", "marketing", "design"]
            for keyword in keywords:
                if keyword in user_message.lower():
                    self.learn_preference(f"interested_in_{keyword}", True)
        
        # Learn facts từ explicit statements
        fact_indicators = ["tôi là", "tôi thích", "tôi muốn", "tôi cần"]
        for indicator in fact_indicators:
            if indicator in user_message.lower():
                self.learn_fact(user_message, {
                    "type": "user_statement",
                    "intent": intent,
                    "sentiment": sentiment
                })
                break
    
    def clear_short_term(self):
        """Clear short-term memory khi end conversation"""
        self.short_term.clear()


# Export
__all__ = [
    "ShortTermMemory",
    "LongTermMemory",
    "EpisodicMemory",
    "AdvancedMemorySystem"
]

