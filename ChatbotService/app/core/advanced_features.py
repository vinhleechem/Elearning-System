"""
Advanced Features cho Production Chatbot
- Streaming responses
- Rate limiting
- Caching
- Conversation summarization
- Analytics
"""

from typing import AsyncGenerator, Dict, Any, Optional
from functools import lru_cache
from datetime import datetime, timedelta
import asyncio
import json
import hashlib
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """Rate limiting để tránh spam"""
    
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
    
    def is_allowed(self, user_id: int) -> bool:
        """Check if user is allowed to make request"""
        now = datetime.now()
        cutoff = now - timedelta(seconds=self.window_seconds)
        
        # Remove old requests
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if req_time > cutoff
        ]
        
        # Check if under limit
        if len(self.requests[user_id]) >= self.max_requests:
            return False
        
        # Add new request
        self.requests[user_id].append(now)
        return True
    
    def get_remaining(self, user_id: int) -> int:
        """Get remaining requests"""
        now = datetime.now()
        cutoff = now - timedelta(seconds=self.window_seconds)
        recent_requests = [
            req_time for req_time in self.requests[user_id]
            if req_time > cutoff
        ]
        return max(0, self.max_requests - len(recent_requests))


class ResponseCache:
    """Cache responses để giảm API calls"""
    
    def __init__(self, ttl_seconds: int = 3600):
        self.cache = {}
        self.ttl_seconds = ttl_seconds
    
    def _generate_key(self, message: str, context: Optional[Dict] = None) -> str:
        """Generate cache key"""
        data = f"{message}:{json.dumps(context or {}, sort_keys=True)}"
        return hashlib.md5(data.encode()).hexdigest()
    
    def get(self, message: str, context: Optional[Dict] = None) -> Optional[str]:
        """Get cached response"""
        key = self._generate_key(message, context)
        if key in self.cache:
            cached_data, timestamp = self.cache[key]
            if datetime.now() - timestamp < timedelta(seconds=self.ttl_seconds):
                logger.info(f"✅ Cache hit for: {message[:50]}...")
                return cached_data
            else:
                del self.cache[key]
        return None
    
    def set(self, message: str, response: str, context: Optional[Dict] = None):
        """Cache response"""
        key = self._generate_key(message, context)
        self.cache[key] = (response, datetime.now())
        logger.info(f"💾 Cached response for: {message[:50]}...")
    
    def clear(self):
        """Clear all cache"""
        self.cache.clear()


class ConversationSummarizer:
    """Tóm tắt conversation khi quá dài"""
    
    @staticmethod
    async def summarize_conversation(
        messages: list,
        ai_provider
    ) -> str:
        """Summarize long conversation"""
        if len(messages) < 10:
            return None
        
        # Build summarization prompt
        conversation_text = "\n".join([
            f"{msg['role']}: {msg['content']}"
            for msg in messages
        ])
        
        summary_prompt = [
            {
                "role": "system",
                "content": "Tóm tắt cuộc hội thoại sau thành 2-3 câu ngắn gọn, giữ lại thông tin quan trọng."
            },
            {
                "role": "user",
                "content": f"Hội thoại:\n{conversation_text}"
            }
        ]
        
        try:
            summary = ai_provider.generate_response(
                messages=summary_prompt,
                temperature=0.3,
                max_tokens=200
            )
            logger.info(f"📝 Summarized conversation: {summary}")
            return summary
        except Exception as e:
            logger.error(f"❌ Error summarizing: {e}")
            return None


class StreamingResponse:
    """Streaming response như ChatGPT"""
    
    @staticmethod
    async def stream_response(
        full_response: str,
        chunk_size: int = 5
    ) -> AsyncGenerator[str, None]:
        """
        Stream response word by word
        
        Args:
            full_response: Full AI response
            chunk_size: Number of words per chunk
        """
        words = full_response.split()
        
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i + chunk_size])
            yield chunk + " "
            await asyncio.sleep(0.05)  # Simulate streaming delay


class ChatAnalytics:
    """Analytics và monitoring"""
    
    def __init__(self):
        self.stats = {
            "total_messages": 0,
            "total_conversations": 0,
            "avg_response_time": 0,
            "popular_topics": defaultdict(int),
            "user_satisfaction": [],
            "error_count": 0
        }
        self.response_times = []
    
    def log_message(
        self,
        user_id: int,
        message: str,
        response_time: float,
        sources_count: int = 0
    ):
        """Log message for analytics"""
        self.stats["total_messages"] += 1
        self.response_times.append(response_time)
        
        # Update average response time
        self.stats["avg_response_time"] = sum(self.response_times) / len(self.response_times)
        
        # Extract topics (simple keyword extraction)
        keywords = ["khóa học", "thanh toán", "đăng ký", "chứng chỉ", "giá", "học phí"]
        for keyword in keywords:
            if keyword in message.lower():
                self.stats["popular_topics"][keyword] += 1
    
    def log_error(self, error_type: str):
        """Log error"""
        self.stats["error_count"] += 1
        logger.error(f"📊 Error logged: {error_type}")
    
    def log_feedback(self, user_id: int, rating: int, feedback: str = ""):
        """Log user feedback"""
        self.stats["user_satisfaction"].append({
            "user_id": user_id,
            "rating": rating,
            "feedback": feedback,
            "timestamp": datetime.now()
        })
    
    def get_stats(self) -> Dict[str, Any]:
        """Get analytics stats"""
        avg_satisfaction = 0
        if self.stats["user_satisfaction"]:
            avg_satisfaction = sum(
                f["rating"] for f in self.stats["user_satisfaction"]
            ) / len(self.stats["user_satisfaction"])
        
        return {
            **self.stats,
            "avg_satisfaction": round(avg_satisfaction, 2),
            "top_topics": dict(
                sorted(
                    self.stats["popular_topics"].items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:5]
            )
        }


class SmartContextManager:
    """Quản lý context thông minh"""
    
    @staticmethod
    def extract_intent(message: str) -> str:
        """Extract user intent"""
        message_lower = message.lower()
        
        intents = {
            "course_search": ["tìm khóa học", "khóa học nào", "học gì", "course"],
            "registration": ["đăng ký", "mua", "thanh toán", "register"],
            "payment": ["thanh toán", "payment", "giá", "phí", "tiền"],
            "certificate": ["chứng chỉ", "certificate", "hoàn thành"],
            "technical": ["lỗi", "không", "error", "bug", "không hoạt động"],
            "refund": ["hoàn tiền", "refund", "trả lại"],
            "general": []
        }
        
        for intent, keywords in intents.items():
            if any(keyword in message_lower for keyword in keywords):
                return intent
        
        return "general"
    
    @staticmethod
    def build_smart_context(
        user_context: Optional[Dict],
        message: str,
        conversation_history: list
    ) -> Dict[str, Any]:
        """Build smart context with intent and history analysis"""
        intent = SmartContextManager.extract_intent(message)
        
        # Analyze conversation history
        recent_topics = []
        if conversation_history:
            for msg in conversation_history[-5:]:
                if msg["role"] == "user":
                    recent_topics.append(
                        SmartContextManager.extract_intent(msg["content"])
                    )
        
        return {
            "intent": intent,
            "recent_topics": recent_topics,
            "user_context": user_context or {},
            "conversation_length": len(conversation_history)
        }


# Global instances
rate_limiter = RateLimiter(max_requests=20, window_seconds=60)
response_cache = ResponseCache(ttl_seconds=1800)  # 30 minutes
analytics = ChatAnalytics()
