import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  Plus,
  CheckCircle2,
  Workflow,
  Clock,
  User,
  Shield,
  ExternalLink,
} from 'lucide-react';
import avatarImg from '../assets/images/avatar_print_admin_1790295940092.jpg';

interface NavbarProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  onToggleMobileSidebar: () => void;
  recentNotifications?: {
    id: string;
    text: string;
    time: string;
    type: 'order' | 'webhook' | 'system';
  }[];
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  searchQuery,
  onSearchChange,
  onOpenUpload,
  onToggleMobileSidebar,
  recentNotifications = [
    {
      id: 'n1',
      text: 'Order ORD-1002 marked Processing (n8n webhook triggered)',
      time: '12m ago',
      type: 'webhook',
    },
    {
      id: 'n2',
      text: 'Order ORD-1003 Completed and archived in MongoDB',
      time: '1h ago',
      type: 'order',
    },
    {
      id: 'n3',
      text: 'Gemini RAG vector cache re-indexed (4 docs)',
      time: '3h ago',
      type: 'system',
    },
  ],
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'staff'>('admin');

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
          {title}
        </h1>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search orders, files, users..."
            className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Upload Document Primary CTA Button */}
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Document</span>
          <span className="sm:hidden">Upload</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications & Webhooks</span>
                <span className="text-[10px] text-blue-600 font-medium">Real-time</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {recentNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-start gap-2">
                      {notif.type === 'webhook' ? (
                        <Workflow className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      ) : notif.type === 'order' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-700 leading-snug font-medium">{notif.text}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{notif.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 text-left rounded-lg hover:bg-slate-100 transition-colors"
          >
            <img
              src={avatarImg}
              alt="Admin Profile"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-slate-800 leading-none">
                Amandeep S.
              </p>
              <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                {userRole === 'admin' ? 'Operations Admin' : 'Campus Staff'}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900">Amandeep S. Dhillon</p>
                <p className="text-[11px] text-slate-500 font-mono">amandhillon1233455@gmail.com</p>
              </div>

              <div className="p-1 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setUserRole(userRole === 'admin' ? 'staff' : 'admin');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-slate-700 flex items-center justify-between"
                >
                  <span>Role: <strong className="capitalize">{userRole}</strong></span>
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
