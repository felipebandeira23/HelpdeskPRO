'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Panel, Spinner, EmptyState } from '@/components/ui';

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  assignee?: { name: string };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Task[]>('/api/tasks').then((d) => {
      setTasks(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8">
      <PageHeader title="Tarefas" subtitle="Lista de tarefas pendentes" />
      {loading ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <Panel>
          <EmptyState icon="✓" title="Nenhuma tarefa" />
        </Panel>
      ) : (
        <Panel>
          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="p-3 bg-slate-800/50 rounded flex justify-between">
                <div>
                  <p className="text-white">{t.title}</p>
                  <p className="text-sm text-slate-400">{t.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
