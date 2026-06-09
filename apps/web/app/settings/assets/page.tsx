'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader, Panel, Button, Field, Input } from '@/components/ui';

export default function AssetSettingsPage() {
  const [uniqueness, setUniqueness] = useState({
    hostname: true,
    serial: true,
    mac: false,
    ip: false,
  });

  const [components, setComponents] = useState([
    { id: '1', name: 'Intel Core i5-10400F', type: 'Processador (CPU)', brand: 'Intel' },
    { id: '2', name: 'Kingston DDR4 8GB 3200MHz', type: 'Memória RAM', brand: 'Kingston' },
    { id: '3', name: 'Kingston NV1 512GB NVMe M.2', type: 'Disco Rígido (SSD)', brand: 'Kingston' },
  ]);

  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState('Processador (CPU)');
  const [newCompBrand, setNewCompBrand] = useState('');
  const [uniquenessFeedback, setUniquenessFeedback] = useState(false);

  useEffect(() => {
    const localUniqueness = localStorage.getItem('settings_asset_uniqueness');
    const localComponents = localStorage.getItem('settings_asset_components');
    if (localUniqueness) {
      try {
        setUniqueness(JSON.parse(localUniqueness));
      } catch (e) {
        console.error(e);
      }
    }
    if (localComponents) {
      try {
        setComponents(JSON.parse(localComponents));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const addComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName || !newCompBrand) return;
    const updatedComponents = [
      ...components,
      {
        id: String(Date.now()),
        name: newCompName,
        type: newCompType,
        brand: newCompBrand,
      },
    ];
    setComponents(updatedComponents);
    localStorage.setItem('settings_asset_components', JSON.stringify(updatedComponents));
    setNewCompName('');
    setNewCompBrand('');
  };

  const deleteComponent = (id: string) => {
    const updatedComponents = components.filter((c) => c.id !== id);
    setComponents(updatedComponents);
    localStorage.setItem('settings_asset_components', JSON.stringify(updatedComponents));
  };

  const handleSaveUniqueness = () => {
    localStorage.setItem('settings_asset_uniqueness', JSON.stringify(uniqueness));
    setUniquenessFeedback(true);
    setTimeout(() => setUniquenessFeedback(false), 3000);
  };

  return (
    <div className="p-8 space-y-6">
      <Link
        href="/settings"
        className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-block font-medium"
      >
        ← Voltar para Configurações
      </Link>
      <PageHeader
        title="Definições de Ativos"
        subtitle="Gerencie componentes de hardware globais e configure regras de unicidade de inventário"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Uniqueness Rules Panel */}
        <Panel className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Unicidade de Campos</h2>
            <p className="text-xs text-slate-400">Evite duplicidade no inventário definindo restrições baseadas nos campos abaixo</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">Hostname Único</p>
                <p className="text-[10px] text-slate-400">Impedir hostnames duplicados</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={uniqueness.hostname} onChange={() => setUniqueness({ ...uniqueness, hostname: !uniqueness.hostname })} />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">Número de Série Único</p>
                <p className="text-[10px] text-slate-400">Requerer número de série único global</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={uniqueness.serial} onChange={() => setUniqueness({ ...uniqueness, serial: !uniqueness.serial })} />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">MAC Address Único</p>
                <p className="text-[10px] text-slate-400">Exigir placas de rede exclusivas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={uniqueness.mac} onChange={() => setUniqueness({ ...uniqueness, mac: !uniqueness.mac })} />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-700/50">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">Endereço IP Único</p>
                <p className="text-[10px] text-slate-400">Verificar se o IP local é exclusivo</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={uniqueness.ip} onChange={() => setUniqueness({ ...uniqueness, ip: !uniqueness.ip })} />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>

          <Button variant="primary" fullWidth onClick={handleSaveUniqueness}>
            {uniquenessFeedback ? '✓ Regras Salvas' : 'Salvar Regras de Unicidade'}
          </Button>
        </Panel>

        {/* Global Component Types Catalog */}
        <Panel className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Catálogo de Componentes Globais</h2>
            <p className="text-xs text-slate-400">Adicione ou remova definições de peças de hardware válidas para homologação</p>
          </div>

          <div className="space-y-3">
            {components.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 text-sm">
                <div className="space-y-1">
                  <p className="font-bold text-white">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.type} — Marca: <span className="text-slate-300 font-semibold">{c.brand}</span></p>
                </div>
                <button onClick={() => deleteComponent(c.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Excluir</button>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-700/50 pt-4">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Homologar Novo Componente</h3>
            <form onSubmit={addComponent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Nome da Peça/Modelo" required>
                  <Input
                    type="text"
                    placeholder="Ex: Corsair Vengeance 16GB"
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                  />
                </Field>
                <Field label="Marca/Fabricante" required>
                  <Input
                    type="text"
                    placeholder="Ex: Corsair, Intel, WD"
                    value={newCompBrand}
                    onChange={(e) => setNewCompBrand(e.target.value)}
                  />
                </Field>
                <Field label="Tipo de Componente" required>
                  <select
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
                    value={newCompType}
                    onChange={(e) => setNewCompType(e.target.value)}
                  >
                    <option value="Processador (CPU)">Processador (CPU)</option>
                    <option value="Memória RAM">Memória RAM</option>
                    <option value="Disco Rígido (SSD)">Disco Rígido (SSD)</option>
                    <option value="Placa de Vídeo (GPU)">Placa de Vídeo (GPU)</option>
                    <option value="Placa de Rede">Placa de Rede</option>
                  </select>
                </Field>
              </div>
              <div className="flex justify-end">
                <Button variant="primary" type="submit">Homologar Componente</Button>
              </div>
            </form>
          </div>
        </Panel>
      </div>
    </div>
  );
}
