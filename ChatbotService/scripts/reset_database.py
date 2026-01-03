"""
Script to drop and recreate all chatbot database tables
Run: python scripts/reset_database.py
"""

import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine
from app.models.sql_models import Base, Conversation, Message, KnowledgeBase, ChatbotContext
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def reset_database():
    """Drop only chatbot tables and recreate them"""
    try:
        logger.info("=" * 70)
        logger.info("🗑️  DROPPING CHATBOT TABLES ONLY...")
        logger.info("=" * 70)
        
        # List of chatbot tables to drop (in correct order due to foreign keys)
        chatbot_tables = [
            "chat_messages",           # Drop first (has FK to conversations)
            "chat_conversations",
            "chatbot_context",
            "chatbot_knowledge_base"
        ]
        
        with engine.connect() as conn:
            for table in chatbot_tables:
                try:
                    conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                    conn.commit()
                    logger.info(f"   ✓ Dropped {table}")
                except Exception as e:
                    logger.warning(f"   ⚠️  Could not drop {table}: {e}")
        
        logger.info("✅ Chatbot tables dropped successfully!")
        
        logger.info("")
        logger.info("=" * 70)
        logger.info("🔨 CREATING CHATBOT TABLES...")
        logger.info("=" * 70)
        
        # Create only chatbot tables
        # This will only create tables defined in sql_models.py
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Chatbot tables created successfully!")
        
        logger.info("")
        logger.info("=" * 70)
        logger.info("🎉 DATABASE RESET COMPLETE!")
        logger.info("=" * 70)
        
        # Show created tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        all_tables = inspector.get_table_names()
        
        # Filter only chatbot tables
        chatbot_table_names = [
            "chat_conversations",
            "chat_messages", 
            "chatbot_context",
            "chatbot_knowledge_base"
        ]
        
        created_tables = [t for t in all_tables if t in chatbot_table_names]
        
        logger.info(f"\n📊 Chatbot tables ({len(created_tables)}):")
        for table in created_tables:
            logger.info(f"   ✓ {table}")
        
        logger.info(f"\n📊 Other tables (Spring Boot - NOT touched): {len(all_tables) - len(created_tables)}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error resetting database: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("\n⚠️  WARNING: This will DELETE chatbot data!")
    print("Tables to be dropped:")
    print("  - chat_conversations")
    print("  - chat_messages")
    print("  - chatbot_context")
    print("  - chatbot_knowledge_base")
    print("")
    print("✅ Spring Boot tables will NOT be affected")
    print("")
    
    confirm = input("Are you sure you want to continue? (yes/no): ")
    
    if confirm.lower() == "yes":
        success = reset_database()
        sys.exit(0 if success else 1)
    else:
        print("❌ Operation cancelled")
        sys.exit(0)
    
    if confirm.lower() == "yes":
        success = reset_database()
        sys.exit(0 if success else 1)
    else:
        print("❌ Operation cancelled")
        sys.exit(0)
