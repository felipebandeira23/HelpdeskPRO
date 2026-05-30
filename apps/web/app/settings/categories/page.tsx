'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  PageHeader,
  Panel,
  Spinner,
  EmptyState,
  ErrorBanner,
} from '@/components/ui';
import { Modal, Field, TextInput, Textarea, Button } from '@/components/Modal';

interface TicketType {
  id: string;
  name: string;
  icon?: string | null;
  color: string;
  description?: string | null;
  slaResponseTime?: number | null;
  slaSolutionTime?: number | null;
}

const emptyForm = {
  name: '',
  icon: '',
  color: '#2B73C9',
  description: '',
  slaResponseTime: '',
  slaSolutionTime: '',
};

export default function CategoriesPage() {
  const [types, setTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TicketType | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<TicketType[]>('/api/ticket-types')
      .then((d) => setTypes(Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (type: TicketType) => {
    setEditing(type);
    setForm({
      name: type.name,
      icon: type.icon || '',
      color: type.color,
      description: type.description || '',
      slaResponseTime: type.slaResponseTime?.toString() || '',
      slaSolutionTime: type.slaSolutionTime?.toString() || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const payload: any = {
        name: form.name,
        icon: form.icon || undefined,
        color: form.color,
        description: form.description || undefined,
      };
      if (form.slaResponseTime)
        payload.slaResponseTime = parseInt(form.slaResponseTime, 10);
      if (form.slaSolutionTime)
        payload.slaSolutionTime = parseInt(form.slaSolutionTime, 10);

      if (editing) {
        await api.patch(`/api/ticket-types/${editing.id}`, payload);
      } else {
        await api.post('/api/ticket-types', payload);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (type: TicketType) => {
    if (!confirm(`Excluir o tipo "${type.name}"?`)) return;
    try {
      await api.delete(`/api/ticket-types/${type.id}`);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="p-8">
      <Link
        href="/settings"
        className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block"
      >
        ← Configurações
      </Link>
      <PageHeader
        title="Tipos de Ticket"
        subtitle="Categorias de chamado com SLA padrão"
        action={<Button onClick={openCreate}>+ Novo Tipo</Button>}
      />

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : types.length === 0 ? (
        <Panel>
          <EmptyState icon="🏷️" title="Nenhum tipo cadastrado" />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type) => (
            <Panel key={type.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full inline-block"
                    style={{ backgroundColor: type.color }}
                  />
                  <h3 className="text-white font-bold">
                    {type.icon} {type.name}
                  </h3>
                </div>
                <div className="space-x-2 text-sm">
                  <button
                    onClick={() => openEdit(type)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove(type)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-1 mb-3">
                {type.description || 'Sem descrição'}
              </p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>⏱️ Resposta: {type.slaResponseTime ?? '—'} min</span>
                <span>✅ Solução: {type.slaSolutionTime ?? '—'} min</span>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Tipo' : 'Novo Tipo'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        {formError && <ErrorBanner message={formError} />}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome">
            <TextInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Incidente"
            />
          </Field>
          <Field label="Ícone (emoji)">
            <TextInput
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="🔧"
            />
          </Field>
        </div>
        <Field label="Cor">
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
          />
        </Field>
        <Field label="Descrição">
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SLA Resposta (min)">
            <TextInput
              type="number"
              value={form.slaResponseTime}
              onChange={(e) =>
                setForm({ ...form, slaResponseTime: e.target.value })
              }
              placeholder="60"
            />
          </Field>
          <Field label="SLA Solução (min)">
            <TextInput
              type="number"
              value={form.slaSolutionTime}
              onChange={(e) =>
                setForm({ ...form, slaSolutionTime: e.target.value })
              }
              placeholder="480"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
