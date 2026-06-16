'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  PageHeader,
  Section,
  Button,
  Modal,
  Field,
  Input,
  Select,
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
  assetType: 'COMPUTER' | 'LAPTOP' | 'SERVER' | 'PRINTER' | 'SWITCH' | 'ROUTER' | 'PHONE' | 'TABLET' | 'MONITOR' | 'OTHER';
  assetStatus: 'IN_USE' | 'AVAILABLE' | 'MAINTENANCE' | 'RETIRED' | 'STOLEN' | 'LENT';
  serialNumber: string | null;
  inventoryNumber: string | null;
  agentStatus: 'ONLINE' | 'OFFLINE' | 'UNKNOWN';
  lastSeen: string | null;
}

const ASSET_TYPES = [
  { value: 'COMPUTER', label: '💻 Computador', icon: '💻' },
  { value: 'LAPTOP', label: '💻 Notebook', icon: '💻' },
  { value: 'SERVER', label: '🖥️ Servidor', icon: '🖥️' },
  { value: 'PRINTER', label: '🖨️ Impressora', icon: '🖨️' },
  { value: 'SWITCH', label: '🔀 Switch', icon: '🔀' },
  { value: 'ROUTER', label: '📡 Roteador', icon: '📡' },
  { value: 'MONITOR', label: '🖥️ Monitor', icon: '🖥️' },
  { value: 'PHONE', label: '☎️ Telefone', icon: '☎️' },
  { value: 'TABLET', label: '📱 Tablet', icon: '📱' },
  { value: 'ACCESS_POINT', label: '📶 Ponto de Acesso', icon: '📶' },
  { value: 'NETWORK_EQUIPMENT', label: '🌐 Equipamento de Rede', icon: '🌐' },
  { value: 'PERIPHERAL', label: '⌨️ Periférico', icon: '⌨️' },
  { value: 'CARTRIDGE', label: '🎨 Cartucho', icon: '🎨' },
  { value: 'CONSUMABLE', label: '📦 Insumo', icon: '📦' },
  { value: 'RACK', label: '🗄️ Rack', icon: '🗄️' },
  { value: 'ENCLOSURE', label: '📦 Chassis', icon: '📦' },
  { value: 'PDU', label: '🔌 PDU', icon: '🔌' },
  { value: 'PASSIVE_DEVICE', label: '🔗 Dispositivo Passivo', icon: '🔗' },
  { value: 'CABLE', label: '🔗 Cabo', icon: '🔗' },
  { value: 'OTHER', label: '❓ Outro', icon: '❓' },
] as const;

const ASSET_STATUS = [
  { value: 'IN_USE', label: '✓ Em uso', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { value: 'AVAILABLE', label: '◉ Disponível', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { value: 'MAINTENANCE', label: '⚙️ Manutenção', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  { value: 'RETIRED', label: '✕ Aposentado', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  { value: 'STOLEN', label: '⚠️ Roubado', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  { value: 'LENT', label: '→ Emprestado', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
] as const;

const AGENT_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  ONLINE: { label: 'Online', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  OFFLINE: { label: 'Offline', cls: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-400' },
  UNKNOWN: { label: 'Sem agente', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-500' },
};

const EMPTY_FORM = {
  hostname: '',
  ip: '',
  manufacturer: '',
  model: '',
  os: '',
  assetType: 'COMPUTER' as const,
  assetStatus: 'IN_USE' as const,
  serialNumber: '',
  inventoryNumber: '',
};

export default function AssetsPage() {
  const searchParams = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(() => {
    const urlType = searchParams.get('type');
    return urlType ? decodeURIComponent(urlType) : null;
  });
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const urlType = searchParams.get('type');
      const queryParam = urlType ? `?type=${encodeURIComponent(urlType)}` : '';
      const data = await api.get<Asset[]>(`/api/assets${queryParam}`);
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar ativos');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

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
      assetType: a.assetType,
      assetStatus: a.assetStatus,
      serialNumber: a.serialNumber || '',
      inventoryNumber: a.inventoryNumber || '',
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
        assetType: form.assetType,
        assetStatus: form.assetStatus,
        serialNumber: form.serialNumber || null,
        inventoryNumber: form.inventoryNumber || null,
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

  const filtered = assets.filter((a) => {
    const matchesQuery =
      !query ||
      [a.hostname, a.ip, a.manufacturer, a.model, a.os, a.serialNumber, a.inventoryNumber]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(query.toLowerCase()));
    const matchesType = !typeFilter || typeFilter.split(',').map(t => t.trim()).includes(a.assetType);
    const matchesStatus = !statusFilter || a.assetStatus === statusFilter;
    return matchesQuery && matchesType && matchesStatus;
  });

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
          <div className="flex gap-3">
            <Select
              value={typeFilter || ''}
              onChange={(e) => setTypeFilter(e.target.value || null)}
              className="w-32"
            >
              <option value="">Todos os tipos</option>
              {ASSET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="w-32"
            >
              <option value="">Todos os status</option>
              {ASSET_STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Buscar por hostname, IP, serial..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64"
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
                  <th className="py-2 pr-4">Tipo</th>
                  <th className="py-2 pr-4">Hostname</th>
                  <th className="py-2 pr-4">IP</th>
                  <th className="py-2 pr-4">Fabricante / Modelo</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Agente</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const agentBadge = AGENT_BADGE[a.agentStatus] || AGENT_BADGE.UNKNOWN;
                  const typeInfo = ASSET_TYPES.find((t) => t.value === a.assetType);
                  const statusInfo = ASSET_STATUS.find((s) => s.value === a.assetStatus);
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 pr-4 text-center text-lg">
                        {typeInfo?.icon || '🔌'}
                      </td>
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
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex text-xs px-2 py-0.5 rounded border ${statusInfo?.cls || 'bg-slate-500/15 text-slate-400 border-slate-500/30'}`}
                        >
                          {statusInfo?.label || a.assetStatus}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border ${agentBadge.cls}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${agentBadge.dot}`} />
                          {agentBadge.label}
                        </span>
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
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo" required>
            <Select
              value={form.assetType}
              onChange={(e) => setForm({ ...form, assetType: e.target.value as any })}
            >
              {ASSET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.assetStatus}
              onChange={(e) => setForm({ ...form, assetStatus: e.target.value as any })}
            >
              {ASSET_STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

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
          <Field label="Serial">
            <Input
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              placeholder="SN123456"
            />
          </Field>
          <Field label="Número de inventário">
            <Input
              value={form.inventoryNumber}
              onChange={(e) => setForm({ ...form, inventoryNumber: e.target.value })}
              placeholder="INV-001"
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
