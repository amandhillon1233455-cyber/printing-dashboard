import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Eye,
  Trash2,
  Printer,
  Download,
  Bot,
  Search,
  Plus,
} from 'lucide-react';
import { DocumentRecord, getDocuments, deleteDocument } from '../services/api';
import { DocumentPreview } from '../components/DocumentPreview';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

interface DocumentsPageProps {
  onOpenUpload: () => void;
  onSelectDocumentForOrder: (doc: DocumentRecord) => void;
  onSelectDocumentForAI: (doc: DocumentRecord) => void;
  searchQuery: string;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  onOpenUpload,
  onSelectDocumentForOrder,
  onSelectDocumentForAI,
  searchQuery,
}) => {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments(searchQuery);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [searchQuery]);

  const handleDelete = async (docId: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete document "${filename}"? Any related orders will remain in records.`)) return;

    try {
      await deleteDocument(docId);
      showToast('Document deleted.', 'info');
      loadDocuments();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleDownloadStub = (doc: DocumentRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const element = window.document.createElement('a');
    const fileContent = `PrintAI Document Payload: ${doc.filename}\nExtracted text: ${doc.extracted_text || 'None'}\nUploaded at: ${doc.uploaded_at}`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.filename;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Document Repository
          </h2>
          <p className="text-xs text-slate-500">
            Validated print files stored with text indexing for Gemini RAG retrieval.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New File</span>
        </button>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <div className="p-16 text-center bg-white rounded-xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">No documents yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload your first document to get started. Supports PDF, DOCX, JPG, JPEG, and PNG up to 10 MB.
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Pages</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documents.map((doc) => {
                  const ext = doc.filename.split('.').pop()?.toUpperCase() || 'FILE';

                  return (
                    <tr
                      key={doc.document_id}
                      onClick={() => setPreviewDoc(doc)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="truncate font-semibold">{doc.filename}</p>
                            <p className="text-[11px] font-mono text-slate-400">{doc.document_id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                        {ext}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums text-slate-600">
                        {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums text-slate-600">
                        {doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ready
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Preview Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectDocumentForOrder(doc)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Create Print Order"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectDocumentForAI(doc)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Ask AI Assistant about this doc"
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDownloadStub(doc, e)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDelete(doc.document_id, doc.filename, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title="Document Inspection Preview"
          subtitle={`${previewDoc.filename} (${previewDoc.page_count} pages)`}
          maxWidth="2xl"
        >
          <DocumentPreview
            document={previewDoc}
            onOrderPrint={(doc) => {
              setPreviewDoc(null);
              onSelectDocumentForOrder(doc);
            }}
          />
        </Modal>
      )}
    </div>
  );
};
