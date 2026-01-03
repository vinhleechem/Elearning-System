from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
import os

from app.core.config import settings
from app.core.database import init_db
from app.rag.vector_store import vector_store
from app.api.routes import router
from app.services.kafka_consumer import course_event_consumer

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
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include router
app.include_router(router)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("🚀 Starting E-Learning AI Chatbot Service v2.0...")
    init_db()
    
    # Start Kafka consumer for auto-sync
    try:
        course_event_consumer.start()
        logger.info("✅ Kafka consumer started - auto-sync enabled!")
    except Exception as e:
        logger.warning(f"⚠️ Kafka consumer not available: {e}")
    
    logger.info("✅ Chatbot service started successfully!")
    logger.info(f"📊 Vector store: {vector_store.get_collection_stats()}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down chatbot service...")
    try:
        course_event_consumer.stop()
        logger.info("✅ Kafka consumer stopped")
    except:
        pass
    logger.info("✅ Shutdown complete!")

if __name__ == "__main__":
    import uvicorn
    import multiprocessing
    
    # Fix for Windows multiprocessing
    multiprocessing.freeze_support()
    
    # Run with reload_dirs instead of reload for Windows compatibility
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        reload_dirs=["app"] if settings.DEBUG else None,
        log_level="info"
    )
