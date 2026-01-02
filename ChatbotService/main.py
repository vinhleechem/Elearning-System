from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse as FastAPIStreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from datetime import datetime
import shutil
import os
from pathlib import Path

from config import settings
from database import get_db, init_db
from schemas import (
    ChatMessageRequest,
    ChatMessageResponse,
    ConversationResponse,
    KnowledgeBaseItem,
    ChatbotConfig,
    FeedbackRequest
)
from chatbot_service import ChatbotService
from models import Conversation, KnowledgeBase
from vector_store import vector_store
from spring_boot_client import spring_boot_client
from advanced_features import (
    rate_limiter,
    response_cache,
    analytics,
    StreamingResponse,
    SmartContextManager
)
from websocket_handler import websocket_chat_endpoint, websocket_typing_indicator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="E-Learning AI Chatbot API",
    description="Production-ready AI Chatbot với RAG, Streaming, WebSocket",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("🚀 Starting E-Learning AI Chatbot Service v2.0...")
    init_db()
    logger.info("✅ Chatbot service started successfully!")
    logger.info(f"📊 Vector store: {vector_store.get_collection_stats()}")


@app.get("/")
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


@app.get("/health")
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


@app.post("/chat", response_model=ChatMessageResponse)
async def chat(
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """
    💬 Gửi tin nhắn và nhận response từ chatbot
    
    Features:
    - ✅ RAG-powered responses
    - ✅ Rate limiting
    - ✅ Response caching
    - ✅ Smart context management
    - ✅ Analytics tracking
    
    Request:
    ```json
    {
        "user_id": 1,
        "message": "Làm sao để đăng ký khóa học?",
        "conversation_id": 123,
        "context": {"course_id": 1, "page": "course_detail"}
    }
    ```
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


@app.post("/chat/stream")
async def chat_stream(
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """
    🌊 Streaming chat response (like ChatGPT)
    
    Returns Server-Sent Events (SSE) stream
    """
    try:
        # Rate limiting
        if not rate_limiter.is_allowed(request.user_id):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
        
        # Process message
        chatbot = ChatbotService(db)
        response = await chatbot.process_message(
            user_id=request.user_id,
            message=request.message,
            conversation_id=request.conversation_id,
            context=request.context
        )
        
        # Stream response
        async def generate():
            async for chunk in StreamingResponse.stream_response(response["message"]):
                yield f"data: {chunk}\n\n"
            yield f"data: [DONE]\n\n"
        
        return FastAPIStreamingResponse(
            generate(),
            media_type="text/event-stream"
        )
        
    except Exception as e:
        logger.error(f"❌ Streaming error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.websocket("/ws/chat/{user_id}")
async def websocket_chat(
    websocket: WebSocket,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    🔌 WebSocket endpoint cho real-time chat
    
    Connect: ws://localhost:8001/ws/chat/{user_id}
    
    Send:
    ```json
    {
        "type": "message",
        "content": "Your message",
        "conversation_id": 123,
        "context": {}
    }
    ```
    
    Receive:
    ```json
    {"type": "start", "conversation_id": 123}
    {"type": "chunk", "content": "Response chunk..."}
    {"type": "end", "sources": [...], "timestamp": "..."}
    ```
    """
    await websocket_chat_endpoint(websocket, user_id, db)


@app.websocket("/ws/typing/{user_id}/{conversation_id}")
async def websocket_typing(
    websocket: WebSocket,
    user_id: int,
    conversation_id: int
):
    """
    ⌨️ WebSocket endpoint cho typing indicator
    
    Send: {"typing": true/false}
    """
    await websocket_typing_indicator(websocket, user_id, conversation_id)


@app.get("/conversations/{user_id}", response_model=List[ConversationResponse])
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


@app.delete("/conversations/{conversation_id}")
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


@app.post("/knowledge-base/sync")
async def sync_knowledge_base(db: Session = Depends(get_db)):
    """
    🔄 Đồng bộ knowledge base từ Spring Boot backend
    
    Tự động lấy tất cả khóa học và thêm vào vector database
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


@app.post("/knowledge-base/add")
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


@app.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """
    ⭐ Submit user feedback
    
    Request:
    ```json
    {
        "user_id": 1,
        "conversation_id": 123,
        "rating": 5,
        "feedback": "Very helpful!"
    }
    ```
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


@app.get("/analytics")
async def get_analytics():
    """
    📊 Lấy analytics và thống kê chatbot
    
    Returns:
    - Total messages
    - Average response time
    - Popular topics
    - User satisfaction
    - Error count
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


@app.post("/cache/clear")
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


@app.get("/stats")
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


@app.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    conversation_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    📷 Upload hình ảnh từ chat
    
    Hỗ trợ: JPG, PNG, GIF, WebP
    Max size: 5MB
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
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # Read 1MB at a time
                file_size += len(chunk)
                if file_size > max_size:
                    # Remove partial file
                    os.remove(file_path)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="File too large. Max size: 5MB"
                    )
                buffer.write(chunk)
        
        # Save to database (optional)
        # You can save file info to a FileUpload model
        
        file_url = f"/uploads/chat/images/{filename}"
        
        logger.info(f"✅ Image uploaded: {file_url}")
        
        return {
            "success": True,
            "file_url": file_url,
            "filename": filename,
            "size": file_size,
            "content_type": file.content_type
        }
        
    except Exception as e:
        logger.error(f"❌ Error uploading image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.post("/upload/file")
async def upload_file(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    conversation_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    📎 Upload file từ chat
    
    Hỗ trợ: PDF, DOC, DOCX, TXT, CSV, XLS, XLSX
    Max size: 10MB
    """
    try:
        # Validate file type
        allowed_types = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: PDF, DOC, DOCX, TXT, CSV, XLS, XLSX"
            )
        
        # Validate file size (10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        file_size = 0
        
        # Create uploads directory
        upload_dir = Path("uploads/chat/files")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = Path(file.filename).suffix
        filename = f"{user_id}_{timestamp}{file_extension}"
        file_path = upload_dir / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # Read 1MB at a time
                file_size += len(chunk)
                if file_size > max_size:
                    os.remove(file_path)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="File too large. Max size: 10MB"
                    )
                buffer.write(chunk)
        
        file_url = f"/uploads/chat/files/{filename}"
        
        logger.info(f"✅ File uploaded: {file_url}")
        
        return {
            "success": True,
            "file_url": file_url,
            "filename": file.filename,
            "size": file_size,
            "content_type": file.content_type
        }
        
    except Exception as e:
        logger.error(f"❌ Error uploading file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/sentiment/{conversation_id}")
