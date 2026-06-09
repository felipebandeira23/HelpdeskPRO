'use client';

import { useEffect, useState } from 'react';
import { PageHeader, Panel, Button, Field, Input, Modal } from '@/components/ui';

interface Device {
  id: string;
  name: string;
  ip: string;
  type: string; // 'Firewall' | 'Switch' | 'Access Point' | 'Impressora' | 'Computador' | 'Servidor'
  status: string; // 'Online' | 'Atenção' | 'Offline'
}

const DEFAULT_DEVICES: Device[] = [
  { id: 'dev_1', name: 'Firewall Core', ip: '192.168.0.1', type: 'Firewall', status: 'Online' },
  { id: 'dev_2', name: 'Switch Vendas', ip: '192.168.1.1', type: 'Switch', status: 'Online' },
  { id: 'dev_3', name: 'Switch ADM', ip: '192.168.2.1', type: 'Switch', status: 'Atenção' },
  { id: 'dev_4', name: 'AP Visitantes', ip: '192.168.1.20', type: 'Access Point', status: 'Online' },
  { id: 'dev_5', name: 'AP Diretoria', ip: '192.168.2.20', type: 'Access Point', status: 'Offline' },
  { id: 'dev_6', name: 'Impressora RH', ip: '192.168.2.50', type: 'Impressora', status: 'Online' },
];

