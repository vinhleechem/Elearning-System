from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.sql_models import Conversation, Message, KnowledgeBase, ChatbotContext
from app.rag.vector_store import vector_store
from app.ai.providers import AIProviderFactory
from datetime import datetime
import logging
import asyncio

# Import enhanced features
from app.ai.enhanced_features import (
    SentimentAnalyzer,
    IntentDetector,
    PersonalizationEngine,
    SmartResponseEnhancer,
    analyze_message_comprehensive,
    generate_smart_response
)

# Import MCP (Model Context Protocol)
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    from app.ai.gemini import GeminiAgent
    from app.ai.mcp_integration import get_mcp_manager
    HAS_MCP = True
except ImportError:
    HAS_MCP = False
    logger.warning("⚠️ MCP modules not available. Install required packages.")

# Import Advanced AI Concepts
try:
    from app.ai.advanced_concepts import (
        ChainOfThought,
        ReActAgent,
        SelfReflection,
        AdvancedAIOrchestrator
    )
    HAS_ADVANCED_AI = True
    logger.info("✅ Advanced AI concepts loaded")
except ImportError:
    HAS_ADVANCED_AI = False
    logger.warning("⚠️ Advanced AI concepts not available.")


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
            logger.info(f"🔍 RAG: Searching for query: {query}")
            
            # Check vector store stats
            stats = self.vector_store.get_collection_stats()
            logger.info(f"📊 Vector store has {stats['total_documents']} documents")
            
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
            
            logger.info(f"🔍 RAG: Found {len(results.get('documents', []))} documents")
            
            # Format results
            relevant_docs = []
            documents = results.get("documents", [])
            metadatas = results.get("metadatas", [])
            distances = results.get("distances", [])
            
            for i, doc in enumerate(documents):
                relevant_docs.append({
                    "content": doc,
                    "metadata": metadatas[i] if i < len(metadatas) else {},
                    "relevance_score": 1 - distances[i] if i < len(distances) else 0
                })
            
            logger.info(f"✅ RAG: Returning {len(relevant_docs)} relevant documents")
            return relevant_docs
        except Exception as e:
            logger.error(f"❌ Error retrieving context: {e}")
            import traceback
            traceback.print_exc()
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

QUY TẮC NGHIÊM NGẶT (PHẢI TUÂN THỦ):
1. CHỈ trả lời về chủ đề liên quan đến E-Learning
2. KHÔNG trả lời về chính trị, tôn giáo, hay chủ đề nhạy cảm
3. **TUYỆT ĐỐI KHÔNG TỰ BỊA/SÁNG TẠO thông tin về BẤT KỲ khóa học nào**
4. **CHỈ sử dụng thông tin từ KNOWLEDGE BASE bên dưới**
5. **KHÔNG được tự nghĩ ra tên khóa học, giá cả, nội dung, giảng viên**
6. **Nếu KNOWLEDGE BASE không có thông tin về khóa học được hỏi:**
   → PHẢI trả lời: "🌱 Hiện tại mình chưa tìm thấy thông tin về [chủ đề] này trong hệ thống. Bạn có thể:
   - Tìm kiếm với từ khóa khác
   - Xem các khóa học nổi bật trên trang chủ
   - Liên hệ bộ phận hỗ trợ để được tư vấn chi tiết hơn!"
7. Trả lời ngắn gọn, rõ ràng, thân thiện

**VÍ DỤ SAI - TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM:**
User: "Có khóa học NodeJS không?"
❌ SAI: "Có, chúng tôi có khóa **NodeJS Backend Development** giá 800,000 VNĐ, giảng viên Nguyễn Văn A..."
→ Sai vì tự bịa tên khóa học, giá cả, giảng viên không có trong KNOWLEDGE BASE

**VÍ DỤ ĐÚNG - PHẢI LÀM NHƯ VẬY:**
User: "Có khóa học NodeJS không?"
✅ ĐÚNG: "🌱 Hiện tại mình chưa tìm thấy khóa học về NodeJS trong hệ thống. Bạn có thể xem các khóa học lập trình khác trên trang chủ nhé!"

