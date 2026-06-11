'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  PageHeader,
  Section,
  Button,
  Modal,
  Field,
  Input,
  Select,
  Textarea,
  ErrorBanner,
  Skeleton,
  EmptyState,
} from '@/components/ui';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  assignee: { id: string; name: string } | null;
  assigneeId: string | null;
  dueDate: string | null;
  completedAt: string | null;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Pendente', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  IN_PROGRESS: { label: 'Em andamento', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  DONE: { label: 'Concluída', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  CANCELLED: { label: 'Cancelada', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

const EMPTY_FORM = { title: '', description: '', assigneeId: '', dueDate: '' };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('OPEN');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [t, u] = await Promise.all([
        api.get<Task[]>('/api/tasks'),
        api.get('/api/users').catch(() => []),
      ]);
      setTasks(Array.isArray(t) ? t : []);
      setUsers(Array.isArray(u) ? u : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.post('/api/tasks', {
        title: form.title,
        description: form.description || null,
        ...(form.assigneeId
          ? { assignee: { connect: { id: form.assigneeId } } }
          : {}),
        ...(form.dueDate ? { dueDate: new Date(form.dueDate).toISOString() } : {}),
      });
      setModalOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tarefa');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (t: Task, status: Task['status']) => {
    try {
      await api.patch(`/api/tasks/${t.id}`, {
        status,
        completedAt: status === 'DONE' ? new Date().toISOString() : null,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
    }
  };

  const remove = async (t: Task) => {
    if (!confirm(`Excluir a tarefa "${t.title}"?`)) return;
    try {
      await api.delete(`/api/tasks/${t.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir tarefa');
    }
  };

  const visible = tasks.filter((t) =>
    filter === 'OPEN'
      ? t.status === 'PENDING' || t.status === 'IN_PROGRESS'
      : filter === 'ALL'
        ? true
        : t.status === filter,
  );

  const isOverdue = (t: Task) =>
    t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < new Date();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Tarefas"
        subtitle="Atividades internas da equipe (visitas, manutenções, configurações)"
        action={<Button onClick={() => setModalOpen(true)}>+ Nova tarefa</Button>}
      />

      {error && <ErrorBanner message={error} />}

      <Section
        title={`Tarefas (${visible.length})`}
        actions={
          <div className="w-44">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="OPEN">Abertas</option>
              <option value="DONE">Concluídas</option>
              <option value="CANCELLED">Canceladas</option>
              <option value="ALL">Todas</option>
            </Select>
          </div>
        }
      >
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nenhuma tarefa aqui"
            description="Crie tarefas para organizar o trabalho da equipe além dos tickets."
          />
        ) : (
          <ul className="space-y-2">
            {visible.map((t) => {
              const meta = STATUS_META[t.status];
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={t.status === 'DONE'}
                    onChange={() =>
                      setStatus(t, t.status === 'DONE' ? 'PENDING' : 'DONE')
                    }
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 shrink-0"
                    aria-label={`Concluir ${t.title}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        t.status === 'DONE'
                          ? 'text-slate-500 line-through'
                          : 'text-slate-200'
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-slate-400 text-xs truncate">
                      {t.assignee ? `${t.assignee.name}` : 'Sem responsável'}
                      {t.dueDate && (
                        <span className={isOverdue(t) ? 'text-red-400' : ''}>
                          {' '}
                          · vence {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                          {isOverdue(t) ? ' (atrasada)' : ''}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border shrink-0 ${meta.cls}`}>
                    {meta.label}
                  </span>
                  {t.status === 'PENDING' && (
                    <button
                      onClick={() => setStatus(t, 'IN_PROGRESS')}
                      className="text-blue-400 hover:text-blue-300 text-xs shrink-0"
                    >
                      Iniciar
                    </button>
                  )}
                  <button
                    onClick={() => remove(t)}
                    className="text-slate-500 hover:text-red-400 text-xs shrink-0"
                    aria-label={`Excluir ${t.title}`}
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Modal open={modalOpen} title="Nova tarefa" onClose={() => setModalOpen(false)}>
        <Field label="Título" required>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Manutenção preventiva - sala 203"
          />
        </Field>
        <Field label="Descrição">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Responsável">
            <Select
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
            >
              <option value="">Sem responsável</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Vencimento">
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={save} loading={saving} disabled={!form.title}>
            Criar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
