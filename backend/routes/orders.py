from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from backend.models.schemas import PrintOrderSchema, PrintOrderCreate, StatusUpdateSchema, StatusLogSchema
from backend.services.document_service import calculate_print_costs
from backend.services.n8n_service import dispatch_n8n_order_event

router = APIRouter(prefix="/api/orders", tags=["orders"])

ORDERS_STORE: List[PrintOrderSchema] = [
    PrintOrderSchema(
        order_id="ORD-1001",
        user_id="USR-101",
        user_name="Amandeep S. Dhillon",
        document_id="DOC-1001",
        document_name="invoice_q3_report.pdf",
        copies=2,
        color_mode="Black & White",
        paper_size="A4",
        duplex="Double-sided",
        priority="Normal",
        status="Pending",
        total_pages=14,
        total_prints=28,
        estimated_cost=2.52,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    ),
    PrintOrderSchema(
        order_id="ORD-1002",
        user_id="USR-102",
        user_name="Sarah Jenkins",
        document_id="DOC-1002",
        document_name="cs301_final_assignment.docx",
        copies=5,
        color_mode="Color",
        paper_size="A4",
        duplex="Single-sided",
        priority="Priority",
        status="Processing",
        total_pages=8,
        total_prints=40,
        estimated_cost=17.50,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
]

STATUS_LOGS: List[StatusLogSchema] = []

@router.get("", response_model=List[PrintOrderSchema])
async def get_orders(status: Optional[str] = None, q: Optional[str] = None):
    results = ORDERS_STORE
    if status and status != "All":
        results = [o for o in results if o.status.lower() == status.lower()]
    if q:
        query = q.lower()
        results = [o for o in results if query in o.order_id.lower() or query in o.document_name.lower() or query in o.user_name.lower()]
    return results

@router.get("/{order_id}", response_model=PrintOrderSchema)
async def get_order(order_id: str):
    for order in ORDERS_STORE:
        if order.order_id == order_id:
            return order
    raise HTTPException(status_code=404, detail="Order not found")

@router.post("", response_model=PrintOrderSchema)
async def create_order(payload: PrintOrderCreate):
    from backend.routes.documents import DOCUMENTS_STORE
    doc = next((d for d in DOCUMENTS_STORE if d.document_id == payload.document_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Referenced document not found")

    costs = calculate_print_costs(
        pages=doc.page_count,
        copies=payload.copies,
        paper=payload.paper_size,
        color=payload.color_mode,
        duplex=payload.duplex,
        priority=payload.priority
    )

    new_id = f"ORD-{1000 + len(ORDERS_STORE) + 1}"
    order = PrintOrderSchema(
        order_id=new_id,
        user_id=doc.user_id,
        user_name="Amandeep S. Dhillon",
        document_id=doc.document_id,
        document_name=doc.filename,
        copies=payload.copies,
        color_mode=payload.color_mode,
        paper_size=payload.paper_size,
        duplex=payload.duplex,
        priority=payload.priority,
        status="Pending",
        total_pages=doc.page_count,
        total_prints=costs["total_prints"],
        estimated_cost=costs["estimated_cost"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    ORDERS_STORE.insert(0, order)

    STATUS_LOGS.insert(0, StatusLogSchema(
        log_id=f"LOG-{len(STATUS_LOGS)+1}",
        order_id=new_id,
        old_status="None",
        new_status="Pending",
        changed_by="User Creation"
    ))

    await dispatch_n8n_order_event("order_created", new_id, "None", "Pending")
    return order

@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, update: StatusUpdateSchema):
    order = next((o for o in ORDERS_STORE if o.order_id == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status
    order.status = update.status
    order.updated_at = datetime.utcnow()

    log = StatusLogSchema(
        log_id=f"LOG-{len(STATUS_LOGS)+1}",
        order_id=order_id,
        old_status=old_status,
        new_status=update.status,
        changed_by=update.changed_by or "Staff"
    )
    STATUS_LOGS.insert(0, log)

    webhook_res = await dispatch_n8n_order_event("order_status_changed", order_id, old_status, update.status)

    return {"order": order, "status_log": log, "n8n_event": webhook_res}
