'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { DonutChart } from '@/components/DonutChart';
import {
  PageHeader,
  Panel,
  Spinner,
  StatCard,
  StatusBadge,
  PriorityBadge,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/components/ui'; // STATUS_LABELS e PRIORITY_LABELS vêm daqui

interface DashboardStats {
  ticketsOpen: number;
  users: number;
  groups: number;
  assets: number;
}

interface Metrics {
  total_tickets: number;
  open_tickets: number;
  closed_tickets: number;
  by_status: { status: string; count: number }[];
  by_priority: { priority: string; count: number }[];
  close_rate: number;
}

interface RecentTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  requester?: { name: string };
  createdAt: string;
}

interface SLAItem {
  id: string;
  ticket: { id: string; title: string };
}

// Cores para gráficos (convertem status/priority em hex para DonutChart)
const STATUS_COLORS: Record<string, string> = {
  OPEN: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  WAITING: '#a855f7',
  PAUSED: '#64748b',
  CLOSED: '#10b981',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#f97316',
  URGENT: '#ef4444',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [breached, setBreached] = useState<SLAItem[]>([]);
  const [warning, setWarning] = useState<SLAItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, metricsData, ticketsData, breachedData, warningData] =
        await Promise.allSettled([
          api.get<DashboardStats>('/api/stats/dashboard'),
          api.get<Metrics>('/api/dashboard/metrics'),
          api.get<RecentTicket[]>('/api/stats/recent-tickets?limit=6'),
          api.get<SLAItem[]>('/api/dashboard/sla/breached'),
          api.get<SLAItem[]>('/api/dashboard/sla/warning'),
        ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (metricsData.status === 'fulfilled') setMetrics(metricsData.value);
      if (ticketsData.status === 'fulfilled')
        setRecentTickets(
          Array.isArray(ticketsData.value) ? ticketsData.value : [],
        );
      if (breachedData.status === 'fulfilled')
        setBreached(Array.isArray(breachedData.value) ? breachedData.value : []);
      if (warningData.status === 'fulfilled')
        setWarning(Array.isArray(warningData.value) ? warningData.value : []);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <PageHeader title="Dashboard" subtitle="Bem-vindo ao HelpdeskPRO" />
        <Spinner />
      </div>
    );
  }

  const statusSlices =
    metrics?.by_status
      .filter((s) => s.count > 0)
      .map((s) => ({
        label: STATUS_LABELS[s.status] || s.status,
        value: s.count,
        color: STATUS_COLORS[s.status] || '#64748b',
      })) || [];

  const prioritySlices =
    metrics?.by_priority
      .filter((p) => p.count > 0)
      .map((p) => ({
        label: PRIORITY_LABELS[p.priority] || p.priority,
        value: p.count,
        color: PRIORITY_COLORS[p.priority] || '#64748b',
      })) || [];

  const pausedCount =
    metrics?.by_status.find((s) => s.status === 'PAUSED')?.count || 0;

  return (
    <div className="p-8">
      <PageHeader title="Dashboard" subtitle="Visão geral em tempo real" />

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tickets Abertos"
          value={stats?.ticketsOpen ?? 0}
          icon="🎫"
          accent="bg-blue-600"
        />
        <StatCard
          title="Total de Tickets"
          value={metrics?.total_tickets ?? 0}
          icon="📋"
          accent="bg-cyan-600"
        />
        <StatCard
          title="Usuários"
          value={stats?.users ?? 0}
          icon="👥"
          accent="bg-purple-600"
        />
        <StatCard
          title="Ativos"
          value={stats?.assets ?? 0}
          icon="💻"
          accent="bg-orange-600"
        />
      </div>

      {/* Painel SLA semáforo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SLAPanel
          title="Prestes a Estourar"
          count={warning.length}
          color="amber"
          icon="⚠️"
          items={warning}
        />
        <SLAPanel
          title="SLA Estourado"
          count={breached.length}
          color="red"
          icon="🔴"
          items={breached}
        />
        <SLAPanel
          title="Pausados"
          count={pausedCount}
          color="slate"
          icon="⏸️"
          items={[]}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Panel>
          <h2 className="text-lg font-bold text-white mb-4">
            Tickets por Status
          </h2>
          {statusSlices.length > 0 ? (
            <DonutChart slices={statusSlices} />
          ) : (
            <p className="text-slate-500 text-sm py-8 text-center">
              Sem dados ainda
            </p>
          )}
        </Panel>
        <Panel>
          <h2 className="text-lg font-bold text-white mb-4">
            Tickets por Prioridade
          </h2>
          {prioritySlices.length > 0 ? (
            <DonutChart slices={prioritySlices} />
          ) : (
            <p className="text-slate-500 text-sm py-8 text-center">
              Sem dados ainda
            </p>
          )}
        </Panel>
      </div>

      {/* Tickets recentes */}
      <Panel>
        <h2 className="text-lg font-bold text-white mb-4">Tickets Recentes</h2>
        {recentTickets.length === 0 ? (
          <div className="text-slate-400 text-center py-8">
            Nenhum ticket ainda. Volte em breve!
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="py-4 flex items-center justify-between hover:bg-slate-800/50 px-4 -mx-4 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 font-medium truncate">
                    {ticket.title}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Por {ticket.requester?.name || 'Desconhecido'}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function SLAPanel({
  title,
  count,
  color,
  icon,
  items,
}: {
  title: string;
  count: number;
  color: 'amber' | 'red' | 'slate';
  icon: string;
  items: SLAItem[];
}) {
  const borderColor = {
    amber: 'border-amber-600/40',
    red: 'border-red-600/40',
    slate: 'border-slate-600/40',
  }[color];

  const textColor = {
    amber: 'text-amber-400',
    red: 'text-red-400',
    slate: 'text-slate-400',
  }[color];

  return (
    <div className={`bg-slate-900 rounded-lg border ${borderColor} p-6`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-300 text-sm font-medium">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-4xl font-bold ${textColor} mb-3`}>{count}</p>
      <div className="space-y-1">
        {items.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            href={`/tickets/${item.ticket.id}`}
            className="block text-xs text-slate-400 hover:text-slate-200 truncate"
          >
            • {item.ticket.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
