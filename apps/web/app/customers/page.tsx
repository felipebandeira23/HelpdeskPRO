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

interface Customer {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  contractStatus: 'NONE' | 'ACTIVE' | 'EXPIRING' | 'OVERDUE';
  notes: string | null;
}

const CONTRACT_BADGE: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Contrato ativo', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  EXPIRING: { label: 'Prestes a vencer', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  OVERDUE: { label: 'Inadimplente', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  NONE: { label: 'Sem contrato', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

const EMPTY_FORM = {
  name: '',
  document: '',
  email: '',
  phone: '',
  address: '',
  contractStatus: 'NONE',
  notes: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.get<Customer[]>('/api/customers');
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      document: c.document || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      contractStatus: c.contractStatus,
      notes: c.notes || '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        document: form.document || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        contractStatus: form.contractStatus,
        notes: form.notes || null,
      };
      if (editing) {
        await api.patch(`/api/customers/${editing.id}`, payload);
      } else {
        await api.post('/api/customers', payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Customer) => {
    if (!confirm(`Excluir o cliente "${c.name}"?`)) return;
    try {
      await api.delete(`/api/customers/${c.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir cliente');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Clientes"
        subtitle="Empresas e solicitantes com contrato"
        action={<Button onClick={openCreate}>+ Novo cliente</Button>}
      />

      {error && <ErrorBanner message={error} />}

      <Section title={`Cadastrados (${customers.length})`}>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon="🏢"
            title="Nenhum cliente cadastrado"
            description="Cadastre empresas para vincular tickets e contratos."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">CNPJ/CPF</th>
                  <th className="py-2 pr-4">Contato</th>
                  <th className="py-2 pr-4">Contrato</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const badge = CONTRACT_BADGE[c.contractStatus] || CONTRACT_BADGE.NONE;
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 pr-4 text-slate-200 font-medium">{c.name}</td>
                      <td className="py-3 pr-4 text-slate-300 tnum">{c.document || '—'}</td>
                      <td className="py-3 pr-4 text-slate-300">
                        {c.email || c.phone || '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(c)}
                          className="text-blue-400 hover:text-blue-300 text-xs mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => remove(c)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Modal
        open={modalOpen}
        title={editing ? 'Editar cliente' : 'Novo cliente'}
        onClose={() => setModalOpen(false)}
      >
        <Field label="Nome" required>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Empresa LTDA"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="CNPJ/CPF">
            <Input
              value={form.document}
              onChange={(e) => setForm({ ...form, document: e.target.value })}
            />
          </Field>
          <Field label="Situação do contrato">
            <Select
              value={form.contractStatus}
              onChange={(e) => setForm({ ...form, contractStatus: e.target.value })}
            >
              <option value="NONE">Sem contrato</option>
              <option value="ACTIVE">Ativo</option>
              <option value="EXPIRING">Prestes a vencer</option>
              <option value="OVERDUE">Inadimplente</option>
            </Select>
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Telefone">
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Endereço">
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
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
          <Button onClick={save} loading={saving} disabled={!form.name}>
            {editing ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
