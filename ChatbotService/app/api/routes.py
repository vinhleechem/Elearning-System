from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, File, UploadFile, Form
from fastapi.responses import StreamingResponse as FastAPIStreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from datetime import datetime
from pathlib import Path
import shutil

from app.core.database import get_db
from app.models.schemas import (
    ChatMessageRequest,
    ChatMessageResponse,
    ConversationResponse,
    KnowledgeBaseItem,
    ChatbotConfig,
    FeedbackRequest
)
from app.services.chatbot_service import ChatbotService
from app.models.sql_models import Conversation, KnowledgeBase, Message
from app.rag.vector_store import vector_store
from app.core.advanced_features import (
    rate_limiter,
    response_cache,
    analytics,
    StreamingResponse,
    SmartContextManager
)
from app.api.websocket import websocket_chat_endpoint, websocket_typing_indicator
from app.core.config import settings
from app.core.spring_boot_client import spring_boot_client

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "E-Learning AI Chatbot",
        "status": "running",
        "version": "2.0.0",
        "ai_provider": settings.DEFAULT_AI_PROVIDER,
        "features": [
            "RAG (Retrieval-Augmented Generation)",
            "Streaming Responses",
            "WebSocket Support",
            "Rate Limiting",
            "Response Caching",
            "Analytics & Monitoring",
            "Smart Context Management"
        ]
    }


@router.get("/health")
async def health_check():
    """Detailed health check"""
    vector_stats = vector_store.get_collection_stats()
    analytics_stats = analytics.get_stats()
    
    return {
        "status": "healthy",
        "database": "connected",
        "vector_store": vector_stats,
        "ai_provider": settings.DEFAULT_AI_PROVIDER,
        "analytics": analytics_stats,
        "timestamp": datetime.now().isoformat()
    }


@router.post("/chat", response_model=ChatMessageResponse)
async def chat(
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """
    💬 Gửi tin nhắn và nhận response từ chatbot
    """
    try:
        # Rate limiting
        if not rate_limiter.is_allowed(request.user_id):
            remaining = rate_limiter.get_remaining(request.user_id)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. {remaining} requests remaining. Try again in 60 seconds."
            )
        
        # Check cache
        cached_response = response_cache.get(request.message, request.context)
        if cached_response:
            logger.info(f"✅ Returning cached response for user {request.user_id}")
            return ChatMessageResponse(
                conversation_id=request.conversation_id or 0,
                message=cached_response,
                role="assistant",
                sources=[],
                timestamp=datetime.now(),
                cached=True
            )
        
        # Build smart context
        smart_context = SmartContextManager.build_smart_context(
            user_context=request.context,
            message=request.message,
            conversation_history=[]
        )
        
        # Process message
        start_time = datetime.now()
        chatbot = ChatbotService(db)
        response = await chatbot.process_message(
            user_id=request.user_id,
            message=request.message,
            conversation_id=request.conversation_id,
            context={**request.context, **smart_context} if request.context else smart_context
        )
        
        # Cache response
        response_cache.set(request.message, response["message"], request.context)
        
        # Analytics
        response_time = (datetime.now() - start_time).total_seconds()
        analytics.log_message(
            user_id=request.user_id,
            message=request.message,
            response_time=response_time,
            sources_count=len(response.get("sources", []))
        )
        
        return ChatMessageResponse(**response, cached=False)
        
    except Exception as e:
        logger.error(f"❌ Chat error: {e}")
        analytics.log_error(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing message: {str(e)}"
        )


