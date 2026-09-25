import os
import httpx
from typing import Dict, Any

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")

async def dispatch_n8n_order_event(event: str, order_id: str, old_status: str, new_status: str) -> Dict[str, Any]:
    payload = {
        "event": event,
        "order_id": order_id,
        "old_status": old_status,
        "new_status": new_status,
        "source": "PrintAI FastAPI Backend"
    }

    if not N8N_WEBHOOK_URL or not N8N_WEBHOOK_URL.startswith("http"):
        return {
            "status": "simulated",
            "message": "N8N_WEBHOOK_URL not configured; event recorded in simulation mode",
            "payload": payload
        }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(N8N_WEBHOOK_URL, json=payload)
            return {
                "status": "delivered",
                "status_code": response.status_code,
                "response": response.text[:200]
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
