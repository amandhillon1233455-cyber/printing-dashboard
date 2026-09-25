from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class UserSchema(BaseModel):
    user_id: str
    name: str
    email: str
    role: str = "student"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DocumentSchema(BaseModel):
    document_id: str
    user_id: str
    filename: str
    file_type: str
    file_size: int
    page_count: int = 1
    file_url: str
    extracted_text: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "Ready"

class PrintOrderCreate(BaseModel):
    document_id: str
    copies: int = Field(default=1, ge=1)
    color_mode: str = "Black & White"  # Color | Black & White
    paper_size: str = "A4"            # A4 | A3 | Letter
    duplex: str = "Single-sided"      # Single-sided | Double-sided
    priority: str = "Normal"          # Normal | Priority

class PrintOrderSchema(BaseModel):
    order_id: str
    user_id: str
    user_name: str
    document_id: str
    document_name: str
    copies: int
    color_mode: str
    paper_size: str
    duplex: str
    priority: str
    status: str = "Pending"  # Pending | Processing | Ready | Completed | Cancelled
    total_pages: int
    total_prints: int
    estimated_cost: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class StatusUpdateSchema(BaseModel):
    status: str
    changed_by: Optional[str] = "Staff"

class StatusLogSchema(BaseModel):
    log_id: str
    order_id: str
    old_status: str
    new_status: str
    changed_by: str
    changed_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeDocCreate(BaseModel):
    title: str
    source: Optional[str] = "Policy Manual"
    content: str
    category: Optional[str] = "General"

class KnowledgeDocSchema(BaseModel):
    doc_id: str
    title: str
    source: str
    content: str
    category: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class AIChatRequest(BaseModel):
    question: str
    document_id: Optional[str] = None

class AIChatResponse(BaseModel):
    answer: str
    retrieved_context: bool
    sources: List[str] = []
    timestamp: str

class AILogSchema(BaseModel):
    session_id: str
    user_id: str
    question: str
    retrieved_context: bool
    response: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class N8nWebhookPayload(BaseModel):
    event: str
    order_id: str
    old_status: str
    new_status: str
    timestamp: Optional[str] = None
