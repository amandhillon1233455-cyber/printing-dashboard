import React from 'react';
import { AIChat } from '../components/AIChat';
import { Sparkles, ShieldCheck, Database, Bot } from 'lucide-react';

interface AIAssistantPageProps {
  initialDocumentId?: string;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ initialDocumentId }) => {
  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>AI Document & Operations Assistant</span>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-medium border border-emerald-200/60">
              RAG Guardrails Active
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Powered by Google Gemini 3.8 Flash. Strictly answers using approved campus printing policies, paper guides, and your uploaded files.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            Knowledge Base Indexed
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero Policy Hallucination
          </span>
        </div>
      </div>

      {/* Main Chat Frame */}
      <div className="flex-1 min-h-0">
        <AIChat initialDocumentId={initialDocumentId} />
      </div>
    </div>
  );
};
