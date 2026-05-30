'use client';

import { PageHeader, Panel } from '@/components/ui';

export default function PlanningPage() {
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1); // Mock calendar days
  
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Planejamento" subtitle="Calendário de equipe, manutenções programadas e vencimentos" />
        <div className="flex gap-2">
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors font-medium text-sm border border-slate-700">
            Mês Anterior
          </button>
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg transition-colors font-medium text-sm border border-slate-700">
            Próximo Mês
          </button>
        </div>
      </div>

      <Panel className="flex-1 flex flex-col min-h-0 bg-slate-900/50 p-0 overflow-hidden border-slate-700/50">
        <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-950">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-bold text-slate-400 uppercase tracking-wider border-r border-slate-700 last:border-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 grid-rows-5 flex-1">
          {dates.map((date, idx) => (
            <div key={idx} className="border-r border-b border-slate-700/50 p-2 relative min-h-[120px] bg-slate-900/20 hover:bg-slate-800/30 transition-colors group">
              <span className={`text-sm font-medium ${idx === 14 ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-400'}`}>
                {date > 31 ? date - 31 : date}
              </span>
              
              {/* Mock Events */}
              <div className="mt-2 space-y-1">
                {idx === 4 && (
                  <div className="bg-blue-900/40 border border-blue-700/50 text-blue-300 text-[10px] px-2 py-1 rounded truncate cursor-pointer hover:bg-blue-800/50">
                    [TKT-1042] Instalação Rede
                  </div>
                )}
                {idx === 14 && (
                  <div className="bg-green-900/40 border border-green-700/50 text-green-300 text-[10px] px-2 py-1 rounded truncate cursor-pointer hover:bg-green-800/50">
                    [TKT-1089] Manutenção Ar Lab 2
                  </div>
                )}
                {idx === 14 && (
                  <div className="bg-red-900/40 border border-red-700/50 text-red-300 text-[10px] px-2 py-1 rounded truncate cursor-pointer hover:bg-red-800/50">
                    ⚠️ Vencimento Garantia Servidor
                  </div>
                )}
                {idx === 22 && (
                  <div className="bg-purple-900/40 border border-purple-700/50 text-purple-300 text-[10px] px-2 py-1 rounded truncate cursor-pointer hover:bg-purple-800/50">
                    [PROJ] Deploy ERP Financeiro
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
