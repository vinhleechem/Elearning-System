import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class VectorStore:
    """RAG Vector Database using ChromaDB"""
    
    def __init__(self):
        # Use PersistentClient for persistence
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIRECTORY,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        
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
        """
        Tìm kiếm documents liên quan sử dụng semantic search
        
        Embedding model tự động hiểu semantic similarity, không cần hardcode keywords.
        Hỗ trợ tất cả các loại khóa học: IT, kinh tế, chính trị, văn học, v.v.
        """
        try:
            # Generate query embedding - embedding model tự động hiểu semantic similarity
            query_embedding = self.embedding_model.encode([query]).tolist()
            
            # Search với n_results lớn hơn một chút để có kết quả tốt hơn
            results = self.collection.query(
                query_embeddings=query_embedding,
                n_results=min(n_results * 2, 20),  # Lấy nhiều hơn nhưng giới hạn tối đa
                where=filter_metadata
            )
            
            docs = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]
            
            # Nếu không tìm thấy, thử với query variations đơn giản (chỉ format, không hardcode chủ đề)
            if len(docs) == 0:
                # Thử thêm "khóa học" hoặc "course" nếu chưa có
                query_lower = query.lower()
                variations = [query]
                
                # Chỉ thêm format variations, không hardcode chủ đề
                if "khóa học" not in query_lower and "course" not in query_lower:
                    variations.append(f"khóa học {query}")
                    variations.append(f"{query} course")
                
                # Thử search với variations
                for variation in variations[1:]:  # Bỏ qua query gốc đã search
                    try:
                        var_embedding = self.embedding_model.encode([variation]).tolist()
                        var_results = self.collection.query(
                            query_embeddings=var_embedding,
                            n_results=n_results,
                            where=filter_metadata
                        )
                        var_docs = var_results.get("documents", [[]])[0]
                        if var_docs:
                            docs = var_docs
                            metadatas = var_results.get("metadatas", [[]])[0]
                            distances = var_results.get("distances", [[]])[0]
                            break
                    except:
                        continue
            
            # Return results
            return {
                "documents": docs[:n_results],
                "metadatas": metadatas[:n_results] if len(metadatas) >= n_results else metadatas,
                "distances": distances[:n_results] if len(distances) >= n_results else distances
            }
        except Exception as e:
            logger.error(f"❌ Error searching: {e}")
            import traceback
            traceback.print_exc()
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
