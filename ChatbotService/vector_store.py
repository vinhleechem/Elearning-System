import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
from config import settings
import logging

logger = logging.getLogger(__name__)


class VectorStore:
    """RAG Vector Database using ChromaDB"""
    
    def __init__(self):
        self.client = chromadb.Client(ChromaSettings(
            persist_directory=settings.CHROMA_PERSIST_DIRECTORY,
            anonymized_telemetry=False
        ))
        
        # Load embedding model
        self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        
        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name="elearning_knowledge",
            metadata={"description": "E-Learning chatbot knowledge base"}
        )
        
        logger.info(f"✅ Vector store initialized with {self.collection.count()} documents")
    
    def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: List[str]
    ):
        """Thêm documents vào vector store"""
        try:
            # Generate embeddings
            embeddings = self.embedding_model.encode(documents).tolist()
            
            # Add to ChromaDB
            self.collection.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"✅ Added {len(documents)} documents to vector store")
        except Exception as e:
            logger.error(f"❌ Error adding documents: {e}")
            raise
    
    def search(
        self,
        query: str,
        n_results: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Tìm kiếm documents liên quan"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query]).tolist()
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=query_embedding,
                n_results=n_results,
                where=filter_metadata
            )
            
            return {
                "documents": results.get("documents", [[]])[0],
                "metadatas": results.get("metadatas", [[]])[0],
                "distances": results.get("distances", [[]])[0]
            }
        except Exception as e:
            logger.error(f"❌ Error searching: {e}")
            return {"documents": [], "metadatas": [], "distances": []}
    
    def update_document(self, document_id: str, document: str, metadata: Dict[str, Any]):
        """Update document trong vector store"""
        try:
            embedding = self.embedding_model.encode([document]).tolist()
            self.collection.update(
                ids=[document_id],
                documents=[document],
                embeddings=embedding,
                metadatas=[metadata]
            )
            logger.info(f"✅ Updated document {document_id}")
        except Exception as e:
            logger.error(f"❌ Error updating document: {e}")
            raise
    
    def delete_document(self, document_id: str):
        """Delete document khỏi vector store"""
        try:
            self.collection.delete(ids=[document_id])
            logger.info(f"✅ Deleted document {document_id}")
        except Exception as e:
            logger.error(f"❌ Error deleting document: {e}")
            raise
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Lấy thống kê collection"""
        return {
            "total_documents": self.collection.count(),
            "collection_name": self.collection.name
        }


# Global instance
vector_store = VectorStore()
