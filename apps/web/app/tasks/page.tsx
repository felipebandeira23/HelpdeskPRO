'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/ui';

export default function TasksPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Revisar logs do servidor', status: 'TODO', priority: 'HIGH', ticket: '#1024', assignee: 'João Silva' },
    { id: 2, title: 'Atualizar licenças do Office', status: 'TODO', priority: 'MEDIUM', ticket: null, assignee: 'Ana Lima' },
    { id: 3, title: 'Trocar cabo de rede mesa 5', status: 'DOING', priority: 'LOW', ticket: '#1021', assignee: 'Pedro Costa' },
    { id: 4, title: 'Configurar novo firewall', status: 'DONE', priority: 'URGENT', ticket: null, assignee: 'Maria Souza' },
  ]);

  const columns = [
    { id: 'TODO', title: 'A Fazer', color: 'border-slate-500' },
    { id: 'DOING', title: 'Em Andamento', color: 'border-blue-500' },
    { id: 'DONE', title: 'Concluído', color: 'border-green-500' },
  ];

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Gestão de Tarefas" subtitle="Quadro Kanban de atividades da equipe" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors">
          + Nova Tarefa
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col.id} className="flex-1 min-w-[300px] bg-slate-900/50 rounded-xl border border-slate-700/50 flex flex-col">
            <div className={`p-4 border-t-4 ${col.color} rounded-t-xl bg-slate-800/80`}>
              <h3 className="text-white font-bold">{col.title} <span className="ml-2 text-xs bg-slate-700 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === col.id).length}</span></h3>
            </div>
            
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-500 transition-colors cursor-grab active:cursor-grabbing shadow-lg shadow-black/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                      ${task.priority === 'URGENT' ? 'bg-red-900/50 text-red-400 border border-red-700/50' : 
                        task.priority === 'HIGH' ? 'bg-orange-900/50 text-orange-400 border border-orange-700/50' : 
                        task.priority === 'MEDIUM' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50' : 
                        'bg-green-900/50 text-green-400 border border-green-700/50'}`}>
                      {task.priority}
                    </span>
                    {task.ticket && (
                      <span className="text-xs text-blue-400 hover:underline cursor-pointer">Ticket {task.ticket}</span>
                    )}
                  </div>
                  <h4 className="text-white font-medium mb-3">{task.title}</h4>
                  <div className="flex justify-between items-center mt-4">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white" title={task.assignee}>
                      {task.assignee.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex gap-1">
                      {col.id !== 'TODO' && <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, status: columns[columns.findIndex(c => c.id === col.id) - 1].id} : t))} className="text-slate-500 hover:text-white p-1">←</button>}
                      {col.id !== 'DONE' && <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, status: columns[columns.findIndex(c => c.id === col.id) + 1].id} : t))} className="text-slate-500 hover:text-white p-1">→</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
