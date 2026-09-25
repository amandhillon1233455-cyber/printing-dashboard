import React, { useState } from 'react';
import { PrintOrder, deleteOrder, updateOrderStatus } from '../services/api';
import { StatusBadge } from './StatusBadge';
import { OrderDetailsModal } from './OrderDetailsModal';
import { useToast } from './Toast';
import {
  Eye,
  Trash2,
  Download,
  RotateCw,
  MoreHorizontal,
  FileText,
  AlertCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';

interface OrderTableProps {
  orders: PrintOrder[];
  onOrdersChanged: () => void;
  isLoading?: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onOrdersChanged,
  isLoading = false,
}) => {
  const { showToast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<PrintOrder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const handleOpenDetails = (order: PrintOrder) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleQuickStatusCycle = async (order: PrintOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    const cycleMap: Record<string, 'Pending' | 'Processing' | 'Ready' | 'Completed'> = {
      Pending: 'Processing',
      Processing: 'Ready',
      Ready: 'Completed',
      Completed: 'Pending',
      Cancelled: 'Pending',
    };
    const nextStatus = cycleMap[order.status] || 'Processing';

    setUpdatingOrderId(order.order_id);
    try {
      await updateOrderStatus(order.order_id, nextStatus, 'Admin (Quick Toggle)');
      showToast(`${order.order_id} updated: ${order.status} → ${nextStatus}`, 'success');
      onOrdersChanged();
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDelete = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete print order ${orderId}?`)) return;

    try {
      await deleteOrder(orderId);
      showToast(`Order ${orderId} deleted successfully.`, 'info');
      onOrdersChanged();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete order', 'error');
    }
  };

  const handleDownloadStub = (order: PrintOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `PrintAI Job Receipt: ${order.order_id}\nDocument: ${order.document_name}\nCopies: ${order.copies}\nPaper: ${order.paper_size}\nColor: ${order.color_mode}\nDuplex: ${order.duplex}\nPriority: ${order.priority}\nStatus: ${order.status}\nCost: $${order.estimated_cost.toFixed(2)}`;
    const element = document.createElement('a');
    element.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    element.download = `${order.order_id}_receipt.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading print orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-900">No print orders yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Upload a document and configure print parameters to create your first print job.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">File Name</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4 text-center">Copies</th>
              <th className="py-3 px-4">Paper</th>
              <th className="py-3 px-4">Color</th>
              <th className="py-3 px-4">Duplex</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {orders.map((order) => {
              const isUpdating = updatingOrderId === order.order_id;

              return (
                <tr
                  key={order.order_id}
                  onClick={() => handleOpenDetails(order)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Order ID */}
                  <td className="py-3.5 px-4 font-mono font-medium text-blue-600 whitespace-nowrap">
                    {order.order_id}
                  </td>

                  {/* File */}
                  <td className="py-3.5 px-4 max-w-[180px] truncate font-medium text-slate-900">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{order.document_name}</span>
                    </div>
                  </td>

                  {/* User */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {order.user_name}
                  </td>

                  {/* Copies */}
                  <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                    {order.copies}
                  </td>

                  {/* Paper */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {order.paper_size}
                  </td>

                  {/* Color */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {order.color_mode}
                  </td>

                  {/* Duplex */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {order.duplex}
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block text-[11px] font-medium ${
                        order.priority === 'Priority'
                          ? 'text-amber-700 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      {order.priority}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Timestamp */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(order)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        title="View details & logs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleQuickStatusCycle(order, e)}
                        disabled={isUpdating}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Cycle Status (triggers n8n)"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin text-blue-600' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDownloadStub(order, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(order.order_id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Order"
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

      {/* Modal for viewing details / full status history */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedOrder(null);
          }}
          onOrderUpdated={(updated) => {
            setSelectedOrder(updated);
            onOrdersChanged();
          }}
        />
      )}
    </div>
  );
};
