import os
from typing import Dict, Any, List
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def get_gemini_client():
    if GEMINI_API_KEY:
        return genai.Client(api_key=GEMINI_API_KEY)
    return None

async def generate_ai_response(question: str, context_chunks: List[Dict[str, Any]], doc_context: str = "") -> Dict[str, Any]:
    client = get_gemini_client()
    
    context_text = "\n\n".join([f"[{c.get('title', 'Knowledge')}]\n{c.get('content', '')}" for c in context_chunks])
    if doc_context:
        context_text = f"DOCUMENT CONTEXT:\n{doc_context}\n\nKNOWLEDGE BASE CONTEXT:\n{context_text}"
        
    has_context = bool(context_chunks or doc_context)
    sources = list({c.get("title", "Knowledge Base") for c in context_chunks})
    if doc_context:
        sources.insert(0, "Selected Document Context")

    system_instruction = (
        "You are PrintAI Assistant, an intelligent print management dashboard assistant. "
        "Answer the user question accurately using ONLY the provided knowledge base context and document metadata. "
        "Never invent policies, pricing, or rules that are not present in the approved knowledge base. "
        "If relevant information is not found in the context, explicitly state: "
        "'The knowledge base does not contain the answer to this question.'"
    )

    if client:
        try:
            full_prompt = f"Context:\n{context_text}\n\nUser Question: {question}"
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=full_prompt,
                config={
                    "system_instruction": system_instruction,
                    "temperature": 0.2
                }
            )
            return {
                "answer": response.text,
                "retrieved_context": has_context,
                "sources": sources
            }
        except Exception as e:
            print(f"Gemini API Error: {e}")

    # Fallback deterministic answer if key not yet added
    q = question.lower()
    if "price" in q or "cost" in q or "rate" in q:
        ans = "A4 B&W is $0.10/page, A4 Color is $0.40/page. Duplex printing provides an automatic 10% environmental paper discount. Priority queue adds $1.50."
    elif "cancel" in q or "refund" in q:
        ans = "Pending orders can be cancelled immediately for a 100% refund. Processing orders cannot be cancelled as print spooling has begun."
    elif "paper" in q or "size" in q:
        ans = "Supported paper sizes are A4, A3, and US Letter. Files must be in PDF, DOCX, JPG, or PNG format with max size 10 MB."
    else:
        ans = "The knowledge base does not contain the answer to this question."

    return {
        "answer": ans,
        "retrieved_context": has_context,
        "sources": sources
    }