@router.post("/chat/stream")
async def chat_stream(
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """
    🌊 Streaming chat response (like ChatGPT)
    """
    try:
        logger.info(f"📨 Received stream request: user_id={request.user_id}, message={request.message[:50]}...")
        
        # Rate limiting
        if not rate_limiter.is_allowed(request.user_id):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
        
        # Process message
        logger.info("🤖 Initializing ChatbotService...")
        chatbot = ChatbotService(db)
        
        logger.info("💬 Processing message...")
        response = await chatbot.process_message(
            user_id=request.user_id,
            message=request.message,
            conversation_id=request.conversation_id,
            context=request.context
        )
        
        logger.info("✅ Message processed successfully")
        
        # Stream response
        async def generate():
            # Send conversation ID first as JSON
            import json
            meta = {"conversation_id": response["conversation_id"]}
            yield f"data: {json.dumps(meta)}\n\n"
            
            async for chunk in StreamingResponse.stream_response(response["message"]):
                yield f"data: {chunk}\n\n"
            yield f"data: [DONE]\n\n"
        
        return FastAPIStreamingResponse(
            generate(),
            media_type="text/event-stream"
        )
        
    except Exception as e:
        logger.error(f"❌ Streaming error: {e}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.websocket("/ws/chat/{user_id}")
async def websocket_chat(
    websocket: WebSocket,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    🔌 WebSocket endpoint cho real-time chat
    """
    await websocket_chat_endpoint(websocket, user_id, db)


@router.websocket("/ws/typing/{user_id}/{conversation_id}")
async def websocket_typing(
    websocket: WebSocket,
    user_id: int,
    conversation_id: int
):
    """
    ⌨️ WebSocket endpoint cho typing indicator
    """
    await websocket_typing_indicator(websocket, user_id, conversation_id)


@router.get("/conversations/{conversation_id}/messages", response_model=List[ChatMessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    user_id: int,
    limit: int = 50,  # Default 50 messages
    before: Optional[str] = None,  # Timestamp for pagination
    db: Session = Depends(get_db)
):
    """
    📜 Lấy lịch sử tin nhắn của conversation với pagination
    
    Args:
        conversation_id: ID của conversation
        user_id: ID của user (để verify ownership)
        limit: Số lượng messages cần lấy (default 50)
        before: Timestamp ISO string - lấy messages trước timestamp này (cho pagination)
    
    Returns:
        List of messages (sorted chronologically, oldest first)
    """
    try:
        # Verify ownership
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Build query
        query = db.query(Message).filter(
            Message.conversation_id == conversation_id
        )
        
        # Apply pagination filter
        if before:
            try:
                from datetime import datetime as dt
                before_dt = dt.fromisoformat(before.replace('Z', '+00:00'))
                query = query.filter(Message.created_at < before_dt)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid 'before' timestamp format. Use ISO 8601 format."
                )
        
        # Get messages (descending order, then reverse for chronological)
        messages = query.order_by(Message.created_at.desc()).limit(limit).all()
        messages = list(reversed(messages))  # Reverse to chronological order
        
        result = []
        for msg in messages:
            # Parse extra_data safely
            sources = []
            if msg.extra_data and isinstance(msg.extra_data, dict):
                sources = msg.extra_data.get("sources", [])
            
            result.append({
                "conversation_id": conversation_id,
                "message": msg.content,
                "role": msg.role,
                "sources": sources,
                "timestamp": msg.created_at,
                "cached": False
            })
            
        logger.info(f"📜 Returned {len(result)} messages for conversation {conversation_id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/conversations/{user_id}", response_model=List[ConversationResponse])
async def get_user_conversations(
    user_id: int,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """📜 Lấy danh sách conversations của user"""
    try:
        conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.is_active == True
        ).order_by(Conversation.updated_at.desc()).limit(limit).all()
        
        result = []
        for conv in conversations:
            result.append({
                "id": conv.id,
                "user_id": conv.user_id,
                "title": conv.title,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at,
                "message_count": len(conv.messages)
            })
        
        return result
    except Exception as e:
        logger.error(f"❌ Error fetching conversations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """🗑️ Xóa conversation"""
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        conversation.is_active = False
        db.commit()
        
        return {"message": "Conversation deleted successfully"}
    except Exception as e:
        logger.error(f"❌ Error deleting conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/knowledge-base/sync")
async def sync_knowledge_base(db: Session = Depends(get_db)):
    """
    🔄 Đồng bộ knowledge base từ Spring Boot backend
    """
    try:
        courses = await spring_boot_client.get_courses(size=100)
        
        if not courses:
            return {"message": "No courses found", "synced": 0}
        
        synced_count = 0
        
        for course in courses:
            course_id = course.get("id")
            title = course.get("title", "")
            description = course.get("description", "")
            
            content = f"Khóa học: {title}\nMô tả: {description}"
            
            existing = db.query(KnowledgeBase).filter(
                KnowledgeBase.content_type == "course",
                KnowledgeBase.content_id == course_id
            ).first()
            
            if existing:
                existing.title = title
                existing.content = content
                existing.extra_data = course
                db.commit()
                
                vector_store.update_document(
                    document_id=f"course_{course_id}",
                    document=content,
                    metadata={"type": "course", "course_id": course_id, "title": title}
                )
            else:
                kb = KnowledgeBase(
                    content_type="course",
                    content_id=course_id,
                    title=title,
                    content=content,
                    embedding_id=f"course_{course_id}",
                    extra_data=course
                )
                db.add(kb)
                db.commit()
                
                vector_store.add_documents(
                    documents=[content],
                    metadatas=[{"type": "course", "course_id": course_id, "title": title}],
                    ids=[f"course_{course_id}"]
                )
            
            synced_count += 1
        
        return {
            "message": "Knowledge base synced successfully",
            "synced": synced_count
        }
    except Exception as e:
        logger.error(f"❌ Error syncing knowledge base: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/knowledge-base/add")
async def add_knowledge_item(
    item: KnowledgeBaseItem,
    db: Session = Depends(get_db)
):
    """➕ Thêm item vào knowledge base"""
    try:
        kb = KnowledgeBase(
            content_type=item.content_type,
            content_id=item.content_id,
            title=item.title,
            content=item.content,
            embedding_id=f"{item.content_type}_{item.content_id or 'custom'}",
            extra_data=item.metadata
        )
        db.add(kb)
        db.commit()
        db.refresh(kb)
        
        vector_store.add_documents(
            documents=[item.content],
            metadatas=[{
                "type": item.content_type,
                "content_id": item.content_id,
                "title": item.title
            }],
            ids=[kb.embedding_id]
        )
        
        return {
            "message": "Knowledge item added successfully",
            "id": kb.id
        }
    except Exception as e:
        logger.error(f"❌ Error adding knowledge item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """
    ⭐ Submit user feedback
    """
    try:
        analytics.log_feedback(
            user_id=feedback.user_id,
            rating=feedback.rating,
            feedback=feedback.feedback
        )
        
        return {"message": "Feedback submitted successfully"}
    except Exception as e:
        logger.error(f"❌ Error submitting feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/analytics")
async def get_analytics():
    """
    📊 Lấy analytics và thống kê chatbot
    """
    try:
        stats = analytics.get_stats()
        vector_stats = vector_store.get_collection_stats()
        
        return {
            "chatbot_analytics": stats,
            "vector_store": vector_stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Error fetching analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/cache/clear")
async def clear_cache():
    """🗑️ Clear response cache"""
    try:
        response_cache.clear()
        return {"message": "Cache cleared successfully"}
    except Exception as e:
        logger.error(f"❌ Error clearing cache: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """📈 Lấy thống kê tổng quan"""
    try:
        total_conversations = db.query(Conversation).count()
        active_conversations = db.query(Conversation).filter(
            Conversation.is_active == True
        ).count()
        total_knowledge = db.query(KnowledgeBase).count()
        vector_stats = vector_store.get_collection_stats()
        analytics_stats = analytics.get_stats()
        
        return {
            "total_conversations": total_conversations,
            "active_conversations": active_conversations,
            "total_knowledge_items": total_knowledge,
            "vector_store": vector_stats,
            "analytics": analytics_stats
        }
    except Exception as e:
        logger.error(f"❌ Error fetching stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    conversation_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    📷 Upload hình ảnh từ chat
    """
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
            )
        
        # Validate file size (5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        file_size = 0
        
        # Create uploads directory if not exists
        upload_dir = Path("uploads/chat/images")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = Path(file.filename).suffix
        filename = f"{user_id}_{timestamp}{file_extension}"
        file_path = upload_dir / filename
        
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "message": "Image uploaded successfully",
            "filename": filename,
            "url": f"/uploads/chat/images/{filename}"
        }
    except Exception as e:
        logger.error(f"❌ Error uploading image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
