'use client';
import { useState } from 'react';
import { PageHeader, Panel, Button } from '@/components/ui';

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'workflow'>('rules');

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Automação e Workflows" subtitle="Motor de regras de negócios e fluxos visuais" />
        <div className="flex gap-1">
          <Button
            variant={activeTab === 'rules' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('rules')}
          >
            Regras de Automação
          </Button>
          <Button
            variant={activeTab === 'workflow' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('workflow')}
          >
            Workflow Drag & Drop
          </Button>
        </div>
      </div>

      {activeTab === 'rules' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Minhas Regras</h2>
            <Button variant="primary">+ Nova Regra</Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Rule Card 1 */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <h3 className="text-lg font-bold text-white">Alerta de SLA Estourado</h3>
                </div>
                <div className="flex items-center flex-wrap gap-2 text-sm text-slate-300">
                  <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700 font-mono text-xs">SE</span>
                  <span>Tempo de SLA for &lt; 0</span>
                  <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700 font-mono text-xs">E</span>
                  <span>Status não for Fechado/Pausado</span>
                  <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700 font-mono text-xs ml-2">ENTÃO</span>
                  <span className="text-blue-400">Notificar NOC por Telegram</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">Editar</Button>
                <Button variant="danger" size="sm">Excluir</Button>
              </div>
            </div>

            {/* Rule Builder Mock */}
            <div className="bg-slate-800/50 rounded-xl border border-blue-500/50 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h3 className="text-lg font-bold text-white mb-4">Criar Nova Regra</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">1. Gatilho (Quando...)</span>
                  <select className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500">
                    <option>Quando um ticket for criado</option>
                    <option>Quando um ticket for atualizado</option>
                    <option>Quando um ticket for fechado</option>
                    <option>Gatilho baseado em Tempo (SLA)</option>
                  </select>
                </div>
                
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">2. Condições (Se...)</span>
                  <div className="flex gap-2 mb-2">
                    <select className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500">
                      <option>Categoria</option>
                      <option>Prioridade</option>
                      <option>Tempo restante SLA</option>
                    </select>
                    <select className="w-32 bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500">
                      <option>=</option>
                      <option>&gt;</option>
                      <option>&lt;</option>
                    </select>
                    <input type="text" className="w-24 bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500" defaultValue="0" />
                  </div>
                  <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">+ Adicionar Condição</button>
                </div>

                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">3. Ação (Então...)</span>
                  <div className="flex gap-2">
                    <select className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500">
                      <option>Alterar Status</option>
                      <option>Alterar Prioridade</option>
                      <option>Enviar Notificação (Push/Telegram/Email)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary">Salvar Regra</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Panel>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-slate-600 text-4xl">
              🧩
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Workflow Visual</h2>
            <p className="text-slate-400 text-center max-w-md mb-8">
              Arraste e solte blocos para criar fluxos de status customizados. (A tela de Canvas será integrada em breve com React Flow).
            </p>
            <Button variant="secondary">Abrir Canvas Experimental</Button>
          </div>
        </Panel>
      )}
    </div>
  );
}
