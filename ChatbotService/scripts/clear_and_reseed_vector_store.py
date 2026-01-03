"""
Clear and reseed vector store with fresh data from database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rag.vector_store import vector_store
from app.core.database import SessionLocal
from app.models.sql_models import KnowledgeBase
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clear_and_reseed():
    """Clear vector store and reseed from database"""
    
    try:
        # Step 1: Clear existing vector store
        logger.info("🗑️  Clearing existing vector store...")
        collection_name = vector_store.collection.name
        vector_store.client.delete_collection(collection_name)
        logger.info(f"✅ Deleted collection: {collection_name}")
        
        # Step 2: Recreate collection
        logger.info("📦 Recreating collection...")
        vector_store.collection = vector_store.client.create_collection(
            name=collection_name,
            metadata={"description": "E-Learning chatbot knowledge base"}
        )
        logger.info(f"✅ Created new collection: {collection_name}")
        
        # Step 3: Load data from database
        logger.info("📚 Loading data from database...")
        db = SessionLocal()
        
        try:
            # Get all active knowledge base entries
            kb_entries = db.query(KnowledgeBase).filter(
                KnowledgeBase.is_active == True
            ).all()
            
            if not kb_entries:
                logger.warning("⚠️  No knowledge base entries found in database!")
                logger.info("💡 Run seed_sample_courses.py first to add sample data")
                return
            
            logger.info(f"📊 Found {len(kb_entries)} entries in database")
            
            # Step 4: Add to vector store
            documents = []
            metadatas = []
            ids = []
            
            for entry in kb_entries:
                documents.append(entry.content)
                metadatas.append({
                    "title": entry.title,
                    "type": entry.content_type,
                    "category": entry.extra_data.get("category", "") if entry.extra_data else "",
                    "kb_id": str(entry.id)
                })
                ids.append(f"kb_{entry.id}")
            
            # Add in batches
            batch_size = 10
            for i in range(0, len(documents), batch_size):
                batch_docs = documents[i:i+batch_size]
                batch_meta = metadatas[i:i+batch_size]
                batch_ids = ids[i:i+batch_size]
                
                vector_store.add_documents(
                    documents=batch_docs,
                    metadatas=batch_meta,
                    ids=batch_ids
                )
                logger.info(f"✅ Added batch {i//batch_size + 1}/{(len(documents)-1)//batch_size + 1}")
            
            logger.info(f"\n🎉 Successfully reseeded vector store with {len(documents)} documents!")
            
            # Step 5: Verify
            stats = vector_store.get_collection_stats()
            logger.info(f"📊 Collection stats: {stats}")
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Error during clear and reseed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("🔄 CLEAR AND RESEED VECTOR STORE")
    logger.info("=" * 60)
    clear_and_reseed()
    logger.info("=" * 60)
