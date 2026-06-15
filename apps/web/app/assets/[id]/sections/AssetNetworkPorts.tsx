'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button, Field, Input, Section, Modal, EmptyState, ErrorBanner } from '@/components/ui';

interface NetworkPort {
  id: string;
  name: string;
  macAddress: string | null;
  speed: string | null;
  ipAddress: string | null;
  isActive: boolean;
}

const EMPTY_FORM = { name: '', macAddress: '', speed: '', ipAddress: '', isActive: true };

export default function AssetNetworkPorts({ assetId }: { assetId: string }) {
  const [items, setItems] = useState<NetworkPort[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<NetworkPort[]>(`/api/assets/${assetId}/network-ports`);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.post(`/api/assets/${assetId}/network-ports`, {
        name: form.name,
        macAddress: form.macAddress || null,
        speed: form.speed || null,
        ipAddress: form.ipAddress || null,
        isActive: form.isActive,
      });
      setModalOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remover porta "${name}"?`)) return;
    try {
      await api.delete(`/api/assets/${assetId}/network-ports/${id}`);
      await load();
    } catch {
      setError('Erro ao remover porta');
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}

      <Section
        title={`Portas de Rede (${items.length})`}
        actions={
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}>+ Adicionar</Button>
        }
      >
        {loading ? (
          <p className="text-slate-400 text-sm">Carregando...</p>
        ) : items.length === 0 ? (
          <EmptyState icon="🌐" title="Nenhuma porta de rede cadastrada" description="Adicione interfaces de rede, Wi-Fi e outras portas de conectividade." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">MAC Address</th>
                  <th className="py-2 pr-4">IP</th>
                  <th className="py-2 pr-4">Velocidade</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4 text-slate-200 font-medium">{p.name}</td>
                    <td className="py-2.5 pr-4 text-slate-400 font-mono text-xs">{p.macAddress || '—'}</td>
                    <td className="py-2.5 pr-4 text-slate-400 font-mono text-xs">{p.ipAddress || '—'}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{p.speed || '—'}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border ${p.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/40 text-slate-500 border-slate-600/30'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {p.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => remove(p.id, p.name)} className="text-red-400 hover:text-red-300 text-xs">
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Modal open={modalOpen} title="Adicionar porta de rede" onClose={() => setModalOpen(false)}>
        <Field label="Nome / Interface" required>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ethernet 1" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="MAC Address">
            <Input value={form.macAddress} onChange={(e) => setForm({ ...form, macAddress: e.target.value })} placeholder="AA:BB:CC:DD:EE:FF" />
          </Field>
          <Field label="Endereço IP">
            <Input value={form.ipAddress} onChange={(e) => setForm({ ...form, ipAddress: e.target.value })} placeholder="192.168.1.10" />
          </Field>
          <Field label="Velocidade">
            <Input value={form.speed} onChange={(e) => setForm({ ...form, speed: e.target.value })} placeholder="1 Gbps" />
          </Field>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 accent-blue-500"
              />
              <span className="text-sm text-slate-300">Porta ativa</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={save} loading={saving} disabled={!form.name}>Adicionar</Button>
        </div>
      </Modal>
    </div>
  );
}
