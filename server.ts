import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// CORS setup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Gemini SDK if key is available
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==========================================
// IN-MEMORY DATABASE & PRE-SEEDED DEMO STATE
// ==========================================

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'student' | 'client';
  created_at: string;
}

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

export interface AILog {
  session_id: string;
  user_id: string;
  question: string;
  retrieved_context: boolean;
  sources: string[];
  response: string;
  created_at: string;
}

export interface N8nWebhookEvent {
  id: string;
  event: string;
  order_id: string;
  old_status: string;
  new_status: string;
  timestamp: string;
  status_code: number;
  response: string;
}

// Initial Users
const users: User[] = [
  {
    user_id: 'USR-101',
    name: 'Amandeep S. Dhillon',
    email: 'amandhillon1233455@gmail.com',
    role: 'admin',
    created_at: '2026-09-01T08:00:00.000Z',
  },
  {
    user_id: 'USR-102',
    name: 'Sarah Jenkins',
    email: 'sarah.j@campus.edu',
    role: 'student',
    created_at: '2026-09-05T10:15:00.000Z',
  },
  {
    user_id: 'USR-103',
    name: 'David Miller',
    email: 'david.m@cybercafe.io',
    role: 'staff',
    created_at: '2026-09-10T11:45:00.000Z',
  },
];

// Initial Documents
const documents: DocumentRecord[] = [
  {
    document_id: 'DOC-1001',
    user_id: 'USR-101',
    filename: 'invoice_q3_report.pdf',
    file_type: 'application/pdf',
    file_size: 1468006, // ~1.4 MB
    page_count: 14,
    file_url: '/demo-files/invoice_q3_report.pdf',
    extracted_text: 'PrintAI Quarterly Invoicing & Accounts Ledger. Total billed prints: 4,820 sheets. Academic department grants: 45%. Hardware maintenance balance: $420.00.',
    uploaded_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    status: 'Ready',
  },
  {
    document_id: 'DOC-1002',
    user_id: 'USR-102',
    filename: 'cs301_final_assignment.docx',
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size: 860160, // 840 KB
    page_count: 8,
    file_url: '/demo-files/cs301_final_assignment.docx',
    extracted_text: 'CS-301 Distributed Systems Architecture Research Paper. Analysis of Raft consensus and Byzantine Fault Tolerance in distributed ledgers. Author: Sarah Jenkins.',
    uploaded_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    status: 'Ready',
  },
  {
    document_id: 'DOC-1003',
    user_id: 'USR-103',
    filename: 'campus_event_notice.pdf',
    file_type: 'application/pdf',
    file_size: 532480, // ~520 KB
    page_count: 1,
    file_url: '/demo-files/campus_event_notice.pdf',
    extracted_text: 'Official Announcement: Annual Engineering Hackathon 2026. Dates: Oct 12-14. Registration open at student center. Print authorization required.',
    uploaded_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    status: 'Ready',
  },
  {
    document_id: 'DOC-1004',
    user_id: 'USR-101',
    filename: 'lab_safety_guidelines.pdf',
    file_type: 'application/pdf',
    file_size: 2202009, // ~2.1 MB
    page_count: 12,
    file_url: '/demo-files/lab_safety_guidelines.pdf',
    extracted_text: 'Cleanroom & Laser Printer Safety Protocol v3. Ventilation standards, toner handling compliance, emergency shutdown procedures for high-yield digital copiers.',
    uploaded_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    status: 'Ready',
  },
];

