'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreateTicketModal } from '@/components/CreateTicketModal';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  requester: { name: string };
  assignedTo: { name: string } | null;
  createdAt: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all');

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter.toUpperCase();
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setTickets(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadTickets();
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      WAITING: 'bg-purple-100 text-purple-800',
      CLOSED: 'bg-green-100 text-green-800',
      PAUSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-blue-400',
      MEDIUM: 'text-yellow-400',
      HIGH: 'text-orange-400',
      URGENT: 'text-red-400',
    };
    return colors[priority] || 'text-gray-400';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tickets</h1>
          <p className="text-slate-400">Gerencie seus chamados de suporte</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + Novo Ticket
        </button>
      </div>

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      <div className="flex gap-4 mb-6">
        {(['all', 'open', 'in-progress', 'closed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {f === 'all' ? 'Todos' : f.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Carregando tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Nenhum ticket encontrado</div>
      ) : (
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Título</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Prioridade</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Progresso</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {ticket.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-200">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="hover:text-blue-400"
                    >
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${ticket.progress}%` }}
                        />
                      </div>
                      <span>{ticket.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {ticket.assignedTo?.name || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
