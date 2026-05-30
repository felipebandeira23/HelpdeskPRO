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
  const [activeTab, setActiveTab] = useState<'info' | 'remote' | 'monitoring' | 'tickets'>('info');

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

      <div className="flex justify-between items-end mb-6">
        <PageHeader title={asset.hostname} subtitle="Detalhe e Gerenciamento do Dispositivo" />
        <div className="flex gap-2 mb-2 bg-slate-800 p-1 rounded-lg">
          <button onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'info' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>Informações</button>
          <button onClick={() => setActiveTab('remote')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'remote' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>Ações Remotas</button>
          <button onClick={() => setActiveTab('monitoring')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'monitoring' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>Monitoramento</button>
          <button onClick={() => setActiveTab('tickets')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'tickets' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}>Tickets ({tickets.length})</button>
        </div>
      </div>

      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel className="lg:col-span-1">
            <h2 className="text-lg font-bold text-white mb-4">Metadados do Hardware</h2>
            <dl className="space-y-4">
              {fields.map((f) => (
                <div key={f.label} className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                  <dt className="text-[11px] uppercase font-bold text-slate-500 mb-1">{f.label}</dt>
                  <dd className="text-sm font-medium text-slate-200">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-900 border-slate-700">
            <div className="w-48 h-48 mb-6">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-slate-700">
                <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V14C20 15.1046 19.1046 16 18 16H6C4.89543 16 4 15.1046 4 14V6Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 16V20M8 20H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Visão Geral do Ativo</h3>
            <p className="text-slate-400 max-w-md text-center text-sm">
              Para visualizar o consumo em tempo real ou executar comandos, acesse as abas de <strong className="text-blue-400">Ações Remotas</strong> ou <strong className="text-blue-400">Monitoramento</strong>.
            </p>
          </Panel>
        </div>
      )}

      {activeTab === 'remote' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Panel>
              <h2 className="text-lg font-bold text-white mb-4">Acesso Rápido</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium p-3 rounded-lg flex items-center justify-between transition-colors shadow-lg shadow-blue-900/20">
                  <span className="flex items-center gap-3"><span className="text-xl">🖥️</span> Acesso Remoto (VNC)</span>
                  <span>→</span>
                </button>
                <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium p-3 rounded-lg flex items-center justify-between transition-colors">
                  <span className="flex items-center gap-3"><span className="text-xl">⌨️</span> Terminal Oculto (CMD)</span>
                  <span>→</span>
                </button>
                <button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium p-3 rounded-lg flex items-center justify-between transition-colors">
                  <span className="flex items-center gap-3"><span className="text-xl">⚡</span> Wake-on-LAN (WOL)</span>
                  <span>→</span>
                </button>
                <button className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-900/50 text-red-400 font-medium p-3 rounded-lg flex items-center justify-between transition-colors">
                  <span className="flex items-center gap-3"><span className="text-xl">🔄</span> Reiniciar Dispositivo</span>
                  <span>→</span>
                </button>
              </div>
            </Panel>
          </div>
          
          <div className="lg:col-span-2">
            <Panel className="h-full flex flex-col bg-slate-950 border-slate-800">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span> Terminal Direto
                </h2>
                <div className="flex gap-2">
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono">root@{asset.hostname}</span>
                </div>
              </div>
              <div className="flex-1 bg-black rounded-lg p-4 font-mono text-sm overflow-hidden flex flex-col border border-slate-800 shadow-inner">
                <div className="flex-1 overflow-y-auto text-green-400 opacity-80 mb-4 space-y-1">
                  <p>HelpdeskPRO Remote Agent v2.4.1</p>
                  <p>Conectado a {asset.ip || '192.168.x.x'} via túnel seguro.</p>
                  <br/>
                  <p className="text-blue-400">PS C:\Windows\System32&gt; systeminfo | findstr /C:"OS Name"</p>
                  <p>OS Name:                   Microsoft Windows 11 Pro</p>
                  <br/>
                  <p className="text-blue-400">PS C:\Windows\System32&gt; _</p>
                </div>
                <div className="flex items-center gap-2 border-t border-slate-800 pt-3">
                  <span className="text-blue-400">PS&gt;</span>
                  <input type="text" className="flex-1 bg-transparent border-none outline-none text-slate-200" placeholder="Digite um comando powershell ou cmd..." />
                  <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors text-xs uppercase font-bold tracking-wider">Executar</button>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Panel className="flex flex-col items-center">
              <h3 className="text-slate-400 font-medium mb-4">Uso de CPU</h3>
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-800">
                <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', transform: 'rotate(-45deg)' }}></div>
                <span className="text-2xl font-bold text-white">24%</span>
              </div>
              <p className="text-xs text-slate-500 mt-4">Intel Core i5-10400F</p>
            </Panel>

            <Panel className="flex flex-col items-center">
              <h3 className="text-slate-400 font-medium mb-4">Memória RAM</h3>
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-800">
                <div className="absolute inset-0 rounded-full border-8 border-yellow-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(90deg)' }}></div>
                <span className="text-2xl font-bold text-white">68%</span>
              </div>
              <p className="text-xs text-slate-500 mt-4">11.2GB / 16.0GB</p>
            </Panel>

            <Panel className="flex flex-col items-center">
              <h3 className="text-slate-400 font-medium mb-4">Armazenamento (C:)</h3>
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-slate-800">
                <div className="absolute inset-0 rounded-full border-8 border-red-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)', transform: 'rotate(180deg)' }}></div>
                <span className="text-2xl font-bold text-white">92%</span>
              </div>
              <p className="text-xs text-red-400 mt-4 font-medium">Crítico: Apenas 40GB livres</p>
            </Panel>
          </div>

          <Panel>
            <h2 className="text-lg font-bold text-white mb-4">Eventos Recentes (Log do Windows)</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="pb-2 font-medium">Nível</th>
                  <th className="pb-2 font-medium">Data/Hora</th>
                  <th className="pb-2 font-medium">Origem</th>
                  <th className="pb-2 font-medium">Mensagem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-3"><span className="text-[10px] bg-red-900/30 text-red-400 border border-red-700/50 px-2 py-0.5 rounded font-bold uppercase">Erro</span></td>
                  <td className="py-3 text-slate-400">Hoje 10:14</td>
                  <td className="py-3 text-slate-300">Disk</td>
                  <td className="py-3 text-slate-300">O dispositivo \Device\Harddisk1\DR1 possui um bloco defeituoso.</td>
                </tr>
                <tr>
                  <td className="py-3"><span className="text-[10px] bg-yellow-900/30 text-yellow-400 border border-yellow-700/50 px-2 py-0.5 rounded font-bold uppercase">Aviso</span></td>
                  <td className="py-3 text-slate-400">Ontem 18:00</td>
                  <td className="py-3 text-slate-300">WindowsUpdateClient</td>
                  <td className="py-3 text-slate-300">Falha na instalação da atualização. Código de erro: 0x80240017</td>
                </tr>
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      {activeTab === 'tickets' && (
        <Panel>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Histórico de Chamados Ocorridos neste Dispositivo</h2>
            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded transition-colors">+ Abrir Ticket Referente</button>
          </div>
          {tickets.length === 0 ? (
            <EmptyState icon="🎫" title="Nenhum ticket vinculado" description="Nenhum suporte precisou ser acionado para este dispositivo ainda." />
          ) : (
            <div className="divide-y divide-slate-700">
              {tickets.map((ticket) => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="py-4 flex items-center justify-between hover:bg-slate-800/50 px-4 -mx-4 transition-colors rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium truncate">{ticket.title}</p>
                    <p className="text-slate-500 text-xs">Aberto em {new Date(ticket.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                    <span className="text-slate-500">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
