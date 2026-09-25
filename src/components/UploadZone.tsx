import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, Trash2, Check, ArrowRight, FileText } from 'lucide-react';
import { uploadDocument, DocumentRecord } from '../services/api';
import { ProcessingStatus, ProcessingStep } from './ProcessingStatus';
import { useToast } from './Toast';

interface UploadZoneProps {
  onDocumentUploaded: (doc: DocumentRecord) => void;
  onCancel?: () => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'jpg', 'jpeg', 'png'];

export const UploadZone: React.FC<UploadZoneProps> = ({ onDocumentUploaded, onCancel }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [processedDoc, setProcessedDoc] = useState<DocumentRecord | null>(null);

  const validateAndSetFile = (file: File) => {
    setValidationError(null);
    setProcessedDoc(null);
    setProcessingStep('idle');
    setUploadProgress(0);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setValidationError(`Unsupported file type .${ext || 'unknown'}. Allowed formats: PDF, DOCX, JPG, JPEG, PNG.`);
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setValidationError(`File is too large (${sizeMb} MB). Maximum allowed size is 10 MB.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    // Create local object URL for preview if image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError(null);
    setUploadProgress(0);
    setProcessingStep('idle');
    setProcessedDoc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startProcessing = async () => {
    if (!selectedFile) return;

    try {
      setProcessingStep('uploading');
      setUploadProgress(25);

      // Simulate step 1
      await new Promise((r) => setTimeout(r, 600));
      setUploadProgress(50);
      setProcessingStep('extracting');

      // Estimate page count based on size and extension
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      let estimatedPages = 1;
      if (ext === 'pdf') {
        estimatedPages = Math.max(1, Math.min(45, Math.ceil(selectedFile.size / 95000)));
      } else if (ext === 'docx') {
        estimatedPages = Math.max(1, Math.min(25, Math.ceil(selectedFile.size / 120000)));
      }

      await new Promise((r) => setTimeout(r, 600));
      setUploadProgress(75);
      setProcessingStep('processing');

      await new Promise((r) => setTimeout(r, 500));
      setUploadProgress(90);
      setProcessingStep('indexing');

      await new Promise((r) => setTimeout(r, 500));
      setProcessingStep('ai_ready');

      // Read sample text snippet
      let extractedTextSnippet = `Document ${selectedFile.name} parsed into PrintAI knowledge base. Size: ${(selectedFile.size / 1024).toFixed(1)} KB, pages: ${estimatedPages}. Ready for print spooling and Gemini RAG search.`;

      // Actual API call
      const newDoc = await uploadDocument({
        filename: selectedFile.name,
        file_type: selectedFile.type || `application/${ext}`,
        file_size: selectedFile.size,
        page_count: estimatedPages,
        preview_data: previewUrl || undefined,
        extracted_text: extractedTextSnippet,
      });

      setUploadProgress(100);
      setProcessingStep('completed');
      setProcessedDoc(newDoc);
      showToast('Document uploaded successfully.', 'success');
      onDocumentUploaded(newDoc);
    } catch (err: any) {
      setProcessingStep('failed');
      setValidationError(err.message || 'Upload failed. Please try again.');
      showToast('Document upload failed. Please check connection.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
            onChange={handleFileInputChange}
          />
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            Drag & Drop your file here
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            or <span className="text-blue-600 font-medium hover:underline">Browse Files</span> from your computer
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>PDF, DOCX, JPG, PNG</span>
            <span aria-hidden="true">·</span>
            <span>Maximum 10 MB</span>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 font-mono tabular-nums">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.name.split('.').pop()?.toUpperCase()}
                </p>
              </div>
            </div>

            {processingStep === 'idle' && (
              <button
                onClick={handleRemove}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress bar during upload */}
          {processingStep !== 'idle' && (
            <div className="space-y-1">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {processingStep === 'idle' && (
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={startProcessing}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Process Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Validation / Friendly Error Banner */}
      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Processing Pipeline Stages */}
      <ProcessingStatus currentStep={processingStep} error={validationError || undefined} />
    </div>
  );
};