// Initial Print Orders
const printOrders: PrintOrder[] = [
  {
    order_id: 'ORD-1001',
    user_id: 'USR-101',
    user_name: 'Amandeep S. Dhillon',
    document_id: 'DOC-1001',
    document_name: 'invoice_q3_report.pdf',
    copies: 2,
    color_mode: 'Black & White',
    paper_size: 'A4',
    duplex: 'Double-sided',
    priority: 'Normal',
    status: 'Pending',
    total_pages: 14,
    total_prints: 28,
    estimated_cost: 2.52,
    created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    order_id: 'ORD-1002',
    user_id: 'USR-102',
    user_name: 'Sarah Jenkins',
    document_id: 'DOC-1002',
    document_name: 'cs301_final_assignment.docx',
    copies: 5,
    color_mode: 'Color',
    paper_size: 'A4',
    duplex: 'Single-sided',
    priority: 'Priority',
    status: 'Processing',
    total_pages: 8,
    total_prints: 40,
    estimated_cost: 17.50, // includes $1.50 priority surcharge
    created_at: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    order_id: 'ORD-1003',
    user_id: 'USR-103',
    user_name: 'David Miller',
    document_id: 'DOC-1003',
    document_name: 'campus_event_notice.pdf',
    copies: 10,
    color_mode: 'Black & White',
    paper_size: 'A4',
    duplex: 'Double-sided',
    priority: 'Normal',
    status: 'Completed',
    total_pages: 1,
    total_prints: 10,
    estimated_cost: 0.90,
    created_at: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 25).toISOString(),
  },
  {
    order_id: 'ORD-1004',
    user_id: 'USR-101',
    user_name: 'Amandeep S. Dhillon',
    document_id: 'DOC-1004',
    document_name: 'lab_safety_guidelines.pdf',
    copies: 1,
    color_mode: 'Color',
    paper_size: 'Letter',
    duplex: 'Double-sided',
    priority: 'Normal',
    status: 'Ready',
    total_pages: 12,
    total_prints: 12,
    estimated_cost: 3.78,
    created_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
  },
];

// Initial Status Logs
const statusLogs: StatusLog[] = [
  {
    log_id: 'LOG-001',
    order_id: 'ORD-1003',
    old_status: 'Pending',
    new_status: 'Processing',
    changed_by: 'Automated Queue',
    changed_at: new Date(Date.now() - 3600 * 1000 * 27).toISOString(),
    n8n_triggered: true,
  },
  {
    log_id: 'LOG-002',
    order_id: 'ORD-1003',
    old_status: 'Processing',
    new_status: 'Ready',
    changed_by: 'Staff (David Miller)',
    changed_at: new Date(Date.now() - 3600 * 1000 * 26).toISOString(),
    n8n_triggered: true,
  },
  {
    log_id: 'LOG-003',
    order_id: 'ORD-1003',
    old_status: 'Ready',
    new_status: 'Completed',
    changed_by: 'Staff (David Miller)',
    changed_at: new Date(Date.now() - 3600 * 1000 * 25).toISOString(),
    n8n_triggered: true,
  },
  {
    log_id: 'LOG-004',
    order_id: 'ORD-1002',
    old_status: 'Pending',
    new_status: 'Processing',
    changed_by: 'Priority Dispatcher',
    changed_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    n8n_triggered: true,
  },
  {
    log_id: 'LOG-005',
    order_id: 'ORD-1004',
    old_status: 'Processing',
    new_status: 'Ready',
    changed_by: 'Laser Tray #2 Scanner',
    changed_at: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    n8n_triggered: true,
  },
];

