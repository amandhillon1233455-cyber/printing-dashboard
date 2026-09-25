/**
 * PrintAI API Service Layer
 * Interacts with the backend via REST endpoints.
 * Never hardcodes production endpoints; respects VITE_API_URL.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export interface DocumentRecord {
  document_id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  page_count: number;
  file_url: string;
  preview_data?: string;
  extracted_text?: string;
  uploaded_at: string;
  status: 'Ready' | 'Processing' | 'Failed';
}

export interface PrintOrder {
  order_id: string;
  user_id: string;
  user_name: string;
  document_id: string;
  document_name: string;
  copies: number;
  color_mode: 'Color' | 'Black & White';
  paper_size: 'A4' | 'A3' | 'Letter';
  duplex: 'Single-sided' | 'Double-sided';
  priority: 'Normal' | 'Priority';
  status: 'Pending' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled';
  total_pages: number;
  total_prints: number;
  estimated_cost: number;
  created_at: string;
  updated_at: string;
  logs?: StatusLog[];
}

export interface StatusLog {
  log_id: string;
  order_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  changed_at: string;
  n8n_triggered?: boolean;
}

export interface KnowledgeDoc {
  doc_id: string;
  title: string;
  source: string;
  content: string;
  category: string;
  uploaded_at: string;
}

export interface AnalyticsData {
  summary: {
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    ready_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    total_documents: number;
    total_prints: number;
    total_revenue: number;
  };
  paper_distribution: {
    A4: number;
    A3: number;
    Letter: number;
  };
  color_distribution: {
    color: number;
    bw: number;
  };
  daily_activity: {
    day: string;
    prints: number;
    orders: number;
  }[];
  recent_logs: StatusLog[];
  n8n_events_count: number;
}

export interface SettingsStatus {
  gemini: {
    status: string;
    model: string;
    configured: boolean;
  };
  mongodb: {
    status: string;
    database_name: string;
    collections: string[];
  };
  n8n: {
    status: string;
    webhook_configured: boolean;
    recent_dispatches: any[];
  };
  system: {
    max_file_size_bytes: number;
    max_file_size_label: string;
    supported_formats: string[];
    active_knowledge_docs: number;
    active_orders: number;
  };
}

export interface AIChatResponse {
  answer: string;
  retrieved_context: boolean;
  sources: string[];
  timestamp: string;
}

// Helper fetch wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.error) {
        errorMsg = errorJson.error;
      } else if (errorJson && errorJson.detail) {
        errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

// 1. Documents API
export async function getDocuments(query?: string): Promise<DocumentRecord[]> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : '';
  return request<DocumentRecord[]>(`/documents${qs}`);
}

export async function getDocument(id: string): Promise<DocumentRecord> {
  return request<DocumentRecord>(`/documents/${id}`);
}

export async function uploadDocument(payload: {
  filename: string;
  file_type: string;
  file_size: number;
  page_count: number;
  preview_data?: string;
  extracted_text?: string;
}): Promise<DocumentRecord> {
  return request<DocumentRecord>('/documents/upload', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteDocument(id: string): Promise<{ message: string; document: DocumentRecord }> {
  return request<{ message: string; document: DocumentRecord }>(`/documents/${id}`, {
    method: 'DELETE',
  });
}

// 2. Orders API
export async function getOrders(status?: string, query?: string): Promise<PrintOrder[]> {
  const params = new URLSearchParams();
  if (status && status !== 'All') params.append('status', status);
  if (query) params.append('q', query);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return request<PrintOrder[]>(`/orders${qs}`);
}

export async function getOrder(id: string): Promise<PrintOrder> {
  return request<PrintOrder>(`/orders/${id}`);
}

export async function createOrder(payload: {
  document_id: string;
  copies: number;
  color_mode: 'Color' | 'Black & White';
  paper_size: 'A4' | 'A3' | 'Letter';
  duplex: 'Single-sided' | 'Double-sided';
  priority: 'Normal' | 'Priority';
}): Promise<PrintOrder> {
  return request<PrintOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: 'Pending' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled',
  changedBy: string = 'Staff Admin'
): Promise<{ order: PrintOrder; status_log: StatusLog; n8n_event?: any }> {
  return request<{ order: PrintOrder; status_log: StatusLog; n8n_event?: any }>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus, changed_by: changedBy }),
  });
}

export async function deleteOrder(orderId: string): Promise<{ message: string; order: PrintOrder }> {
  return request<{ message: string; order: PrintOrder }>(`/orders/${orderId}`, {
    method: 'DELETE',
  });
}

// 3. AI Assistant & RAG
export async function sendChatMessage(question: string, documentId?: string): Promise<AIChatResponse> {
  return request<AIChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      question,
      document_id: documentId || null,
    }),
  });
}

// 4. Knowledge Base
export async function getKnowledge(): Promise<KnowledgeDoc[]> {
  return request<KnowledgeDoc[]>('/knowledge');
}

export async function uploadKnowledgeDocument(payload: {
  title: string;
  source: string;
  content: string;
  category: string;
}): Promise<KnowledgeDoc> {
  return request<KnowledgeDoc>('/knowledge', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteKnowledge(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/knowledge/${id}`, {
    method: 'DELETE',
  });
}

// 5. Analytics & Settings
export async function getAnalytics(): Promise<AnalyticsData> {
  return request<AnalyticsData>('/analytics');
}

export async function getSettingsStatus(): Promise<SettingsStatus> {
  return request<SettingsStatus>('/settings/status');
}

export async function triggerN8nWebhook(payload: {
  event: string;
  order_id: string;
  old_status: string;
  new_status: string;
}): Promise<any> {
  return request('/webhooks/n8n', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getHealth(): Promise<any> {
  return request('/health');
}
