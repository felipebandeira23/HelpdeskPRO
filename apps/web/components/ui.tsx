'use client';

import { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
        {subtitle && <p className="text-slate-400">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Panel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-slate-900 rounded-lg border border-slate-700 p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon = '📭',
  title,
  description,
}: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-slate-300 font-medium">{title}</p>
      {description && (
        <p className="text-slate-500 text-sm mt-1">{description}</p>
      )}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
      {message}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  WAITING: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  PAUSED: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  CLOSED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Andamento',
  WAITING: 'Aguardando',
  PAUSED: 'Pausado',
  CLOSED: 'Fechado',
};

export function StatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full border font-medium ${style}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-green-500/15 text-green-300 border-green-500/30',
  MEDIUM: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  HIGH: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  URGENT: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export function PriorityBadge({ priority }: { priority: string }) {
  const style =
    PRIORITY_STYLES[priority] ||
    'bg-slate-500/15 text-slate-300 border-slate-500/30';
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full border font-medium ${style}`}
    >
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

export function StatCard({
  title,
  value,
  icon,
  accent = 'bg-blue-600',
}: {
  title: string;
  value: string | number;
  icon: string;
  accent?: string;
}) {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-2xl ${accent} bg-opacity-10 rounded-lg p-3`}>
          {icon}
        </span>
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
