'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TicketTimeline from '@/components/TicketTimeline';
import TicketMetadata from '@/components/TicketMetadata';

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
      setStatusValue(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ticket');
    } finally {
      setLoading(false);
    }
  };



  const handleTimelineAddFollowup = async (message: string, isInternal: boolean) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}/followups`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ message, isInternal }),
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao adicionar acompanhamento');
      }

      await loadTicket();
    } catch (err) {
      console.error('Erro ao adicionar followup:', err);
    }
  };

  const handleMetadataUpdate = async (field: string, value: any) => {
    try {
      const updateData: Record<string, any> = {};
      updateData[field] = value;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/${ticketId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar ticket');
      }

      await loadTicket();
    } catch (err) {
      console.error('Erro ao atualizar:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center gap-4">
        <Link href="/tickets" className="text-blue-400 hover:text-blue-300">
          ← Voltar
        </Link>
        <h1 className="text-lg font-bold text-white">#{ticket?.id}</h1>
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
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
