'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  PageHeader,
  Panel,
  Button,
  Modal,
  Field,
  Input,
  Select,
  ErrorBanner,
  Spinner,
  PRIORITY_LABELS,
} from '@/components/ui';

interface SlaPolicy {
  id: string;
  name: string;
  priority: string | null;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
  responseMinutes: number;
  solutionMinutes: number;
  businessHoursOnly: boolean;
  active: boolean;
}

interface BusinessDay {
  weekday: number;
  start: string;
  end: string;
  enabled: boolean;
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  recurring: boolean;
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </Panel>
  );
}

const DEFAULT_WEEK: BusinessDay[] = Array.from({ length: 7 }, (_, weekday) => ({
  weekday,
  start: '08:00',
  end: '18:00',
  enabled: weekday >= 1 && weekday <= 5,
}));

function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${m}` : `${h}h`;
}

export default function SLAPage() {
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [week, setWeek] = useState<BusinessDay[]>(DEFAULT_WEEK);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [categories, setCategories] = useState<{ id: string; path?: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingWeek, setSavingWeek] = useState(false);

  // Modal de política
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<SlaPolicy | null>(null);
  const [form, setForm] = useState({
    name: '',
    priority: '',
    categoryId: '',
    responseMinutes: 480,
    solutionMinutes: 2400,
    businessHoursOnly: true,
    active: true,
  });

  // Form de feriado
  const [holidayForm, setHolidayForm] = useState({ name: '', date: '', recurring: true });

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, bh, h, cats] = await Promise.all([
        api.get<SlaPolicy[]>('/api/slas/policies'),
        api.get<BusinessDay[]>('/api/slas/business-hours'),
        api.get<Holiday[]>('/api/slas/holidays'),
        api.get('/api/categories'),
      ]);
      setPolicies(p);
      if (bh.length > 0) {
        setWeek(
          DEFAULT_WEEK.map(
            (d) => bh.find((b) => b.weekday === d.weekday) ?? d,
          ),
        );
      }
      setHolidays(h);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações de SLA');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      priority: '',
      categoryId: '',
      responseMinutes: 480,
      solutionMinutes: 2400,
      businessHoursOnly: true,
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (p: SlaPolicy) => {
    setEditing(p);
    setForm({
      name: p.name,
      priority: p.priority || '',
      categoryId: p.categoryId || '',
      responseMinutes: p.responseMinutes,
      solutionMinutes: p.solutionMinutes,
      businessHoursOnly: p.businessHoursOnly,
      active: p.active,
    });
    setIsModalOpen(true);
  };

  const savePolicy = async () => {
    try {
      const payload = {
        name: form.name,
        priority: form.priority || null,
        categoryId: form.categoryId || null,
        responseMinutes: Number(form.responseMinutes),
        solutionMinutes: Number(form.solutionMinutes),
        businessHoursOnly: form.businessHoursOnly,
        active: form.active,
      };
      if (editing) {
        await api.patch(`/api/slas/policies/${editing.id}`, payload);
      } else {
        await api.post('/api/slas/policies', payload);
      }
      setIsModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar política');
    }
  };

  const deletePolicy = async (p: SlaPolicy) => {
    if (!confirm(`Excluir a política "${p.name}"?`)) return;
    try {
      await api.delete(`/api/slas/policies/${p.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir política');
    }
  };

  const saveWeek = async () => {
    setSavingWeek(true);
    setError(null);
    try {
      await api.put('/api/slas/business-hours', { days: week });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar expediente');
    } finally {
      setSavingWeek(false);
    }
  };

  const addHoliday = async () => {
    if (!holidayForm.name || !holidayForm.date) return;
    try {
      await api.post('/api/slas/holidays', holidayForm);
      setHolidayForm({ name: '', date: '', recurring: true });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar feriado');
    }
  };

  const removeHoliday = async (h: Holiday) => {
    try {
      await api.delete(`/api/slas/holidays/${h.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover feriado');
    }
  };

  const scopeLabel = (p: SlaPolicy): string => {
    const parts: string[] = [];
    if (p.category?.name) parts.push(`Categoria: ${p.category.name}`);
    if (p.priority) parts.push(`Prioridade: ${PRIORITY_LABELS[p.priority] || p.priority}`);
    return parts.length > 0 ? parts.join(' · ') : 'Global (todos os tickets)';
  };

  if (loading) return <Spinner label="Carregando configurações de SLA..." />;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Configuração de SLA"
        subtitle="Políticas de prazo, expediente de atendimento e feriados"
      />

      {error && <ErrorBanner message={error} />}

      {/* Políticas */}
      <Section
        title="Políticas de SLA"
        actions={<Button onClick={openCreate}>+ Nova política</Button>}
      >
        {policies.length === 0 ? (
          <p className="text-slate-400 text-sm py-4">
            Nenhuma política configurada. Sem política, tickets são criados sem SLA.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="py-2 pr-4">Nome</th>
                <th className="py-2 pr-4">Escopo</th>
                <th className="py-2 pr-4">Resposta</th>
                <th className="py-2 pr-4">Solução</th>
                <th className="py-2 pr-4">Expediente</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id} className="border-b border-slate-800">
                  <td className="py-3 pr-4 text-slate-200 font-medium">{p.name}</td>
                  <td className="py-3 pr-4 text-slate-400">{scopeLabel(p)}</td>
                  <td className="py-3 pr-4 text-slate-200 font-mono">
                    {formatMinutes(p.responseMinutes)}
                  </td>
                  <td className="py-3 pr-4 text-slate-200 font-mono">
                    {formatMinutes(p.solutionMinutes)}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">
                    {p.businessHoursOnly ? 'Horário útil' : '24/7'}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        p.active
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-slate-600/30 text-slate-400'
                      }`}
                    >
                      {p.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-blue-400 hover:text-blue-300 text-xs mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deletePolicy(p)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Expediente */}
      <Section
        title="Expediente de atendimento"
        actions={
          <Button onClick={saveWeek} loading={savingWeek}>
            Salvar expediente
          </Button>
        }
      >
        <p className="text-slate-400 text-xs mb-4">
          O contador de SLA só corre dentro do expediente (para políticas em
          &quot;Horário útil&quot;).
        </p>
        <div className="space-y-2">
          {week.map((day) => (
            <div
              key={day.weekday}
              className="flex items-center gap-4 bg-slate-800/40 rounded-lg px-4 py-2"
            >
              <label className="flex items-center gap-2 w-32">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(e) =>
                    setWeek((w) =>
                      w.map((d) =>
                        d.weekday === day.weekday
                          ? { ...d, enabled: e.target.checked }
                          : d,
                      ),
                    )
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
                />
                <span className="text-slate-200 text-sm">{WEEKDAYS[day.weekday]}</span>
              </label>
              <input
                type="time"
                value={day.start}
                disabled={!day.enabled}
                onChange={(e) =>
                  setWeek((w) =>
                    w.map((d) =>
                      d.weekday === day.weekday ? { ...d, start: e.target.value } : d,
                    ),
                  )
                }
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-sm disabled:opacity-40"
              />
              <span className="text-slate-500 text-sm">até</span>
              <input
                type="time"
                value={day.end}
                disabled={!day.enabled}
                onChange={(e) =>
                  setWeek((w) =>
                    w.map((d) =>
                      d.weekday === day.weekday ? { ...d, end: e.target.value } : d,
                    ),
                  )
                }
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-sm disabled:opacity-40"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Feriados */}
      <Section title="Feriados">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <Field label="Nome">
            <Input
              value={holidayForm.name}
              onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
              placeholder="Ex: Corpus Christi"
            />
          </Field>
          <Field label="Data">
            <Input
              type="date"
              value={holidayForm.date}
              onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 pb-2.5">
            <input
              type="checkbox"
              checked={holidayForm.recurring}
              onChange={(e) =>
                setHolidayForm({ ...holidayForm, recurring: e.target.checked })
              }
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
            />
            <span className="text-slate-300 text-sm">Repete todo ano</span>
          </label>
          <div className="pb-1">
            <Button onClick={addHoliday}>Adicionar</Button>
          </div>
        </div>

        {holidays.length === 0 ? (
          <p className="text-slate-400 text-sm">Nenhum feriado cadastrado.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {holidays.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between bg-slate-800/40 rounded-lg px-4 py-2"
              >
                <div>
                  <span className="text-slate-200 text-sm">{h.name}</span>
                  <span className="text-slate-500 text-xs ml-2">
                    {new Date(h.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    {h.recurring ? ' · anual' : ''}
                  </span>
                </div>
                <button
                  onClick={() => removeHoliday(h)}
                  className="text-slate-500 hover:text-red-400 text-sm"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Modal de política */}
      {isModalOpen && (
        <Modal
          open={isModalOpen}
          title={editing ? 'Editar política de SLA' : 'Nova política de SLA'}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="space-y-4">
            <Field label="Nome" required>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: SLA Urgente"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Prioridade (escopo)">
                <Select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="">Qualquer prioridade</option>
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </Select>
              </Field>
              <Field label="Categoria (escopo)">
                <Select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">Qualquer categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.path || c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Resposta (minutos)" required>
                <Input
                  type="number"
                  min={1}
                  value={form.responseMinutes}
                  onChange={(e) =>
                    setForm({ ...form, responseMinutes: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Solução (minutos)" required>
                <Input
                  type="number"
                  min={1}
                  value={form.solutionMinutes}
                  onChange={(e) =>
                    setForm({ ...form, solutionMinutes: Number(e.target.value) })
                  }
                />
              </Field>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.businessHoursOnly}
                  onChange={(e) =>
                    setForm({ ...form, businessHoursOnly: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
                />
                <span className="text-slate-300 text-sm">Contar apenas horário útil</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
                />
                <span className="text-slate-300 text-sm">Ativa</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={savePolicy} disabled={!form.name}>
                {editing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
