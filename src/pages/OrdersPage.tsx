import React, { useState, useEffect } from 'react';
import {
  Printer,
  Filter,
  RefreshCw,
  Plus,
  Clock,
  RotateCw,
  CheckCircle2,
  Workflow,
  Download,
} from 'lucide-react';
import { PrintOrder, getOrders } from '../services/api';
import { OrderTable } from '../components/OrderTable';

interface OrdersPageProps {
  onOpenUpload: () => void;
  searchQuery: string;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ onOpenUpload, searchQuery }) => {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getOrders(activeTab, searchQuery);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, searchQuery]);

  const tabs = ['All', 'Pending', 'Processing', 'Ready', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Print Order Management
          </h2>
          <p className="text-xs text-slate-500">
            Real-time spooler queue with automated n8n webhook dispatch on state transitions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchOrders}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Print Job</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <OrderTable
        orders={orders}
        onOrdersChanged={fetchOrders}
        isLoading={isLoading}
      />
    </div>
  );
};
