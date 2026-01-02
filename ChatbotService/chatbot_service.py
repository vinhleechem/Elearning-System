from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from models import Conversation, Message, KnowledgeBase, ChatbotContext
from vector_store import vector_store
from ai_providers import AIProviderFactory
from datetime import datetime
import logging

# Import enhanced features
from enhanced_features import (
    SentimentAnalyzer,
    IntentDetector,
    PersonalizationEngine,
    SmartResponseEnhancer,
    analyze_message_comprehensive,
    generate_smart_response
)

logger = logging.getLogger(__name__)


class RAGService:
    """Service quản lý RAG (Retrieval Augmented Generation)"""
    
    def __init__(self):
        self.vector_store = vector_store
    
    def retrieve_relevant_context(
        self,
        query: str,
        user_context: Optional[Dict[str, Any]] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Lấy context liên quan từ knowledge base
        
        Args:
            query: Câu hỏi của user
            user_context: Context của user (course_id, page, etc.)
            top_k: Số lượng documents cần lấy
        
        Returns:
            List of relevant documents with metadata
        """
        try:
            # Build filter metadata
            filter_metadata = None
            if user_context and user_context.get("course_id"):
                filter_metadata = {"content_id": user_context["course_id"]}
            
            # Search in vector store
            results = self.vector_store.search(
                query=query,
                n_results=top_k,
                filter_metadata=filter_metadata
            )
            
            # Format results
            relevant_docs = []
            for i, doc in enumerate(results["documents"]):
                relevant_docs.append({
                    "content": doc,
                    "metadata": results["metadatas"][i] if i < len(results["metadatas"]) else {},
                    "relevance_score": 1 - results["distances"][i] if i < len(results["distances"]) else 0
                })
            
            return relevant_docs
        except Exception as e:
            logger.error(f"❌ Error retrieving context: {e}")
            return []
    
    def build_augmented_prompt(
        self,
        user_query: str,
        relevant_docs: List[Dict[str, Any]],
        conversation_history: List[Dict[str, str]] = None
    ) -> List[Dict[str, str]]:
        """
        Build prompt với RAG context
        
        Args:
            user_query: Câu hỏi của user
            relevant_docs: Documents liên quan từ RAG
            conversation_history: Lịch sử chat
        
        Returns:
            Messages format cho AI provider
        """
        # System prompt để giới hạn phạm vi trả lời
        system_prompt = """Bạn là trợ lý AI của nền tảng E-Learning.

NHIỆM VỤ:
- Trả lời câu hỏi về khóa học, bài học, thanh toán, đăng ký
- Gợi ý khóa học phù hợp với người dùng
- Hỗ trợ giải đáp thắc mắc về nền tảng

QUY TẮC:
1. CHỈ trả lời về chủ đề liên quan đến E-Learning
2. KHÔNG trả lời về chính trị, tôn giáo, hay chủ đề nhạy cảm
3. Sử dụng thông tin từ KNOWLEDGE BASE được cung cấp
4. Nếu không biết, hãy thành thật nói "Tôi không có thông tin về vấn đề này"
5. Trả lời ngắn gọn, rõ ràng, thân thiện

KNOWLEDGE BASE (Thông tin tham khảo):
"""
        
        # Add relevant documents to system prompt
        if relevant_docs:
            for i, doc in enumerate(relevant_docs, 1):
                system_prompt += f"\n\n[Nguồn {i}]: {doc['content']}"
                if doc.get('metadata', {}).get('title'):
                    system_prompt += f"\n(Từ: {doc['metadata']['title']})"
        else:
            system_prompt += "\n(Không tìm thấy thông tin liên quan trong cơ sở dữ liệu)"
        
        # Build messages
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history
        if conversation_history:
            messages.extend(conversation_history[-10:])  # Last 10 messages
        
        # Add current user query
        messages.append({"role": "user", "content": user_query})
        
        return messages


class ConversationMemory:
    """Quản lý memory/context của conversation"""
    
    def __init__(self, db: Session, max_history: int = 10):
        self.db = db
        self.max_history = max_history
    
    def get_conversation_history(
        self,
        conversation_id: int
    ) -> List[Dict[str, str]]:
        """Lấy lịch sử conversation"""
        messages = self.db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.desc()).limit(self.max_history).all()
        
        # Reverse để có thứ tự đúng
        messages = list(reversed(messages))
        
        return [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]
    
    def save_message(
        self,
        conversation_id: int,
        role: str,
        content: str,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> Message:
        """Lưu message vào database"""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            extra_data=extra_data
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message
    
    def create_conversation(
        self,
        user_id: int,
        title: Optional[str] = None
    ) -> Conversation:
        """Tạo conversation mới"""
        conversation = Conversation(
            user_id=user_id,
            title=title or f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        )
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation
    
    def get_or_create_conversation(
        self,
        user_id: int,
        conversation_id: Optional[int] = None
    ) -> Conversation:
        """Lấy hoặc tạo conversation"""
        if conversation_id:
            conversation = self.db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            ).first()
            if conversation:
                return conversation
        
        # Create new conversation
        return self.create_conversation(user_id)
    
    def update_user_context(
        self,
        user_id: int,
        course_id: Optional[int] = None,
        page: Optional[str] = None,
        preferences: Optional[Dict[str, Any]] = None
    ):
        """Update context của user"""
        context = self.db.query(ChatbotContext).filter(
            ChatbotContext.user_id == user_id
        ).first()
        
        if not context:
            context = ChatbotContext(user_id=user_id)
            self.db.add(context)
        
        if course_id is not None:
            context.current_course_id = course_id
        if page is not None:
            context.current_page = page
        if preferences is not None:
            context.preferences = preferences
        
        self.db.commit()
    
    def get_user_context(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Lấy context của user"""
        context = self.db.query(ChatbotContext).filter(
            ChatbotContext.user_id == user_id
        ).first()
        
        if not context:
            return None
        
        return {
            "course_id": context.current_course_id,
            "page": context.current_page,
            "preferences": context.preferences
        }


class ChatbotService:
    """Main chatbot service kết hợp RAG + AI + Memory"""
    
    def __init__(self, db: Session):
        self.db = db
        self.rag_service = RAGService()
        self.memory = ConversationMemory(db)
        self.ai_provider = AIProviderFactory.create_provider()
    
    async def process_message(
        self,
        user_id: int,
        message: str,
        conversation_id: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None,
        ai_provider: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """
        Xử lý tin nhắn từ user với RAG + Enhanced Features
        
        Args:
            user_id: ID của user
            message: Tin nhắn từ user
            conversation_id: ID conversation (optional)
            context: Context hiện tại (course_id, page, etc.)
            ai_provider: AI provider to use (optional)
            temperature: Temperature for AI
            max_tokens: Max tokens for response
        
        Returns:
            Enhanced response với message, sources, suggestions, actions
        """
        try:
            # ===== STEP 1: Analyze message comprehensively =====
            message_analysis = analyze_message_comprehensive(message, context)
            logger.info(f"📊 Message analysis: {message_analysis}")
            
            # Get or create conversation
            conversation = self.memory.get_or_create_conversation(user_id, conversation_id)
            
            # Update user context if provided
            if context:
                self.memory.update_user_context(
                    user_id,
                    course_id=context.get("course_id"),
                    page=context.get("page")
                )
            
            # Get user context
            user_context = self.memory.get_user_context(user_id) or {}
            
            # ===== STEP 2: RAG - Retrieve relevant documents =====
            relevant_docs = self.rag_service.retrieve_relevant_context(
                query=message,
                user_context=user_context,
                top_k=5
            )
            
            # ===== STEP 3: Get conversation history =====
            conversation_history = self.memory.get_conversation_history(conversation.id)
            
            # ===== STEP 4: Build augmented prompt with enhanced context =====
            messages = self.rag_service.build_augmented_prompt(
                user_query=message,
                relevant_docs=relevant_docs,
                conversation_history=conversation_history
            )
            
            # Add sentiment and intent to system prompt for better response
            if messages and messages[0]["role"] == "system":
                sentiment_info = f"\n\nTHÔNG TIN THÊM:\n"
                sentiment_info += f"- Cảm xúc người dùng: {message_analysis['sentiment']['sentiment']}\n"
                sentiment_info += f"- Ý định: {message_analysis['intent']['intent']}\n"
                
                if message_analysis['sentiment']['sentiment'] == 'frustrated':
                    sentiment_info += "- LƯU Ý: Người dùng đang thất vọng, hãy thể hiện sự đồng cảm và hỗ trợ tích cực\n"
                elif message_analysis['sentiment']['sentiment'] == 'negative':
                    sentiment_info += "- LƯU Ý: Người dùng không hài lòng, hãy lịch sự và giải quyết vấn đề\n"
                
                messages[0]["content"] += sentiment_info
            
            # ===== STEP 5: Generate AI response =====
            if ai_provider:
                provider = AIProviderFactory.create_provider(ai_provider)
            else:
                provider = self.ai_provider
            
            # Adjust temperature based on intent
            if message_analysis['intent']['intent'] in ['technical_support', 'payment', 'refund']:
                temperature = 0.3  # More precise for technical/financial questions
            
            ai_response = provider.generate_response(
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            # ===== STEP 6: Generate smart enhanced response =====
            user_context_enhanced = {
                **user_context,
                "user_name": context.get("user_name") if context else None
            }
            
            enhanced_response = generate_smart_response(
                ai_response,
                message_analysis,
                user_context_enhanced
            )
            
            # ===== STEP 7: Save messages to database =====
            self.memory.save_message(
                conversation_id=conversation.id,
                role="user",
                content=message,
                extra_data={
                    "sentiment": message_analysis["sentiment"],
                    "intent": message_analysis["intent"]
                }
            )
            
            assistant_msg = self.memory.save_message(
                conversation_id=conversation.id,
                role="assistant",
                content=enhanced_response["response"],
                extra_data={
                    "sources": [
                        {
                            "content": doc["content"][:200],
                            "title": doc.get("metadata", {}).get("title"),
                            "relevance": doc.get("relevance_score")
                        }
                        for doc in relevant_docs[:3]
                    ] if relevant_docs else [],
                    "suggestions": enhanced_response.get("suggestions", []),
                    "actions": enhanced_response.get("actions", []),
                    "quick_replies": enhanced_response.get("quick_replies", []),
                    "sentiment": message_analysis["sentiment"],
                    "intent": message_analysis["intent"]
                }
            )
            
            return {
                "conversation_id": conversation.id,
                "message": enhanced_response["response"],
                "role": "assistant",
                "sources": assistant_msg.extra_data.get("sources") if assistant_msg.extra_data else [],
                "suggestions": enhanced_response.get("suggestions", []),
                "actions": enhanced_response.get("actions", []),
                "quick_replies": enhanced_response.get("quick_replies", []),
                "timestamp": assistant_msg.created_at,
                "analysis": {
                    "sentiment": message_analysis["sentiment"]["sentiment"],
                    "intent": message_analysis["intent"]["intent"],
                    "confidence": message_analysis["intent"]["confidence"]
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing message: {e}")
            raise
