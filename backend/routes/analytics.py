from fastapi import APIRouter
from backend.routes.orders import ORDERS_STORE, STATUS_LOGS
from backend.routes.documents import DOCUMENTS_STORE

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("")
async def get_analytics():
    total_orders = len(ORDERS_STORE)
    pending = len([o for o in ORDERS_STORE if o.status == "Pending"])
    processing = len([o for o in ORDERS_STORE if o.status == "Processing"])
    ready = len([o for o in ORDERS_STORE if o.status == "Ready"])
    completed = len([o for o in ORDERS_STORE if o.status == "Completed"])
    cancelled = len([o for o in ORDERS_STORE if o.status == "Cancelled"])
    total_prints = sum(o.total_prints for o in ORDERS_STORE)
    total_revenue = round(sum(o.estimated_cost for o in ORDERS_STORE), 2)

    return {
        "summary": {
            "total_orders": total_orders,
            "pending_orders": pending,
            "processing_orders": processing,
            "ready_orders": ready,
            "completed_orders": completed,
            "cancelled_orders": cancelled,
            "total_documents": len(DOCUMENTS_STORE),
            "total_prints": total_prints,
            "total_revenue": total_revenue
        },
        "paper_distribution": {
            "A4": len([o for o in ORDERS_STORE if o.paper_size == "A4"]),
            "A3": len([o for o in ORDERS_STORE if o.paper_size == "A3"]),
            "Letter": len([o for o in ORDERS_STORE if o.paper_size == "Letter"])
        },
        "color_distribution": {
            "color": len([o for o in ORDERS_STORE if o.color_mode == "Color"]),
            "bw": len([o for o in ORDERS_STORE if o.color_mode == "Black & White"])
        },
        "recent_logs": STATUS_LOGS[:5]
    }
