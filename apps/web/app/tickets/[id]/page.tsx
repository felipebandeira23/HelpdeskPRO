'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface TicketDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  requester: { id: string; name: string; email: string };
  assignedTo: { id: string; name: string; email: string } | null;
  group: { id: string; name: string } | null;
  asset: { id: string; hostname: string } | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  followups: Array<{
    id: string;
    message: string;
    isInternal: boolean;
    author: { name: string };
    createdAt: string;
  }>;
}

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Ticket não encontrado');
      }

      const data = await response.json();
      setTicket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ticket');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Carregando...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-6">
          {error || 'Ticket não encontrado'}
        </div>
        <Link href="/tickets" className="text-blue-400 hover:text-blue-300">
          ← Voltar para tickets
        </Link>
      </div>
    );
  }

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

  return (
    <div className="p-8">
      <Link href="/tickets" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
        ← Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{ticket.title}</h1>
                <p className="text-slate-400 text-sm font-mono">{ticket.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>

            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-slate-200 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Seguimentos</h2>
              {ticket.followups.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  Nenhum acompanhamento ainda
                </p>
              ) : (
                <div className="space-y-3">
                  {ticket.followups.map((followup) => (
                    <div
                      key={followup.id}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-200">
                          {followup.author.name}
                        </span>
                        {followup.isInternal && (
                          <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded">
                            Nota interna
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm">
                        {followup.message}
                      </p>
                      <p className="text-slate-500 text-xs mt-2">
                        {new Date(followup.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 sticky top-24 space-y-6">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
                Status
              </label>
              <select
                value={ticket.status}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="OPEN">Aberto</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="WAITING">Aguardando</option>
                <option value="PAUSED">Pausado</option>
                <option value="CLOSED">Fechado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
                Prioridade
              </label>
              <p className="text-slate-200 capitalize">{ticket.priority}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
                Progresso
              </label>
              <div className="space-y-2">
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${ticket.progress}%` }}
                  />
                </div>
                <p className="text-slate-300 text-sm">{ticket.progress}%</p>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
                Solicitante
              </label>
              <p className="text-slate-200">{ticket.requester.name}</p>
              <p className="text-slate-400 text-sm">{ticket.requester.email}</p>
            </div>

            {ticket.assignedTo && (
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
                  Atribuído a
                </label>
                <p className="text-slate-200">{ticket.assignedTo.name}</p>
              </div>
            )}

            {ticket.group && (
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
                  Grupo
                </label>
                <p className="text-slate-200">{ticket.group.name}</p>
              </div>
            )}

            {ticket.asset && (
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
                  Ativo
                </label>
                <p className="text-slate-200">{ticket.asset.hostname}</p>
              </div>
            )}

            <div className="border-t border-slate-700 pt-4 space-y-2 text-xs text-slate-400">
              <p>Criado: {new Date(ticket.createdAt).toLocaleString('pt-BR')}</p>
              <p>Atualizado: {new Date(ticket.updatedAt).toLocaleString('pt-BR')}</p>
              {ticket.closedAt && (
                <p>Fechado: {new Date(ticket.closedAt).toLocaleString('pt-BR')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
