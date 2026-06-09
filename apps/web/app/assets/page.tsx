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
  Input,
  Modal,
  Field,
  Button,
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

export default function AssetsPage() {
  const [dbAssets, setDbAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'computers' | 'monitors' | 'softwares' | 'printers' | 'peripherals'>('computers');

  // Submodules lists states
  const [computers, setComputers] = useState([
    { id: 'c1', hostname: 'DESKTOP-5253', status: 'Funcionando', location: 'Comunicação', user: 'Sergio Meyer', manufacturer: 'LENOVO', serial: 'FE02B4RX', model: 'ThinkCentre E73', os: 'Windows 11 Pro', lastSeen: '2026-06-09 12:49' },
    { id: 'c2', hostname: 'DESKTOP-5345', status: 'Não encontrado', location: 'Suporte TI', user: 'Cássio Almeida', manufacturer: 'LENOVO', serial: 'PE02B511', model: 'ThinkCentre E73', os: 'Windows 11 Pro', lastSeen: '2026-06-08 09:54' },
    { id: 'c3', hostname: 'NOTEBOOK-5965', status: 'Funcionando', location: 'Diretoria', user: 'Patricia Vieira', manufacturer: 'DELL', serial: '1UL23082', model: 'Latitude 5430', os: 'Windows 10 Pro', lastSeen: '2026-06-09 10:30' },
    { id: 'c4', hostname: 'NOTEBOOK-6090', status: 'Funcionando', location: 'Faturamento', user: 'Alexandre Amorim', manufacturer: 'SAMSUNG', serial: '0A299QBW', model: 'Book 550XDA', os: 'Windows 11 Home', lastSeen: '2026-06-09 14:02' },
  ]);

  const [monitors, setMonitors] = useState([
    { id: 'm1', name: 'MONITOR-LAB1', manufacturer: 'LG', model: 'UltraGear 24ML600', serial: 'LG-98231', size: '24"', location: 'Suporte TI', resolution: '1920x1080' },
    { id: 'm2', name: 'MONITOR-FIN1', manufacturer: 'SAMSUNG', model: 'T350', serial: 'SAM-41829', size: '22"', location: 'Financeiro', resolution: '1920x1080' },
    { id: 'm3', name: 'MONITOR-DIR1', manufacturer: 'DELL', model: 'P2722H', serial: 'DEL-88123', size: '27"', location: 'Diretoria', resolution: '1920x1080' },
  ]);

  const [softwares, setSoftwares] = useState([
    { id: 's1', name: 'Google Chrome', version: '125.0.6422.142', manufacturer: 'Google LLC', installations: 140, license: 'Livre' },
    { id: 's2', name: 'Microsoft Office 365 Business', version: '16.0.17628', manufacturer: 'Microsoft Corp.', installations: 85, license: 'Volume O365' },
    { id: 's3', name: 'VS Code', version: '1.90.0', manufacturer: 'Microsoft Corp.', installations: 24, license: 'Livre' },
    { id: 's4', name: 'Adobe Acrobat Reader', version: '24.002', manufacturer: 'Adobe Inc.', installations: 110, license: 'Livre' },
  ]);

  const [printers, setPrinters] = useState([
    { id: 'p1', name: 'PRINTER-CORP1', ip: '192.168.1.50', manufacturer: 'HP', model: 'LaserJet Pro M404dn', type: 'Laser Monocromática', pages: 45281 },
    { id: 'p2', name: 'PRINTER-FIN1', ip: '192.168.1.52', manufacturer: 'EPSON', model: 'EcoTank L3250', type: 'Tanque de Tinta', pages: 12054 },
  ]);

  const [peripherals, setPeripherals] = useState([
    { id: 'pe1', name: 'Teclado USB Dell KB216', type: 'Teclado', manufacturer: 'DELL', model: 'KB216', connection: 'Fio USB' },
    { id: 'pe2', name: 'Mouse Sem Fio Logitech M170', type: 'Mouse', manufacturer: 'LOGITECH', model: 'M170', connection: 'Sem Fio USB' },
    { id: 'pe3', name: 'Headset Jabra Evolve 20', type: 'Headset', manufacturer: 'JABRA', model: 'Evolve 20', connection: 'Fio USB' },
  ]);

  // Asset creation modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<'computers' | 'monitors' | 'softwares' | 'printers' | 'peripherals'>('computers');
  const [formName, setFormName] = useState('');
  const [formManufacturer, setFormManufacturer] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formUser, setFormUser] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formOs, setFormOs] = useState('');
  const [formSize, setFormSize] = useState('');
  const [formResolution, setFormResolution] = useState('');
  const [formVersion, setFormVersion] = useState('');
  const [formLicense, setFormLicense] = useState('Livre');
  const [formIp, setFormIp] = useState('');
  const [formPrinterType, setFormPrinterType] = useState('');
  const [formConnection, setFormConnection] = useState('');
  const [formPeripheralType, setFormPeripheralType] = useState('Teclado');

  // Load actual assets from API & LocalStorage
  useEffect(() => {
    api
      .get<Asset[]>('/api/assets')
      .then((data) => {
        setDbAssets(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.warn('Erro ao buscar ativos (pode necessitar login):', e.message);
      })
      .finally(() => setLoading(false));

    // Retrieve from LocalStorage
    const localComputers = localStorage.getItem('custom_computers');
    const localMonitors = localStorage.getItem('custom_monitors');
    const localSoftwares = localStorage.getItem('custom_softwares');
    const localPrinters = localStorage.getItem('custom_printers');
    const localPeripherals = localStorage.getItem('custom_peripherals');

    if (localComputers) setComputers(JSON.parse(localComputers));
    if (localMonitors) setMonitors(JSON.parse(localMonitors));
    if (localSoftwares) setSoftwares(JSON.parse(localSoftwares));
    if (localPrinters) setPrinters(JSON.parse(localPrinters));
    if (localPeripherals) setPeripherals(JSON.parse(localPeripherals));
  }, []);

  // Combine DB assets into computers list
  const allComputers = [...computers];
  dbAssets.forEach(db => {
    if (!allComputers.some(c => c.hostname === db.hostname)) {
      allComputers.push({
        id: db.id,
        hostname: db.hostname,
        status: db.agentStatus === 'ONLINE' ? 'Funcionando' : 'Desconhecido',
        location: 'Rede/Importado',
        user: '—',
        manufacturer: db.manufacturer || 'Desconhecido',
        serial: '—',
        model: db.model || 'Desconhecido',
        os: db.os || 'Desconhecido',
        lastSeen: db.lastSeen ? new Date(db.lastSeen).toLocaleString('pt-BR').substring(0, 16) : '—'
      });
    }
  });

  const counts = {
    computers: allComputers.length,
    monitors: monitors.length,
    softwares: softwares.length,
    printers: printers.length,
    peripherals: peripherals.length,
  };

  const openCreateModal = () => {
    setFormCategory(activeCategory);
    setFormName('');
    setFormManufacturer('');
    setFormModel('');
    setFormLocation('');
    setFormUser('');
    setFormSerial('');
    setFormOs('');
    setFormSize('');
    setFormResolution('');
    setFormVersion('');
    setFormLicense('Livre');
    setFormIp('');
    setFormPrinterType('');
    setFormConnection('');
    setFormPeripheralType('Teclado');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const newId = 'custom_' + Date.now();

    if (formCategory === 'computers') {
      const updated = [
        ...computers,
        {
          id: newId,
          hostname: formName,
          status: 'Funcionando',
          location: formLocation || 'Escritório',
          user: formUser || '—',
          manufacturer: formManufacturer || 'Desconhecido',
          serial: formSerial || '—',
          model: formModel || 'Desconhecido',
          os: formOs || 'Windows 11 Pro',
          lastSeen: new Date().toLocaleString('pt-BR').substring(0, 16),
        },
      ];
      setComputers(updated);
      localStorage.setItem('custom_computers', JSON.stringify(updated));
    } else if (formCategory === 'monitors') {
      const updated = [
        ...monitors,
        {
          id: newId,
          name: formName,
          manufacturer: formManufacturer || 'LG',
          model: formModel || 'Standard',
          serial: formSerial || '—',
          size: formSize || '24"',
          location: formLocation || 'Escritório',
          resolution: formResolution || '1920x1080',
        },
      ];
      setMonitors(updated);
      localStorage.setItem('custom_monitors', JSON.stringify(updated));
    } else if (formCategory === 'softwares') {
      const updated = [
        ...softwares,
        {
          id: newId,
          name: formName,
          version: formVersion || '1.0.0',
          manufacturer: formManufacturer || 'Desconhecido',
          installations: 0,
          license: formLicense,
        },
      ];
      setSoftwares(updated);
      localStorage.setItem('custom_softwares', JSON.stringify(updated));
    } else if (formCategory === 'printers') {
      const updated = [
        ...printers,
        {
          id: newId,
          name: formName,
          ip: formIp || '—',
          manufacturer: formManufacturer || 'HP',
          model: formModel || 'Standard',
          type: formPrinterType || 'Laser',
          pages: 0,
        },
      ];
      setPrinters(updated);
      localStorage.setItem('custom_printers', JSON.stringify(updated));
    } else if (formCategory === 'peripherals') {
      const updated = [
        ...peripherals,
        {
          id: newId,
          name: formName,
          type: formPeripheralType,
          manufacturer: formManufacturer || 'Logitech',
          model: formModel || 'Standard',
          connection: formConnection || 'USB',
        },
      ];
      setPeripherals(updated);
      localStorage.setItem('custom_peripherals', JSON.stringify(updated));
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string, category: typeof activeCategory) => {
    if (!confirm('Deseja realmente excluir este ativo do inventário?')) return;

    if (category === 'computers') {
      const updated = computers.filter(c => c.id !== id);
      setComputers(updated);
      localStorage.setItem('custom_computers', JSON.stringify(updated));
    } else if (category === 'monitors') {
      const updated = monitors.filter(m => m.id !== id);
      setMonitors(updated);
      localStorage.setItem('custom_monitors', JSON.stringify(updated));
    } else if (category === 'softwares') {
      const updated = softwares.filter(s => s.id !== id);
      setSoftwares(updated);
      localStorage.setItem('custom_softwares', JSON.stringify(updated));
    } else if (category === 'printers') {
      const updated = printers.filter(p => p.id !== id);
      setPrinters(updated);
      localStorage.setItem('custom_printers', JSON.stringify(updated));
    } else if (category === 'peripherals') {
      const updated = peripherals.filter(pe => pe.id !== id);
      setPeripherals(updated);
      localStorage.setItem('custom_peripherals', JSON.stringify(updated));
    }
  };

  return (
    <div className="p-8">
      {/* Top Title Section */}
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Inventário de Ativos"
          subtitle="Gerenciamento de computadores, softwares e infraestrutura de rede integrado (Estilo GLPI)"
        />
        <Button variant="primary" onClick={openCreateModal}>
          + Novo Ativo
        </Button>
      </div>

      {/* GLPI Categories Grid Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <button
          onClick={() => setActiveCategory('computers')}
          className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 ${
            activeCategory === 'computers'
              ? 'bg-rose-500/20 border-rose-500/50 ring-2 ring-rose-500/30'
              : 'bg-slate-900 border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-start w-full">
            <span className="text-2xl">🖥️</span>
            <span className="text-xs font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">{counts.computers}</span>
          </div>
          <div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Computadores</h3>
            <p className="text-xl font-bold text-white mt-1">Máquinas</p>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('monitors')}
          className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 ${
            activeCategory === 'monitors'
              ? 'bg-orange-500/20 border-orange-500/50 ring-2 ring-orange-500/30'
              : 'bg-slate-900 border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-start w-full">
            <span className="text-2xl">📺</span>
            <span className="text-xs font-bold bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">{counts.monitors}</span>
          </div>
          <div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Monitores</h3>
            <p className="text-xl font-bold text-white mt-1">Telas</p>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('softwares')}
          className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 ${
            activeCategory === 'softwares'
              ? 'bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500/30'
              : 'bg-slate-900 border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-start w-full">
            <span className="text-2xl">💾</span>
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">{counts.softwares}</span>
          </div>
          <div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Softwares</h3>
            <p className="text-xl font-bold text-white mt-1">Sistemas</p>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('printers')}
          className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 ${
            activeCategory === 'printers'
              ? 'bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500/30'
              : 'bg-slate-900 border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-start w-full">
            <span className="text-2xl">🖨️</span>
            <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{counts.printers}</span>
          </div>
          <div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Impressoras</h3>
            <p className="text-xl font-bold text-white mt-1">Output</p>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('peripherals')}
          className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 ${
            activeCategory === 'peripherals'
              ? 'bg-purple-500/20 border-purple-500/50 ring-2 ring-purple-500/30'
              : 'bg-slate-900 border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex justify-between items-start w-full">
            <span className="text-2xl">⌨️</span>
            <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{counts.peripherals}</span>
          </div>
          <div>
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Periféricos</h3>
            <p className="text-xl font-bold text-white mt-1">Acessórios</p>
          </div>
        </button>
      </div>

      <Panel>
        {/* Title & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-slate-700/50 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {activeCategory === 'computers' && 'Inventário de Computadores'}
              {activeCategory === 'monitors' && 'Inventário de Monitores'}
              {activeCategory === 'softwares' && 'Catálogo de Softwares'}
              {activeCategory === 'printers' && 'Dispositivos de Impressão'}
              {activeCategory === 'peripherals' && 'Acessórios & Periféricos'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Exibindo {counts[activeCategory]} ativos nesta lista</p>
          </div>
          <Input
            type="text"
            placeholder="Filtrar por nome, modelo, fabricante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
          />
        </div>

        {/* COMPUTERS VIEW */}
        {activeCategory === 'computers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700 font-medium">
                  <th className="py-3 px-3">Nome</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Localização</th>
                  <th className="py-3 px-3">Usuário</th>
                  <th className="py-3 px-3">Fabricante</th>
                  <th className="py-3 px-3">Modelo</th>
                  <th className="py-3 px-3">Nº Série</th>
                  <th className="py-3 px-3">Sist. Operacional</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {allComputers
                  .filter(c =>
                    c.hostname.toLowerCase().includes(search.toLowerCase()) ||
                    c.model.toLowerCase().includes(search.toLowerCase()) ||
                    c.manufacturer.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <Link href={`/assets/${c.id}`} className="text-blue-400 hover:text-blue-300 font-medium">
                          {c.hostname}
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          c.status === 'Funcionando'
                            ? 'bg-green-955/30 text-green-400 border-green-700/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{c.location}</td>
                      <td className="py-3 px-3 text-slate-300">{c.user}</td>
                      <td className="py-3 px-3 text-slate-300">{c.manufacturer}</td>
                      <td className="py-3 px-3 text-slate-300 font-medium">{c.model}</td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-400">{c.serial}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs">{c.os}</td>
                      <td className="py-3 px-3 text-right">
                        {c.id.startsWith('custom_') && (
                          <button onClick={() => handleDeleteItem(c.id, 'computers')} className="text-red-400 hover:text-red-300 text-xs font-semibold">Excluir</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MONITORS VIEW */}
        {activeCategory === 'monitors' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700 font-medium">
                  <th className="py-3 px-3">Nome</th>
                  <th className="py-3 px-3">Fabricante</th>
                  <th className="py-3 px-3">Modelo</th>
                  <th className="py-3 px-3">Nº Série</th>
                  <th className="py-3 px-3">Tamanho</th>
                  <th className="py-3 px-3">Resolução</th>
                  <th className="py-3 px-3">Localização</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {monitors
                  .filter(m =>
                    m.name.toLowerCase().includes(search.toLowerCase()) ||
                    m.model.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-200">{m.name}</td>
                      <td className="py-3 px-3 text-slate-300">{m.manufacturer}</td>
                      <td className="py-3 px-3 text-slate-300">{m.model}</td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-400">{m.serial}</td>
                      <td className="py-3 px-3 text-slate-300">{m.size}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs">{m.resolution}</td>
                      <td className="py-3 px-3 text-slate-300">{m.location}</td>
                      <td className="py-3 px-3 text-right">
                        {m.id.startsWith('custom_') && (
                          <button onClick={() => handleDeleteItem(m.id, 'monitors')} className="text-red-400 hover:text-red-300 text-xs font-semibold">Excluir</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SOFTWARES VIEW */}
        {activeCategory === 'softwares' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700 font-medium">
                  <th className="py-3 px-3">Nome do Software</th>
                  <th className="py-3 px-3">Fabricante</th>
                  <th className="py-3 px-3">Versão</th>
                  <th className="py-3 px-3">Instalações Ativas</th>
                  <th className="py-3 px-3">Licença Vinculada</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {softwares
                  .filter(s =>
                    s.name.toLowerCase().includes(search.toLowerCase()) ||
                    s.manufacturer.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-200">{s.name}</td>
                      <td className="py-3 px-3 text-slate-300">{s.manufacturer}</td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-400">{s.version}</td>
                      <td className="py-3 px-3 text-slate-200 font-semibold">{s.installations} computadores</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          s.license === 'Livre'
                            ? 'bg-green-955/30 text-green-400 border-green-700/30'
                            : 'bg-blue-955/30 text-blue-400 border-blue-700/30'
                        }`}>
                          {s.license}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {s.id.startsWith('custom_') && (
                          <button onClick={() => handleDeleteItem(s.id, 'softwares')} className="text-red-400 hover:text-red-300 text-xs font-semibold">Excluir</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PRINTERS VIEW */}
        {activeCategory === 'printers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700 font-medium">
                  <th className="py-3 px-3">Nome</th>
                  <th className="py-3 px-3">IP do Host</th>
                  <th className="py-3 px-3">Fabricante</th>
                  <th className="py-3 px-3">Modelo</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Páginas Impressas</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {printers
                  .filter(p =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.model.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-200">{p.name}</td>
                      <td className="py-3 px-3 font-mono text-xs text-blue-400">{p.ip}</td>
                      <td className="py-3 px-3 text-slate-300">{p.manufacturer}</td>
                      <td className="py-3 px-3 text-slate-300">{p.model}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs">{p.type}</td>
                      <td className="py-3 px-3 text-slate-300 font-medium">{p.pages.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-3 text-right">
                        {p.id.startsWith('custom_') && (
                          <button onClick={() => handleDeleteItem(p.id, 'printers')} className="text-red-400 hover:text-red-300 text-xs font-semibold">Excluir</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PERIPHERALS VIEW */}
        {activeCategory === 'peripherals' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700 font-medium">
                  <th className="py-3 px-3">Nome do Dispositivo</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Fabricante</th>
                  <th className="py-3 px-3">Modelo</th>
                  <th className="py-3 px-3">Tipo de Conexão</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {peripherals
                  .filter(pe =>
                    pe.name.toLowerCase().includes(search.toLowerCase()) ||
                    pe.type.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((pe) => (
                    <tr key={pe.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-medium text-slate-200">{pe.name}</td>
                      <td className="py-3 px-3 text-slate-300">{pe.type}</td>
                      <td className="py-3 px-3 text-slate-300">{pe.manufacturer}</td>
                      <td className="py-3 px-3 text-slate-300">{pe.model}</td>
                      <td className="py-3 px-3 text-slate-400 text-xs">{pe.connection}</td>
                      <td className="py-3 px-3 text-right">
                        {pe.id.startsWith('custom_') && (
                          <button onClick={() => handleDeleteItem(pe.id, 'peripherals')} className="text-red-400 hover:text-red-300 text-xs font-semibold">Excluir</button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Asset Creation Modal (GLPI style) */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Novo Ativo no Inventário"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={!formName}>Salvar Ativo</Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Field label="Categoria do Ativo" required>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as any)}
            >
              <option value="computers">Computador</option>
              <option value="monitors">Monitor</option>
              <option value="softwares">Software</option>
              <option value="printers">Impressora</option>
              <option value="peripherals">Periférico</option>
            </select>
          </Field>

          <Field label="Nome / Identificador do Ativo" required>
            <Input
              type="text"
              placeholder="Ex: DESKTOP-LAB1, MONITOR-05, Chrome"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Fabricante">
              <Input
                type="text"
                placeholder="Ex: DELL, LENOVO, LG"
                value={formManufacturer}
                onChange={(e) => setFormManufacturer(e.target.value)}
              />
            </Field>
            <Field label="Modelo / Versão">
              <Input
                type="text"
                placeholder="Ex: ThinkCentre, Latitude, 125.0"
                value={formModel}
                onChange={(e) => setFormModel(e.target.value)}
              />
            </Field>
          </div>

          {/* COMPUTER SPECIFIC FIELDS */}
          {formCategory === 'computers' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Localização">
                  <Input
                    type="text"
                    placeholder="Ex: Suporte TI, Sala 301"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                  />
                </Field>
                <Field label="Usuário Responsável">
                  <Input
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formUser}
                    onChange={(e) => setFormUser(e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nº de Série">
                  <Input
                    type="text"
                    placeholder="Ex: PE02B4RX"
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                  />
                </Field>
                <Field label="Sist. Operacional">
                  <Input
                    type="text"
                    placeholder="Ex: Windows 11 Pro"
                    value={formOs}
                    onChange={(e) => setFormOs(e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          {/* MONITOR SPECIFIC FIELDS */}
          {formCategory === 'monitors' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tamanho da Tela">
                  <Input
                    type="text"
                    placeholder='Ex: 24", 27"'
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                  />
                </Field>
                <Field label="Resolução Padrão">
                  <Input
                    type="text"
                    placeholder="Ex: 1920x1080"
                    value={formResolution}
                    onChange={(e) => setFormResolution(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Localização">
                <Input
                  type="text"
                  placeholder="Ex: Suporte TI"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                />
              </Field>
            </>
          )}

          {/* SOFTWARE SPECIFIC FIELDS */}
          {formCategory === 'softwares' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Versão do Pacote">
                  <Input
                    type="text"
                    placeholder="Ex: 125.0.6422"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                  />
                </Field>
                <Field label="Tipo de Licenciamento">
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
                    value={formLicense}
                    onChange={(e) => setFormLicense(e.target.value)}
                  >
                    <option value="Livre">Livre (Open Source)</option>
                    <option value="Proprietária">Proprietária</option>
                    <option value="Volume O365">Volume O365 / Assinatura</option>
                    <option value="SaaS">SaaS</option>
                  </select>
                </Field>
              </div>
            </>
          )}

          {/* PRINTER SPECIFIC FIELDS */}
          {formCategory === 'printers' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Endereço IP">
                  <Input
                    type="text"
                    placeholder="Ex: 192.168.1.50"
                    value={formIp}
                    onChange={(e) => setFormIp(e.target.value)}
                  />
                </Field>
                <Field label="Tipo de Impressão">
                  <Input
                    type="text"
                    placeholder="Ex: Laser Monocromática, Jato de Tinta"
                    value={formPrinterType}
                    onChange={(e) => setFormPrinterType(e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          {/* PERIPHERAL SPECIFIC FIELDS */}
          {formCategory === 'peripherals' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo de Periférico">
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
                    value={formPeripheralType}
                    onChange={(e) => setFormPeripheralType(e.target.value)}
                  >
                    <option value="Teclado">Teclado</option>
                    <option value="Mouse">Mouse</option>
                    <option value="Headset">Headset</option>
                    <option value="Webcam">Webcam</option>
                    <option value="Adaptador">Adaptador</option>
                  </select>
                </Field>
                <Field label="Conexão">
                  <Input
                    type="text"
                    placeholder="Ex: Fio USB, Bluetooth, Wireless"
                    value={formConnection}
                    onChange={(e) => setFormConnection(e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
}
