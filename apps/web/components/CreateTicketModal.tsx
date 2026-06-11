'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button, Field, Input, Textarea, Select, ErrorBanner } from '@/components/ui';

interface CreateTicketModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTicketModal({ onClose, onSuccess }: CreateTicketModalProps) {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    groupId: '',
    assetId: '',
    assignedToId: '',
    requesterId: '',
    categoryId: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({ ...prev, requesterId: currentUser.id }));
    }
  }, [currentUser]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const groupsData = await api.get('/api/groups');
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (err) {
        console.error('Erro ao carregar grupos:', err);
      }

      try {
        const assetsData = await api.get('/api/assets');
        setAssets(Array.isArray(assetsData) ? assetsData : []);
      } catch (err) {
        console.error('Erro ao carregar ativos:', err);
      }

      try {
        const usersData = await api.get('/api/users');
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
      }

      try {
        const categoriesData = await api.get('/api/categories');
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/tickets', {
        ...formData,
        groupId: formData.groupId || undefined,
        assetId: formData.assetId || undefined,
        assignedToId: formData.assignedToId || undefined,
        requesterId: formData.requesterId || undefined,
        categoryId: formData.categoryId || undefined,
      });
      
      // Dispatch global ticket created event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ticket-created'));
      }
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const isStaff = currentUser?.role === 'ADMIN' || currentUser?.role === 'TECHNICIAN';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Novo Ticket</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && <ErrorBanner message={error} />}

          <Field label="Título" required>
            <Input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Resumo do problema"
            />
          </Field>

          <Field label="Descrição" required>
            <Textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detalhe o problema..."
              rows={4}
            />
          </Field>

          {isStaff && (
            <Field label="Solicitante (Cliente)" required>
              <Select
                value={formData.requesterId}
                onChange={(e) => setFormData({ ...formData, requesterId: e.target.value })}
              >
                <option value="">Selecione um solicitante...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'ADMIN' ? 'Admin' : u.role === 'TECHNICIAN' ? 'Técnico' : 'Cliente'})
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Categoria">
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.path || c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Prioridade">
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </Select>
            </Field>

            <Field label="Técnico Atribuído">
              <Select
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              >
                <option value="">Não atribuído</option>
                {users
                  .filter((u) => u.role === 'ADMIN' || u.role === 'TECHNICIAN')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role === 'ADMIN' ? 'Admin' : 'Técnico'})
                    </option>
                  ))}
              </Select>
            </Field>

            <Field label="Grupo Atribuído">
              <Select
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              >
                <option value="">Nenhum grupo</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Dispositivo / Ativo">
              <Select
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              >
                <option value="">Nenhum dispositivo</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.hostname} {a.model ? `(${a.model})` : ''}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {loading ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
