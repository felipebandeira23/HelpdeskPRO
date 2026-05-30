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

interface Group {
  id: string;
  name: string;
  description?: string | null;
  _count?: { members: number; tickets: number };
}

const emptyForm = { name: '', description: '' };

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<Group[]>('/api/groups')
      .then((d) => setGroups(Array.isArray(d) ? d : []))
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

  const openEdit = (group: Group) => {
    setEditing(group);
    setForm({ name: group.name, description: group.description || '' });
    setFormError(null);
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await api.patch(`/api/groups/${editing.id}`, form);
      } else {
        await api.post('/api/groups', form);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (group: Group) => {
    if (!confirm(`Excluir o grupo "${group.name}"?`)) return;
    try {
      await api.delete(`/api/groups/${group.id}`);
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
        title="Grupos / Mesas de Trabalho"
        subtitle="Equipes de suporte"
        action={<Button onClick={openCreate}>+ Novo Grupo</Button>}
      />

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner />
      ) : groups.length === 0 ? (
        <Panel>
          <EmptyState icon="👨‍💼" title="Nenhum grupo cadastrado" />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Panel key={group.id}>
              <div className="flex items-start justify-between">
                <h3 className="text-white font-bold">{group.name}</h3>
                <div className="space-x-2 text-sm">
                  <button
                    onClick={() => openEdit(group)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove(group)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-1 mb-4">
                {group.description || 'Sem descrição'}
              </p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>👥 {group._count?.members ?? 0} membros</span>
                <span>🎫 {group._count?.tickets ?? 0} tickets</span>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Grupo' : 'Novo Grupo'}
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
        <Field label="Nome">
          <TextInput
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Suporte N1"
          />
        </Field>
        <Field label="Descrição">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descrição do grupo"
          />
        </Field>
      </Modal>
    </div>
  );
}
