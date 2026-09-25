import React, { useState } from 'react';
import { Printer, Zap, CheckCircle2, ShieldCheck, FileText, Loader2, Sparkles } from 'lucide-react';
import { DocumentRecord, createOrder, PrintOrder } from '../services/api';
import { useToast } from './Toast';

interface PrintOrderFormProps {
  document: DocumentRecord;
  onOrderCreated: (order: PrintOrder) => void;
  onCancel?: () => void;
}

export const PrintOrderForm: React.FC<PrintOrderFormProps> = ({
  document,
  onOrderCreated,
  onCancel,
}) => {
  const { showToast } = useToast();

  const [copies, setCopies] = useState<number>(1);
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'Letter'>('A4');
  const [colorMode, setColorMode] = useState<'Color' | 'Black & White'>('Black & White');
  const [duplex, setDuplex] = useState<'Single-sided' | 'Double-sided'>('Single-sided');
  const [priority, setPriority] = useState<'Normal' | 'Priority'>('Normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculation formulas
  const pages = Math.max(1, document.page_count || 1);
  const totalPrints = pages * copies;

  let baseRate = 0.10;
  if (paperSize === 'A4') {
    baseRate = colorMode === 'Color' ? 0.40 : 0.10;
  } else if (paperSize === 'A3') {
    baseRate = colorMode === 'Color' ? 0.80 : 0.25;
  } else if (paperSize === 'Letter') {
    baseRate = colorMode === 'Color' ? 0.35 : 0.10;
  }

  let totalCost = totalPrints * baseRate;
  if (duplex === 'Double-sided') {
    totalCost = totalCost * 0.90; // 10% eco discount
  }
  if (priority === 'Priority') {
    totalCost += 1.50; // Priority surcharge
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const order = await createOrder({
        document_id: document.document_id,
        copies,
        color_mode: colorMode,
        paper_size: paperSize,
        duplex,
        priority,
      });

      showToast(`Order ${order.order_id} created successfully! (Status: Pending)`, 'success');
      onOrderCreated(order);
    } catch (err: any) {
      showToast(err.message || 'Failed to create print order.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Target Document Header */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {document.filename}
            </p>
            <p className="text-[11px] text-slate-500 font-mono tabular-nums">
              ID: {document.document_id} · {pages} {pages === 1 ? 'page' : 'pages'}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
          Validated
        </span>
      </div>

      {/* Grid of print parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Copies */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Number of Copies
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min={1}
              max={100}
              value={copies}
              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono tabular-nums bg-white text-slate-900"
              required
            />
          </div>
          <p className="text-[11px] text-slate-400">Total printed sides: {totalPrints}</p>
        </div>

        {/* Paper Size */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Paper Size
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['A4', 'A3', 'Letter'] as const).map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => setPaperSize(size)}
                className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                  paperSize === size
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            {paperSize === 'A4' && 'Standard standard print (210×297mm)'}
            {paperSize === 'A3' && 'Large format architectural/poster'}
            {paperSize === 'Letter' && 'US Standard office (8.5×11in)'}
          </p>
        </div>

        {/* Color Mode */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Color Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['Black & White', 'Color'] as const).map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setColorMode(mode)}
                className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                  colorMode === mode
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            {colorMode === 'Color' ? 'High-gamut 4-color CMYK laser' : 'Economical monochrome 1200 DPI'}
          </p>
        </div>

        {/* Duplex */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Duplex (Sides)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['Single-sided', 'Double-sided'] as const).map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDuplex(d)}
                className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                  duplex === d
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            {duplex === 'Double-sided' ? '10% Eco discount applied' : 'Standard single page sheets'}
          </p>
        </div>
      </div>

      {/* Priority Toggle */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${priority === 'Priority' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">Priority Fast-Track Queue</p>
            <p className="text-[11px] text-slate-500">Jump ahead in spooler (+ $1.50 surcharge)</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setPriority('Normal')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              priority === 'Normal' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => setPriority('Priority')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              priority === 'Priority' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Priority
          </button>
        </div>
      </div>

      {/* Summary Cost Card */}
      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-blue-700 font-semibold">
            Estimated Cost Breakdown
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
            <span>{totalPrints} total sides</span>
            <span aria-hidden="true">·</span>
            <span>{paperSize} {colorMode}</span>
            {duplex === 'Double-sided' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">10% Eco Discount</span>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
            ${totalCost.toFixed(2)}
          </span>
          <p className="text-[11px] text-slate-500">Charge to campus/user balance</p>
        </div>
      </div>

      {/* Submission Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting to Spooler...</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              <span>Create Print Order</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
