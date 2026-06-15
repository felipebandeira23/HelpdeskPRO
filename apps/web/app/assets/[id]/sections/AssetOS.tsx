'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button, Field, Input, Section, Modal, EmptyState, ErrorBanner } from '@/components/ui';

interface OS {
  id: string;
  name: string;
  version: string | null;
  architecture: string | null;
  serialNumber: string | null;
  installDate: string | null;
}

const EMPTY_FORM = { name: '', version: '', architecture: '', serialNumber: '', installDate: '' };

export default function AssetOS({ assetId }: { assetId: string }) {
  const [items, setItems] = useState<OS[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<OS[]>(`/api/assets/${assetId}/os`);
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
      await api.post(`/api/assets/${assetId}/os`, {
        name: form.name,
        version: form.version || null,
        architecture: form.architecture || null,
        serialNumber: form.serialNumber || null,
        installDate: form.installDate || null,
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
    if (!confirm(`Remover "${name}"?`)) return;
    try {
      await api.delete(`/api/assets/${assetId}/os/${id}`);
      await load();
    } catch {
      setError('Erro ao remover');
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}

      <Section
        title={`Sistemas Operacionais (${items.length})`}
        actions={
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}>
            + Adicionar
          </Button>
        }
      >
        {loading ? (
          <p className="text-slate-400 text-sm">Carregando...</p>
        ) : items.length === 0 ? (
          <EmptyState icon="🖥️" title="Nenhum sistema operacional cadastrado" description="Adicione informações do SO instalado neste ativo." />
        ) : (
          <div className="space-y-3">
            {items.map((os) => (
              <div key={os.id} className="bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-slate-200 font-medium text-sm">{os.name}</p>
                  <div className="flex gap-4 mt-1">
                    {os.version && <span className="text-slate-400 text-xs">Versão: {os.version}</span>}
                    {os.architecture && <span className="text-slate-400 text-xs">Arch: {os.architecture}</span>}
                    {os.serialNumber && <span className="text-slate-400 text-xs">Série: {os.serialNumber}</span>}
                    {os.installDate && (
                      <span className="text-slate-400 text-xs">
                        Instalado: {new Date(os.installDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => remove(os.id, os.name)} className="text-red-400 hover:text-red-300 text-xs shrink-0">
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Modal open={modalOpen} title="Adicionar sistema operacional" onClose={() => setModalOpen(false)}>
        <Field label="Nome" required>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Microsoft Windows 11 Pro" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Versão">
            <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="23H2" />
          </Field>
          <Field label="Arquitetura">
            <Input value={form.architecture} onChange={(e) => setForm({ ...form, architecture: e.target.value })} placeholder="x86_64" />
          </Field>
          <Field label="Número de série / Licença">
            <Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} placeholder="XXXXX-XXXXX-XXXXX" />
          </Field>
          <Field label="Data de instalação">
            <Input type="date" value={form.installDate} onChange={(e) => setForm({ ...form, installDate: e.target.value })} />
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
