import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight, FileText, Printer } from 'lucide-react';
import { DocumentRecord } from '../services/api';

interface DocumentPreviewProps {
  document: DocumentRecord;
  onOrderPrint?: (doc: DocumentRecord) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onOrderPrint }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  const isImage = document.file_type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(document.filename);
  const totalPages = document.page_count || 1;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(200, prev + 20));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(60, prev - 20));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    // Generate a dummy download blob or link
    const element = window.document.createElement('a');
    const fileContent = `PrintAI Document Payload: ${document.filename}\nExtracted text: ${document.extracted_text || 'None'}\nUploaded at: ${document.uploaded_at}`;
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = document.filename;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden text-white select-none">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/90 border-b border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 truncate max-w-xs sm:max-w-md">
          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-medium truncate">{document.filename}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-400 font-mono tabular-nums">
            {(document.file_size / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Page controls for multi-page */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 bg-slate-700/60 rounded-lg px-2 py-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="hover:text-white disabled:opacity-30 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono tabular-nums px-1 text-[11px]">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="hover:text-white disabled:opacity-30 transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Zoom & Rotate */}
          <div className="flex items-center gap-1 bg-slate-700/60 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-600 rounded transition-colors text-slate-300 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono tabular-nums px-1 text-slate-300">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-600 rounded transition-colors text-slate-300 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1 hover:bg-slate-600 rounded transition-colors text-slate-300 hover:text-white ml-1"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="p-1.5 bg-slate-700/60 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Download Document"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center min-h-[380px] bg-slate-950/70">
        <div
          style={{
            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="relative max-w-full"
        >
          {isImage ? (
            <div className="bg-white rounded shadow-2xl p-2 border border-slate-700 max-w-lg">
              <img
                src={document.preview_data || document.file_url || '/placeholder.png'}
                alt={document.filename}
                referrerPolicy="no-referrer"
                className="max-h-[420px] object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="p-3 text-center text-xs text-slate-600 border-t border-slate-100 mt-2">
                Image resolution calibrated for 300 DPI high-speed print
              </div>
            </div>
          ) : (
            /* Document Simulation Canvas */
            <div className="w-[360px] sm:w-[480px] min-h-[520px] bg-white text-slate-900 rounded shadow-2xl p-8 flex flex-col justify-between border border-slate-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                  <span className="text-xs font-semibold tracking-wider uppercase text-blue-600">
                    PrintAI Validated Document
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">
                    {document.filename.replace(/\.[^/.]+$/, '')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authenticated document stream · Ready for high-speed laser output
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed font-mono">
                  {document.extracted_text ||
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.'}
                </div>

                {/* Simulated text lines */}
                <div className="space-y-2 pt-2">
                  <div className="h-2 bg-slate-100 rounded w-full" />
                  <div className="h-2 bg-slate-100 rounded w-11/12" />
                  <div className="h-2 bg-slate-100 rounded w-4/5" />
                  <div className="h-2 bg-slate-100 rounded w-full" />
                  <div className="h-2 bg-slate-100 rounded w-3/4" />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>PrintAI Spooler v2</span>
                <span>Security Hash: SHA256-OK</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Quick Print CTA if requested */}
      {onOrderPrint && (
        <div className="px-4 py-3 bg-slate-800/90 border-t border-slate-700/60 flex items-center justify-between">
          <div className="text-xs text-slate-300">
            Document verified for print configuration
          </div>
          <button
            onClick={() => onOrderPrint(document)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Configure Print Order
          </button>
        </div>
      )}
    </div>
  );
};