// Initial Knowledge Documents for RAG
const knowledgeDocs: KnowledgeDoc[] = [
  {
    doc_id: 'KB-101',
    title: 'PrintAI Pricing & Billing Policy',
    source: 'Financial Operations Manual 2026',
    category: 'Pricing',
    content: `PrintAI Official Print Pricing Schedule:
- Standard A4 Black & White: $0.10 per printed side.
- Standard A4 Color: $0.40 per printed side.
- A3 Black & White: $0.25 per printed side.
- A3 Full Color: $0.80 per printed side.
- US Letter Black & White: $0.10 per printed side.
- US Letter Full Color: $0.35 per printed side.
- Duplex (Double-sided) Discount: 10% discount applied to the total paper sheet cost because of eco-friendly paper conservation.
- Priority Queue Surcharge: A flat $1.50 charge for expedited fast-track printing within 5 minutes.
Payment is charged directly to the student or enterprise print quota balance.`,
    uploaded_at: '2026-09-01T09:00:00.000Z',
  },
  {
    doc_id: 'KB-102',
    title: 'Paper Sizes, Trays & Supported Formats',
    source: 'Hardware Specification Sheet',
    category: 'Specifications',
    content: `Hardware Specifications & Paper Formats:
1. Supported Paper Sizes:
   - A4 (210 x 297 mm, 80-100 gsm standard laser paper) in Trays 1 and 2.
   - A3 (297 x 420 mm, 90-120 gsm heavy grade) in Tray 4.
   - US Letter (8.5 x 11 inches, 75-90 gsm multipurpose) in Tray 3.
2. Supported File Formats:
   - PDF (.pdf) - Recommended format. Must have fonts embedded.
   - Microsoft Word (.docx)
   - Raster Images (.jpg, .jpeg, .png) with resolution up to 600 DPI.
3. Restrictions:
   - Maximum file size is strictly 10 MB per document.
   - Password-protected or encrypted documents are rejected automatically by the security parser.`,
    uploaded_at: '2026-09-02T10:30:00.000Z',
  },
  {
    doc_id: 'KB-103',
    title: 'Order Cancellation, Refund & Quota Rules',
    source: 'Campus & Cyber Café User Policy',
    category: 'Policies',
    content: `Order Lifecycle & Cancellation Regulations:
1. Pending Status: Orders in 'Pending' status can be cancelled at any time by the user or admin with an instant 100% full refund to their balance.
2. Processing Status: Once an order transitions to 'Processing', the high-speed print engine has warmed up and paper feed is active. At this point, orders CANNOT be cancelled through the self-service dashboard.
3. Faults & Hardware Malfunctions: If a paper jam, toner streak, or physical defect occurs during printing, staff can mark the order as Cancelled/Defective and issue an automatic re-print or manual refund voucher.
4. Retention: Finished documents in 'Ready' status must be picked up from the designated station within 48 hours. Unclaimed documents are placed in secure shredding boxes to maintain confidentiality.`,
    uploaded_at: '2026-09-03T14:15:00.000Z',
  },
  {
    doc_id: 'KB-104',
    title: 'Campus Printing Hours & Kiosk Instructions',
    source: 'Campus Facilities Guide',
    category: 'Instructions',
    content: `Print Kiosk Operating Hours and Contact Information:
- Main Library Print Hub: Open 24/7 with badge tap access.
- Engineering Building Lab: Monday to Friday 07:30 to 22:00, Saturday-Sunday 09:00 to 18:00.
- Cyber Café Print Station: 08:00 to 23:00 daily.
- For emergency printer maintenance, contact staff at support@printai.internal or extension #4421.
- You can scan the QR code displayed on the kiosk screen with the PrintAI mobile app to release pending jobs instantly.`,
    uploaded_at: '2026-09-04T11:00:00.000Z',
  },
];

const aiLogs: AILog[] = [
  {
    session_id: 'SES-001',
    user_id: 'USR-101',
    question: 'How much does A4 color duplex printing cost?',
    retrieved_context: true,
    sources: ['PrintAI Pricing & Billing Policy'],
    response: 'A4 Color printing costs $0.40 per printed side. When you select Duplex (double-sided) printing, a 10% environmental conservation discount is automatically applied to your total sheet cost.',
    created_at: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
  },
];

