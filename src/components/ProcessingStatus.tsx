import React from 'react';
import { CheckCircle2, Loader2, Sparkles, FileText, Database, HardDriveDownload } from 'lucide-react';

export type ProcessingStep =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'processing'
  | 'indexing'
  | 'ai_ready'
  | 'completed'
  | 'failed';

interface ProcessingStatusProps {
  currentStep: ProcessingStep;
  error?: string;
}

const STEPS = [
  { id: 'uploading', label: 'Uploading file...', icon: HardDriveDownload },
  { id: 'extracting', label: 'Extracting text & page count...', icon: FileText },
  { id: 'processing', label: 'Processing document structure...', icon: Loader2 },
  { id: 'indexing', label: 'Creating knowledge embeddings...', icon: Database },
  { id: 'ai_ready', label: 'AI analysis & RAG ready', icon: Sparkles },
];

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ currentStep, error }) => {
  if (currentStep === 'idle') return null;

  if (currentStep === 'failed') {
    return (
      <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
        <p className="font-semibold">Processing Failed</p>
        <p className="mt-1 text-xs">{error || 'An unexpected error occurred during processing.'}</p>
      </div>
    );
  }

  const getStepIndex = (step: ProcessingStep) => {
    switch (step) {
      case 'uploading': return 0;
      case 'extracting': return 1;
      case 'processing': return 2;
      case 'indexing': return 3;
      case 'ai_ready':
      case 'completed': return 4;
      default: return -1;
    }
  };

  const activeIndex = getStepIndex(currentStep);

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Processing Pipeline
        </span>
        {currentStep === 'completed' ? (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Print Order
          </span>
        ) : (
          <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        )}
      </div>

      <div className="space-y-2">
        {STEPS.map((step, idx) => {
          const isDone = activeIndex > idx || currentStep === 'completed';
          const isCurrent = activeIndex === idx && currentStep !== 'completed';
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 text-xs transition-colors duration-200 ${
                isDone
                  ? 'text-slate-700 font-medium'
                  : isCurrent
                  ? 'text-blue-600 font-medium'
                  : 'text-slate-400'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-slate-300" />
                )}
              </div>
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>

      {currentStep === 'completed' && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-emerald-700 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Document processed successfully.
        </div>
      )}
    </div>
  );
};
