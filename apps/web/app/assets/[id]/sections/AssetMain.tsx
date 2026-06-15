'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Button, Field, Input, Select, Section, ErrorBanner, Textarea } from '@/components/ui';

const ASSET_TYPES = [
  { value: 'COMPUTER', label: 'Desktop' },
  { value: 'LAPTOP', label: 'Notebook' },
  { value: 'SERVER', label: 'Servidor' },
  { value: 'PRINTER', label: 'Impressora' },
  { value: 'SWITCH', label: 'Switch' },
  { value: 'ROUTER', label: 'Roteador' },
  { value: 'PHONE', label: 'Telefone' },
  { value: 'TABLET', label: 'Tablet' },
  { value: 'MONITOR', label: 'Monitor' },
  { value: 'OTHER', label: 'Outro' },
];

const ASSET_STATUSES = [
  { value: 'IN_USE', label: 'Em uso' },
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'MAINTENANCE', label: 'Em manutenção' },
  { value: 'RETIRED', label: 'Descartado' },
  { value: 'STOLEN', label: 'Furtado/Roubado' },
  { value: 'LENT', label: 'Emprestado' },
];

const AGENT_BADGE: Record<string, { label: string; cls: string; dot: string }> = {
  ONLINE: { label: 'Online', cls: 'text-emerald-400', dot: 'bg-emerald-400' },
  OFFLINE: { label: 'Offline', cls: 'text-red-400', dot: 'bg-red-400' },
  UNKNOWN: { label: 'Sem agente', cls: 'text-slate-400', dot: 'bg-slate-500' },
};

interface Asset {
  id: string;
  hostname: string;
  ip: string | null;
  manufacturer: string | null;
  model: string | null;
  os: string | null;
  assetType: string;
  assetStatus: string;
  serialNumber: string | null;
  inventoryNumber: string | null;
  uuid: string | null;
  comments: string | null;
  agentStatus: string;
  lastSeen: string | null;
  createdAt: string;
  technicianId: string | null;
  userId: string | null;
  technician?: { id: string; name: string } | null;
  assetUser?: { id: string; name: string } | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

function QRCodeCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!url) return;
    import('qrcode').then((QRCode) => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: 128,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
      }
    });
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded border border-slate-700" />
      <span className="text-xs text-slate-500">URL do ativo</span>
    </div>
  );
}

export default function AssetMain({ assetId, asset: initial }: { assetId: string; asset: Asset }) {
  const [asset, setAsset] = useState<Asset>(initial);
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState('');

  const [form, setForm] = useState({
    hostname: initial.hostname,
    ip: initial.ip || '',
    manufacturer: initial.manufacturer || '',
    model: initial.model || '',
    os: initial.os || '',
    assetType: initial.assetType || 'COMPUTER',
    assetStatus: initial.assetStatus || 'IN_USE',
    serialNumber: initial.serialNumber || '',
    inventoryNumber: initial.inventoryNumber || '',
    uuid: initial.uuid || '',
    comments: initial.comments || '',
    technicianId: initial.technicianId || '',
    userId: initial.userId || '',
  });

  useEffect(() => {
    setQrUrl(window.location.href);
    api.get<User[]>('/api/users').then(setUsers).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.patch<Asset>(`/api/assets/${assetId}`, {
        hostname: form.hostname,
        ip: form.ip || null,
        manufacturer: form.manufacturer || null,
        model: form.model || null,
        os: form.os || null,
        assetType: form.assetType,
        assetStatus: form.assetStatus,
        serialNumber: form.serialNumber || null,
        inventoryNumber: form.inventoryNumber || null,
        uuid: form.uuid || null,
        comments: form.comments || null,
        technicianId: form.technicianId || null,
        userId: form.userId || null,
      });
      setAsset(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const badge = AGENT_BADGE[asset.agentStatus] || AGENT_BADGE.UNKNOWN;

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Formulário principal */}
        <div className="xl:col-span-3 space-y-6">
          <Section title="Identificação">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome / Hostname" required>
                <Input
                  value={form.hostname}
                  onChange={(e) => setForm({ ...form, hostname: e.target.value })}
                  placeholder="desktop-001"
                />
              </Field>
              <Field label="Número de inventário">
                <Input
                  value={form.inventoryNumber}
                  onChange={(e) => setForm({ ...form, inventoryNumber: e.target.value })}
                  placeholder="INV-2024-001"
                />
              </Field>
              <Field label="Tipo">
                <Select value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })}>
                  {ASSET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.assetStatus} onChange={(e) => setForm({ ...form, assetStatus: e.target.value })}>
                  {ASSET_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="Hardware">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="OptiPlex 7090"
                />
              </Field>
              <Field label="Número de série">
                <Input
                  value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  placeholder="DELL7090SP001"
                />
              </Field>
              <Field label="UUID">
                <Input
                  value={form.uuid}
                  onChange={(e) => setForm({ ...form, uuid: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </Field>
            </div>
          </Section>

          <Section title="Rede">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Endereço IP">
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
            </div>
          </Section>

          <Section title="Responsáveis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Técnico encarregado">
                <Select value={form.technicianId} onChange={(e) => setForm({ ...form, technicianId: e.target.value })}>
                  <option value="">— Nenhum —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Usuário responsável">
                <Select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
                  <option value="">— Nenhum —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="Comentários">
            <Textarea
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              placeholder="Observações sobre este ativo..."
              rows={3}
            />
          </Section>
        </div>

        {/* Painel lateral: status do agente + QR code */}
        <div className="space-y-4">
          <Section title="Status do agente">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2.5 h-2.5 rounded-full ${badge.dot} ${asset.agentStatus === 'ONLINE' ? 'animate-pulse' : ''}`} />
              <span className={`text-sm font-medium ${badge.cls}`}>{badge.label}</span>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Visto por último</dt>
                <dd className="text-slate-300 text-xs">
                  {asset.lastSeen ? new Date(asset.lastSeen).toLocaleString('pt-BR') : 'Nunca'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Cadastrado em</dt>
                <dd className="text-slate-300 text-xs">
                  {new Date(asset.createdAt).toLocaleDateString('pt-BR')}
                </dd>
              </div>
            </dl>
          </Section>

          {qrUrl && (
            <Section title="QR Code">
              <QRCodeCanvas url={qrUrl} />
            </Section>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={save} loading={saving} disabled={!form.hostname}>
          Salvar
        </Button>
      </div>
    </div>
  );
}
