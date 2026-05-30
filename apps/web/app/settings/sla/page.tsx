'use client';
import Link from 'next/link';
import { PageHeader, Panel, Button } from '@/components/ui';

export default function SLAPage() {
  const slaRules = [
    { id: 1, name: 'SLA Prioridade Urgente', criteria: 'Prioridade = URGENTE', response: '15m', solution: '4h', active: true },
    { id: 2, name: 'SLA Prioridade Alta', criteria: 'Prioridade = ALTA', response: '30m', solution: '8h', active: true },
    { id: 3, name: 'SLA Contrato Premium', criteria: 'Cliente.Contrato = Premium', response: '1h', solution: '24h', active: false },
  ];

  return (
    <div className="p-8 h-full flex flex-col">
      <Link href="/settings" className="text-sm text-blue-400 mb-4 inline-block hover:text-blue-300">← Voltar para Configurações</Link>
      
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Motor de SLA" subtitle="Gerenciamento de Acordos de Nível de Serviço" />
        <Button variant="primary">+ Criar Regra SLA</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 overflow-y-auto">
          <Panel>
            <h2 className="text-lg font-bold text-white mb-4">Políticas Ativas</h2>
            <div className="space-y-4">
              {slaRules.map(rule => (
                <div key={rule.id} className="bg-slate-900 border border-slate-700 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-500 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white">{rule.name}</h3>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${rule.active ? 'bg-green-900/30 text-green-400 border border-green-700/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                        {rule.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center text-sm">
                      <span className="text-slate-500">Se</span>
                      <span className="bg-slate-800 text-blue-400 px-2 py-0.5 rounded font-mono text-xs">{rule.criteria}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="text-center bg-slate-800/50 px-3 py-2 rounded">
                      <div className="text-xs text-slate-500 uppercase font-bold">Resposta</div>
                      <div className="text-lg font-bold text-amber-400">{rule.response}</div>
                    </div>
                    <div className="text-center bg-slate-800/50 px-3 py-2 rounded">
                      <div className="text-xs text-slate-500 uppercase font-bold">Solução</div>
                      <div className="text-lg font-bold text-green-400">{rule.solution}</div>
                    </div>
                    <div className="flex flex-col gap-2 ml-2">
                      <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">✏️</span>
                      <span className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer">🗑️</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6 overflow-y-auto">
          <Panel>
            <h2 className="text-lg font-bold text-white mb-4">Horário de Atendimento</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
                <span className="text-slate-300">Dias Úteis (Seg - Sex)</span>
                <span className="font-mono text-white bg-slate-800 px-2 py-1 rounded">08:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
                <span className="text-slate-300">Sábados</span>
                <span className="font-mono text-white bg-slate-800 px-2 py-1 rounded">08:00 - 12:00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Domingos e Feriados</span>
                <span className="font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">Sem Expediente</span>
              </div>
            </div>
            <button className="w-full mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">Editar Calendário / Feriados</button>
          </Panel>

          <Panel>
            <h2 className="text-lg font-bold text-white mb-4">Regra de Pausa de SLA</h2>
            <p className="text-sm text-slate-400 mb-4">Quais status pausam a contagem regressiva do SLA?</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
                <span className="text-slate-300 text-sm">Aguardando Cliente</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
                <span className="text-slate-300 text-sm">Aguardando Fornecedor / Terceiro</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-blue-500" />
                <span className="text-slate-300 text-sm">Em Análise Técnica</span>
              </label>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