**LƯU Ý:** Áp dụng cho TẤT CẢ khóa học (Python, Java, React, AI, v.v.) - KHÔNG bịa thông tin về BẤT KỲ khóa học nào!

CÁCH TRÌNH BÀY (CỰC KỲ QUAN TRỌNG):
1. **Câu mở đầu ngắn gọn** (1-2 câu), sau đó XUỐNG DÒNG 2 lần (thêm dòng trống)

2. **Chia nhỏ thông tin thành các đoạn ngắn**:
   - Mỗi đoạn chỉ 2-3 câu
   - Giữa các đoạn PHẢI có dòng trống
   - Sử dụng bullet points (-) hoặc số (1., 2.) cho danh sách

3. **Format Markdown**:
   - In đậm (**tên khóa học**, **từ khóa quan trọng**)
   - Dùng emoji phù hợp (📚, ✨, 💡, 🎯)

4. **VÍ DỤ FORMAT ĐÚNG**:
```
Có, nền tảng có khóa học [chủ đề] đấy! 

**Khóa học hiện có:**

📚 **[Tên khóa học]**
- Nội dung: [Mô tả ngắn gọn]
- Giá: [Giá] VNĐ
- Cấp độ: [Level]

Bạn có thể xem chi tiết trên trang Khóa học nhé!
```

5. **TUYỆT ĐỐI KHÔNG ĐƯỢC**:
   - Viết thành 1 đoạn văn dài
   - Liệt kê nhiều thông tin không có dòng trống
   - Bắt đầu bằng câu dài dòng, tiêu cực
   - **BỊA THÔNG TIN - CHỈ dùng thông tin từ KNOWLEDGE BASE bên dưới**
   - **TỰ NGHĨ RA tên khóa học, giá cả, nội dung**

