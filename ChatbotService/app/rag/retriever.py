"""
Advanced RAG với Reranking và Hybrid Search
- Vector search + Keyword search
- Reranking để cải thiện relevance
- Multi-query retrieval
- Context compression
"""

import logging
from typing import List, Dict, Any, Optional
from sentence_transformers import CrossEncoder
import numpy as np

from app.rag.vector_store import vector_store

logger = logging.getLogger(__name__)


class AdvancedRAG:
    """
    Advanced RAG system với multiple retrieval strategies
    """
    
    def __init__(self):
        # Cross-encoder for reranking (chính xác hơn bi-encoder)
        try:
            self.reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
            self.has_reranker = True
            logger.info("✅ Loaded reranker model")
        except Exception as e:
            logger.warning(f"⚠️ Could not load reranker: {e}")
            self.has_reranker = False
    
    def retrieve_with_reranking(
        self,
        query: str,
        top_k: int = 10,
        rerank_top_k: int = 5,
        filter_metadata: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve documents với reranking
        
        Process:
        1. Vector search lấy top_k documents
        2. Rerank bằng cross-encoder
        3. Return top rerank_top_k
        """
        try:
            # Step 1: Vector search
            results = vector_store.search(
                query=query,
                n_results=top_k,
                filter_metadata=filter_metadata
            )
            
            if not results or not results.get("documents"):
                return []
            
            documents = results["documents"]
            metadatas = results.get("metadatas", [{}] * len(documents))
            distances = results.get("distances", [0] * len(documents))
            
            # Step 2: Rerank if available
            if self.has_reranker and len(documents) > 1:
                # Prepare pairs for reranking
                pairs = [[query, doc] for doc in documents]
                
                # Get reranking scores
                rerank_scores = self.reranker.predict(pairs)
                
                # Combine with original data
                combined = [
                    {
                        "content": doc,
                        "metadata": meta,
                        "vector_score": 1 - dist,  # Convert distance to similarity
                        "rerank_score": float(score),
                        "final_score": float(score)  # Use rerank score as final
                    }
                    for doc, meta, dist, score in zip(documents, metadatas, distances, rerank_scores)
                ]
                
                # Sort by rerank score
                combined.sort(key=lambda x: x["final_score"], reverse=True)
                
                # Return top rerank_top_k
                return combined[:rerank_top_k]
            
            else:
                # No reranking, just return original results
                return [
                    {
                        "content": doc,
                        "metadata": meta,
                        "vector_score": 1 - dist,
                        "final_score": 1 - dist
                    }
                    for doc, meta, dist in zip(documents, metadatas, distances)
                ][:rerank_top_k]
                
        except Exception as e:
            logger.error(f"Error in retrieve_with_reranking: {e}")
            return []
    
    def multi_query_retrieval(
        self,
        query: str,
        query_variations: List[str],
        top_k_per_query: int = 5,
        final_top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Multi-query retrieval: Search với nhiều variations của query
        Useful để tăng recall
        """
        all_results = []
        seen_contents = set()
        
        # Search với original query
        queries = [query] + query_variations
        
        for q in queries:
            results = self.retrieve_with_reranking(
                query=q,
                top_k=top_k_per_query,
                rerank_top_k=top_k_per_query
            )
            
            for result in results:
                content = result["content"]
                # Avoid duplicates
                if content not in seen_contents:
                    all_results.append(result)
                    seen_contents.add(content)
        
        # Sort by final_score
        all_results.sort(key=lambda x: x["final_score"], reverse=True)
        
        return all_results[:final_top_k]
    
    def hybrid_search(
        self,
        query: str,
        top_k: int = 5,
        vector_weight: float = 0.7,
        keyword_weight: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Hybrid search: Kết hợp vector search và keyword search
        
        Args:
            vector_weight: Weight cho vector search score
            keyword_weight: Weight cho keyword match score
        """
        # Vector search
        vector_results = self.retrieve_with_reranking(query, top_k=top_k*2, rerank_top_k=top_k*2)
        
        # Calculate keyword match scores
        query_lower = query.lower()
        query_terms = set(query_lower.split())
        
        for result in vector_results:
            content_lower = result["content"].lower()
            content_terms = set(content_lower.split())
            
            # Jaccard similarity for keyword match
            intersection = query_terms & content_terms
            union = query_terms | content_terms
            keyword_score = len(intersection) / len(union) if union else 0
            
            # Combine scores
            result["keyword_score"] = keyword_score
            result["hybrid_score"] = (
                vector_weight * result.get("final_score", 0) +
                keyword_weight * keyword_score
            )
        
        # Sort by hybrid score
        vector_results.sort(key=lambda x: x["hybrid_score"], reverse=True)
        
        return vector_results[:top_k]
    
    def compress_context(
        self,
        documents: List[Dict[str, Any]],
        max_tokens: int = 1000
    ) -> List[Dict[str, Any]]:
        """
        Compress context để fit vào token limit
        Giữ lại most relevant parts
        """
        compressed = []
        total_tokens = 0
        
        # Estimate: 1 token ≈ 4 characters
        for doc in documents:
            content = doc["content"]
            estimated_tokens = len(content) // 4
            
            if total_tokens + estimated_tokens <= max_tokens:
                compressed.append(doc)
                total_tokens += estimated_tokens
            else:
                # Truncate to fit
                remaining_tokens = max_tokens - total_tokens
                remaining_chars = remaining_tokens * 4
                
                if remaining_chars > 100:  # Only add if meaningful
                    doc["content"] = content[:remaining_chars] + "..."
                    compressed.append(doc)
                
                break
        
        return compressed


# Export
__all__ = ["AdvancedRAG"]

