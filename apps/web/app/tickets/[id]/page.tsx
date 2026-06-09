'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import TicketTimeline from '@/components/TicketTimeline';
import TicketMetadata from '@/components/TicketMetadata';

interface TicketDetail {
  id: string;
  ticketNumber: number;
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
    author: { id: string; name: string };
    createdAt: string;
  }>;
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      const data = await api.get<TicketDetail>(`/api/tickets/${ticketId}`);
      setTicket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleTimelineAddFollowup = async (message: string, isInternal: boolean) => {
    try {
      await api.post(`/api/tickets/${ticketId}/followups`, { message, isInternal });
      await loadTicket();
    } catch (err) {
      console.error('Erro ao adicionar followup:', err);
    }
  };

  const handleMetadataUpdate = async (field: string, value: any) => {
    try {
      const updateData: Record<string, any> = {};
      updateData[field] = value;
      await api.patch(`/api/tickets/${ticketId}`, updateData);
      await loadTicket();
    } catch (err) {
      console.error('Erro ao atualizar:', err);
    }
  };

  const handleSolve = async (solution: string) => {
    try {
      await api.post(`/api/tickets/${ticketId}/followups`, { message: `**Solução:**\n${solution}`, isInternal: false });
      await api.patch(`/api/tickets/${ticketId}`, { status: 'CLOSED' });
      await loadTicket();
    } catch (err) {
      console.error('Erro ao solucionar:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/tickets/${ticketId}`);
      router.push('/tickets');
    } catch (err) {
      console.error('Erro ao deletar:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center gap-4">
        <Link href="/tickets" className="text-blue-400 hover:text-blue-300">
          ← Voltar
        </Link>
        <h1 className="text-lg font-bold text-white">#{ticket?.ticketNumber}</h1>
      </div>

      {/* Main content - Split layout 70/30 */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left side - Timeline (70%) */}
        <div className="flex-1 border-r border-slate-700 p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center text-slate-400">Carregando...</div>
          ) : error || !ticket ? (
            <div className="text-red-400">{error || 'Ticket não encontrado'}</div>
          ) : (
            <TicketTimeline
              followups={ticket.followups}
              onAddFollowup={handleTimelineAddFollowup}
              loading={loading}
            />
          )}
        </div>

        {/* Right side - Metadata (30%) */}
        <div className="w-96 bg-slate-900 p-6 overflow-y-auto border-l border-slate-700">
          {loading ? (
            <div className="text-center text-slate-400">Carregando...</div>
          ) : error || !ticket ? (
            <div className="text-red-400">{error || 'Ticket não encontrado'}</div>
          ) : (
            <TicketMetadata
              ticket={ticket}
              onUpdate={handleMetadataUpdate}
              onDelete={handleDelete}
              onSolve={handleSolve}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
