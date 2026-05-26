'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  ticketsOpen: number;
  users: number;
  groups: number;
  assets: number;
}

interface RecentTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  requester: { name: string };
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, ticketsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/dashboard`, {
          headers,
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/recent-tickets?limit=5`, {
          headers,
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setRecentTickets(ticketsData.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Bem-vindo ao HelpdeskPRO</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : stats ? (
          <>
            <Card
              title="Tickets Abertos"
              value={stats.ticketsOpen.toString()}
              icon="🎫"
              color="bg-blue-600"
            />
            <Card
              title="Usuários"
              value={stats.users.toString()}
              icon="👥"
              color="bg-emerald-600"
            />
            <Card
              title="Grupos"
              value={stats.groups.toString()}
              icon="👨‍💼"
              color="bg-purple-600"
            />
            <Card
              title="Ativos"
              value={stats.assets.toString()}
              icon="💻"
              color="bg-orange-600"
            />
          </>
        ) : null}
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Tickets Recentes</h2>
        {loading ? (
          <div className="text-slate-400 text-center py-8">Carregando...</div>
        ) : recentTickets.length === 0 ? (
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
                <div className="flex-1">
                  <p className="text-slate-200 font-medium">{ticket.title}</p>
                  <p className="text-slate-400 text-sm">
                    Por {ticket.requester.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300">
                    {ticket.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

function Card({ title, value, icon, color }: CardProps) {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-3xl ${color} rounded-lg p-3 bg-opacity-10`}>
          {icon}
        </span>
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
      <div className="h-12 bg-slate-800 rounded mb-4 animate-pulse" />
      <div className="h-4 bg-slate-800 rounded mb-3 w-20 animate-pulse" />
      <div className="h-8 bg-slate-800 rounded w-16 animate-pulse" />
    </div>
  );
}