async def get_conversation_sentiment(
    conversation_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    😊 Lấy phân tích sentiment của conversation
    
    Returns sentiment analysis for the entire conversation
    """
    try:
        from enhanced_features import SentimentAnalyzer
        
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        # Analyze all user messages
        sentiments = []
        for message in conversation.messages:
            if message.role == "user":
                sentiment = SentimentAnalyzer.analyze(message.content)
                sentiments.append({
                    "message": message.content[:50],
                    "sentiment": sentiment["sentiment"],
                    "confidence": sentiment["confidence"],
                    "timestamp": message.created_at.isoformat()
                })
        
        # Calculate overall sentiment
        if sentiments:
            sentiment_counts = {}
            for s in sentiments:
                sentiment_counts[s["sentiment"]] = sentiment_counts.get(s["sentiment"], 0) + 1
            
            overall_sentiment = max(sentiment_counts, key=sentiment_counts.get)
            avg_confidence = sum(s["confidence"] for s in sentiments) / len(sentiments)
        else:
            overall_sentiment = "neutral"
            avg_confidence = 0.5
        
        return {
            "conversation_id": conversation_id,
            "overall_sentiment": overall_sentiment,
            "avg_confidence": avg_confidence,
            "message_sentiments": sentiments,
            "sentiment_distribution": sentiment_counts if sentiments else {}
        }
        
    except Exception as e:
        logger.error(f"❌ Error analyzing sentiment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
