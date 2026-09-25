import React, { useState, useEffect } from 'react';
import {
  Printer,
  Clock,
  RotateCw,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
  Plus,
  Bot,
  Filter,
} from 'lucide-react';
import { StatsCard } from '../components/StatsCard';
import { OrderTable } from '../components/OrderTable';
import { PrintOrder, getOrders, getAnalytics, AnalyticsData } from '../services/api';

interface DashboardPageProps {
  onOpenUpload: () => void;
  onNavigateToAssistant: () => void;
  onNavigateToOrders: () => void;
  searchQuery: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenUpload,
  onNavigateToAssistant,
  onNavigateToOrders,
  searchQuery,
}) => {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [fetchedOrders, fetchedAnalytics] = await Promise.all([
        getOrders(statusFilter, searchQuery),
        getAnalytics(),
      ]);
      setOrders(fetchedOrders);
      setAnalytics(fetchedAnalytics);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [statusFilter, searchQuery]);

  const summary = analytics?.summary || {
    total_orders: orders.length,
    pending_orders: orders.filter((o) => o.status === 'Pending').length,
    processing_orders: orders.filter((o) => o.status === 'Processing').length,
    ready_orders: orders.filter((o) => o.status === 'Ready').length,
    completed_orders: orders.filter((o) => o.status === 'Completed').length,
    cancelled_orders: orders.filter((o) => o.status === 'Cancelled').length,
    total_documents: 4,
    total_prints: orders.reduce((sum, o) => sum + o.total_prints, 0),
    total_revenue: orders.reduce((sum, o) => sum + o.estimated_cost, 0),
  };

  return (
    <div className="space-y-6">
      {/* Primary Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Orders"
          value={summary.total_orders}
          subtitle="Cumulative queued jobs"
          icon={Printer}
          trend={{ value: '+14% this week', positive: true }}
          onClick={onNavigateToOrders}
        />
        <StatsCard
          title="Pending Queue"
          value={summary.pending_orders}
          subtitle="Awaiting spooler release"
          icon={Clock}
          onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending')}
        />
        <StatsCard
          title="Processing"
          value={summary.processing_orders}
          subtitle="Active print engine"
          icon={RotateCw}
          onClick={() => setStatusFilter(statusFilter === 'Processing' ? 'All' : 'Processing')}
        />
        <StatsCard
          title="Completed"
          value={summary.completed_orders}
          subtitle="Dispatched and archived"
          icon={CheckCircle2}
          trend={{ value: '99.4% SLA', positive: true }}
          onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'All' : 'Completed')}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Documents</p>
              <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {summary.total_documents}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">10 MB limit</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Prints Produced</p>
              <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {summary.total_prints.toLocaleString()}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Laser Grade</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Billed Revenue</p>
              <p className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                ${summary.total_revenue.toFixed(2)}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Auto-ledgered</span>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">
              Instant Dispatch
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight">
            Need high-speed print release or policy answers?
          </h3>
          <p className="text-xs text-blue-100">
            Upload any PDF or ask our Gemini RAG Assistant about paper size constraints and rates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onNavigateToAssistant}
            className="px-4 py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Recent Print Orders
            </h3>
            <p className="text-xs text-slate-500">
              Live print queue synchronized with MongoDB collection and n8n triggers.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start text-xs">
            {(['All', 'Pending', 'Processing', 'Ready', 'Completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <OrderTable
          orders={orders}
          onOrdersChanged={loadDashboardData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
