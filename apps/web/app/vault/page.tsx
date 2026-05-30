'use client';
import { useState } from 'react';
import { PageHeader, Panel } from '@/components/ui';

export default function VaultPage() {
  const [revealed, setRevealed] = useState<number | null>(null);

  const passwords = [
    { id: 1, name: 'Roteador Mikrotik Core', username: 'admin', lastUpdate: 'Hoje' },
    { id: 2, name: 'Banco de Dados ERP', username: 'sa', lastUpdate: '10/05/2026' },
    { id: 3, name: 'Acesso Admin Servidor AD', username: 'administrator', lastUpdate: '15/04/2026' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Cofre de Senhas" subtitle="Armazenamento criptografado de credenciais de ativos" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors">
          + Adicionar Credencial
        </button>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-4 text-xs font-medium text-slate-400 uppercase">Ativo / Recurso</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase">Usuário</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase">Senha</th>
                <th className="p-4 text-xs font-medium text-slate-400 uppercase">Última Atualização</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {passwords.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-white">{p.name}</td>
                  <td className="p-4 text-sm text-slate-300 font-mono">{p.username}</td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <input 
                        type={revealed === p.id ? "text" : "password"} 
                        value="S3nh@F0rt3" 
                        readOnly 
                        className="bg-transparent border-none text-slate-300 font-mono w-24 focus:outline-none"
                      />
                      <button 
                        onClick={() => setRevealed(revealed === p.id ? null : p.id)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                        title={revealed === p.id ? "Ocultar" : "Revelar"}
                      >
                        {revealed === p.id ? "👁️‍🗨️" : "👁️"}
                      </button>
                      <button 
                        className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
                        title="Copiar"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{p.lastUpdate}</td>
                  <td className="p-4 text-right">
                    <button className="text-sm text-blue-400 hover:text-blue-300">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
