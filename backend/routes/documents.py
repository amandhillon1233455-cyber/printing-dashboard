from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import uuid
from backend.models.schemas import DocumentSchema

router = APIRouter(prefix="/api/documents", tags=["documents"])

# In-memory document storage
DOCUMENTS_STORE: List[DocumentSchema] = [
    DocumentSchema(
        document_id="DOC-1001",
        user_id="USR-101",
        filename="invoice_q3_report.pdf",
        file_type="application/pdf",
        file_size=1468006,
        page_count=14,
        file_url="/demo-files/invoice_q3_report.pdf",
        extracted_text="PrintAI Quarterly Invoicing Ledger. Total prints: 4,820 sheets.",
        uploaded_at=datetime.utcnow(),
        status="Ready"
    ),
    DocumentSchema(
        document_id="DOC-1002",
        user_id="USR-102",
        filename="cs301_final_assignment.docx",
        file_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        file_size=860160,
        page_count=8,
        file_url="/demo-files/cs301_final_assignment.docx",
        extracted_text="CS-301 Distributed Systems Research Paper. Author: Sarah Jenkins.",
        uploaded_at=datetime.utcnow(),
        status="Ready"
    )
]

@router.get("", response_model=List[DocumentSchema])
async def get_documents(q: Optional[str] = None):
    if not q:
        return DOCUMENTS_STORE
    query = q.lower()
    return [d for d in DOCUMENTS_STORE if query in d.filename.lower() or query in d.document_id.lower()]

@router.get("/{document_id}", response_model=DocumentSchema)
async def get_document(document_id: str):
    for doc in DOCUMENTS_STORE:
        if doc.document_id == document_id:
            return doc
    raise HTTPException(status_code=404, detail="Document not found")

@router.post("/upload", response_model=DocumentSchema)
async def upload_document(
    filename: str = Form(...),
    file_type: str = Form("application/pdf"),
    file_size: int = Form(500000),
    page_count: int = Form(1),
    extracted_text: Optional[str] = Form(None)
):
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 10 MB limit.")

    new_id = f"DOC-{1000 + len(DOCUMENTS_STORE) + 1}"
    doc = DocumentSchema(
        document_id=new_id,
        user_id="USR-101",
        filename=filename,
        file_type=file_type,
        file_size=file_size,
        page_count=page_count,
        file_url=f"/uploads/{filename}",
        extracted_text=extracted_text or f"Extracted content for {filename}",
        uploaded_at=datetime.utcnow(),
        status="Ready"
    )
    DOCUMENTS_STORE.insert(0, doc)
    return doc

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    global DOCUMENTS_STORE
    initial_len = len(DOCUMENTS_STORE)
    DOCUMENTS_STORE = [d for d in DOCUMENTS_STORE if d.document_id != document_id]
    if len(DOCUMENTS_STORE) == initial_len:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully", "document_id": document_id}
