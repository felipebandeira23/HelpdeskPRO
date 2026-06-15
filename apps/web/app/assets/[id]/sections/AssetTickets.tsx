'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Section, EmptyState, ErrorBanner, StatusBadge, PriorityBadge } from '@/components/ui';

interface TicketRow {
  id: string;
  ticketNumber: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function AssetTickets({ assetId }: { assetId: string }) {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<TicketRow[]>(`/api/assets/${assetId}/tickets`);
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}

      <Section title={`Chamados vinculados (${tickets.length})`}>
        {loading ? (
          <p className="text-slate-400 text-sm">Carregando...</p>
        ) : tickets.length === 0 ? (
          <EmptyState icon="🎫" title="Nenhum chamado vinculado" description="Chamados abertos para este dispositivo aparecerão aqui." />
        ) : (
          <ul className="space-y-2">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tickets/${t.id}`}
                  className="flex items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-lg px-4 py-3 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="text-slate-500 text-xs tnum shrink-0">#{t.ticketNumber}</span>
                    <span className="text-slate-200 text-sm truncate">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500 text-xs hidden md:block">
                      {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
