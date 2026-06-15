'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; cls: string; bg: string }> = {
  PENDING: { label: 'Pendente', cls: 'bg-slate-500/15 text-slate-300 border-slate-500/30', bg: 'bg-slate-500' },
  IN_PROGRESS: { label: 'Em andamento', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30', bg: 'bg-blue-500' },
  DONE: { label: 'Concluída', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', bg: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelada', cls: 'bg-red-500/15 text-red-400 border-red-500/30', bg: 'bg-red-500' },
};

const EMPTY_FORM = { title: '', description: '', assigneeId: '', dueDate: '' };

function formatDuration(from: Date, to: Date): string {
  const mins = Math.floor((to.getTime() - from.getTime()) / 60000);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}min`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold shrink-0">
      {initials}
    </span>
  );
}

function TimelineCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className={`rounded-lg px-3 py-2.5 border ${color}`}>
      <p className="text-xs font-medium text-slate-400 mb-1">{icon} {label}</p>
      <p className="text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('OPEN');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => { load(); }, [load]);

  const openDetail = (t: Task) => {
    setSelected(t);
    setEditTitle(t.title);
    setEditDesc(t.description ?? '');
    setEditAssigneeId(t.assigneeId ?? '');
    setEditDueDate(t.dueDate ? t.dueDate.slice(0, 10) : '');
  };

  const closeDetail = () => {
    setSelected(null);
    setIsEditingTitle(false);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.post('/api/tasks', {
        title: form.title,
        description: form.description || null,
        ...(form.assigneeId ? { assignee: { connect: { id: form.assigneeId } } } : {}),
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

  const saveEdit = async () => {
    if (!selected) return;
    setEditSaving(true);
    try {
      await api.patch(`/api/tasks/${selected.id}`, {
        title: editTitle,
        description: editDesc || null,
        ...(editAssigneeId
          ? { assignee: { connect: { id: editAssigneeId } } }
          : { assignee: { disconnect: true } }),
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
      });
      closeDetail();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar tarefa');
    } finally {
      setEditSaving(false);
    }
  };

  const setStatus = async (t: Task, status: Task['status']) => {
    try {
      const updated = await api.patch<Task>(`/api/tasks/${t.id}`, {
        status,
        completedAt: status === 'DONE' ? new Date().toISOString() : null,
      });
      if (selected?.id === t.id) setSelected(updated);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tarefa');
    }
  };

  const remove = async (t: Task) => {
    if (!confirm(`Excluir a tarefa "${t.title}"?`)) return;
    try {
      await api.delete(`/api/tasks/${t.id}`);
      if (selected?.id === t.id) closeDetail();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir tarefa');
    }
  };

  const visible = tasks.filter((t) =>
    filter === 'OPEN'
      ? t.status === 'PENDING' || t.status === 'IN_PROGRESS'
      : filter === 'ALL' ? true : t.status === filter,
  );

  const isOverdue = (t: Task) =>
    t.dueDate && t.status !== 'DONE' && new Date(t.dueDate) < new Date();

  return (
    <div className="p-4 sm:p-6 space-y-6">
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
                  className="flex items-center gap-3 sm:gap-4 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 sm:px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
                  onClick={() => openDetail(t)}
                >
                  <input
                    type="checkbox"
                    checked={t.status === 'DONE'}
                    onChange={() => setStatus(t, t.status === 'DONE' ? 'PENDING' : 'DONE')}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 shrink-0 cursor-pointer"
                    aria-label={`Concluir ${t.title}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium line-clamp-1 ${t.status === 'DONE' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {t.title}
                    </p>
                    <p className="text-slate-400 text-xs truncate">
                      {t.assignee ? t.assignee.name : 'Sem responsável'}
                      {t.dueDate && (
                        <span className={isOverdue(t) ? 'text-red-400' : ''}>
                          {' · '}{new Date(t.dueDate).toLocaleDateString('pt-BR')}
                          {isOverdue(t) ? ' ⚠' : ''}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border shrink-0 whitespace-nowrap ${meta.cls}`}>{meta.label}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(t); }}
                    className="text-slate-500 hover:text-red-400 text-xs shrink-0 p-1 hover:bg-red-500/10 rounded transition-colors"
                    aria-label={`Excluir ${t.title}`}
                    title="Excluir tarefa"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Modal: nova tarefa */}
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
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descreva o que precisa ser feito, contexto, passos, etc."
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Responsável">
            <Select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
              <option value="">Sem responsável</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
          </Field>
          <Field label="Vencimento">
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={save} loading={saving} disabled={!form.title}>Criar</Button>
        </div>
      </Modal>

      {/* Card detail — estilo Trello melhorado */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-4 sm:py-10 px-3 sm:px-4"
          onClick={closeDetail}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-title"
        >
          <div
            className="relative bg-[#1d2125] rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra de cor do status — sticky no topo */}
            <div className={`h-1.5 sm:h-2 shrink-0 ${STATUS_META[selected.status].bg}`} />

            {/* Botão fechar — posicionamento melhorado */}
            <button
              onClick={closeDetail}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Fechar detalhes da tarefa"
              title="Fechar (Esc)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Conteúdo principal — flex layout responsivo */}
            <div className="flex-1 p-4 sm:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Coluna esquerda — conteúdo principal */}
              <div className="flex-1 min-w-0 space-y-6">
                {/* ▸ TÍTULO — visual hierarchy forte */}
                <div className="space-y-2">
                  {isEditingTitle ? (
                    <textarea
                      ref={titleRef}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setIsEditingTitle(false); }
                        if (e.key === 'Escape') { setEditTitle(selected.title); setIsEditingTitle(false); }
                      }}
                      rows={3}
                      className="w-full bg-white/10 border-2 border-blue-500 rounded-lg text-2xl sm:text-3xl font-bold text-white resize-none px-3 py-2 focus:outline-none focus:ring-0"
                      autoFocus
                    />
                  ) : (
                    <h1
                      id="task-title"
                      onClick={() => { setIsEditingTitle(true); setTimeout(() => titleRef.current?.focus(), 0); }}
                      className="text-2xl sm:text-3xl font-bold text-white leading-tight cursor-text hover:bg-white/[0.05] rounded-lg px-3 py-2 -mx-3 -my-2 transition-colors"
                      title="Clique para editar o título"
                    >
                      {editTitle}
                    </h1>
                  )}
                  <p className="text-xs text-slate-500 px-3">Clique no título para editar</p>
                </div>

                {/* ▸ DESCRIÇÃO */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Descrição
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={5}
                    className="w-full bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/[0.1] focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm text-slate-200 resize-none focus:outline-none transition-all placeholder:text-slate-600"
                    placeholder="Adicione detalhes, instruções, notas importantes…"
                    aria-label="Descrição da tarefa"
                  />
                </div>

                {/* ▸ LINHA DO TEMPO — layout responsivo em grid */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Cronograma
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <TimelineCard
                      label="Criada"
                      value={new Date(selected.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      icon="📅"
                      color="border border-white/[0.1] bg-white/[0.03]"
                    />
                    <TimelineCard
                      label="Iniciada"
                      value={selected.startedAt ? new Date(selected.startedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      icon="▶"
                      color={selected.startedAt ? 'border border-blue-500/30 bg-blue-500/10' : 'border border-white/[0.1] bg-white/[0.03]'}
                    />
                    <TimelineCard
                      label="Concluída"
                      value={selected.completedAt ? new Date(selected.completedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                      icon="✓"
                      color={selected.completedAt ? 'border border-emerald-500/30 bg-emerald-500/10' : 'border border-white/[0.1] bg-white/[0.03]'}
                    />
                    <TimelineCard
                      label="Duração"
                      value={selected.startedAt ? formatDuration(new Date(selected.startedAt), selected.completedAt ? new Date(selected.completedAt) : new Date()) : '—'}
                      icon="⏱"
                      color="border border-white/[0.1] bg-white/[0.03]"
                    />
                  </div>
                </div>

                {/* ▸ BOTÕES DE AÇÃO (mobile) — empilhados em mobile */}
                <div className="lg:hidden space-y-2 pt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.status === 'PENDING' && (
                      <button
                        onClick={() => setStatus(selected, 'IN_PROGRESS')}
                        className="flex-1 min-w-max bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        ▶ Iniciar
                      </button>
                    )}
                    {selected.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => setStatus(selected, 'DONE')}
                        className="flex-1 min-w-max bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        ✓ Concluir
                      </button>
                    )}
                    {selected.status === 'DONE' && (
                      <button
                        onClick={() => setStatus(selected, 'PENDING')}
                        className="flex-1 min-w-max bg-white/[0.1] hover:bg-white/[0.15] text-slate-300 text-xs font-semibold rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                      >
                        ↩ Reabrir
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar direita — fixed width em desktop, full width em mobile */}
              <div className="w-full lg:w-56 shrink-0 space-y-4">
                {/* STATUS BADGE */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</p>
                  <span className={`inline-block text-xs px-3 py-1.5 rounded-lg border font-semibold ${STATUS_META[selected.status].cls}`}>
                    {STATUS_META[selected.status].label}
                  </span>
                </div>

                {/* AÇÕES DE STATUS (desktop) */}
                <div className="hidden lg:block space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ações</p>
                  {selected.status === 'PENDING' && (
                    <button
                      onClick={() => setStatus(selected, 'IN_PROGRESS')}
                      className="w-full text-left text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-2 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      ▶ Iniciar
                    </button>
                  )}
                  {selected.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => setStatus(selected, 'DONE')}
                      className="w-full text-left text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-2 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      ✓ Concluir
                    </button>
                  )}
                  {selected.status === 'DONE' && (
                    <button
                      onClick={() => setStatus(selected, 'PENDING')}
                      className="w-full text-left text-xs bg-white/[0.1] hover:bg-white/[0.15] text-slate-300 rounded-lg px-3 py-2 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-white/30"
                    >
                      ↩ Reabrir
                    </button>
                  )}
                  {selected.status !== 'CANCELLED' && selected.status !== 'DONE' && (
                    <button
                      onClick={() => setStatus(selected, 'CANCELLED')}
                      className="w-full text-left text-xs bg-white/[0.05] hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg px-3 py-2 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-red-400/50"
                    >
                      ✕ Cancelar
                    </button>
                  )}
                </div>

                {/* RESPONSÁVEL */}
                <div className="border-t border-white/[0.05] pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Responsável</p>
                  {selected.assignee && (
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={selected.assignee.name} />
                      <span className="text-xs font-medium text-slate-300 truncate">{selected.assignee.name}</span>
                    </div>
                  )}
                  <select
                    value={editAssigneeId}
                    onChange={(e) => setEditAssigneeId(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-500/30"
                    aria-label="Selecionar responsável"
                  >
                    <option value="">Sem responsável</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>

                {/* VENCIMENTO */}
                <div className="border-t border-white/[0.05] pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Vencimento</p>
                  {selected.dueDate && (
                    <p className={`text-xs font-medium mb-2 ${isOverdue(selected) ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isOverdue(selected) ? '⚠ Atrasada' : '✓ No prazo'} — {new Date(selected.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-500/30"
                    aria-label="Data de vencimento"
                  />
                </div>

                {/* FOOTER — Botões de salvamento */}
                <div className="border-t border-white/[0.05] pt-4 space-y-2">
                  <Button
                    onClick={saveEdit}
                    loading={editSaving}
                    disabled={!editTitle}
                    className="w-full"
                  >
                    Salvar alterações
                  </Button>
                  <button
                    onClick={() => remove(selected)}
                    className="w-full text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg py-2 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-400/50"
                    title="Excluir esta tarefa permanentemente"
                  >
                    Excluir tarefa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
