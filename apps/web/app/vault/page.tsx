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
  Textarea,
  ErrorBanner,
  Skeleton,
  EmptyState,
} from '@/components/ui';

interface Credential {
  id: string;
  name: string;
  username: string;
  url: string | null;
  notes: string | null;
  createdAt: string;
}

const EMPTY_FORM = { name: '', username: '', password: '', url: '', notes: '' };

export default function VaultPage() {
  const [creds, setCreds] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.get<Credential[]>('/api/vault');
      setCreds(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar cofre');
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
      await api.post('/api/vault', {
        name: form.name,
        username: form.username,
        password: form.password,
        url: form.url || undefined,
        notes: form.notes || undefined,
      });
      setModalOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar credencial');
    } finally {
      setSaving(false);
    }
  };

  const reveal = async (id: string) => {
    if (revealed[id]) {
      setRevealed((r) => {
        const next = { ...r };
        delete next[id];
        return next;
      });
      return;
    }
    try {
      const data = await api.get<{ password: string }>(`/api/vault/${id}/reveal`);
      setRevealed((r) => ({ ...r, [id]: data.password }));
      // auto-oculta após 15s
      setTimeout(
        () =>
          setRevealed((r) => {
            const next = { ...r };
            delete next[id];
            return next;
          }),
        15000,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao revelar senha');
    }
  };

  const remove = async (c: Credential) => {
    if (!confirm(`Excluir a credencial "${c.name}"?`)) return;
    try {
      await api.delete(`/api/vault/${c.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir credencial');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Cofre de Senhas"
        subtitle="Credenciais pessoais criptografadas — visíveis apenas para você"
        action={<Button onClick={() => setModalOpen(true)}>+ Nova credencial</Button>}
      />

      {error && <ErrorBanner message={error} />}

      <Section title={`Credenciais (${creds.length})`}>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : creds.length === 0 ? (
          <EmptyState
            icon="🔐"
            title="Cofre vazio"
            description="Guarde senhas de equipamentos e serviços com criptografia em repouso."
          />
        ) : (
          <ul className="space-y-2">
            {creds.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-medium">{c.name}</p>
                  <p className="text-slate-400 text-xs">
                    {c.username}
                    {c.url ? ` · ${c.url}` : ''}
                  </p>
                </div>
                <code className="text-xs tnum bg-slate-950/60 border border-white/[0.06] rounded px-2 py-1 text-slate-300 min-w-28 text-center">
                  {revealed[c.id] ?? '••••••••'}
                </code>
                <button
                  onClick={() => reveal(c.id)}
                  className="text-blue-400 hover:text-blue-300 text-xs"
                  aria-label={revealed[c.id] ? 'Ocultar senha' : 'Revelar senha'}
                >
                  {revealed[c.id] ? 'Ocultar' : 'Revelar'}
                </button>
                <button
                  onClick={() => remove(c)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Modal
        open={modalOpen}
        title="Nova credencial"
        onClose={() => setModalOpen(false)}
      >
        <Field label="Nome" required>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Switch core - sala 101"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Usuário" required>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoComplete="off"
            />
          </Field>
          <Field label="Senha" required>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </Field>
        </div>
        <Field label="URL / Endereço">
          <Input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://192.168.1.1"
          />
        </Field>
        <Field label="Observações">
          <Textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            loading={saving}
            disabled={!form.name || !form.username || !form.password}
          >
            Salvar no cofre
          </Button>
        </div>
      </Modal>
    </div>
  );
}
