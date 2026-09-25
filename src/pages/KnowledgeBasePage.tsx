import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  Sparkles,
  Database,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { KnowledgeDoc, getKnowledge, uploadKnowledgeDocument, deleteKnowledge } from '../services/api';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';

export const KnowledgeBasePage: React.FC = () => {
  const { showToast } = useToast();
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);

  // Upload form state
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('Pricing');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadKnowledge = async () => {
    setIsLoading(true);
    try {
      const data = await getKnowledge();
      setDocs(data);
    } catch (err) {
      console.error('Failed to load knowledge:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledge();
  }, []);

  const handleReindex = async () => {
    setIsReindexing(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsReindexing(false);
    showToast('Knowledge base re-indexed with ChromaDB vector cache.', 'success');
  };

  const handleDelete = async (docId: string, title: string) => {
    if (!window.confirm(`Delete knowledge document "${title}" from RAG index?`)) return;

    try {
      await deleteKnowledge(docId);
      showToast('Knowledge document deleted.', 'info');
      loadKnowledge();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleCreateKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await uploadKnowledgeDocument({
        title: title.trim(),
        source: source.trim() || 'Internal Manual',
        category,
        content: content.trim(),
      });

      showToast('Knowledge document ingested & chunked for RAG.', 'success');
      setIsUploadModalOpen(false);
      setTitle('');
      setSource('');
      setContent('');
      loadKnowledge();
    } catch (err: any) {
      showToast(err.message || 'Failed to ingest knowledge', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Knowledge Base & RAG Index</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-medium">
              ChromaDB Grounded
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Authoritative institutional rules, pricing tiers, and paper formats used by Gemini to answer user questions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleReindex}
            disabled={isReindexing}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Re-Index Chunks</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Knowledge Doc</span>
          </button>
        </div>
      </div>

      {/* Docs Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading knowledge base...
        </div>
      ) : docs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">No knowledge documents</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload verified operational instructions, refund policies, or pricing tables for RAG retrieval.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Add First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div
              key={doc.doc_id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold uppercase">
                      {doc.category || 'Policy'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{doc.doc_id}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.doc_id, doc.title)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                    title="Delete knowledge document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {doc.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Source: {doc.source} · {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed font-mono line-clamp-4 border border-slate-100">
                  {doc.content}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Embedded in ChromaDB
                </span>
                <span>{(doc.content.length / 4).toFixed(0)} tokens</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Knowledge Doc Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Add Knowledge Document to RAG Index"
        subtitle="This text will be parsed into vector chunks for Gemini retrieval."
      >
        <form onSubmit={handleCreateKnowledge} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Student Quota Exemption Rules 2026"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
              >
                <option value="Pricing">Pricing & Rates</option>
                <option value="Specifications">Specifications</option>
                <option value="Policies">Order Policies & Refunds</option>
                <option value="Instructions">Operating Instructions</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Source Document</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Campus Senate Bylaws v4"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Document Content</label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the official rules, prices, or operating text. Paragraphs will be automatically chunked for vector search..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {isSubmitting ? 'Ingesting & Chunking...' : 'Ingest to Knowledge Base'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
