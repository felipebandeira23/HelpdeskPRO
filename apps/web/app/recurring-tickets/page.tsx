'use client';

import { PageHeader, Panel } from '@/components/ui';

export default function RecurringTicketsPage() {
  const recurring = [
    { id: '1', title: 'Manutenção Preventiva - Ar Condicionado Labs', frequency: 'A cada 6 Meses', nextRun: '2026-06-01 08:00', assignedTo: 'Equipe de Infra', active: true },
    { id: '2', title: 'Verificação Lâmpadas Datashow', frequency: 'Toda Sexta-feira', nextRun: '2026-06-05 14:00', assignedTo: 'Suporte N1', active: true },
    { id: '3', title: 'Limpeza de Cache Servidor Moodle', frequency: '1º Dia do Mês', nextRun: '2026-06-01 03:00', assignedTo: 'Suporte N3', active: false },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Chamados Recorrentes" subtitle="Agendamento automático de demandas e manutenções preventivas" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-lg shadow-blue-900/20 flex items-center gap-2">
          <span>+</span> Novo Agendamento
        </button>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider bg-slate-800/30">
                <th className="py-3 px-4 font-bold rounded-tl-lg">Gatilho (Título do Ticket)</th>
                <th className="py-3 px-4 font-bold">Frequência (Cron)</th>
                <th className="py-3 px-4 font-bold">Próxima Execução</th>
                <th className="py-3 px-4 font-bold">Atribuir Para</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-right rounded-tr-lg">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recurring.map(rec => (
                <tr key={rec.id} className={`transition-colors ${rec.active ? 'hover:bg-slate-800/50' : 'bg-slate-900/50 opacity-60'}`}>
                  <td className="py-4 px-4 text-white font-medium flex items-center gap-3">
                    <span className="text-blue-400">🕒</span>
                    {rec.title}
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded font-medium border border-slate-700">
                      {rec.frequency}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-300">
                    {rec.nextRun}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-900 flex items-center justify-center text-[10px] text-indigo-200 border border-indigo-700">
                        {rec.assignedTo.substring(0, 2).toUpperCase()}
                      </div>
                      {rec.assignedTo}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={rec.active} readOnly />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium mr-4">Editar</button>
                    <button className="text-red-400 hover:text-red-300 text-sm font-medium">Excluir</button>
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
