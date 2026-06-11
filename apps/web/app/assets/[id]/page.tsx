'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  PageHeader,
  Section,
  ErrorBanner,
  Skeleton,
  EmptyState,
  StatusBadge,
  PriorityBadge,
} from '@/components/ui';

interface Asset {
  id: string;
  hostname: string;
  ip: string | null;
  manufacturer: string | null;
  model: string | null;
  os: string | null;
  agentStatus: string;
  lastSeen: string | null;
  createdAt: string;
}

interface TicketRow {
  id: string;
  ticketNumber: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [a, t] = await Promise.all([
        api.get<Asset>(`/api/assets/${assetId}`),
        api.get<TicketRow[]>(`/api/assets/${assetId}/tickets`),
      ]);
      setAsset(a);
      setTickets(Array.isArray(t) ? t : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ativo');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-6">
        <ErrorBanner message={error || 'Ativo não encontrado'} />
        <Link href="/assets" className="text-blue-400 hover:text-blue-300 text-sm">
          ← Voltar ao inventário
        </Link>
      </div>
    );
  }

  const specs: [string, string][] = [
    ['IP', asset.ip || '—'],
    ['Fabricante', asset.manufacturer || '—'],
    ['Modelo', asset.model || '—'],
    ['Sistema operacional', asset.os || '—'],
    ['Status do agente', asset.agentStatus],
    [
      'Visto por último',
      asset.lastSeen ? new Date(asset.lastSeen).toLocaleString('pt-BR') : 'Nunca',
    ],
    ['Cadastrado em', new Date(asset.createdAt).toLocaleDateString('pt-BR')],
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link href="/assets" className="text-blue-400 hover:text-blue-300 text-sm">
          ← Inventário
        </Link>
        <PageHeader title={asset.hostname} subtitle="Detalhe do ativo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Section title="Especificações">
          <dl className="space-y-3">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 text-sm">
                <dt className="text-slate-400">{k}</dt>
                <dd className="text-slate-200 text-right tnum">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title={`Tickets vinculados (${tickets.length})`} className="lg:col-span-2">
          {tickets.length === 0 ? (
            <EmptyState
              icon="🎫"
              title="Nenhum ticket vinculado"
              description="Tickets abertos para este dispositivo aparecerão aqui."
            />
          ) : (
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/tickets/${t.id}`}
                    className="flex items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-lg px-4 py-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-slate-500 text-xs tnum mr-2">
                        #{t.ticketNumber}
                      </span>
                      <span className="text-slate-200 text-sm truncate">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
    </div>
  );
}
