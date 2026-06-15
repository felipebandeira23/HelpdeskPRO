'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button, Field, Input, Section, Modal, EmptyState, ErrorBanner } from '@/components/ui';

interface Software {
  id: string;
  name: string;
  version: string | null;
  vendor: string | null;
  installDate: string | null;
}

const EMPTY_FORM = { name: '', version: '', vendor: '', installDate: '' };

export default function AssetSoftware({ assetId }: { assetId: string }) {
  const [items, setItems] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<Software[]>(`/api/assets/${assetId}/software`);
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
      await api.post(`/api/assets/${assetId}/software`, {
        name: form.name,
        version: form.version || null,
        vendor: form.vendor || null,
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
      await api.delete(`/api/assets/${assetId}/software/${id}`);
      await load();
    } catch {
      setError('Erro ao remover software');
    }
  };

  const filtered = items.filter((s) =>
    [s.name, s.vendor, s.version].filter(Boolean).some((v) => v!.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}

      <Section
        title={`Softwares (${filtered.length}${filtered.length !== items.length ? `/${items.length}` : ''})`}
        actions={
          <div className="flex gap-2">
            <Input className="w-48 text-xs py-1.5" placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}>+ Adicionar</Button>
          </div>
        }
      >
        {loading ? (
          <p className="text-slate-400 text-sm">Carregando...</p>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📦" title={query ? 'Nenhum resultado' : 'Nenhum software cadastrado'} description="Registre os softwares instalados neste dispositivo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">Fabricante</th>
                  <th className="py-2 pr-4">Versão</th>
                  <th className="py-2 pr-4">Instalado em</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4 text-slate-200">{s.name}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{s.vendor || '—'}</td>
                    <td className="py-2.5 pr-4 text-slate-400 font-mono text-xs">{s.version || '—'}</td>
                    <td className="py-2.5 pr-4 text-slate-400 text-xs">
                      {s.installDate ? new Date(s.installDate).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => remove(s.id, s.name)} className="text-red-400 hover:text-red-300 text-xs">
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

      <Modal open={modalOpen} title="Adicionar software" onClose={() => setModalOpen(false)}>
        <Field label="Nome" required>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Microsoft Office 365" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fabricante">
            <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="Microsoft" />
          </Field>
          <Field label="Versão">
            <Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="16.0.18227" />
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
