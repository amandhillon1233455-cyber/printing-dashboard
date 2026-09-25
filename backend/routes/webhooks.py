from fastapi import APIRouter
from backend.models.schemas import N8nWebhookPayload
from backend.services.n8n_service import dispatch_n8n_order_event

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])

@router.post("/n8n")
async def trigger_webhook(payload: N8nWebhookPayload):
    result = await dispatch_n8n_order_event(
        event=payload.event,
        order_id=payload.order_id,
        old_status=payload.old_status,
        new_status=payload.new_status
    )
    return {"status": "dispatched", "result": result}
