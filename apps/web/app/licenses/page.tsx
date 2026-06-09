'use client';

import { useState } from 'react';
import { PageHeader, Panel, StatCard } from '@/components/ui';

export default function LicensesPage() {
  const licenses = [
    { id: '1', software: 'Microsoft Office 365', type: 'Assinatura (SaaS)', purchased: 150, installed: 142, expireAt: '2026-12-31', status: 'OK' },
    { id: '2', software: 'Adobe Creative Cloud', type: 'Assinatura (SaaS)', purchased: 15, installed: 15, expireAt: '2026-06-15', status: 'ESGOTADO' },
    { id: '3', software: 'Windows 11 Pro (OEM)', type: 'Chave Perpétua', purchased: 300, installed: 310, expireAt: null, status: 'EXCEDIDO' },
    { id: '4', software: 'SPSS Statistics', type: 'Chave Perpétua (Acadêmica)', purchased: 40, installed: 22, expireAt: null, status: 'OK' },
  ];

  const totalPurchased = licenses.reduce((acc, l) => acc + l.purchased, 0);
  const totalInstalled = licenses.reduce((acc, l) => acc + l.installed, 0);

  // Only sum positive balances
  const totalAvailable = licenses.reduce((acc, l) => {
    const diff = l.purchased - l.installed;
    return diff > 0 ? acc + diff : acc;
  }, 0);

  // Sum negative balances (where installed > purchased)
  const totalExceeded = licenses.reduce((acc, l) => {
    const diff = l.installed - l.purchased;
    return diff > 0 ? acc + diff : acc;
  }, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Licenças de Software (SAM)" subtitle="Gestão de ativos de software, chaves e conformidade de uso" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-lg shadow-blue-900/20">
          + Adicionar Licença
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total de Licenças" value={totalPurchased} icon="🔑" accent="bg-blue-600" />
        <StatCard title="Em Uso" value={totalInstalled} icon="💻" accent="bg-purple-600" />
        <StatCard title="Disponíveis" value={totalAvailable} icon="✅" accent="bg-emerald-600" />
        <StatCard title="Irregulares (Excedidas)" value={totalExceeded} icon="⚠️" accent="bg-red-600" />
      </div>

      <Panel>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Inventário de Software</h2>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Buscar software..." 
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider bg-slate-800/30">
                <th className="py-3 px-4 font-bold rounded-tl-lg">Software</th>
                <th className="py-3 px-4 font-bold">Tipo</th>
                <th className="py-3 px-4 font-bold">Compradas</th>
                <th className="py-3 px-4 font-bold">Instaladas</th>
                <th className="py-3 px-4 font-bold">Disponíveis</th>
                <th className="py-3 px-4 font-bold">Expiração</th>
                <th className="py-3 px-4 font-bold rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {licenses.map(lic => {
                const available = lic.purchased - lic.installed;
                return (
                  <tr key={lic.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4 text-white font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">💿</div>
                      {lic.software}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300">{lic.type}</td>
                    <td className="py-4 px-4 text-sm font-mono text-slate-300">{lic.purchased}</td>
                    <td className="py-4 px-4 text-sm font-mono text-slate-300">{lic.installed}</td>
                    <td className="py-4 px-4">
                      <span className={`text-sm font-bold font-mono ${available > 0 ? 'text-green-400' : available === 0 ? 'text-slate-400' : 'text-red-400'}`}>
                        {available}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-400">
                      {lic.expireAt ? new Date(lic.expireAt).toLocaleDateString('pt-BR') : 'Vitalícia'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        lic.status === 'OK' ? 'bg-green-900/30 text-green-400 border border-green-700/30' : 
                        lic.status === 'ESGOTADO' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/30' : 
                        'bg-red-900/30 text-red-400 border border-red-700/30'
                      }`}>
                        {lic.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
