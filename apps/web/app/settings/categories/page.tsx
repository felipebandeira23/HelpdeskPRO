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
  ErrorBanner,
  Skeleton,
  EmptyState,
} from '@/components/ui';

interface CategoryNode {
  id: string;
  name: string;
  description: string | null;
  color: string;
  active: boolean;
  parentId: string | null;
  ticketCount: number;
  children: CategoryNode[];
}

const EMPTY_FORM = { name: '', description: '', color: '#2B73C9', parentId: '' };

export default function CategoriesSettingsPage() {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [flat, setFlat] = useState<{ id: string; path: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryNode | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [t, f] = await Promise.all([
        api.get<CategoryNode[]>('/api/categories/tree'),
        api.get('/api/categories?includeInactive=true'),
      ]);
      setTree(Array.isArray(t) ? t : []);
      setFlat(Array.isArray(f) ? f : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = (parentId = '') => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, parentId });
    setModalOpen(true);
  };

  const openEdit = (c: CategoryNode) => {
    setEditing(c);
    setForm({
      name: c.name,
      description: c.description || '',
      color: c.color,
      parentId: c.parentId || '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        color: form.color,
        parentId: form.parentId || undefined,
      };
      if (editing) {
        await api.patch(`/api/categories/${editing.id}`, payload);
      } else {
        await api.post('/api/categories', payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: CategoryNode) => {
    try {
      await api.patch(`/api/categories/${c.id}`, { active: !c.active });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar categoria');
    }
  };

  const remove = async (c: CategoryNode) => {
    if (!confirm(`Excluir a categoria "${c.name}"?`)) return;
    try {
      await api.delete(`/api/categories/${c.id}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria');
    }
  };

  const renderNode = (node: CategoryNode, depth = 0) => (
    <div key={node.id}>
      <div
        className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
        style={{ marginLeft: depth * 24 }}
      >
        <span
          className="w-3 h-3 rounded-full shrink-0 border border-white/20"
          style={{ backgroundColor: node.color }}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${node.active ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
            {node.name}
          </span>
          {node.description && (
            <span className="text-slate-500 text-xs ml-2">{node.description}</span>
          )}
        </div>
        <span className="text-slate-500 text-xs tnum shrink-0">
          {node.ticketCount} ticket{node.ticketCount === 1 ? '' : 's'}
        </span>
        <button
          onClick={() => openCreate(node.id)}
          className="text-emerald-400 hover:text-emerald-300 text-xs shrink-0"
          title="Adicionar subcategoria"
        >
          + Sub
        </button>
        <button
          onClick={() => openEdit(node)}
          className="text-blue-400 hover:text-blue-300 text-xs shrink-0"
        >
          Editar
        </button>
        <button
          onClick={() => toggleActive(node)}
          className="text-amber-400 hover:text-amber-300 text-xs shrink-0"
        >
          {node.active ? 'Desativar' : 'Ativar'}
        </button>
        <button
          onClick={() => remove(node)}
          className="text-red-400 hover:text-red-300 text-xs shrink-0"
        >
          Excluir
        </button>
      </div>
      {node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((c) => renderNode(c, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Catálogo de Categorias"
        subtitle="Hierarquia usada em tickets, SLA por categoria e relatórios"
        action={<Button onClick={() => openCreate()}>+ Nova categoria</Button>}
      />

      {error && <ErrorBanner message={error} />}

      <Section title="Árvore de categorias">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        ) : tree.length === 0 ? (
          <EmptyState
            icon="🗂️"
            title="Nenhuma categoria"
            description="Crie categorias como 'Hardware > Impressora' para classificar tickets."
          />
        ) : (
          <div className="space-y-2">{tree.map((n) => renderNode(n))}</div>
        )}
      </Section>

      <Modal
        open={modalOpen}
        title={editing ? 'Editar categoria' : 'Nova categoria'}
        onClose={() => setModalOpen(false)}
      >
        <Field label="Nome" required>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Impressora"
          />
        </Field>
        <Field label="Descrição">
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoria pai">
            <Select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            >
              <option value="">— Raiz —</option>
              {flat
                .filter((c) => c.id !== editing?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.path}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="Cor">
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
              aria-label="Cor da categoria"
            />
          </Field>
        </div>
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
