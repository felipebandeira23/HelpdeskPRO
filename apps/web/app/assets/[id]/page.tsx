'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  PageHeader,
  Panel,
  Spinner,
  EmptyState,
  ErrorBanner,
  StatusBadge,
  PriorityBadge,
} from '@/components/ui';

interface Asset {
  id: string;
  hostname: string;
  ip?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  os?: string | null;
  agentStatus: string;
  lastSeen?: string | null;
}

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.id as string;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([
      api.get<Asset>(`/api/assets/${assetId}`),
      api.get<Ticket[]>(`/api/assets/${assetId}/tickets`),
    ])
      .then(([assetRes, ticketsRes]) => {
        if (assetRes.status === 'fulfilled') setAsset(assetRes.value);
        else setError(assetRes.reason?.message || 'Erro ao carregar ativo');
        if (ticketsRes.status === 'fulfilled')
          setTickets(
            Array.isArray(ticketsRes.value) ? ticketsRes.value : [],
          );
      })
      .finally(() => setLoading(false));
  }, [assetId]);

  if (loading) {
    return (
      <div className="p-8">
        <Spinner />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-8">
        <ErrorBanner message={error || 'Ativo não encontrado'} />
        <Link href="/assets" className="text-blue-400 hover:text-blue-300">
          ← Voltar para Inventário
        </Link>
      </div>
    );
  }

  const fields = [
    { label: 'Hostname', value: asset.hostname },
    { label: 'Endereço IP', value: asset.ip || '—' },
    { label: 'Fabricante', value: asset.manufacturer || '—' },
    { label: 'Modelo', value: asset.model || '—' },
    { label: 'Sistema Operacional', value: asset.os || '—' },
    {
      label: 'Status do Agente',
      value:
        asset.agentStatus === 'ONLINE'
          ? 'Online'
          : asset.agentStatus === 'OFFLINE'
          ? 'Offline'
          : 'Desconhecido',
    },
    {
      label: 'Visto por último',
      value: asset.lastSeen
        ? new Date(asset.lastSeen).toLocaleString('pt-BR')
        : '—',
    },
  ];

  return (
    <div className="p-8">
      <Link
        href="/assets"
        className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block"
      >
        ← Voltar para Inventário
      </Link>

      <PageHeader title={asset.hostname} subtitle="Detalhe do dispositivo" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-1">
          <h2 className="text-lg font-bold text-white mb-4">Informações</h2>
          <dl className="space-y-3">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-xs text-slate-500">{f.label}</dt>
                <dd className="text-sm text-slate-200">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel className="lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4">
            Histórico de Tickets ({tickets.length})
          </h2>
          {tickets.length === 0 ? (
            <EmptyState
              icon="🎫"
              title="Nenhum ticket vinculado"
              description="Tickets abertos a partir deste dispositivo aparecem aqui."
            />
          ) : (
            <div className="divide-y divide-slate-700">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="py-4 flex items-center justify-between hover:bg-slate-800/50 px-4 -mx-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium truncate">
                      {ticket.title}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {new Date(ticket.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
