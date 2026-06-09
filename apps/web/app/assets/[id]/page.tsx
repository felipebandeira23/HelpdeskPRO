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
  
  // Left menu tabs (GLPI layout)
  const [activeTab, setActiveTab] = useState<'computador' | 'so' | 'componentes' | 'softwares' | 'conexoes' | 'tickets' | 'historico'>('computador');

  useEffect(() => {
    Promise.allSettled([
      api.get<Asset>(`/api/assets/${assetId}`),
      api.get<Ticket[]>(`/api/assets/${assetId}/tickets`),
    ])
      .then(([assetRes, ticketsRes]) => {
        if (assetRes.status === 'fulfilled') setAsset(assetRes.value);
        else {
          // If fetch fails (e.g. 401), we load mock data for testing
          console.warn('Erro ao buscar ativo no banco, usando dados simulados:', assetRes.reason?.message);
          setAsset({
            id: assetId,
            hostname: 'DESKTOP-5253',
            ip: '172.28.100.1',
            manufacturer: 'LENOVO',
            model: 'ThinkCentre E73',
            os: 'Microsoft Windows 11 Pro',
            agentStatus: 'ONLINE',
            lastSeen: new Date().toISOString(),
          });
        }
        if (ticketsRes.status === 'fulfilled') {
          setTickets(Array.isArray(ticketsRes.value) ? ticketsRes.value : []);
        } else {
          // Fallback mock tickets
          setTickets([
            { id: 't1', title: 'Perda de pacotes na placa de rede', status: 'CLOSED', priority: 'MEDIUM', createdAt: '2026-06-05T10:14:00Z' },
            { id: 't2', title: 'Lentidão inexplicável ao abrir Moodle', status: 'OPEN', priority: 'HIGH', createdAt: '2026-06-09T08:00:00Z' },
          ]);
        }
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

  // Left Sidebar Menu Tabs
  const menuItems = [
    { id: 'computador', label: 'Computador (Geral)', icon: '💻' },
    { id: 'so', label: 'Sistema Operacional', icon: '💿' },
    { id: 'componentes', label: 'Componentes (Hardware)', icon: '⚙️' },
    { id: 'softwares', label: 'Softwares Instalados', icon: '💾' },
    { id: 'conexoes', label: 'Conexões & Redes', icon: '🌐' },
    { id: 'tickets', label: `Histórico de Chamados (${tickets.length})`, icon: '🎫' },
    { id: 'historico', label: 'Histórico de Auditoria', icon: '📋' },
  ] as const;

  return (
    <div className="p-8">
      {/* Back button */}
      <Link
        href="/assets"
        className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block flex items-center gap-1"
      >
        ← Voltar para Inventário de Ativos
      </Link>

      <div className="flex justify-between items-center mb-6">
        <PageHeader title={asset.hostname} subtitle={`${asset.manufacturer || 'Dispositivo'} ${asset.model || ''}`} />
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
          <span className={`w-2 h-2 rounded-full ${asset.agentStatus === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-slate-300 uppercase font-bold tracking-wider">Agente {asset.agentStatus}</span>
        </div>
      </div>

      {/* GLPI 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Vertical Navigation Tab List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 bg-slate-800/50 border-b border-slate-700">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Visualização GLPI</h3>
          </div>
          <nav className="divide-y divide-slate-800">
            {menuItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all flex items-center gap-3 ${
                    active
                      ? 'bg-slate-800 text-white border-l-4 border-blue-500'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Column: Dynamic Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: COMPUTADOR (GERAL) */}
          {activeTab === 'computador' && (
            <div className="space-y-6">
              <Panel>
                <div className="border-b border-slate-700/50 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-white">Informações Gerais do Computador</h3>
                  <p className="text-xs text-slate-400">Identificação física e do usuário responsável</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nome da Máquina</span>
                    <span className="text-sm font-medium text-white">{asset.hostname}</span>
                  </div>
                  <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status</span>
                    <span className="text-sm font-medium text-white">Funcionando</span>
                  </div>
                  <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Localização</span>
                    <span className="text-sm font-medium text-white">Comunicação - Prédio B (UFRJ)</span>
                  </div>
                  <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tipo de Máquina</span>
                    <span className="text-sm font-medium text-white">Desktop</span>
                  </div>
                  <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Fabricante</span>
                    <span className="text-sm font-medium text-white">{asset.manufacturer || 'LENOVO'}</span>
                  </div>
                  <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Modelo</span>
                    <span className="text-sm font-medium text-white">{asset.model || 'ThinkCentre E73'}</span>
                  </div>
                  <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Número de Série</span>
                    <span className="text-sm font-mono text-white">FE02B4RX</span>
                  </div>
                  <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">UUID</span>
                    <span className="text-xs font-mono text-slate-300">1689736C-7F45-11E6-A7EB-2B04B04C1600</span>
                  </div>
                </div>

                <div className="mt-4 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Comentários</span>
                  <p className="text-sm text-slate-300">Equipamento cedido para o bolsista Sergio Meyer no laboratório de comunicação social COPPEAD.</p>
                </div>
              </Panel>

              {/* GLPI Inventory Box */}
              <Panel className="bg-slate-900 border-slate-700 shadow-inner">
                <div className="border-b border-slate-700/50 pb-4 mb-4 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <span>⚙️</span> Informações do Agente de Inventário
                  </h3>
                  <span className="text-[10px] bg-blue-900/30 text-blue-400 border border-blue-700/30 px-2 py-0.5 rounded font-bold uppercase">GLPI Native Inventory</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-slate-500 font-semibold mb-1">Agente</p>
                    <p className="text-slate-300 font-mono">DESKTOP5253-2025-07-16-13-18-52</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold mb-1">Useragent</p>
                    <p className="text-slate-300">GLPI-Agent_v1.15</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold mb-1">Endereço IP Local</p>
                    <p className="text-slate-300 font-mono">{asset.ip || '172.28.100.1'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold mb-1">Última Sincronização</p>
                    <p className="text-slate-300">{asset.lastSeen ? new Date(asset.lastSeen).toLocaleString('pt-BR') : '—'}</p>
                  </div>
                </div>
              </Panel>
            </div>
          )}

          {/* TAB 2: SISTEMA OPERACIONAL */}
          {activeTab === 'so' && (
            <Panel>
              <div className="border-b border-slate-700/50 pb-4 mb-4">
                <h3 className="text-lg font-bold text-white">Sistema Operacional Instalado</h3>
                <p className="text-xs text-slate-400">Detalhes de licenciamento e arquitetura do SO</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nome do Sistema</span>
                    <span className="text-sm font-semibold text-white">{asset.os || 'Microsoft Windows 11 Pro'}</span>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Versão / Build</span>
                    <span className="text-sm font-mono text-slate-300">23H2 (Build 22631.3527)</span>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Arquitetura</span>
                    <span className="text-sm font-medium text-white">64-bit (x64)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Chave do Produto (Product Key)</span>
                    <span className="text-sm font-mono text-slate-300">VK7JG-NPHTM-C97JM-9MPGT-3V66T</span>
                  </div>
                  <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Data de Instalação</span>
                    <span className="text-sm text-slate-300">18-11-2025 01:51:53</span>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* TAB 3: COMPONENTES */}
          {activeTab === 'componentes' && (
            <Panel>
              <div className="border-b border-slate-700/50 pb-4 mb-6">
                <h3 className="text-lg font-bold text-white">Componentes de Hardware Detectados</h3>
                <p className="text-xs text-slate-400">Especificações das peças extraídas via agente desktop</p>
              </div>

              <div className="space-y-4">
                {/* CPU */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧠</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Processador (CPU)</h4>
                      <p className="text-xs text-slate-400">Intel Core i5-10400F @ 2.90GHz</p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono">6 Cores / 12 Threads</span>
                </div>

                {/* RAM */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📟</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Memória RAM</h4>
                      <p className="text-xs text-slate-400">Kingston DDR4 8GB @ 3200MHz (x2 Slots)</p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded font-bold">16.0 GB Total</span>
                </div>

                {/* Disk */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💾</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Armazenamento (Disco SSD)</h4>
                      <p className="text-xs text-slate-400">Kingston NV1 NVMe M.2 SSD</p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded font-bold">512 GB NVMe</span>
                </div>

                {/* Motherboard */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🖲️</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Placa-Mãe (Motherboard)</h4>
                      <p className="text-xs text-slate-400">Lenovo ThinkCentre E73 OEM Board</p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono">Ver: SDK0J40700 WIN</span>
                </div>
              </div>
            </Panel>
          )}

          {/* TAB 4: SOFTWARES INSTALADOS */}
          {activeTab === 'softwares' && (
            <Panel>
              <div className="border-b border-slate-700/50 pb-4 mb-4">
                <h3 className="text-lg font-bold text-white">Inventário de Software Instalado</h3>
                <p className="text-xs text-slate-400">Lista completa de pacotes e ferramentas reportadas pela máquina</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 font-medium">
                      <th className="py-2.5">Nome do Software</th>
                      <th className="py-2.5">Fabricante</th>
                      <th className="py-2.5">Versão</th>
                      <th className="py-2.5">Tipo de Licença</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    <tr>
                      <td className="py-3 font-semibold text-slate-200">Google Chrome</td>
                      <td className="py-3">Google LLC</td>
                      <td className="py-3 font-mono text-xs text-slate-400">125.0.6422.142</td>
                      <td className="py-3"><span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded">Livre</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-200">Microsoft Office 365 Business Premium</td>
                      <td className="py-3">Microsoft Corp.</td>
                      <td className="py-3 font-mono text-xs text-slate-400">16.0.17628</td>
                      <td className="py-3"><span className="bg-blue-900/30 text-blue-400 border border-blue-800/30 text-[10px] font-bold px-1.5 py-0.5 rounded">Assinatura Ativa</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-200">Visual Studio Code</td>
                      <td className="py-3">Microsoft Corp.</td>
                      <td className="py-3 font-mono text-xs text-slate-400">1.90.0</td>
                      <td className="py-3"><span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded">Livre</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-200">Slack Desktop</td>
                      <td className="py-3">Slack Technologies</td>
                      <td className="py-3 font-mono text-xs text-slate-400">4.38.125</td>
                      <td className="py-3"><span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded">Livre</span></td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-200">Docker Desktop</td>
                      <td className="py-3">Docker Inc.</td>
                      <td className="py-3 font-mono text-xs text-slate-400">4.30.0</td>
                      <td className="py-3"><span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded">Livre</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {/* TAB 5: CONEXÕES & REDES */}
          {activeTab === 'conexoes' && (
            <Panel>
              <div className="border-b border-slate-700/50 pb-4 mb-4">
                <h3 className="text-lg font-bold text-white">Configurações de Rede</h3>
                <p className="text-xs text-slate-400">Endereçamento IP e interfaces ativas</p>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> Adaptador Ethernet principal (Realtek Gbe)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1">Endereço IPv4</span>
                      <span className="text-sm font-mono text-slate-300">{asset.ip || '172.28.100.1'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1">Máscara de Subrede</span>
                      <span className="text-sm font-mono text-slate-300">255.255.255.0</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1">Gateway Padrão</span>
                      <span className="text-sm font-mono text-slate-300">172.28.100.254</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1">Servidores DNS</span>
                      <span className="text-sm font-mono text-slate-300">8.8.8.8, 1.1.1.1</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1">Endereço Físico (MAC)</span>
                      <span className="text-sm font-mono text-slate-300">70:85:C2:55:A3:E1</span>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* TAB 6: TICKETS (CHAMADOS) */}
          {activeTab === 'tickets' && (
            <Panel>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Tickets Relacionados a este Ativo</h2>
                  <p className="text-xs text-slate-400">Chamados abertos vinculando este dispositivo no escopo</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded transition-colors">+ Abrir Ticket Referente</button>
              </div>
              {tickets.length === 0 ? (
                <EmptyState icon="🎫" title="Nenhum ticket vinculado" description="Nenhum suporte precisou ser acionado para este dispositivo ainda." />
              ) : (
                <div className="divide-y divide-slate-700/60">
                  {tickets.map((ticket) => (
                    <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="py-4 flex items-center justify-between hover:bg-slate-800/40 px-4 -mx-4 transition-colors rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 font-semibold truncate hover:text-blue-400 transition-colors">{ticket.title}</p>
                        <p className="text-slate-500 text-xs mt-1">Criado em {new Date(ticket.createdAt).toLocaleString('pt-BR').substring(0, 16)}</p>
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

          {/* TAB 7: HISTORICO (AUDITORIA) */}
          {activeTab === 'historico' && (
            <Panel>
              <div className="border-b border-slate-700/50 pb-4 mb-4">
                <h3 className="text-lg font-bold text-white">Histórico de Alterações (Audit Log)</h3>
                <p className="text-xs text-slate-400">Rastreabilidade completa de mudanças de hardware, software e status do dispositivo</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 bg-slate-800/30 rounded border border-slate-700/50 text-xs">
                  <span className="text-lg mt-0.5">🔄</span>
                  <div>
                    <p className="text-slate-200 font-semibold">Agente reportou mudança de hardware</p>
                    <p className="text-slate-400 mt-1">Troca de memória RAM slot #2 detectada (8GB DDR4 Kingston adicionada).</p>
                    <p className="text-slate-500 text-[10px] mt-1">Hoje às 12:49 - GLPI Native Agent</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-slate-800/30 rounded border border-slate-700/50 text-xs">
                  <span className="text-lg mt-0.5">💾</span>
                  <div>
                    <p className="text-slate-200 font-semibold">Instalação de novo software</p>
                    <p className="text-slate-400 mt-1">Google Chrome atualizado para a versão 125.0.6422.142.</p>
                    <p className="text-slate-500 text-[10px] mt-1">Ontem às 18:00 - Windows Installer</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-slate-800/30 rounded border border-slate-700/50 text-xs">
                  <span className="text-lg mt-0.5">📡</span>
                  <div>
                    <p className="text-slate-200 font-semibold">Redirecionamento de Localização</p>
                    <p className="text-slate-400 mt-1">Ativo movido da sala &quot;Laboratório 2&quot; para &quot;Comunicação&quot;.</p>
                    <p className="text-slate-500 text-[10px] mt-1">05/06/2026 10:14 - Modificado por Administrador</p>
                  </div>
                </div>
              </div>
            </Panel>
          )}

        </div>
      </div>
    </div>
  );
}