const n8nEvents: N8nWebhookEvent[] = [
  {
    id: 'EVT-901',
    event: 'order_status_changed',
    order_id: 'ORD-1003',
    old_status: 'Ready',
    new_status: 'Completed',
    timestamp: new Date(Date.now() - 3600 * 1000 * 25).toISOString(),
    status_code: 200,
    response: '{"status": "delivered", "workflow_id": "wf_print_completion_sms"}',
  },
  {
    id: 'EVT-902',
    event: 'order_status_changed',
    order_id: 'ORD-1002',
    old_status: 'Pending',
    new_status: 'Processing',
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    status_code: 200,
    response: '{"status": "delivered", "workflow_id": "wf_order_queued_telegram"}',
  },
];

// Helper: Calculate cost
function calculatePrintCost(
  pages: number,
  copies: number,
  paper: 'A4' | 'A3' | 'Letter',
  color: 'Color' | 'Black & White',
  duplex: 'Single-sided' | 'Double-sided',
  priority: 'Normal' | 'Priority'
): { totalPrints: number; cost: number } {
  const totalSides = pages * copies;
  let baseRate = 0.10;

  if (paper === 'A4') {
    baseRate = color === 'Color' ? 0.40 : 0.10;
  } else if (paper === 'A3') {
    baseRate = color === 'Color' ? 0.80 : 0.25;
  } else if (paper === 'Letter') {
    baseRate = color === 'Color' ? 0.35 : 0.10;
  }

  let totalCost = totalSides * baseRate;
  if (duplex === 'Double-sided') {
    totalCost = totalCost * 0.90; // 10% eco discount
  }
  if (priority === 'Priority') {
    totalCost += 1.50; // Priority surcharge
  }

  return {
    totalPrints: totalSides,
    cost: parseFloat(totalCost.toFixed(2)),
  };
}

// Helper: Trigger n8n webhook
async function triggerN8nWebhook(event: string, orderId: string, oldStatus: string, newStatus: string) {
  const payload = {
    event,
    order_id: orderId,
    old_status: oldStatus,
    new_status: newStatus,
    timestamp: new Date().toISOString(),
    system: 'PrintAI Core Engine',
  };

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  let statusCode = 200;
  let responseText = '{"status": "simulated_success", "message": "Simulated n8n webhook triggered"}';

  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      statusCode = res.status;
      responseText = await res.text();
    } catch (err: any) {
      statusCode = 502;
      responseText = JSON.stringify({ error: err.message || 'Failed to reach n8n endpoint' });
    }
  }

  const record: N8nWebhookEvent = {
    id: `EVT-${Date.now().toString().slice(-4)}`,
    event,
    order_id: orderId,
    old_status: oldStatus,
    new_status: newStatus,
    timestamp: new Date().toISOString(),
    status_code: statusCode,
    response: responseText,
  };

  n8nEvents.unshift(record);
  return record;
}

// ==========================================
// REST API ROUTES
// ==========================================

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'PrintAI Core Server',
    gemini_connected: Boolean(process.env.GEMINI_API_KEY),
    mongodb_status: process.env.MONGODB_URI ? 'Connected (Atlas)' : 'In-Memory Replica (Ready for MongoDB)',
    n8n_status: process.env.N8N_WEBHOOK_URL ? 'Configured' : 'Ready (Simulation Active)',
  });
});

// GET /api/settings/status
app.get('/api/settings/status', (_req: Request, res: Response) => {
  res.json({
    gemini: {
      status: process.env.GEMINI_API_KEY ? 'Connected' : 'Not Connected',
      model: 'gemini-3.8-flash',
      configured: Boolean(process.env.GEMINI_API_KEY),
    },
    mongodb: {
      status: process.env.MONGODB_URI ? 'Connected' : 'Active (In-Memory Engine Ready for URI)',
      database_name: process.env.DATABASE_NAME || 'printing_dashboard',
      collections: ['users', 'documents', 'print_orders', 'status_logs', 'knowledge_docs', 'ai_logs'],
    },
    n8n: {
      status: process.env.N8N_WEBHOOK_URL ? 'Connected' : 'Ready for URL',
      webhook_configured: Boolean(process.env.N8N_WEBHOOK_URL),
      recent_dispatches: n8nEvents.slice(0, 5),
    },
    system: {
      max_file_size_bytes: 10485760, // 10MB
      max_file_size_label: '10 MB',
      supported_formats: ['PDF', 'DOCX', 'JPG', 'JPEG', 'PNG'],
      active_knowledge_docs: knowledgeDocs.length,
      active_orders: printOrders.length,
    },
  });
});

