import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Database,
  Workflow,
  Sparkles,
  Shield,
  Send,
  Loader2,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { getSettingsStatus, triggerN8nWebhook, SettingsStatus } from '../services/api';
import { useToast } from '../components/Toast';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testOrderState, setTestOrderState] = useState<'Pending' | 'Processing' | 'Ready' | 'Completed'>('Processing');

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await getSettingsStatus();
      setStatus(res);
    } catch (err) {
      console.error('Failed to load settings status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestN8n = async () => {
    setIsTestingWebhook(true);
    try {
      const res = await triggerN8nWebhook({
        event: 'order_status_changed',
        order_id: 'ORD-1002',
        old_status: 'Pending',
        new_status: testOrderState,
      });

      showToast(`n8n webhook event dispatched (${res.status || 'OK'})`, 'success');
      fetchStatus();
    } catch (err: any) {
      showToast(err.message || 'Webhook trigger failed', 'error');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  if (isLoading || !status) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
        Loading system environment parameters...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          System Infrastructure & Integrations
        </h2>
        <p className="text-xs text-slate-500">
          Monitor connection states for Google Gemini, MongoDB persistence, and n8n workflow webhooks.
        </p>
      </div>

      {/* Integration Status Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gemini Tile */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                status.gemini.configured ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.gemini.configured ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {status.gemini.status}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Google Gemini</h4>
            <p className="text-xs text-slate-500 mt-0.5">Model: {status.gemini.model}</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            {status.gemini.configured
              ? 'Key verified in server runtime'
              : 'Add GEMINI_API_KEY to .env or Secrets'}
          </div>
        </div>

        {/* MongoDB Tile */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {status.mongodb.status.includes('Connected') ? 'Connected' : 'Active Engine'}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">MongoDB Database</h4>
            <p className="text-xs text-slate-500 mt-0.5">DB: {status.mongodb.database_name}</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            {status.mongodb.collections.length} collections structured
          </div>
        </div>

        {/* n8n Tile */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Workflow className="w-4 h-4" />
            </div>
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                status.n8n.webhook_configured ? 'text-emerald-700' : 'text-blue-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.n8n.webhook_configured ? 'bg-emerald-500' : 'bg-blue-500'
                }`}
              />
              {status.n8n.status}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">n8n Automation</h4>
            <p className="text-xs text-slate-500 mt-0.5">Workflow webhook endpoint</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            {status.n8n.webhook_configured ? 'Live endpoint hooked' : 'Simulation dispatcher ready'}
          </div>
        </div>
      </div>

      {/* Test n8n Webhook Trigger Card */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Workflow className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Test n8n Webhook Dispatcher</h3>
            <p className="text-xs text-slate-500">
              Emit a synthetic print order status change payload to verify external notifications.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 space-y-1">
          <span className="text-slate-400 block">// Outgoing Webhook Payload</span>
          <p>{`{ "event": "order_status_changed", "order_id": "ORD-1002", "old_status": "Pending", "new_status": "${testOrderState}" }`}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">Target status:</span>
            <select
              value={testOrderState}
              onChange={(e) => setTestOrderState(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
            >
              <option value="Processing">Processing</option>
              <option value="Ready">Ready</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={handleTestN8n}
            disabled={isTestingWebhook}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {isTestingWebhook ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Dispatch Test Webhook</span>
          </button>
        </div>
      </div>

      {/* Platform Policies & Upload Rules */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Upload & Parser Specifications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="text-slate-500">Maximum File Size</span>
            <p className="font-bold text-slate-900 text-sm font-mono">
              {status.system.max_file_size_label}
            </p>
            <p className="text-slate-400 text-[11px]">Enforced on client and server</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <span className="text-slate-500">Permitted Formats</span>
            <p className="font-bold text-slate-900 text-sm font-mono">
              {status.system.supported_formats.join(', ')}
            </p>
            <p className="text-slate-400 text-[11px]">Strict MIME & extension guard</p>
          </div>
        </div>
      </div>
    </div>
  );
};
