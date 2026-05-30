'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  PageHeader,
  Panel,
  Spinner,
  EmptyState,
  ErrorBanner,
  StatCard,
  Input,
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
  tickets?: { id: string }[];
}

const AGENT_STATUS: Record<string, { label: string; dot: string; text: string }> =
  {
    ONLINE: { label: 'Online', dot: 'bg-emerald-500', text: 'text-emerald-400' },
    OFFLINE: { label: 'Offline', dot: 'bg-red-500', text: 'text-red-400' },
    UNKNOWN: {
      label: 'Desconhecido',
      dot: 'bg-slate-500',
      text: 'text-slate-400',
    },
  };

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get<Asset[]>('/api/assets')
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assets.filter(
    (a) =>
      a.hostname.toLowerCase().includes(search.toLowerCase()) ||
      (a.ip || '').includes(search) ||
      (a.manufacturer || '').toLowerCase().includes(search.toLowerCase()),
  );

  const online = assets.filter((a) => a.agentStatus === 'ONLINE').length;
  const offline = assets.filter((a) => a.agentStatus === 'OFFLINE').length;

  return (
    <div className="p-8">
      <PageHeader
        title="Inventário de Ativos"
        subtitle="Dispositivos monitorados pelo agente desktop"
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total de Dispositivos"
          value={assets.length}
          icon="💻"
          accent="bg-orange-600"
        />
        <StatCard title="Online" value={online} icon="🟢" accent="bg-emerald-600" />
        <StatCard title="Offline" value={offline} icon="🔴" accent="bg-red-600" />
      </div>

      <Panel>
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="text-lg font-bold text-white">Dispositivos</h2>
          <Input
            type="text"
            placeholder="Buscar por hostname, IP, fabricante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72"
          />
        </div>

        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="💻"
            title="Nenhum dispositivo encontrado"
            description="Os ativos aparecem aqui quando o agente desktop os reporta."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="py-3 px-2 font-medium">Hostname</th>
                  <th className="py-3 px-2 font-medium">IP</th>
                  <th className="py-3 px-2 font-medium">Fabricante</th>
                  <th className="py-3 px-2 font-medium">SO</th>
                  <th className="py-3 px-2 font-medium">Status</th>
                  <th className="py-3 px-2 font-medium">Tickets</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => {
                  const status =
                    AGENT_STATUS[asset.agentStatus] || AGENT_STATUS.UNKNOWN;
                  return (
                    <tr
                      key={asset.id}
                      className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          {asset.hostname}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {asset.ip || '—'}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {asset.manufacturer || '—'}
                        {asset.model ? ` ${asset.model}` : ''}
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {asset.os || '—'}
                      </td>
                      <td className="py-3 px-2">
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${status.dot}`}
                          />
                          <span className={status.text}>{status.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-300">
                        {asset.tickets?.length ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