export default function NetworkPage() {
  const [devices, setDevices] = useState<Device[]>(DEFAULT_DEVICES);
  const [activeView, setActiveView] = useState<'map' | 'list'>('map');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dName, setDName] = useState('');
  const [dIp, setDIp] = useState('');
  const [dType, setDType] = useState('Computador');
  const [dStatus, setDStatus] = useState('Online');

  // Selected device for side drawer/terminal details
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [pingLog, setPingLog] = useState<string[]>([]);
  const [pinging, setPinging] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const localDevices = localStorage.getItem('network_devices');
    if (localDevices) {
      try {
        setDevices(JSON.parse(localDevices));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dName || !dIp) return;

    const newDevice: Device = {
      id: 'dev_' + Date.now(),
      name: dName,
      ip: dIp,
      type: dType,
      status: dStatus,
    };

    const updated = [...devices, newDevice];
    setDevices(updated);
    localStorage.setItem('network_devices', JSON.stringify(updated));

    setDName('');
    setDIp('');
    setIsModalOpen(false);
  };

  const handleDeleteDevice = (id: string) => {
    if (!confirm('Excluir este dispositivo da rede?')) return;
    const updated = devices.filter((d) => d.id !== id);
    setDevices(updated);
    localStorage.setItem('network_devices', JSON.stringify(updated));
    if (selectedDevice?.id === id) {
      setSelectedDevice(null);
      setPingLog([]);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    const updated = devices.map((d) => (d.id === id ? { ...d, status: newStatus } : d));
    setDevices(updated);
    localStorage.setItem('network_devices', JSON.stringify(updated));
    if (selectedDevice?.id === id) {
      setSelectedDevice({ ...selectedDevice, status: newStatus });
    }
  };

  const runSimulatedPing = (ip: string) => {
    setPinging(true);
    setPingLog([`Iniciando ping para ${ip} com 32 bytes de dados...`]);

    let seq = 0;
    const interval = setInterval(() => {
      if (seq >= 4) {
        clearInterval(interval);
        setPingLog((prev) => [
          ...prev,
          `--- ${ip} ping estatísticas ---`,
          `4 pacotes transmitidos, 4 recebidos, 0% perda de pacote`,
          `tempo min/avg/max = 1.12/1.85/2.50 ms`
        ]);
        setPinging(false);
        return;
      }
      
      const ms = (Math.random() * 2 + 1).toFixed(2);
      setPingLog((prev) => [
        ...prev,
        `Resposta de ${ip}: bytes=32 tempo=${ms}ms TTL=64`
      ]);
      seq++;
    }, 500);
  };

  // Position devices by hierarchical layer
  const getPositionedNodes = () => {
    const level0 = devices.filter((d) => d.type === 'Firewall');
    const level1 = devices.filter((d) => d.type === 'Switch');
    const level2 = devices.filter((d) => d.type !== 'Firewall' && d.type !== 'Switch');

    const positioned: (Device & { x: string; y: string })[] = [];

    // Level 0 (Top Center)
    level0.forEach((d, idx) => {
      const count = level0.length;
      const xVal = count === 1 ? '50%' : `${15 + (70 * idx) / (count - 1)}%`;
      positioned.push({ ...d, x: xVal, y: '16%' });
    });

    // Level 1 (Middle)
    level1.forEach((d, idx) => {
      const count = level1.length;
      const xVal = count === 1 ? '50%' : `${25 + (50 * idx) / (count - 1)}%`;
      positioned.push({ ...d, x: xVal, y: '46%' });
    });

    // Level 2 (Bottom)
    level2.forEach((d, idx) => {
      const count = level2.length;
      const xVal = count === 1 ? '50%' : `${10 + (80 * idx) / (count - 1)}%`;
      positioned.push({ ...d, x: xVal, y: '78%' });
    });

    return positioned;
  };

  const positionedNodes = getPositionedNodes();

  const renderSVGLines = () => {
    const lines: JSX.Element[] = [];
    const switches = positionedNodes.filter((n) => n.type === 'Switch');
    const firewall = positionedNodes.find((n) => n.type === 'Firewall') || positionedNodes[0];
    const clients = positionedNodes.filter((n) => n.type !== 'Firewall' && n.type !== 'Switch');

    if (!firewall) return null;

    // Connect switches to firewall
    switches.forEach((sw) => {
      lines.push(
        <line
          key={`line-fw-sw-${sw.id}`}
          x1={firewall.x}
          y1={firewall.y}
          x2={sw.x}
          y2={sw.y}
          stroke={sw.status === 'Offline' ? '#ef4444' : '#475569'}
          strokeWidth="3"
        />
      );
    });

    // Connect clients to switches (distributed evenly)
    if (switches.length > 0) {
      clients.forEach((cli, idx) => {
        const swIdx = idx % switches.length;
        const sw = switches[swIdx];
        lines.push(
          <line
            key={`line-sw-cli-${cli.id}`}
            x1={sw.x}
            y1={sw.y}
            x2={cli.x}
            y2={cli.y}
            stroke={cli.status === 'Offline' ? '#ef4444' : cli.status === 'Atenção' ? '#eab308' : '#334155'}
            strokeWidth="1.8"
            strokeDasharray={cli.status === 'Atenção' ? '4,4' : undefined}
          />
        );
      });
    } else {
      // Direct core connection if no switch
      clients.forEach((cli) => {
        lines.push(
          <line
            key={`line-fw-cli-${cli.id}`}
            x1={firewall.x}
            y1={firewall.y}
            x2={cli.x}
            y2={cli.y}
            stroke={cli.status === 'Offline' ? '#ef4444' : '#334155'}
            strokeWidth="1.5"
          />
        );
      });
    }

    return lines;
  };

  return (
    <div className="p-8 space-y-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <PageHeader title="Topologia de Rede" subtitle="Visualização em tempo real e monitoramento dos ativos de infraestrutura" />
        <div className="flex gap-2">
          <Button
            variant={activeView === 'map' ? 'primary' : 'secondary'}
            onClick={() => setActiveView(activeView === 'map' ? 'list' : 'map')}
            size="sm"
          >
            {activeView === 'map' ? '📋 Visualizar Lista' : '🌐 Visualizar Mapa'}
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} size="sm">
            + Adicionar Dispositivo
          </Button>
        </div>
      </div>

      {activeView === 'map' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
          {/* Main Visual SVG Topology Canvas */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-700 rounded-2xl relative overflow-hidden flex flex-col">
            {/* Map Toolbar legend */}
            <div className="absolute top-4 right-4 z-10 bg-slate-900/90 border border-slate-700/60 p-3 rounded-lg text-xs space-y-1.5 shadow-xl">
              <h4 className="text-white font-bold mb-1">Status</h4>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/30"></span>
                <span className="text-slate-300">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30"></span>
                <span className="text-slate-300">Atenção</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500/30"></span>
                <span className="text-slate-300">Offline</span>
              </div>
            </div>

            <div className="flex-1 w-full h-full relative select-none">
              {/* SVG Link Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {renderSVGLines()}
              </svg>

              {/* Positioned Node Cards */}
              {positionedNodes.map((node) => {
                const isActive = selectedDevice?.id === node.id;
                return (
                  <div
                    key={node.id}
                    style={{ left: node.x, top: node.y }}
                    onClick={() => {
                      setSelectedDevice(node);
                      setPingLog([]);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all border-2 ${
                      node.status === 'Online'
                        ? 'bg-green-950/20 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
                        : node.status === 'Atenção'
                        ? 'bg-yellow-950/20 border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.2)]'
                        : 'bg-red-950/20 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse'
                    } ${isActive ? 'ring-4 ring-blue-500 scale-110' : 'group-hover:scale-110'}`}>
                      {node.type === 'Firewall' && '🌐'}
                      {node.type === 'Switch' && '🖧'}
                      {node.type === 'Access Point' && '🛜'}
                      {node.type === 'Impressora' && '🖨️'}
                      {node.type === 'Computador' && '💻'}
                      {node.type === 'Servidor' && '🗄️'}
                    </div>
                    <span className="mt-2 text-white font-semibold bg-slate-900/90 border border-slate-700/50 px-2 py-0.5 rounded text-[10px] whitespace-nowrap shadow-lg">
                      {node.name}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">{node.ip}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Drawer & Terminal Panel */}
          <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
            <Panel className="flex-1 flex flex-col min-h-0 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider shrink-0">Status do Dispositivo</h3>
              
              {selectedDevice ? (
                <div className="flex-1 flex flex-col min-h-0 space-y-4">
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-400">Nome: <b className="text-white">{selectedDevice.name}</b></p>
                    <p className="text-slate-400">IP: <span className="font-mono text-blue-400">{selectedDevice.ip}</span></p>
                    <p className="text-slate-400">Tipo: <span className="text-slate-200 font-medium">{selectedDevice.type}</span></p>
                    <div className="flex gap-2 items-center text-slate-400">
                      <span>Status:</span>
                      <select
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        value={selectedDevice.status}
                        onChange={(e) => handleUpdateStatus(selectedDevice.id, e.target.value)}
                      >
                        <option value="Online">Online</option>
                        <option value="Atenção">Atenção</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button variant="secondary" size="sm" fullWidth onClick={() => runSimulatedPing(selectedDevice.ip)} disabled={pinging}>
                      {pinging ? 'Pingando...' : 'Testar Conexão (Ping)'}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteDevice(selectedDevice.id)}>
                      Excluir
                    </Button>
                  </div>

                  {/* Simulated CLI Terminal output box */}
                  <div className="flex-1 bg-black/80 rounded-xl p-3 border border-slate-850 font-mono text-[10px] text-green-400 overflow-y-auto min-h-[140px] leading-relaxed">
                    {pingLog.length === 0 ? (
                      <span className="text-slate-500 italic">Console do terminal pronto...</span>
                    ) : (
                      pingLog.map((line, i) => <div key={i}>{line}</div>)
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-12 flex-1">Selecione um nó do mapa de rede para executar ações e testar conectividade.</p>
              )}
            </Panel>
          </div>
        </div>
      ) : (
        /* List View */
        <Panel className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="pb-3 px-2">Dispositivo</th>
                <th className="pb-3 px-2">Endereço IP</th>
                <th className="pb-3 px-2">Tipo de Ativo</th>
                <th className="pb-3 px-2">Estado</th>
                <th className="pb-3 px-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {devices.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-2 font-bold text-white">{d.name}</td>
                  <td className="py-3 px-2 font-mono text-blue-400">{d.ip}</td>
                  <td className="py-3 px-2 text-slate-350">{d.type}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                      d.status === 'Online'
                        ? 'bg-green-955/20 text-green-400 border-green-800/30'
                        : d.status === 'Atenção'
                        ? 'bg-yellow-955/20 text-yellow-400 border-yellow-800/30'
                        : 'bg-red-955/20 text-red-400 border-red-800/30'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right space-x-3">
                    <button
                      onClick={() => {
                        setSelectedDevice(d);
                        setActiveView('map');
                        setPingLog([]);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-xs font-bold"
                    >
                      Ver no Mapa
                    </button>
                    <button
                      onClick={() => handleDeleteDevice(d.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {/* Add Device Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Dispositivo de Rede"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleAddDevice} disabled={!dName || !dIp}>Salvar Dispositivo</Button>
          </div>
        }
      >
        <form onSubmit={handleAddDevice} className="space-y-4">
          <Field label="Nome do Dispositivo" required>
            <Input type="text" placeholder="Ex: Roteador-Borda-02" value={dName} onChange={(e) => setDName(e.target.value)} />
          </Field>
          <Field label="Endereço IP" required>
            <Input type="text" placeholder="Ex: 192.168.1.15" value={dIp} onChange={(e) => setDIp(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoria de Rede">
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
                value={dType}
                onChange={(e) => setDType(e.target.value)}
              >
                <option value="Firewall">Roteador / Firewall</option>
                <option value="Switch">Switch</option>
                <option value="Access Point">Access Point (AP)</option>
                <option value="Impressora">Impressora de Rede</option>
                <option value="Servidor">Servidor Local</option>
                <option value="Computador">Estação de Trabalho (PC)</option>
              </select>
            </Field>
            <Field label="Status Inicial">
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
                value={dStatus}
                onChange={(e) => setDStatus(e.target.value)}
              >
                <option value="Online">Online</option>
                <option value="Atenção">Atenção</option>
                <option value="Offline">Offline</option>
              </select>
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
