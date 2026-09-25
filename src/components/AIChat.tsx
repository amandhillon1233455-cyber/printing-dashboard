import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Bot, User, Sparkles, BookOpen, ChevronDown, Check, Loader2, Info } from 'lucide-react';
import { sendChatMessage, DocumentRecord, getDocuments } from '../services/api';
import { useToast } from './Toast';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  retrievedContext?: boolean;
  sources?: string[];
}

interface AIChatProps {
  initialDocumentId?: string;
}

const SAMPLE_QUESTIONS = [
  'What are the color and B&W printing rates?',
  'Can I cancel an order that is currently Processing?',
  'What paper sizes and file types are supported?',
  'What are the campus print hub operating hours?',
  'How does the duplex eco-discount work?',
];

export const AIChat: React.FC<AIChatProps> = ({ initialDocumentId }) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your PrintAI Assistant. I am grounded in the official printing knowledge base, pricing rules, and your uploaded documents. Ask me anything about print parameters, cancellation policies, or paper specifications.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      retrievedContext: false,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documentsList, setDocumentsList] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocumentId || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDocuments()
      .then(setDocumentsList)
      .catch((e) => console.error('Failed to load documents for chat:', e));
  }, []);

  useEffect(() => {
    if (initialDocumentId) {
      setSelectedDocId(initialDocumentId);
    }
  }, [initialDocumentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(query, selectedDocId || undefined);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retrievedContext: response.retrieved_context,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      showToast(err.message || 'AI request failed', 'error');
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Sorry, I encountered an error connecting to the AI service. Please verify your GEMINI_API_KEY in the environment or server logs.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: 'Chat history cleared. How can I assist you with your print operations?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const selectedDoc = documentsList.find((d) => d.document_id === selectedDocId);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 leading-tight flex items-center gap-1.5">
              <span>AI Document Assistant</span>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-medium">
                Gemini 3.8 Flash RAG
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Grounded in verified print pricing, hardware rules & documents
            </p>
          </div>
        </div>

        {/* Document Context Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="text-xs bg-white border border-slate-200 text-slate-700 rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none max-w-[200px] truncate"
            >
              <option value="">All Knowledge Base (No Doc Filter)</option>
              {documentsList.map((doc) => (
                <option key={doc.document_id} value={doc.document_id}>
                  Doc: {doc.filename}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Badge if Doc is selected */}
      {selectedDoc && (
        <div className="px-5 py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-800">
          <span className="truncate">
            Active Context: <strong>{selectedDoc.filename}</strong> ({selectedDoc.page_count} pages)
          </span>
          <button
            onClick={() => setSelectedDocId('')}
            className="text-[11px] text-blue-600 hover:underline shrink-0 ml-2"
          >
            Clear context
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[340px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[82%] rounded-xl p-3.5 text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-xs'
              }`}
            >
              {/* Retrieved Context Banner for AI messages */}
              {msg.retrievedContext && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 w-fit">
                  <Sparkles className="w-3 h-3" />
                  <span>Knowledge base context retrieved</span>
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Source citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">Sources consulted: </span>
                  {msg.sources.join(' · ')}
                </div>
              )}

              <span
                className={`block text-[10px] ${
                  msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>AI is thinking and searching knowledge base...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-5 py-2 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Suggested Questions:
        </p>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3.5 border-t border-slate-100 flex items-center gap-2 bg-white"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask something about printing or this document..."
          disabled={isLoading}
          className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-slate-50 focus:bg-white transition-colors"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
