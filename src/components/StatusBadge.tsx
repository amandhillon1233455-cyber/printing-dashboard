import React from 'react';

export type OrderStatus = 'Pending' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled';

interface StatusBadgeProps {
  status: OrderStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const norm = status.toLowerCase();

  let dotColor = 'bg-slate-400';
  let textColor = 'text-slate-700';

  if (norm === 'pending') {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-800';
  } else if (norm === 'processing') {
    dotColor = 'bg-blue-500 animate-pulse';
    textColor = 'text-blue-800';
  } else if (norm === 'ready') {
    dotColor = 'bg-emerald-500';
    textColor = 'text-emerald-800';
  } else if (norm === 'completed') {
    dotColor = 'bg-slate-600';
    textColor = 'text-slate-800';
  } else if (norm === 'cancelled') {
    dotColor = 'bg-rose-500';
    textColor = 'text-rose-800';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'} ${textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
