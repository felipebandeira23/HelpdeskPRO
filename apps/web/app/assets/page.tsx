'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  PageHeader,
  Section,
  Button,
  Modal,
  Field,
  Input,
  ErrorBanner,
  Skeleton,
  EmptyState,
} from '@/components/ui';

interface Asset {
  id: string;
  hostname: string;
  ip: string | null;
  manufacturer: string | null;
  model: string | null;
  os: string | null;
  agentStatus: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
  lastSeen: string | null;
}

const AGENT_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  ONLINE: { label: 'Online', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  OFFLINE: { label: 'Offline', cls: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-400' },
  UNKNOWN: { label: 'Sem agente', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-500' },
};

const EMPTY_FORM = { hostname: '', ip: '', manufacturer: '', model: '', os: '' };

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.get<Asset[]>('/api/assets');
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ativos');
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

  const openEdit = (a: Asset) => {
    setEditing(a);
    setForm({
      hostname: a.hostname,
      ip: a.ip || '',
      manufacturer: a.manufacturer || '',
      model: a.model || '',
      os: a.os || '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        hostname: form.hostname,
        ip: form.ip || null,
        manufacturer: form.manufacturer || null,
        model: form.model || null,
        os: form.os || null,
      };
      if (editing) {
        await api.patch(`/api/assets/${editing.id}`, payload);
      } else {
        await api.post('/api/assets', payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar ativo');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a: Asset) => {
    if (!confirm(`Excluir o ativo "${a.hostname}"?`)) return;
    try {
      await api.delete(`/api/assets/${a.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir ativo');
    }
  };

  const filtered = assets.filter((a) =>
    [a.hostname, a.ip, a.manufacturer, a.model, a.os]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Inventário de Ativos"
        subtitle="Dispositivos cadastrados e status dos agentes"
        action={<Button onClick={openCreate}>+ Novo ativo</Button>}
      />

      {error && <ErrorBanner message={error} />}

      <Section
        title={`Dispositivos (${filtered.length})`}
        actions={
          <div className="w-64">
            <Input
              placeholder="Buscar por hostname, IP, modelo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        }
      >
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🖥️"
            title={query ? 'Nenhum ativo encontrado' : 'Nenhum ativo cadastrado'}
            description={
              query
                ? 'Ajuste a busca ou limpe o filtro.'
                : 'Cadastre o primeiro dispositivo ou aguarde o agente reportar.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                  <th className="py-2 pr-4">Hostname</th>
                  <th className="py-2 pr-4">IP</th>
                  <th className="py-2 pr-4">Fabricante / Modelo</th>
                  <th className="py-2 pr-4">Sistema</th>
                  <th className="py-2 pr-4">Agente</th>
                  <th className="py-2 pr-4">Visto por último</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const badge = AGENT_BADGE[a.agentStatus] || AGENT_BADGE.UNKNOWN;
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/assets/${a.id}`}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          {a.hostname}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-slate-300 tnum">{a.ip || '—'}</td>
                      <td className="py-3 pr-4 text-slate-300">
                        {[a.manufacturer, a.model].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{a.os || '—'}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border ${badge.cls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 text-xs">
                        {a.lastSeen
                          ? new Date(a.lastSeen).toLocaleString('pt-BR')
                          : 'Nunca'}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(a)}
                          className="text-blue-400 hover:text-blue-300 text-xs mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => remove(a)}
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
        title={editing ? 'Editar ativo' : 'Novo ativo'}
        onClose={() => setModalOpen(false)}
      >
        <Field label="Hostname" required>
          <Input
            value={form.hostname}
            onChange={(e) => setForm({ ...form, hostname: e.target.value })}
            placeholder="desktop-001"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="IP">
            <Input
              value={form.ip}
              onChange={(e) => setForm({ ...form, ip: e.target.value })}
              placeholder="192.168.1.10"
            />
          </Field>
          <Field label="Sistema operacional">
            <Input
              value={form.os}
              onChange={(e) => setForm({ ...form, os: e.target.value })}
              placeholder="Windows 11 Pro"
            />
          </Field>
          <Field label="Fabricante">
            <Input
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              placeholder="Dell"
            />
          </Field>
          <Field label="Modelo">
            <Input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="Optiplex 7090"
            />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={save} loading={saving} disabled={!form.hostname}>
            {editing ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
