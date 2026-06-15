'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button, Field, Input, Select, Section, Modal, EmptyState, ErrorBanner } from '@/components/ui';

const COMPONENT_TYPES = [
  { value: 'CPU', label: 'Processador (CPU)' },
  { value: 'RAM', label: 'Memória RAM' },
  { value: 'STORAGE', label: 'Armazenamento' },
  { value: 'GPU', label: 'Placa de vídeo' },
  { value: 'NETWORK_CARD', label: 'Placa de rede' },
  { value: 'MOTHERBOARD', label: 'Placa-mãe' },
  { value: 'POWER_SUPPLY', label: 'Fonte de alimentação' },
  { value: 'BATTERY', label: 'Bateria' },
  { value: 'SCREEN', label: 'Tela / Monitor' },
  { value: 'OTHER', label: 'Outro' },
];

const TYPE_ICON: Record<string, string> = {
  CPU: '🔲', RAM: '💾', STORAGE: '💽', GPU: '🖥️',
  NETWORK_CARD: '🌐', MOTHERBOARD: '🔌', POWER_SUPPLY: '⚡',
  BATTERY: '🔋', SCREEN: '📺', OTHER: '🔧',
};

interface Component {
  id: string;
  type: string;
  name: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  quantity: number;
  specs: string | null;
}

const EMPTY_FORM = { type: 'CPU', name: '', brand: '', model: '', serialNumber: '', quantity: '1', specs: '' };

export default function AssetComponents({ assetId }: { assetId: string }) {
  const [items, setItems] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<Component[]>(`/api/assets/${assetId}/components`);
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
      await api.post(`/api/assets/${assetId}/components`, {
        type: form.type,
        name: form.name,
        brand: form.brand || null,
        model: form.model || null,
        serialNumber: form.serialNumber || null,
        quantity: parseInt(form.quantity) || 1,
        specs: form.specs || null,
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
    if (!confirm(`Remover componente "${name}"?`)) return;
    try {
      await api.delete(`/api/assets/${assetId}/components/${id}`);
      await load();
    } catch {
      setError('Erro ao remover componente');
    }
  };

  const typeLabel = (t: string) => COMPONENT_TYPES.find((c) => c.value === t)?.label ?? t;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}

      <Section
        title={`Componentes (${items.length})`}
        actions={
          <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}>
            + Adicionar
          </Button>
        }
      >
        {loading ? (
          <p className="text-slate-400 text-sm">Carregando...</p>
        ) : items.length === 0 ? (
          <EmptyState icon="🔧" title="Nenhum componente cadastrado" description="Adicione CPUs, memórias, discos e outros componentes." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                  <th className="py-2 pr-4">Tipo</th>
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">Fabricante</th>
                  <th className="py-2 pr-4">Modelo</th>
                  <th className="py-2 pr-4">Série</th>
                  <th className="py-2 pr-4">Qtd</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4 text-slate-300">
                      <span className="mr-1.5">{TYPE_ICON[c.type] ?? '🔧'}</span>
                      {typeLabel(c.type)}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-200 font-medium">{c.name}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{c.brand || '—'}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{c.model || '—'}</td>
                    <td className="py-2.5 pr-4 text-slate-400 font-mono text-xs">{c.serialNumber || '—'}</td>
                    <td className="py-2.5 pr-4 text-slate-400">{c.quantity}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => remove(c.id, c.name)} className="text-red-400 hover:text-red-300 text-xs">
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

      <Modal open={modalOpen} title="Adicionar componente" onClose={() => setModalOpen(false)}>
        <Field label="Tipo" required>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {COMPONENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Nome / Descrição" required>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Intel Core i7-12700" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fabricante">
            <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Intel" />
          </Field>
          <Field label="Modelo">
            <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="i7-12700K" />
          </Field>
          <Field label="Número de série">
            <Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} placeholder="SN123456" />
          </Field>
          <Field label="Quantidade">
            <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </Field>
        </div>
        <Field label="Especificações">
          <Input value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} placeholder="3.6 GHz, 12 núcleos, 20 threads" />
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={save} loading={saving} disabled={!form.name}>Adicionar</Button>
        </div>
      </Modal>
    </div>
  );
}
