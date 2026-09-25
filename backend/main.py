import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.routes.documents import router as documents_router
from backend.routes.orders import router as orders_router
from backend.routes.ai import ai_router, knowledge_router
from backend.routes.analytics import router as analytics_router
from backend.routes.webhooks import router as webhooks_router
from backend.database.mongodb import connect_to_mongo, close_mongo_connection

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="PrintAI – Smart Printing Management API",
    description="FastAPI Backend for PrintAI supporting Gemini AI RAG, MongoDB persistence, and n8n webhooks.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register subrouters
app.include_router(documents_router)
app.include_router(orders_router)
app.include_router(ai_router)
app.include_router(knowledge_router)
app.include_router(analytics_router)
app.include_router(webhooks_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "PrintAI FastAPI Backend",
        "gemini_connected": bool(os.getenv("GEMINI_API_KEY")),
        "n8n_configured": bool(os.getenv("N8N_WEBHOOK_URL")),
        "mongodb_configured": bool(os.getenv("MONGODB_URI")),
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
