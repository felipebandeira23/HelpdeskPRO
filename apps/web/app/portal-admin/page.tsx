'use client';
import { useState } from 'react';
import { PageHeader, Panel, StatCard } from '@/components/ui';

export default function PortalAdminPage() {
  const [activeTab, setActiveTab] = useState<'articles' | 'announcements'>('articles');

  const articles = [
    { id: 1, title: 'Como resetar a senha do ERP', category: 'Acessos', views: 1245, status: 'Publicado' },
    { id: 2, title: 'Configurando a VPN no Windows 11', category: 'Redes', views: 890, status: 'Publicado' },
    { id: 3, title: 'Política de Uso de Equipamentos', category: 'RH', views: 320, status: 'Rascunho' },
  ];

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Gestão do Portal do Cliente" subtitle="Base de Conhecimento e Comunicados" />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:text-white transition-colors border border-slate-700">
            Acessar Portal como Cliente
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors">
            + Novo Artigo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 shrink-0">
        <StatCard title="Artigos Publicados" value="42" icon="📚" accent="bg-blue-500" />
        <StatCard title="Visualizações Totais" value="12.5k" icon="👁️" accent="bg-emerald-500" />
        <StatCard title="Avaliação Útil (Média)" value="94%" icon="👍" accent="bg-amber-500" />
      </div>

      <Panel className="flex-1 flex flex-col min-h-[400px]">
        <div className="flex gap-6 border-b border-slate-700 mb-6">
          <button 
            onClick={() => setActiveTab('articles')}
            className={`pb-3 font-medium transition-colors ${activeTab === 'articles' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            Base de Conhecimento (FAQ)
          </button>
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 font-medium transition-colors ${activeTab === 'announcements' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'}`}
          >
            Avisos e Comunicados Globais
          </button>
        </div>

        {activeTab === 'articles' ? (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Título do Artigo</th>
                  <th className="pb-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Categoria</th>
                  <th className="pb-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Visualizações</th>
                  <th className="pb-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Status</th>
                  <th className="pb-3 text-xs uppercase tracking-wider text-slate-500 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {articles.map(art => (
                  <tr key={art.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 font-medium text-white">{art.title}</td>
                    <td className="py-4 text-sm text-slate-400">{art.category}</td>
                    <td className="py-4 text-sm text-slate-400">{art.views.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${art.status === 'Publicado' ? 'bg-green-900/30 text-green-400 border border-green-700/30' : 'bg-slate-800 text-slate-400 border border-slate-600'}`}>
                        {art.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="text-sm text-blue-400 hover:text-blue-300 mr-3">Editar</button>
                      <button className="text-sm text-red-400 hover:text-red-300">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-5xl mb-4">📢</span>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum Comunicado Ativo</h3>
            <p className="text-slate-400 max-w-md mb-6">Crie avisos que aparecerão no topo do Portal do Cliente (ex: Manutenção Agendada, Queda de Serviço).</p>
            <button className="px-4 py-2 border border-slate-600 text-white rounded hover:bg-slate-800 transition-colors">
              Criar Primeiro Aviso
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}
