'use client';
import { PageHeader, Panel } from '@/components/ui';

export default function ChecklistsPage() {
  const templates = [
    { id: 1, title: 'Formatação de Computador Padrão', items: 8, usage: 142 },
    { id: 2, title: 'Onboarding de Novo Funcionário', items: 15, usage: 89 },
    { id: 3, title: 'Manutenção Preventiva de Servidor', items: 12, usage: 34 },
  ];

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Templates de Checklist" subtitle="Padronização de roteiros de atendimento" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors">
          + Criar Template
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-1 overflow-y-auto">
          <Panel className="h-full">
            <h2 className="text-lg font-bold text-white mb-4">Meus Modelos</h2>
            <div className="space-y-3">
              {templates.map((tpl, i) => (
                <div key={tpl.id} className={`p-4 rounded-lg cursor-pointer transition-colors border ${i === 0 ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}>
                  <h3 className={`font-bold mb-1 ${i === 0 ? 'text-blue-400' : 'text-white'}`}>{tpl.title}</h3>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{tpl.items} itens</span>
                    <span>Usado {tpl.usage}x</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-2 overflow-y-auto">
          <Panel className="h-full flex flex-col">
            <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Formatação de Computador Padrão</h2>
                <p className="text-sm text-slate-400">Roteiro para preparo de máquina para colaborador.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded text-sm transition-colors">Editar</button>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-500 uppercase">Fase 1: Preparação</h3>
                <div className="bg-slate-900 border border-slate-700 p-3 rounded flex gap-3 items-center">
                  <div className="w-5 h-5 rounded border-2 border-slate-600 flex-shrink-0"></div>
                  <span className="text-slate-300 flex-1">Fazer backup local dos arquivos do usuário</span>
                  <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-700/30">Obrigatório</span>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-3 rounded flex gap-3 items-center">
                  <div className="w-5 h-5 rounded border-2 border-slate-600 flex-shrink-0"></div>
                  <span className="text-slate-300 flex-1">Anotar serial do Windows e Office</span>
                  <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-700/30">Obrigatório</span>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase">Fase 2: Instalação</h3>
                <div className="bg-slate-900 border border-slate-700 p-3 rounded flex gap-3 items-center">
                  <div className="w-5 h-5 rounded border-2 border-slate-600 flex-shrink-0"></div>
                  <span className="text-slate-300 flex-1">Instalar Windows 11 Pro via Pendrive</span>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-3 rounded flex gap-3 items-center">
                  <div className="w-5 h-5 rounded border-2 border-slate-600 flex-shrink-0"></div>
                  <span className="text-slate-300 flex-1">Rodar script de Ninite (Chrome, 7-zip, VLC, PDF)</span>
                </div>
                <div className="bg-slate-900 border border-slate-700 p-3 rounded flex gap-3 items-center">
                  <div className="w-5 h-5 rounded border-2 border-slate-600 flex-shrink-0"></div>
                  <span className="text-slate-300 flex-1">Ingressar no Domínio (AD)</span>
                  <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded border border-red-700/30">Obrigatório</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-center">
               <button className="text-slate-400 hover:text-white border border-dashed border-slate-600 hover:border-slate-400 px-4 py-2 rounded transition-colors text-sm w-full">
                 + Adicionar Item ao Checklist
               </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
