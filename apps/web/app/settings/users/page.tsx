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
import {
  Modal,
  Field,
  TextInput,
  Select,
  Button,
} from '@/components/Modal';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico',
  VIEWER: 'Visualizador',
};

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'VIEWER',
  active: true,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<User[]>('/api/users')
      .then((d) => setUsers(Array.isArray(d) ? d : []))
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

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      active: user.active,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const payload: any = {
          name: form.name,
          email: form.email,
          role: form.role,
          active: form.active,
        };
        if (form.password) payload.password = form.password;
        await api.patch(`/api/users/${editing.id}`, payload);
      } else {
        await api.post('/api/users', form);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (user: User) => {
    if (!confirm(`Excluir o usuário "${user.name}"?`)) return;
    try {
      await api.delete(`/api/users/${user.id}`);
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
        title="Usuários"
        subtitle="Operadores e perfis de acesso"
        action={<Button onClick={openCreate}>+ Novo Usuário</Button>}
      />

      {error && <ErrorBanner message={error} />}

      <Panel>
        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState icon="👥" title="Nenhum usuário cadastrado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="py-3 px-2 font-medium">Nome</th>
                  <th className="py-3 px-2 font-medium">Email</th>
                  <th className="py-3 px-2 font-medium">Perfil</th>
                  <th className="py-3 px-2 font-medium">Status</th>
                  <th className="py-3 px-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800 hover:bg-slate-800/40"
                  >
                    <td className="py-3 px-2 text-slate-200 font-medium">
                      {user.name}
                    </td>
                    <td className="py-3 px-2 text-slate-300">{user.email}</td>
                    <td className="py-3 px-2 text-slate-300">
                      {ROLE_LABELS[user.role] || user.role}
                    </td>
                    <td className="py-3 px-2">
                      {user.active ? (
                        <span className="text-emerald-400">Ativo</span>
                      ) : (
                        <span className="text-slate-500">Inativo</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right space-x-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => remove(user)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Usuário' : 'Novo Usuário'}
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
            placeholder="Nome completo"
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@empresa.com"
          />
        </Field>
        <Field
          label={editing ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
        >
          <TextInput
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </Field>
        <Field label="Perfil">
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="ADMIN">Administrador</option>
            <option value="TECHNICIAN">Técnico</option>
            <option value="VIEWER">Visualizador</option>
          </Select>
        </Field>
        <Field label="Status">
          <Select
            value={form.active ? 'true' : 'false'}
            onChange={(e) =>
              setForm({ ...form, active: e.target.value === 'true' })
            }
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
        </Field>
      </Modal>
    </div>
  );
}