KNOWLEDGE BASE (Thông tin tham khảo):
"""
        
        # Add relevant documents to system prompt
        if relevant_docs:
            system_prompt += "\n=== THÔNG TIN TỪ CƠ SỞ DỮ LIỆU (NGUỒN DUY NHẤT) ===\n"
            system_prompt += "Dưới đây là TẤT CẢ thông tin có trong hệ thống:\n\n"
            for i, doc in enumerate(relevant_docs, 1):
                system_prompt += f"[Nguồn {i}]:\n{doc['content']}\n"
                if doc.get('metadata', {}).get('title'):
                    system_prompt += f"(Tên chính xác: {doc['metadata']['title']})\n"
                if doc.get('relevance_score'):
                    system_prompt += f"(Độ liên quan: {doc['relevance_score']:.2f})\n"
                system_prompt += "\n"
            
            system_prompt += "\n⚠️ QUY TẮC BẮT BUỘC KHI TRẢ LỜI:\n"
            system_prompt += "1. CHỈ được dùng TÊN KHÓA HỌC CHÍNH XÁC từ 'Tên chính xác' ở trên\n"
            system_prompt += "2. KHÔNG được tự đổi tên, rút gọn, hoặc diễn giải lại tên khóa học\n"
            system_prompt += "3. KHÔNG được tự nghĩ ra giá, nội dung, giảng viên nếu không có trong nguồn\n"
            system_prompt += "4. Nếu thông tin không đầy đủ → Nói 'Bạn có thể xem chi tiết trên trang khóa học'\n"
            system_prompt += "5. Nếu KHÔNG có nguồn nào → Nói 'Hiện tại chưa tìm thấy khóa học này'\n"
        else:
            system_prompt += "\n⚠️ KHÔNG tìm thấy thông tin liên quan trong hệ thống.\n"
            system_prompt += "Trong trường hợp này, bạn PHẢI:\n"
            system_prompt += "1. Trả lời: '🌱 Hiện tại mình chưa tìm thấy khóa học về [chủ đề] trong hệ thống.'\n"
            system_prompt += "2. Gợi ý: 'Bạn có thể xem các khóa học khác trên trang chủ hoặc liên hệ hỗ trợ.'\n"
            system_prompt += "3. TUYỆT ĐỐI KHÔNG tự bịa tên khóa học, giá cả, nội dung!\n"
        
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
    """Main chatbot service kết hợp RAG + AI + Memory + MCP + Advanced AI Concepts"""
    
    def __init__(self, db: Session):
        self.db = db
        self.rag_service = RAGService()
        self.memory = ConversationMemory(db)
        
        # Initialize AI Provider - với hoặc không có MCP
        if settings.ENABLE_MCP and HAS_MCP:
            # Sử dụng GeminiAgent với MCP (có thể gọi tools)
            logger.info("🤖 Initializing Gemini Agent with MCP support...")
            self.ai_provider = GeminiAgent()
            
            # Initialize MCP Manager và đăng ký tools
            self.mcp_manager = get_mcp_manager(db)
            self.ai_provider.register_mcp_tools(self.mcp_manager)
            
            # MCP servers sẽ connect khi cần (lazy connection)
            logger.info("✅ Gemini Agent with MCP initialized")
            logger.info(f"🔧 Available MCP tools: {len(self.mcp_manager.get_available_tools())}")
        else:
            # Sử dụng GeminiProvider thông thường (không có function calling)
            self.ai_provider = AIProviderFactory.create_provider()
            self.mcp_manager = None
            if settings.ENABLE_MCP:
                logger.warning("⚠️ MCP enabled but modules not available. Using standard provider.")
            else:
                logger.info("ℹ️ MCP disabled. Using standard Gemini provider.")
        
        # Initialize Advanced AI Orchestrator
        if HAS_ADVANCED_AI:
            self.ai_orchestrator = AdvancedAIOrchestrator()
            logger.info("✅ Advanced AI Orchestrator initialized")
        else:
            self.ai_orchestrator = None
    
    async def process_message(
        self,
        user_id: int,
        message: str,
        conversation_id: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None,
        ai_provider: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 4000
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
            # Tăng top_k lên 10 để lấy nhiều context hơn (đặc biệt là danh sách khóa học)
            relevant_docs = self.rag_service.retrieve_relevant_context(
                query=message,
                user_context=user_context,
                top_k=10
            )
            logger.info(f"📚 RAG retrieved {len(relevant_docs)} relevant documents for query: {message[:50]}...")
            if relevant_docs:
                logger.info(f"📄 First doc preview: {relevant_docs[0].get('content', '')[:100]}...")
            
            # ===== STEP 3: Get conversation history =====
            conversation_history = self.memory.get_conversation_history(conversation.id)
            
            # ===== STEP 4: Build augmented prompt with enhanced context =====
            messages = self.rag_service.build_augmented_prompt(
                user_query=message,
                relevant_docs=relevant_docs,
                conversation_history=conversation_history
            )
            
            # ===== STEP 4.5: Apply Advanced AI Techniques =====
            enhanced_message = message
            ai_technique_used = "standard"
            
            if self.ai_orchestrator:
                # Phân tích độ phức tạp của query
                complexity = self.ai_orchestrator.analyze_query_complexity(message)
                logger.info(f"🧠 Query complexity: {complexity}")
                
                # Enhance query với technique phù hợp
                if complexity['recommended_technique'] != 'standard':
                    technique_context = {
                        'available_tools': [tool['name'] for tool in self.mcp_manager.get_available_tools()] if self.mcp_manager else [],
                        'user_context': user_context
                    }
                    
                    enhanced_message = self.ai_orchestrator.enhance_prompt_with_technique(
                        query=message,
                        technique=complexity['recommended_technique'],
                        context=technique_context
                    )
                    ai_technique_used = complexity['recommended_technique']
                    logger.info(f"✨ Applied AI technique: {ai_technique_used}")
                    
                    # Update messages với enhanced query
                    if messages and messages[-1]["role"] == "user":
                        messages[-1]["content"] = enhanced_message
            
            # Add sentiment and intent to system prompt for better response
            if messages and messages[0]["role"] == "system":
                sentiment_info = f"\n\nTHÔNG TIN THÊM:\n"
                sentiment_info += f"- Cảm xúc người dùng: {message_analysis['sentiment']['sentiment']}\n"
                sentiment_info += f"- Ý định: {message_analysis['intent']['intent']}\n"
                
                if ai_technique_used != "standard":
                    sentiment_info += f"- AI Technique: {ai_technique_used}\n"
                
                if message_analysis['sentiment']['sentiment'] == 'frustrated':
                    sentiment_info += "- LƯU Ý: Người dùng đang thất vọng, hãy thể hiện sự đồng cảm và hỗ trợ tích cực\n"
                elif message_analysis['sentiment']['sentiment'] == 'negative':
                    sentiment_info += "- LƯU Ý: Người dùng không hài lòng, hãy lịch sự và giải quyết vấn đề\n"
                
                messages[0]["content"] += sentiment_info
            
            # ===== STEP 5: Generate AI response =====
            # Adjust temperature based on intent
            if message_analysis['intent']['intent'] in ['technical_support', 'payment', 'refund']:
                temperature = 0.3  # More precise for technical/financial questions
            
            # Use GeminiAgent with MCP if enabled, otherwise use standard provider
            if HAS_MCP and self.mcp_manager and hasattr(self.ai_provider, 'generate_response') and asyncio.iscoroutinefunction(self.ai_provider.generate_response):
                # GeminiAgent với MCP - có thể gọi tools
                logger.info("🔧 Using Gemini Agent with MCP (function calling enabled)")
                try:
                    ai_response = await self.ai_provider.generate_response(
                        messages=messages,
                        use_tools=True,  # Cho phép gọi tools
                        max_iterations=5
                    )
                except Exception as e:
                    logger.warning(f"⚠️ MCP Agent failed, falling back to standard provider: {e}")
                    # Fallback to standard provider
                    provider = AIProviderFactory.create_provider()
                    ai_response = provider.generate_response(
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens
                    )
            else:
                # Standard GeminiProvider - không có function calling
                if ai_provider:
                    provider = AIProviderFactory.create_provider(ai_provider)
                else:
                    provider = self.ai_provider
                
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
            
            # ===== STEP 6.5: Self-Reflection for critical queries =====
            final_response = enhanced_response['message']
            reflection_applied = False
            
            if self.ai_orchestrator and HAS_ADVANCED_AI:
                # Check if query is critical (needs high accuracy)
                critical_keywords = ['chính xác', 'accurate', 'quan trọng', 'important', 'đảm bảo']
                is_critical = any(kw in message.lower() for kw in critical_keywords)
                
                # Or if AI technique used was complex
                is_complex = ai_technique_used in ['cot', 'react']
                
                if is_critical or is_complex:
                    logger.info("🔍 Applying Self-Reflection for critical/complex query...")
                    
                    try:
                        from advanced_ai_concepts import SelfReflection
                        
                        # Create reflection prompt
                        reflection_prompt = SelfReflection.create_reflection_prompt(
                            query=message,
                            initial_answer=ai_response,
                            context=user_context_enhanced
                        )
                        
                        # Generate reflection
                        if HAS_MCP and hasattr(self.ai_provider, 'generate_response') and asyncio.iscoroutinefunction(self.ai_provider.generate_response):
                            reflection_response = await self.ai_provider.generate_response(
                                messages=[{"role": "user", "content": reflection_prompt}],
                                use_tools=False
                            )
                        else:
                            reflection_response = self.ai_provider.generate_response(
                                messages=[{"role": "user", "content": reflection_prompt}],
                                temperature=0.3,
                                max_tokens=max_tokens
                            )
                        
                        # Parse reflection
                        reflection_result = SelfReflection.parse_reflection(reflection_response)
                        
                        # If improved answer is significantly better, use it
                        if reflection_result.get('improved_answer'):
                            avg_score = reflection_result.get('average_score', 0)
                            if avg_score < 8:  # If initial answer scored < 8/10
                                final_response = reflection_result['improved_answer']
                                reflection_applied = True
                                logger.info(f"✨ Used improved answer from self-reflection (score: {avg_score}/10)")
                    
                    except Exception as e:
                        logger.warning(f"⚠️ Self-reflection failed: {e}")
            
            # Update enhanced_response with final response
            if reflection_applied:
                enhanced_response['message'] = final_response
                enhanced_response['metadata'] = enhanced_response.get('metadata', {})
                enhanced_response['metadata']['reflection_applied'] = True
                enhanced_response['metadata']['ai_technique'] = ai_technique_used
            
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
                content=enhanced_response["message"],
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
                "message": enhanced_response["message"],
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
