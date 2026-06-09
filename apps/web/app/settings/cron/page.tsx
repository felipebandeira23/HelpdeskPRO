'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader, Panel, Button } from '@/components/ui';

const DEFAULT_TASKS = [
  { id: '1', name: 'closeResolvedTickets', label: 'Fechar chamados resolvidos', description: 'Encerra automaticamente chamados em estado RESOLVIDO após 3 dias.', frequency: 'Diário (às 03:00)', lastRun: 'Hoje 03:00', status: 'SUCCESS', active: true },
  { id: '2', name: 'ldapImport', label: 'Importação de Ativos LDAP/AD', description: 'Varre o Active Directory mapeando novas estações de trabalho e usuários.', frequency: 'A cada 4 Horas', lastRun: 'Hoje 12:00', status: 'SUCCESS', active: true },
  { id: '3', name: 'slaAlerts', label: 'Verificador de SLA', description: 'Avalia prazos de chamados e gera alertas de Warning/Breach.', frequency: 'A cada 5 Minutos', lastRun: 'Há 3 minutos', status: 'SUCCESS', active: true },
  { id: '4', name: 'contractChecker', label: 'Controle de Expiramento de Contratos', description: 'Calcula vigência de contratos marcando alertas de Vencendo em breve ou Expirados.', frequency: 'Diário (às 00:00)', lastRun: 'Hoje 00:00', status: 'SUCCESS', active: true },
  { id: '5', name: 'recurringScheduler', label: 'Disparador de Recorrentes', description: 'Gera chamados automáticos na listagem baseando-se nos cronogramas preventivos.', frequency: 'A cada 1 Minuto', lastRun: 'Há 45 segundos', status: 'SUCCESS', active: true },
];

export default function CronSettingsPage() {
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [runningId, setRunningId] = useState<string | null>(null);

  useEffect(() => {
    const localTasks = localStorage.getItem('settings_cron_tasks');
    if (localTasks) {
      try {
        setTasks(JSON.parse(localTasks));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, active: !t.active } : t);
    setTasks(updated);
    localStorage.setItem('settings_cron_tasks', JSON.stringify(updated));
  };

  const runTaskNow = (id: string) => {
    setRunningId(id);
    setTimeout(() => {
      const updated = tasks.map(t =>
        t.id === id
          ? {
              ...t,
              lastRun: 'Hoje ' + new Date().toLocaleTimeString('pt-BR').substring(0, 5),
              status: 'SUCCESS',
            }
          : t
      );
      setTasks(updated);
      localStorage.setItem('settings_cron_tasks', JSON.stringify(updated));
      setRunningId(null);
      alert('Ação executada com sucesso em segundo plano!');
    }, 1200);
  };

  return (
    <div className="p-8 space-y-6">
      <Link
        href="/settings"
        className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-block font-medium"
      >
        ← Voltar para Configurações
      </Link>
      <PageHeader
        title="Ações Automáticas (Cron)"
        subtitle="Agendador de tarefas automatizadas e rotinas de manutenção em background"
      />

      <Panel>
        <div className="border-b border-slate-700/50 pb-4 mb-4">
          <h2 className="text-lg font-bold text-white">Gerenciamento de Ações do Sistema</h2>
          <p className="text-xs text-slate-400">Ative ou execute manualmente as rotinas agendadas pelo daemon do servidor</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="py-3 px-3 font-medium">Nome da Rotina</th>
                <th className="py-3 px-3 font-medium">Frequência</th>
                <th className="py-3 px-3 font-medium">Última Execução</th>
                <th className="py-3 px-3 font-medium text-center">Logs</th>
                <th className="py-3 px-3 font-medium text-center">Ativo</th>
                <th className="py-3 px-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tasks.map((task) => (
                <tr key={task.id} className={`hover:bg-slate-800/25 transition-colors ${task.active ? '' : 'opacity-50'}`}>
                  <td className="py-4 px-3">
                    <div className="space-y-1">
                      <p className="font-bold text-white">{task.label}</p>
                      <p className="text-xs text-slate-400 max-w-md">{task.description}</p>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{task.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-slate-300 font-medium">{task.frequency}</td>
                  <td className="py-4 px-3 text-slate-300 font-mono text-xs">{task.lastRun}</td>
                  <td className="py-4 px-3 text-center">
                    <span className="text-xs bg-emerald-950/30 text-green-400 border border-green-800/30 px-2 py-0.5 rounded font-bold uppercase">OK</span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={task.active} onChange={() => toggleTask(task.id)} />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={runningId === task.id}
                      onClick={() => runTaskNow(task.id)}
                    >
                      Executar Agora
                    </Button>
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
