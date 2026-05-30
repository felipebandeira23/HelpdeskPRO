'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'new'>('tickets');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Central de Ajuda</h1>
          <p className="text-slate-400">Acompanhe seus chamados ou abra uma nova solicitação.</p>
        </div>
        
        <div className="bg-slate-800 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'tickets' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Meus Chamados
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'new' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
          >
            Abrir Chamado
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
        {activeTab === 'tickets' ? (
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-700">
                  <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Assunto</th>
                  <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Atualização</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 text-sm font-mono text-slate-300">#1024</td>
                  <td className="p-4 text-sm text-white font-medium">Problema de acesso ao ERP</td>
                  <td className="p-4 text-sm"><span className="bg-yellow-900/50 text-yellow-400 border border-yellow-700/50 px-2 py-1 rounded text-xs">Em Andamento</span></td>
                  <td className="p-4 text-sm text-slate-400">Hoje, 10:30</td>
                </tr>
                <tr className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 text-sm font-mono text-slate-300">#1021</td>
                  <td className="p-4 text-sm text-white font-medium">Solicitação de novo mouse</td>
                  <td className="p-4 text-sm"><span className="bg-green-900/50 text-green-400 border border-green-700/50 px-2 py-1 rounded text-xs">Resolvido</span></td>
                  <td className="p-4 text-sm text-slate-400">Ontem, 15:45</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 max-w-2xl">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setActiveTab('tickets'); }}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Categoria</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Suporte a Equipamentos</option>
                  <option>Dúvida sobre Software</option>
                  <option>Acesso e Senhas</option>
                  <option>Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Assunto</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Impressora não liga" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Descrição Detalhada</label>
                <textarea rows={5} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Descreva o problema ou solicitação com o máximo de detalhes..." required></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Anexos</label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:bg-slate-900/50 transition-colors cursor-pointer">
                  <span className="text-slate-400 text-sm">Clique ou arraste arquivos aqui para anexar</span>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                  Enviar Solicitação
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
