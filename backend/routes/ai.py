from fastapi import APIRouter
from backend.models.schemas import AIChatRequest, AIChatResponse, KnowledgeDocCreate, KnowledgeDocSchema
from backend.services.rag_service import rag_pipeline
from backend.services.ai_service import generate_ai_response
from datetime import datetime
from typing import List

ai_router = APIRouter(prefix="/api/ai", tags=["ai"])
knowledge_router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])

KNOWLEDGE_STORE: List[KnowledgeDocSchema] = [
    KnowledgeDocSchema(
        doc_id="KB-101",
        title="PrintAI Pricing & Billing Policy",
        source="Financial Operations Manual 2026",
        content="Standard A4 Black & White: $0.10/page. Standard A4 Color: $0.40/page. Duplex discount: 10%. Priority queue surcharge: $1.50 flat fee.",
        category="Pricing",
        uploaded_at=datetime.utcnow()
    ),
    KnowledgeDocSchema(
        doc_id="KB-102",
        title="Paper Sizes and Specifications",
        source="Hardware Specification Sheet",
        content="Supported paper sizes: A4 in Trays 1-2, A3 in Tray 4, US Letter in Tray 3. Supported formats: PDF, DOCX, JPG, PNG under 10 MB.",
        category="Specifications",
        uploaded_at=datetime.utcnow()
    )
]

# Initialize RAG on startup
for kd in KNOWLEDGE_STORE:
    rag_pipeline.ingest_document(kd.doc_id, kd.title, kd.content, kd.category)

@ai_router.post("/chat", response_model=AIChatResponse)
async def ai_chat(payload: AIChatRequest):
    retrieved_chunks = rag_pipeline.retrieve_context(payload.question, top_k=2)

    doc_context = ""
    if payload.document_id:
        from backend.routes.documents import DOCUMENTS_STORE
        doc = next((d for d in DOCUMENTS_STORE if d.document_id == payload.document_id), None)
        if doc:
            doc_context = f"{doc.filename} ({doc.page_count} pages): {doc.extracted_text}"

    result = await generate_ai_response(payload.question, retrieved_chunks, doc_context)

    return AIChatResponse(
        answer=result["answer"],
        retrieved_context=result["retrieved_context"],
        sources=result["sources"],
        timestamp=datetime.utcnow().isoformat()
    )

@knowledge_router.get("", response_model=List[KnowledgeDocSchema])
async def list_knowledge():
    return KNOWLEDGE_STORE

@knowledge_router.post("", response_model=KnowledgeDocSchema)
async def add_knowledge(doc: KnowledgeDocCreate):
    new_id = f"KB-{100 + len(KNOWLEDGE_STORE) + 1}"
    record = KnowledgeDocSchema(
        doc_id=new_id,
        title=doc.title,
        source=doc.source or "Custom Admin Upload",
        content=doc.content,
        category=doc.category or "General",
        uploaded_at=datetime.utcnow()
    )
    KNOWLEDGE_STORE.insert(0, record)
    rag_pipeline.ingest_document(record.doc_id, record.title, record.content, record.category)
    return record
