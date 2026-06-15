'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button, Field, Input, Section, Modal, EmptyState, ErrorBanner } from '@/components/ui';

interface Volume {
  id: string;
  name: string;
  mountPoint: string | null;
  fileSystem: string | null;
  totalGB: number | null;
  freeGB: number | null;
}

const EMPTY_FORM = { name: '', mountPoint: '', fileSystem: '', totalGB: '', freeGB: '' };

function DiskBar({ total, free }: { total: number; free: number }) {
  const used = total - free;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-blue-500';
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{used.toFixed(1)} GB usados de {total.toFixed(1)} GB</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AssetVolumes({ assetId }: { assetId: string }) {
  const [items, setItems] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<Volume[]>(`/api/assets/${assetId}/volumes`);
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
      await api.post(`/api/assets/${assetId}/volumes`, {
        name: form.name,
        mountPoint: form.mountPoint || null,
        fileSystem: form.fileSystem || null,
        totalGB: form.totalGB ? parseFloat(form.totalGB) : null,
        freeGB: form.freeGB ? parseFloat(form.freeGB) : null,
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
    if (!confirm(`Remover volume "${name}"?`)) return;
    try {
      await api.delete(`/api/assets/${assetId}/volumes/${id}`);
      await load();
    } catch {
      setError('Erro ao remover volume');
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}

      <Section
        title={`Volumes (${items.length})`}
        actions={
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}>+ Adicionar</Button>
        }
      >
        {loading ? (
          <p className="text-slate-400 text-sm">Carregando...</p>
        ) : items.length === 0 ? (
          <EmptyState icon="💾" title="Nenhum volume cadastrado" description="Adicione discos e partições deste dispositivo." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((v) => (
              <div key={v.id} className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-slate-200 font-medium text-sm">💽 {v.name}</p>
                    <div className="flex gap-3 mt-0.5">
                      {v.mountPoint && <span className="text-slate-500 text-xs font-mono">{v.mountPoint}</span>}
                      {v.fileSystem && <span className="text-slate-500 text-xs">{v.fileSystem}</span>}
                    </div>
                  </div>
                  <button onClick={() => remove(v.id, v.name)} className="text-red-400 hover:text-red-300 text-xs">
                    Remover
                  </button>
                </div>
                {v.totalGB && v.freeGB != null ? (
                  <DiskBar total={v.totalGB} free={v.freeGB} />
                ) : v.totalGB ? (
                  <p className="text-xs text-slate-400 mt-2">Total: {v.totalGB} GB</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Modal open={modalOpen} title="Adicionar volume" onClose={() => setModalOpen(false)}>
        <Field label="Nome" required>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Disco C:" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ponto de montagem">
            <Input value={form.mountPoint} onChange={(e) => setForm({ ...form, mountPoint: e.target.value })} placeholder="C:\ ou /mnt/data" />
          </Field>
          <Field label="Sistema de arquivos">
            <Input value={form.fileSystem} onChange={(e) => setForm({ ...form, fileSystem: e.target.value })} placeholder="NTFS" />
          </Field>
          <Field label="Capacidade total (GB)">
            <Input type="number" min="0" step="0.1" value={form.totalGB} onChange={(e) => setForm({ ...form, totalGB: e.target.value })} placeholder="500" />
          </Field>
          <Field label="Espaço livre (GB)">
            <Input type="number" min="0" step="0.1" value={form.freeGB} onChange={(e) => setForm({ ...form, freeGB: e.target.value })} placeholder="200" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={save} loading={saving} disabled={!form.name}>Adicionar</Button>
        </div>
      </Modal>
    </div>
  );
}
