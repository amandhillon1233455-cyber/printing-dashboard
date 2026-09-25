import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Layers,
  FileCheck,
  RefreshCw,
  Printer,
  DollarSign,
} from 'lucide-react';
import { getAnalytics, AnalyticsData } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading live analytics...
      </div>
    );
  }

  const { summary, paper_distribution, color_distribution, daily_activity } = data;

  const totalPaper = (paper_distribution.A4 || 0) + (paper_distribution.A3 || 0) + (paper_distribution.Letter || 0) || 1;
  const a4Pct = Math.round(((paper_distribution.A4 || 0) / totalPaper) * 100);
  const a3Pct = Math.round(((paper_distribution.A3 || 0) / totalPaper) * 100);
  const letterPct = Math.round(((paper_distribution.Letter || 0) / totalPaper) * 100);

  const totalColor = (color_distribution.color || 0) + (color_distribution.bw || 0) || 1;
  const colorPct = Math.round(((color_distribution.color || 0) / totalColor) * 100);
  const bwPct = Math.round(((color_distribution.bw || 0) / totalColor) * 100);

  const maxDailyPrints = Math.max(...daily_activity.map((d) => d.prints), 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Operational Analytics & Audit
          </h2>
          <p className="text-xs text-slate-500">
            Real-time throughput metrics, paper size distributions, and automated spooler logs.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Orders
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {summary.total_orders}
          </p>
          <p className="text-[11px] text-slate-400">All lifetime print jobs</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Output Pages
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-blue-600">
            {summary.total_prints.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">Printed sides delivered</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Estimated Revenue
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            ${summary.total_revenue.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400">Quota debit balance</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Jobs
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-amber-600">
            {summary.pending_orders + summary.processing_orders}
          </p>
          <p className="text-[11px] text-slate-400">In spooler & laser stages</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Print Volume Activity (Bar Chart) */}
        <div className="lg:col-span-8 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Print Volume Over Time</h3>
              <p className="text-xs text-slate-500">Daily physical sheets printed across campus</p>
            </div>
            <span className="text-xs text-blue-600 font-semibold font-mono">
              7-Day Throughput
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {daily_activity.map((item) => {
              const heightPct = Math.round((item.prints / maxDailyPrints) * 100);

              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[11px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.prints}
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-md h-36 flex items-end">
                    <div
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-all rounded-t-md"
                      style={{ height: `${Math.max(12, heightPct)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 font-mono">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paper Distribution Breakdown */}
        <div className="lg:col-span-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Format & Color Breakdown</h3>
            <p className="text-xs text-slate-500">Hardware tray utilization</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Paper sizes */}
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>A4 Standard</span>
                <span className="font-mono">{a4Pct}% ({paper_distribution.A4 || 0})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${a4Pct}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>A3 Format</span>
                <span className="font-mono">{a3Pct}% ({paper_distribution.A3 || 0})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${a3Pct}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>US Letter</span>
                <span className="font-mono">{letterPct}% ({paper_distribution.Letter || 0})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${letterPct}%` }} />
              </div>
            </div>

            {/* Color vs BW */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700">Monochrome B&W: {bwPct}%</span>
                <span className="text-blue-600">Color CMYK: {colorPct}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden flex">
                <div className="bg-slate-800 h-2" style={{ width: `${bwPct}%` }} />
                <div className="bg-blue-600 h-2" style={{ width: `${colorPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