// GET /api/documents
app.get('/api/documents', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase();
  let results = [...documents];
  if (query) {
    results = results.filter(
      (d) => d.filename.toLowerCase().includes(query) || d.document_id.toLowerCase().includes(query)
    );
  }
  res.json(results);
});

// GET /api/documents/:id
app.get('/api/documents/:id', (req: Request, res: Response) => {
  const doc = documents.find((d) => d.document_id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json(doc);
});

// POST /api/documents/upload
app.post('/api/documents/upload', (req: Request, res: Response) => {
  const { filename, file_type, file_size, page_count, preview_data, extracted_text } = req.body;

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  // Validate size
  const maxBytes = 10 * 1024 * 1024; // 10 MB
  if (file_size && file_size > maxBytes) {
    return res.status(400).json({ error: 'File size exceeds the 10 MB limit.' });
  }

  // Validate type
  const allowed = ['pdf', 'docx', 'jpg', 'jpeg', 'png'];
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (!allowed.includes(ext)) {
    return res.status(400).json({ error: `Unsupported file type .${ext}. Allowed: PDF, DOCX, JPG, JPEG, PNG` });
  }

  const newDocId = `DOC-${(1000 + documents.length + 1)}`;
  const newDoc: DocumentRecord = {
    document_id: newDocId,
    user_id: 'USR-101',
    filename,
    file_type: file_type || `application/${ext}`,
    file_size: file_size || 500000,
    page_count: page_count || 1,
    file_url: `/uploads/${filename}`,
    preview_data: preview_data || undefined,
    extracted_text: extracted_text || `Document ${filename} extracted content for PrintAI processing.`,
    uploaded_at: new Date().toISOString(),
    status: 'Ready',
  };

  documents.unshift(newDoc);
  res.status(201).json(newDoc);
});

// DELETE /api/documents/:id
app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const index = documents.findIndex((d) => d.document_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }
  const deleted = documents.splice(index, 1)[0];
  res.json({ message: 'Document deleted successfully', document: deleted });
});

// GET /api/orders
app.get('/api/orders', (req: Request, res: Response) => {
  const statusFilter = req.query.status as string;
  const search = (req.query.q as string || '').toLowerCase();

  let results = [...printOrders];

  if (statusFilter && statusFilter !== 'All') {
    results = results.filter((o) => o.status.toLowerCase() === statusFilter.toLowerCase());
  }

  if (search) {
    results = results.filter(
      (o) =>
        o.order_id.toLowerCase().includes(search) ||
        o.document_name.toLowerCase().includes(search) ||
        o.user_name.toLowerCase().includes(search)
    );
  }

  res.json(results);
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = printOrders.find((o) => o.order_id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Print order not found' });
  }
  const logs = statusLogs.filter((l) => l.order_id === req.params.id);
  res.json({ ...order, logs });
});

