import React, { useState } from 'react';
import { PrintOrder, updateOrderStatus, StatusLog } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { Modal } from './Modal';
import { useToast } from './Toast';
import {
  Clock,
  ArrowRight,
  Printer,
  CheckCircle2,
  FileText,
  User,
  Workflow,
  Loader2,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: PrintOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: (updated: PrintOrder) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}) => {
  const { showToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  if (!order) return null;

  const currentStatus = order.status;
  const validTransitions: Record<string, ('Pending' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled')[]> = {
    Pending: ['Processing', 'Cancelled'],
    Processing: ['Ready', 'Cancelled'],
    Ready: ['Completed', 'Cancelled'],
    Completed: [],
    Cancelled: ['Pending'],
  };

  const nextOptions = validTransitions[currentStatus] || ['Pending', 'Processing', 'Ready', 'Completed', 'Cancelled'];

  const handleStatusChange = async (newStatus: 'Pending' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled') => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatus(order.order_id, newStatus, 'Admin (PrintAI Operations)');
      showToast(`Status transitioned to ${newStatus}. n8n webhook triggered.`, 'success');
      onOrderUpdated(res.order);
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadStub = () => {
    const text = `PrintAI Job Receipt: ${order.order_id}\nFile: ${order.document_name}\nCopies: ${order.copies}\nPaper: ${order.paper_size}\nColor: ${order.color_mode}\nDuplex: ${order.duplex}\nStatus: ${order.status}\nCost: $${order.estimated_cost.toFixed(2)}`;
    const element = document.createElement('a');
    element.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    element.download = `receipt_${order.order_id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Print Job ${order.order_id}`}
      subtitle={`Created ${new Date(order.created_at).toLocaleString()}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Status Lifecycle Banner */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Spooler State
            </span>
            <StatusBadge status={order.status} size="md" />
          </div>

          {/* Quick status stepper */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
            {(['Pending', 'Processing', 'Ready', 'Completed'] as const).map((step, idx) => {
              const stages = ['Pending', 'Processing', 'Ready', 'Completed'];
              const currentIdx = stages.indexOf(order.status);
              const isPast = currentIdx >= idx && order.status !== 'Cancelled';
              const isCurrent = order.status === step;

              return (
                <div key={step} className="flex-1 flex flex-col items-center text-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono mb-1 ${
                      isPast
                        ? 'bg-blue-600 text-white font-bold'
                        : isCurrent
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-[11px] ${isPast || isCurrent ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {order.status === 'Cancelled' && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Job was marked as cancelled. Quota refund processed.</span>
            </div>
          )}
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Copies</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums text-sm">
              {order.copies}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Paper Size</span>
            <span className="font-semibold text-slate-900">{order.paper_size}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Color Mode</span>
            <span className="font-semibold text-slate-900">{order.color_mode}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Duplex / Sides</span>
            <span className="font-semibold text-slate-900">{order.duplex}</span>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="space-y-2 text-xs divide-y divide-slate-100">
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Document File</span>
            <span className="font-medium text-slate-900 truncate max-w-xs">{order.document_name}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Document ID</span>
            <span className="font-mono text-slate-700">{order.document_id}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Requested By</span>
            <span className="font-medium text-slate-900">{order.user_name}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Total Page Output</span>
            <span className="font-mono tabular-nums text-slate-900">{order.total_prints} printed sides</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Priority Level</span>
            <span className={`font-semibold ${order.priority === 'Priority' ? 'text-amber-700' : 'text-slate-700'}`}>
              {order.priority}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Estimated Cost</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
              ${order.estimated_cost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Admin Action: Change Status (triggers n8n) */}
        <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-900">Admin Status Controls & n8n Dispatch</p>
              <p className="text-[11px] text-slate-500">Transitioning status dispatches webhook payload to n8n automation engine.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {(['Pending', 'Processing', 'Ready', 'Completed', 'Cancelled'] as const).map((st) => (
              <button
                key={st}
                disabled={isUpdating || order.status === st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  order.status === st
                    ? 'bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-white hover:bg-blue-600 hover:text-white border-slate-200 text-slate-700 shadow-xs'
                }`}
              >
                Mark as {st}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleDownloadStub}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Job Receipt
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
