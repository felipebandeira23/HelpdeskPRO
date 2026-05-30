'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
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
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter.toUpperCase();
      const params = new URLSearchParams();
      if (status) params.append('status', status);

      const data = await api.get<any>(`/api/tickets?${params}`);
      setTickets(data.data || []);
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

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
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
        
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            ≡ Lista
          </button>
          <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
            ◫ Kanban
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Carregando tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Nenhum ticket encontrado</div>
      ) : viewMode === 'list' ? (
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
          <table className="w-full">
            <thead className="bg-slate-800/80 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">ID</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">Título do Chamado</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">Status</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">Prioridade</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">SLA Progresso</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-800/60 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                    <Link href={`/tickets/${ticket.id}`} className="hover:text-blue-400 transition-colors">
                      #{ticket.id.slice(0, 6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-200 font-medium">
                    <Link href={`/tickets/${ticket.id}`} className="hover:text-blue-400 transition-colors">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border border-transparent ${
                      ticket.status === 'OPEN' ? 'bg-blue-900/30 text-blue-400 border-blue-700/30' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/30' :
                      ticket.status === 'CLOSED' ? 'bg-green-900/30 text-green-400 border-green-700/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-bold text-[11px] uppercase ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${ticket.progress > 80 ? 'bg-red-500' : ticket.progress > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${ticket.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{ticket.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {ticket.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center text-[10px] text-blue-200 font-bold" title={ticket.assignedTo.name}>
                          {ticket.assignedTo.name.substring(0,2).toUpperCase()}
                        </div>
                        <span className="text-slate-300">{ticket.assignedTo.name.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-xs">Não atribuído</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[60vh]">
          {['OPEN', 'IN_PROGRESS', 'CLOSED'].map(statusCol => {
            const colTickets = tickets.filter(t => t.status === statusCol);
            return (
              <div key={statusCol} className="flex-1 min-w-[320px] bg-slate-900/40 rounded-xl border border-slate-700/50 flex flex-col">
                <div className={`p-4 border-t-4 rounded-t-xl bg-slate-800/60 ${statusCol === 'OPEN' ? 'border-blue-500' : statusCol === 'IN_PROGRESS' ? 'border-yellow-500' : 'border-green-500'}`}>
                  <h3 className="text-white font-bold flex items-center gap-2">
                    {statusCol === 'OPEN' ? 'Novos / Abertos' : statusCol === 'IN_PROGRESS' ? 'Em Andamento' : 'Concluídos'}
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{colTickets.length}</span>
                  </h3>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {colTickets.map(ticket => (
                    <div key={ticket.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-500 transition-colors shadow-lg shadow-black/20 cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                          ticket.priority === 'URGENT' ? 'bg-red-900/30 text-red-400 border-red-700/30' :
                          ticket.priority === 'HIGH' ? 'bg-orange-900/30 text-orange-400 border-orange-700/30' :
                          ticket.priority === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/30' :
                          'bg-blue-900/30 text-blue-400 border-blue-700/30'
                        }`}>
                          {ticket.priority}
                        </span>
                        <Link href={`/tickets/${ticket.id}`} className="text-xs text-slate-500 hover:text-blue-400">#{ticket.id.slice(0,6)}</Link>
                      </div>
                      <Link href={`/tickets/${ticket.id}`} className="block">
                        <h4 className="text-slate-200 font-medium mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">{ticket.title}</h4>
                      </Link>
                      
                      {/* SLA Progress Bar Mini */}
                      <div className="w-full h-1 bg-slate-700 rounded-full mb-4 overflow-hidden">
                        <div className={`h-full ${ticket.progress > 80 ? 'bg-red-500' : ticket.progress > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${ticket.progress}%` }}></div>
                      </div>

                      <div className="flex justify-between items-center mt-2 border-t border-slate-700/50 pt-3">
                        {ticket.assignedTo ? (
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white" title={ticket.assignedTo.name}>
                            {ticket.assignedTo.name.substring(0,2).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-dashed border-slate-500 flex items-center justify-center text-slate-500 text-xs" title="Sem atribuição">?</div>
                        )}
                        <span className="text-[10px] text-slate-500">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                  {colTickets.length === 0 && (
                     <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-lg">Nenhum ticket</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
