'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ErrorBanner, Skeleton } from '@/components/ui';
import dynamic from 'next/dynamic';

const AssetMain = dynamic(() => import('./sections/AssetMain'), { ssr: false });
const AssetOS = dynamic(() => import('./sections/AssetOS'));
const AssetComponents = dynamic(() => import('./sections/AssetComponents'));
const AssetVolumes = dynamic(() => import('./sections/AssetVolumes'));
const AssetSoftware = dynamic(() => import('./sections/AssetSoftware'));
const AssetNetworkPorts = dynamic(() => import('./sections/AssetNetworkPorts'));
const AssetTickets = dynamic(() => import('./sections/AssetTickets'));
const AssetTelemetry = dynamic(() => import('./sections/AssetTelemetry'));

interface Asset {
  id: string;
  hostname: string;
  ip: string | null;
  manufacturer: string | null;
  model: string | null;
  os: string | null;
  assetType: string;
  assetStatus: string;
  serialNumber: string | null;
  inventoryNumber: string | null;
  uuid: string | null;
  comments: string | null;
  agentStatus: string;
  lastSeen: string | null;
  createdAt: string;
  technicianId: string | null;
  userId: string | null;
  technician?: { id: string; name: string } | null;
  assetUser?: { id: string; name: string } | null;
  tickets?: { id: string }[];
}

type Section =
  | 'computer'
  | 'os'
  | 'components'
  | 'volumes'
  | 'software'
  | 'ports'
  | 'tickets'
  | 'telemetry';

const ASSET_TYPE_ICON: Record<string, string> = {
  COMPUTER: '💻', LAPTOP: '📱', SERVER: '🗄️', PRINTER: '🖨️',
  SWITCH: '🔀', ROUTER: '📡', PHONE: '☎️', TABLET: '📟',
  MONITOR: '🖥️', OTHER: '🔌',
};

const ASSET_TYPE_LABEL: Record<string, string> = {
  COMPUTER: 'Computador', LAPTOP: 'Notebook', SERVER: 'Servidor', PRINTER: 'Impressora',
  SWITCH: 'Switch', ROUTER: 'Roteador', PHONE: 'Telefone', TABLET: 'Tablet',
  MONITOR: 'Monitor', OTHER: 'Outro',
};

const ASSET_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  IN_USE: { label: '✓ Em uso', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  AVAILABLE: { label: '◉ Disponível', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  MAINTENANCE: { label: '⚙️ Manutenção', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  RETIRED: { label: '✕ Aposentado', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  STOLEN: { label: '⚠️ Roubado', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  LENT: { label: '→ Emprestado', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

const AGENT_DOT: Record<string, string> = {
  ONLINE: 'bg-emerald-400 animate-pulse',
  OFFLINE: 'bg-red-400',
  UNKNOWN: 'bg-slate-500',
};

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: 'computer', label: 'Computador', icon: '💻' },
  { id: 'os', label: 'Sist. Operacional', icon: '🖥️' },
  { id: 'components', label: 'Componentes', icon: '🔧' },
  { id: 'volumes', label: 'Volumes', icon: '💾' },
  { id: 'software', label: 'Softwares', icon: '📦' },
  { id: 'ports', label: 'Portas de Rede', icon: '🌐' },
  { id: 'tickets', label: 'Chamados', icon: '🎫' },
  { id: 'telemetry', label: 'Telemetria', icon: '📊' },
] as const as { id: Section; label: string; icon: string }[];

const SECTION_LABELS: Record<Section, string> = {
  computer: 'Computador',
  os: 'Sistemas Operacionais',
  components: 'Componentes',
  volumes: 'Volumes',
  software: 'Softwares',
  ports: 'Portas de Rede',
  tickets: 'Chamados',
  telemetry: 'Telemetria',
};

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('computer');

  const load = useCallback(async () => {
    try {
      const a = await api.get<Asset>(`/api/assets/${assetId}`);
      setAsset(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ativo');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-80" />
        <div className="flex gap-6 mt-4">
          <Skeleton className="h-96 w-48" />
          <Skeleton className="h-96 flex-1" />
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-6 space-y-4">
        <Link href="/assets" className="text-blue-400 hover:text-blue-300 text-sm">← Inventário</Link>
        <ErrorBanner message={error || 'Ativo não encontrado'} />
      </div>
    );
  }

  const typeIcon = ASSET_TYPE_ICON[asset.assetType] ?? '🔌';
  const agentDot = AGENT_DOT[asset.agentStatus] ?? AGENT_DOT.UNKNOWN;
  const ticketCount = asset.tickets?.length ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
        <Link href="/assets" className="text-blue-400 hover:text-blue-300 text-xs mb-3 inline-flex items-center gap-1">
          ← Inventário
        </Link>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{typeIcon}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">{asset.hostname}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                  {ASSET_TYPE_LABEL[asset.assetType] || asset.assetType}
                </span>
                {asset.serialNumber && (
                  <span className="text-xs text-slate-500 font-mono">SN: {asset.serialNumber}</span>
                )}
                {asset.inventoryNumber && (
                  <span className="text-xs text-slate-500 font-mono">INV: {asset.inventoryNumber}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status badge */}
            <span
              className={`inline-flex text-xs px-3 py-1.5 rounded border ${
                ASSET_STATUS_BADGE[asset.assetStatus]?.cls || 'bg-slate-500/15 text-slate-400 border-slate-500/30'
              }`}
            >
              {ASSET_STATUS_BADGE[asset.assetStatus]?.label || asset.assetStatus}
            </span>
            {/* Agent status */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
              <span className={`w-1.5 h-1.5 rounded-full ${agentDot}`} />
              <span className="text-xs text-slate-400">
                {asset.agentStatus === 'ONLINE' ? 'Online' : asset.agentStatus === 'OFFLINE' ? 'Offline' : 'Sem agente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout: sidebar + conteúdo */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar de navegação */}
        <aside className="w-52 shrink-0 border-r border-white/[0.06] p-3 space-y-0.5">
          {NAV.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'tickets' && ticketCount > 0 && (
                  <span className="ml-auto bg-slate-700 text-slate-300 text-xs px-1.5 py-0.5 rounded-full">
                    {ticketCount}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-y-auto p-6">
          {section === 'computer' && <AssetMain assetId={assetId} asset={asset} />}
          {section === 'os' && <AssetOS assetId={assetId} />}
          {section === 'components' && <AssetComponents assetId={assetId} />}
          {section === 'volumes' && <AssetVolumes assetId={assetId} />}
          {section === 'software' && <AssetSoftware assetId={assetId} />}
          {section === 'ports' && <AssetNetworkPorts assetId={assetId} />}
          {section === 'tickets' && <AssetTickets assetId={assetId} />}
          {section === 'telemetry' && <AssetTelemetry assetId={assetId} />}
        </main>
      </div>
    </div>
  );
}