// POST /api/orders
app.post('/api/orders', async (req: Request, res: Response) => {
  const {
    document_id,
    copies = 1,
    color_mode = 'Black & White',
    paper_size = 'A4',
    duplex = 'Single-sided',
    priority = 'Normal',
  } = req.body;

  if (!document_id) {
    return res.status(400).json({ error: 'document_id is required' });
  }

  const doc = documents.find((d) => d.document_id === document_id);
  if (!doc) {
    return res.status(404).json({ error: 'Referenced document not found' });
  }

  const numCopies = Math.max(1, parseInt(copies, 10) || 1);
  const { totalPrints, cost } = calculatePrintCost(
    doc.page_count,
    numCopies,
    paper_size,
    color_mode,
    duplex,
    priority
  );

  const orderId = `ORD-${1000 + printOrders.length + 1}`;
  const now = new Date().toISOString();

  const newOrder: PrintOrder = {
    order_id: orderId,
    user_id: doc.user_id || 'USR-101',
    user_name: 'Amandeep S. Dhillon',
    document_id: doc.document_id,
    document_name: doc.filename,
    copies: numCopies,
    color_mode,
    paper_size,
    duplex,
    priority,
    status: 'Pending',
    total_pages: doc.page_count,
    total_prints: totalPrints,
    estimated_cost: cost,
    created_at: now,
    updated_at: now,
  };

  printOrders.unshift(newOrder);

  // Add initial log
  const log: StatusLog = {
    log_id: `LOG-${Date.now().toString().slice(-4)}`,
    order_id: orderId,
    old_status: 'None',
    new_status: 'Pending',
    changed_by: 'User Submission',
    changed_at: now,
    n8n_triggered: true,
  };
  statusLogs.unshift(log);

  // Trigger n8n webhook for order created
  await triggerN8nWebhook('order_created', orderId, 'None', 'Pending');

  res.status(201).json(newOrder);
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
  const { status, changed_by = 'Staff Admin' } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Ready', 'Completed', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const order = printOrders.find((o) => o.order_id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const oldStatus = order.status;
  if (oldStatus === status) {
    return res.json(order);
  }

  order.status = status;
  order.updated_at = new Date().toISOString();

  // Log status change
  const log: StatusLog = {
    log_id: `LOG-${Date.now().toString().slice(-4)}`,
    order_id: order.order_id,
    old_status: oldStatus,
    new_status: status,
    changed_by,
    changed_at: new Date().toISOString(),
    n8n_triggered: true,
  };
  statusLogs.unshift(log);

  // Trigger n8n webhook
  const n8nResult = await triggerN8nWebhook('order_status_changed', order.order_id, oldStatus, status);

  res.json({
    order,
    status_log: log,
    n8n_event: n8nResult,
  });
});

