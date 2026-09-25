import os
from typing import List, Dict, Any

# Ingest, chunk, and retrieve context for RAG
class RAGPipeline:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []

    def ingest_document(self, doc_id: str, title: str, content: str, category: str = "General"):
        # Chunk content into paragraphs / sections
        chunks = [c.strip() for c in content.split("\n\n") if c.strip()]
        for idx, chunk in enumerate(chunks):
            self.documents.append({
                "doc_id": doc_id,
                "chunk_id": f"{doc_id}_c{idx}",
                "title": title,
                "category": category,
                "content": chunk
            })

    def retrieve_context(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_words = set(query.lower().split())
        scored = []
        for doc in self.documents:
            doc_words = set(doc["content"].lower().split())
            overlap = len(query_words.intersection(doc_words))
            if overlap > 0:
                scored.append((overlap, doc))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]

rag_pipeline = RAGPipeline()
