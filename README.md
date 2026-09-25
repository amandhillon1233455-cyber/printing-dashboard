# PrintAI – AI-Powered Smart Printing Management Dashboard

PrintAI is a centralized smart printing management platform for universities, colleges, corporate offices, cyber cafés, and commercial print-service hubs.

It orchestrates document validation, print order lifecycle management, Google Gemini 3.8 Flash RAG question answering, MongoDB persistence, n8n automated workflow notifications, and operational analytics.

---

## 1. Architecture Overview

### Frontend
- **Framework**: React 19 + Vite (TypeScript)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Design Constitution**: SaaS dashboard aesthetics, zero-pill typography, tabular figures (`tabular-nums`), responsive mobile drawer, single-elevation surfaces.

### Full-Stack Runtime (AI Studio Applet)
- **Engine**: Node.js Express server (`server.ts`) mounting Vite middleware on port 3000.
- **REST Endpoints**: Real full-featured API handling documents, orders, status transitions, Gemini 3.8 Flash RAG queries, analytics aggregation, and n8n webhooks.

### Standalone Python FastAPI Backend (`backend/`)
- **FastAPI**: Asynchronous REST API service (`backend/main.py`)
- **AI & RAG**: Google Gemini (`google-genai`), LangChain, and ChromaDB vector embeddings
- **Database**: MongoDB / MongoDB Atlas via `motor` and `pymongo`
- **Automation**: n8n status change webhooks via `httpx`

---

## 2. Quickstart & Local Development

### Running the Integrated Full-Stack Applet
```bash
# 1. Install dependencies
npm install

# 2. Run dev server (starts server.ts on port 3000)
npm run dev
```

### Running the Standalone Python FastAPI Backend
```bash
# 1. Enter backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your GEMINI_API_KEY, MONGODB_URI, and N8N_WEBHOOK_URL

# 5. Start FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 3. Environment Variables

Create `.env` based on `.env.example`:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for AI assistant & RAG |
| `MONGODB_URI` | MongoDB Atlas or local MongoDB connection URI |
| `DATABASE_NAME` | Name of MongoDB database (default: `printing_dashboard`) |
| `N8N_WEBHOOK_URL` | Webhook URL of your n8n workflow for status change alerts |
| `APPLICATION_SECRET` | Secret token for JWT or webhook signature verification |
| `FRONTEND_URL` | Client URL for CORS policy (e.g. `http://localhost:3000`) |
| `VITE_API_URL` | Client API endpoint (defaults to `/api` when hosted on full-stack) |

---

## 4. End-to-End User Flow

1. **Landing Page**: Open `PrintAI`, review core capabilities and 5-step lifecycle, and click **Launch Dashboard** / **Get Started**.
2. **Dashboard**: View summary KPI cards (*Total Orders*, *Pending*, *Processing*, *Completed*, *Revenue*).
3. **Upload Document**:
   - Drag & drop any PDF, DOCX, JPG, or PNG (up to 10 MB).
   - Observe the 5-step processing pipeline (*Uploading* → *Extracting text* → *Processing document* → *Creating knowledge embeddings* → *AI analysis ready*).
4. **Preview & Configure**:
   - Inspect the file in the Document Preview modal (page controls, zoom in/out, download).
   - Configure print options: Copies, Paper Size (A4, A3, Letter), Color Mode (Color, B&W), Duplex (Single-sided, Double-sided with 10% eco discount), Priority Fast-Track (+ $1.50).
5. **Create Order**:
   - Click **Create Print Order** to generate unique ID `ORD-xxxx` with initial `Pending` status.
6. **Order Lifecycle & n8n Automation**:
   - Open order in modal or click quick status cycle (*Pending* → *Processing* → *Ready* → *Completed*).
   - Every status change logs an entry and dispatches a JSON webhook to n8n.
7. **AI Assistant & RAG**:
   - Ask printing policy or pricing questions (e.g., *"What are the A4 color printing rates?"*, *"Can I cancel an order that is Processing?"*).
   - Gemini retrieves the approved knowledge base context and cites sources.
8. **Analytics**:
   - Audit print volumes over time, paper tray distributions, and revenue totals.
9. **Settings**:
   - Check real-time connection status of Gemini, MongoDB, and n8n, or send test webhook events.
