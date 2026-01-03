"""
WebSocket endpoint cho real-time chat
Giống như ChatGPT, Claude - chat real-time với streaming
"""

from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import Dict, List
import json
import logging
from datetime import datetime

from app.core.database import get_db
from app.services.chatbot_service import ChatbotService
from app.core.advanced_features import (
    rate_limiter,
    response_cache,
    analytics,
    StreamingResponse
)

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Quản lý WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept WebSocket connection"""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"✅ User {user_id} connected via WebSocket")
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        """Remove WebSocket connection"""
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"❌ User {user_id} disconnected")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send message to specific connection"""
        await websocket.send_text(message)
    
    async def send_json(self, data: dict, websocket: WebSocket):
        """Send JSON data"""
        await websocket.send_json(data)
    
    async def broadcast_to_user(self, message: str, user_id: int):
        """Broadcast to all connections of a user"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)


manager = ConnectionManager()


async def websocket_chat_endpoint(
    websocket: WebSocket,
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint cho real-time chat
    
    URL: ws://localhost:8001/ws/chat/{user_id}
    
    Message format:
    {
        "type": "message",
        "content": "User message",
        "conversation_id": 123,
        "context": {"course_id": 1}
    }
    
    Response format:
    {
        "type": "start",
        "conversation_id": 123
    }
    {
        "type": "chunk",
        "content": "Streaming response chunk..."
    }
    {
        "type": "end",
        "sources": [...],
        "timestamp": "2026-01-01T23:00:00"
    }
    """
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Validate message type
            if message_data.get("type") != "message":
                await manager.send_json({
                    "type": "error",
                    "message": "Invalid message type"
                }, websocket)
                continue
            
            user_message = message_data.get("content", "")
            conversation_id = message_data.get("conversation_id")
            context = message_data.get("context", {})
            
            # Rate limiting
            if not rate_limiter.is_allowed(user_id):
                await manager.send_json({
                    "type": "error",
                    "message": "Rate limit exceeded. Please wait a moment.",
                    "retry_after": 60
                }, websocket)
                continue
            
            # Check cache
            cached_response = response_cache.get(user_message, context)
            if cached_response:
                # Send cached response with streaming effect
                await manager.send_json({
                    "type": "start",
                    "conversation_id": conversation_id,
                    "cached": True
                }, websocket)
                
                async for chunk in StreamingResponse.stream_response(cached_response):
                    await manager.send_json({
                        "type": "chunk",
                        "content": chunk
                    }, websocket)
                
                await manager.send_json({
                    "type": "end",
                    "sources": [],
                    "timestamp": datetime.now().isoformat()
                }, websocket)
                continue
            
            # Process message with chatbot
            start_time = datetime.now()
            
            try:
                chatbot = ChatbotService(db)
                response = await chatbot.process_message(
                    user_id=user_id,
                    message=user_message,
                    conversation_id=conversation_id,
                    context=context
                )
                
                # Send start signal
                await manager.send_json({
                    "type": "start",
                    "conversation_id": response["conversation_id"]
                }, websocket)
                
                # Stream response
                full_message = response["message"]
                async for chunk in StreamingResponse.stream_response(full_message):
                    await manager.send_json({
                        "type": "chunk",
                        "content": chunk
                    }, websocket)
                
                # Send end signal with metadata
                await manager.send_json({
                    "type": "end",
                    "sources": response.get("sources", []),
                    "timestamp": response["timestamp"].isoformat()
                }, websocket)
                
                # Cache response
                response_cache.set(user_message, full_message, context)
                
                # Analytics
                response_time = (datetime.now() - start_time).total_seconds()
                analytics.log_message(
                    user_id=user_id,
                    message=user_message,
                    response_time=response_time,
                    sources_count=len(response.get("sources", []))
                )
                
            except Exception as e:
                logger.error(f"❌ Error processing message: {e}")
                analytics.log_error(str(e))
                
                await manager.send_json({
                    "type": "error",
                    "message": "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
                    "error_code": "PROCESSING_ERROR"
                }, websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        logger.info(f"🔌 User {user_id} disconnected")
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
        manager.disconnect(websocket, user_id)


async def websocket_typing_indicator(
    websocket: WebSocket,
    user_id: int,
    conversation_id: int
):
    """
    WebSocket endpoint cho typing indicator
    
    URL: ws://localhost:8001/ws/typing/{user_id}/{conversation_id}
    
    Message: {"typing": true/false}
    """
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            typing_data = json.loads(data)
            
            # Broadcast typing status to other participants
            # (Useful for group chat or instructor support)
            await manager.broadcast_to_user(
                json.dumps({
                    "type": "typing",
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "typing": typing_data.get("typing", False)
                }),
                user_id
            )
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
