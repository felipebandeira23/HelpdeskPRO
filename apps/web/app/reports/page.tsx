'use client';
import { PageHeader, Panel, StatCard, Button } from '@/components/ui';

export default function ReportsPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Relatórios e Analytics" subtitle="Métricas de atendimento, SLA e produtividade" />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Exportar CSV</Button>
          <Button variant="danger" size="sm">Exportar PDF</Button>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Período</label>
          <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500">
            <option>Últimos 7 dias</option>
            <option>Este Mês</option>
            <option>Mês Anterior</option>
            <option>Personalizado...</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cliente</label>
          <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500">
            <option>Todos os Clientes</option>
            <option>TechCorp</option>
            <option>Global Inc</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Técnico/Mesa</label>
          <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-500">
            <option>Todos</option>
            <option>N1 - Suporte Básico</option>
            <option>N2 - Infraestrutura</option>
          </select>
        </div>
        <Button variant="primary">Aplicar Filtros</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard title="Tickets Resolvidos" value="142" icon="✅" accent="bg-green-600" />
        <StatCard title="SLA Cumprido" value="94%" icon="🎯" accent="bg-blue-600" />
        <StatCard title="Tempo Médio Resposta" value="15m" icon="⏱️" accent="bg-amber-500" />
        <StatCard title="Tempo Médio Solução" value="2h 10m" icon="🛠️" accent="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel>
          <h2 className="text-lg font-bold text-white mb-4">Evolução de Chamados</h2>
          <div className="h-64 flex items-end gap-2 pt-8 border-b border-l border-slate-700 pl-2 pb-2 relative">
            <div className="absolute top-0 left-2 text-xs text-slate-500">Vol.</div>
            <div className="absolute bottom-2 -left-6 text-xs text-slate-500">0</div>
            {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-600/80 hover:bg-blue-500 transition-colors rounded-t-sm relative group cursor-pointer" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{h} tickets</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
            <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-lg font-bold text-white mb-4">Tickets por Técnico (Top 5)</h2>
          <div className="space-y-4">
            {[
              { name: 'João Silva', count: 45, color: 'bg-blue-500' },
              { name: 'Maria Souza', count: 38, color: 'bg-green-500' },
              { name: 'Carlos Santos', count: 25, color: 'bg-yellow-500' },
              { name: 'Ana Lima', count: 18, color: 'bg-purple-500' },
              { name: 'Pedro Costa', count: 16, color: 'bg-orange-500' },
            ].map(t => (
              <div key={t.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{t.name}</span>
                  <span className="text-white font-bold">{t.count}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className={`${t.color} h-2 rounded-full`} style={{ width: `${(t.count / 45) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
