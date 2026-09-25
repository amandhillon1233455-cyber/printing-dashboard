import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Printer,
  Bot,
  BookOpen,
  BarChart3,
  Settings,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'documents'
  | 'orders'
  | 'assistant'
  | 'knowledge'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onGoToLanding?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'documents' as NavTab, label: 'Documents', icon: FileText },
  { id: 'orders' as NavTab, label: 'Print Orders', icon: Printer },
  { id: 'assistant' as NavTab, label: 'AI Assistant', icon: Bot, isSpecial: true },
  { id: 'knowledge' as NavTab, label: 'Knowledge Base', icon: BookOpen },
  { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
  { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onGoToLanding,
}) => {
  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div
          onClick={onGoToLanding}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Return to Landing Page"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold tracking-tight shadow-xs group-hover:bg-blue-700 transition-colors">
            P
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-slate-900 tracking-tight">
              PrintAI
            </span>
            <span className="text-[10px] uppercase font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-semibold">
              OS
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.isSpecial && (
                <span className="text-[10px] text-blue-600 font-mono font-medium flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  RAG
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status / Quick Info Box */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Spooler Engine</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">n8n Automation</span>
            <span className="text-slate-700 font-mono">Active</span>
          </div>
        </div>

        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            className="w-full mt-3 text-center text-xs text-slate-500 hover:text-blue-600 font-medium py-1 transition-colors flex items-center justify-center gap-1"
          >
            <span>Landing Overview</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 z-20">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