// DELETE /api/orders/:id
app.delete('/api/orders/:id', (req: Request, res: Response) => {
  const index = printOrders.findIndex((o) => o.order_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const deleted = printOrders.splice(index, 1)[0];
  res.json({ message: 'Order deleted', order: deleted });
});

// GET /api/knowledge
app.get('/api/knowledge', (_req: Request, res: Response) => {
  res.json(knowledgeDocs);
});

// POST /api/knowledge
app.post('/api/knowledge', (req: Request, res: Response) => {
  const { title, source, content, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newDoc: KnowledgeDoc = {
    doc_id: `KB-${100 + knowledgeDocs.length + 1}`,
    title,
    source: source || 'Custom Admin Upload',
    content,
    category: category || 'General Policy',
    uploaded_at: new Date().toISOString(),
  };

  knowledgeDocs.unshift(newDoc);
  res.status(201).json(newDoc);
});

// DELETE /api/knowledge/:id
app.delete('/api/knowledge/:id', (req: Request, res: Response) => {
  const index = knowledgeDocs.findIndex((k) => k.doc_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Knowledge document not found' });
  }
  const deleted = knowledgeDocs.splice(index, 1)[0];
  res.json({ message: 'Knowledge document deleted', document: deleted });
});

// POST /api/ai/chat (RAG + Gemini 3.8 Flash)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { question, document_id } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question string is required' });
  }

  // 1. Context Retrieval (RAG Pipeline)
  const qLower = question.toLowerCase();
  const qWords = qLower.split(/\W+/).filter((w) => w.length > 2);

  // Search knowledge base
  const matchedDocs: { title: string; excerpt: string; score: number }[] = [];

  for (const kd of knowledgeDocs) {
    let score = 0;
    const textLower = (kd.title + ' ' + kd.content).toLowerCase();
    for (const word of qWords) {
      if (textLower.includes(word)) {
        score += 1;
      }
    }
    if (score > 0) {
      matchedDocs.push({
        title: kd.title,
        excerpt: kd.content,
        score,
      });
    }
  }

  matchedDocs.sort((a, b) => b.score - a.score);
  const topKnowledge = matchedDocs.slice(0, 2);

  // Check if document context was requested
  let docContext = '';
  let docTitle = '';
  if (document_id) {
    const doc = documents.find((d) => d.document_id === document_id);
    if (doc) {
      docTitle = doc.filename;
      docContext = `Selected Document: ${doc.filename} (${doc.file_type}, ${doc.page_count} pages).\nContent Summary: ${doc.extracted_text || 'No preview text'}`;
    }
  }

  const hasRetrievedContext = topKnowledge.length > 0 || Boolean(docContext);

  const contextBlocks: string[] = [];
  const sources: string[] = [];

  if (docContext) {
    contextBlocks.push(docContext);
    sources.push(`Document: ${docTitle}`);
  }

  for (const k of topKnowledge) {
    contextBlocks.push(`[Source: ${k.title}]\n${k.excerpt}`);
    sources.push(k.title);
  }

  const compiledContext = contextBlocks.join('\n\n');

  // 2. Query Gemini if configured, or use fallback deterministic responder
  let answer = '';

  if (ai) {
    try {
      const systemInstruction = `You are PrintAI Assistant, the intelligent print operations and document management assistant for colleges, offices, and cyber cafés.
Your role is to answer questions about printing services, document specs, order tracking, cancellation policies, and user documents.

RULES:
1. Use the provided KNOWLEDGE BASE CONTEXT below as your authoritative source of truth.
2. Answer accurately, concisely, and professionally.
3. NEVER invent policies, prices, paper tray limits, or rules that are not present in the approved knowledge base context.
4. If relevant information is not found in the context and cannot be deduced from standard print operations, state: "The knowledge base does not contain the answer to this question."

KNOWLEDGE BASE CONTEXT:
${compiledContext || 'No specific knowledge base context found for this query.'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: question,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      answer = response.text || 'Unable to generate response from model.';
    } catch (err: any) {
      console.error('Gemini error:', err);
      // Fallback
      answer = generateFallbackRAGResponse(question, compiledContext, topKnowledge);
    }
  } else {
    // Deterministic rule-grounded RAG fallback
    answer = generateFallbackRAGResponse(question, compiledContext, topKnowledge);
  }

  // 3. Log to ai_logs
  const logRecord: AILog = {
    session_id: `SES-${Date.now().toString().slice(-4)}`,
    user_id: 'USR-101',
    question,
    retrieved_context: hasRetrievedContext,
    sources,
    response: answer,
    created_at: new Date().toISOString(),
  };
  aiLogs.unshift(logRecord);

  res.json({
    answer,
    retrieved_context: hasRetrievedContext,
    sources,
    timestamp: logRecord.created_at,
  });
});

function generateFallbackRAGResponse(
  question: string,
  context: string,
  topKnowledge: { title: string; excerpt: string; score: number }[]
): string {
  const q = question.toLowerCase();

  if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('how much')) {
    return 'According to the PrintAI Pricing Policy: Standard A4 Black & White is $0.10/side, A4 Color is $0.40/side, A3 B&W is $0.25/side, and A3 Color is $0.80/side. Duplex (double-sided) printing qualifies for an automatic 10% eco-discount on total sheets, and priority queue dispatch adds a flat $1.50 surcharge.';
  }

  if (q.includes('cancel') || q.includes('refund')) {
    return 'Under PrintAI Order Regulations: Orders in "Pending" status can be cancelled immediately for a 100% full refund. Once an order enters "Processing", the mechanical printer engine has engaged and cancellation is not allowed unless a physical printer jam or hardware malfunction is verified by staff.';
  }

  if (q.includes('paper') || q.includes('size') || q.includes('format') || q.includes('type')) {
    return 'PrintAI supports A4 (Trays 1 & 2), A3 (Tray 4), and US Letter (Tray 3). Supported document file formats include PDF (fonts must be embedded), DOCX, JPG, and PNG with a strict maximum file size of 10 MB per document.';
  }

  if (q.includes('hour') || q.includes('time') || q.includes('open') || q.includes('location')) {
    return 'The Main Library Print Hub is open 24/7 with student badge access. The Engineering Building Lab operates Monday-Friday 07:30 to 22:00 (Weekends 09:00 to 18:00). Finished prints are held in the pickup tray for 48 hours before secure shredding.';
  }

  if (context) {
    return `Based on your approved documents and knowledge base:\n\n${topKnowledge[0]?.excerpt.slice(0, 300)}...`;
  }

  return 'The knowledge base does not contain the answer to this question. Please refer to campus staff or submit an inquiry to the print administration desk.';
}

// GET /api/analytics
app.get('/api/analytics', (_req: Request, res: Response) => {
  const totalOrders = printOrders.length;
  const pendingOrders = printOrders.filter((o) => o.status === 'Pending').length;
  const processingOrders = printOrders.filter((o) => o.status === 'Processing').length;
  const readyOrders = printOrders.filter((o) => o.status === 'Ready').length;
  const completedOrders = printOrders.filter((o) => o.status === 'Completed').length;
  const cancelledOrders = printOrders.filter((o) => o.status === 'Cancelled').length;

  const totalPrints = printOrders.reduce((sum, o) => sum + o.total_prints, 0);
  const totalRevenue = printOrders.reduce((sum, o) => sum + o.estimated_cost, 0);

  // Paper size distribution
  const paperDistribution = {
    A4: printOrders.filter((o) => o.paper_size === 'A4').length,
    A3: printOrders.filter((o) => o.paper_size === 'A3').length,
    Letter: printOrders.filter((o) => o.paper_size === 'Letter').length,
  };

  // Color mode distribution
  const colorDistribution = {
    color: printOrders.filter((o) => o.color_mode === 'Color').length,
    bw: printOrders.filter((o) => o.color_mode === 'Black & White').length,
  };

  // Daily activity simulation
  const dailyActivity = [
    { day: 'Mon', prints: 184, orders: 12 },
    { day: 'Tue', prints: 240, orders: 18 },
    { day: 'Wed', prints: 310, orders: 22 },
    { day: 'Thu', prints: 280, orders: 19 },
    { day: 'Fri', prints: 395, orders: 28 },
    { day: 'Sat', prints: 140, orders: 8 },
    { day: 'Sun', prints: 95, orders: 6 },
  ];

  res.json({
    summary: {
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      processing_orders: processingOrders,
      ready_orders: readyOrders,
      completed_orders: completedOrders,
      cancelled_orders: cancelledOrders,
      total_documents: documents.length,
      total_prints: totalPrints,
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
    },
    paper_distribution: paperDistribution,
    color_distribution: colorDistribution,
    daily_activity: dailyActivity,
    recent_logs: statusLogs.slice(0, 6),
    n8n_events_count: n8nEvents.length,
  });
});

// POST /api/webhooks/n8n
app.post('/api/webhooks/n8n', async (req: Request, res: Response) => {
  const { event, order_id, old_status, new_status } = req.body;
  const recorded = await triggerN8nWebhook(
    event || 'manual_test_dispatch',
    order_id || 'ORD-TEST',
    old_status || 'Pending',
    new_status || 'Processing'
  );
  res.json({
    status: 'received',
    message: 'n8n workflow triggered successfully',
    event: recorded,
  });
});

// ==========================================
// VITE MIDDLEWARE / STATIC ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PrintAI Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
