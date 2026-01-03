import sys
# Fix encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.models.sql_models import Base
from typing import Generator

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created successfully!")


def drop_db():
    """Drop only chatbot tables (USE WITH CAUTION!)"""
    from sqlalchemy import text
    
    print("⚠️  WARNING: Dropping chatbot tables only...")
    
    # List of chatbot tables (in order due to foreign keys)
    chatbot_tables = [
        "chat_messages",           # Drop first (has FK)
        "chat_conversations",
        "chatbot_context",
        "chatbot_knowledge_base"
    ]
    
    with engine.connect() as conn:
        for table in chatbot_tables:
            try:
                conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                conn.commit()
                print(f"   ✓ Dropped {table}")
            except Exception as e:
                print(f"   ⚠️  Could not drop {table}: {e}")
    
    print("✅ Chatbot tables dropped successfully!")
    print("✅ Spring Boot tables NOT affected")


def reset_db():
    """Drop and recreate chatbot tables only (USE WITH CAUTION!)"""
    print("🔄 Resetting chatbot database...")
    drop_db()
    init_db()
    print("🎉 Chatbot database reset complete!")


def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
