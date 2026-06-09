'use client';

import { useEffect, useState } from 'react';
import { PageHeader, Panel, Button, Field, Input, Modal } from '@/components/ui';

interface Credential {
  id: string;
  name: string;
  username: string;
  passwordContent: string;
  lastUpdate: string;
}

const DEFAULT_CREDENTIALS: Credential[] = [
  { id: '1', name: 'Roteador Mikrotik Core', username: 'admin', passwordContent: 'S3nh@F0rt3_Mikrotik', lastUpdate: '09/06/2026' },
  { id: '2', name: 'Banco de Dados ERP', username: 'sa', passwordContent: 'SqlPassword_2026!', lastUpdate: '10/05/2026' },
  { id: '3', name: 'Acesso Admin Servidor AD', username: 'administrator', passwordContent: 'DomainAdminPassword987', lastUpdate: '15/04/2026' },
];

export default function VaultPage() {
  const [credentials, setCredentials] = useState<Credential[]>(DEFAULT_CREDENTIALS);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPasswordContent, setFormPasswordContent] = useState('');

  // Load from LocalStorage
  useEffect(() => {
    const localCreds = localStorage.getItem('vault_credentials');
    if (localCreds) {
      try {
        setCredentials(JSON.parse(localCreds));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormUsername('');
    setFormPasswordContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Credential) => {
    setEditingId(c.id);
    setFormName(c.name);
    setFormUsername(c.username);
    setFormPasswordContent(c.passwordContent);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formUsername || !formPasswordContent) return;

    let updated: Credential[];
    const todayStr = new Date().toLocaleDateString('pt-BR');

    if (editingId) {
      // Edit mode
      updated = credentials.map((c) =>
        c.id === editingId
          ? { ...c, name: formName, username: formUsername, passwordContent: formPasswordContent, lastUpdate: todayStr }
          : c
      );
    } else {
      // Add mode
      const newCred: Credential = {
        id: 'cred_' + Date.now(),
        name: formName,
        username: formUsername,
        passwordContent: formPasswordContent,
        lastUpdate: todayStr,
      };
      updated = [...credentials, newCred];
    }

    setCredentials(updated);
    localStorage.setItem('vault_credentials', JSON.stringify(updated));
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Deseja realmente remover esta credencial de forma permanente?')) return;
    const updated = credentials.filter((c) => c.id !== id);
    setCredentials(updated);
    localStorage.setItem('vault_credentials', JSON.stringify(updated));
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (password: string) => {
    navigator.clipboard.writeText(password);
    alert('Senha copiada para a área de transferência!');
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Cofre de Senhas" subtitle="Armazenamento seguro de credenciais e senhas de ativos de TI" />
        <Button variant="primary" onClick={openAddModal}>
          + Adicionar Credencial
        </Button>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          {credentials.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-2">🔐</span>
              <p className="text-slate-400">Nenhuma credencial cadastrada no cofre.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="p-4 font-semibold uppercase">Ativo / Recurso</th>
                  <th className="p-4 font-semibold uppercase">Usuário</th>
                  <th className="p-4 font-semibold uppercase">Senha</th>
                  <th className="p-4 font-semibold uppercase">Última Atualização</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {credentials.map((p) => {
                  const isRevealed = !!revealedIds[p.id];
                  return (
                    <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-semibold text-white">{p.name}</td>
                      <td className="p-4 text-slate-300 font-mono">{p.username}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type={isRevealed ? 'text' : 'password'}
                            value={p.passwordContent}
                            readOnly
                            className="bg-transparent border-none text-slate-300 font-mono w-40 focus:outline-none select-all"
                          />
                          <button
                            onClick={() => toggleReveal(p.id)}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                            title={isRevealed ? 'Ocultar' : 'Revelar'}
                          >
                            {isRevealed ? '👁️‍🗨️' : '👁️'}
                          </button>
                          <button
                            onClick={() => copyToClipboard(p.passwordContent)}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                            title="Copiar"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{p.lastUpdate}</td>
                      <td className="p-4 text-right space-x-3">
                        <button
                          onClick={() => openEditModal(p)}
                          className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-sm text-red-400 hover:text-red-300 font-medium"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Panel>

      {/* Add / Edit Credential Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Credencial' : 'Adicionar Credencial ao Cofre'}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={!formName || !formUsername || !formPasswordContent}>
              {editingId ? 'Salvar Alterações' : 'Salvar no Cofre'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Nome do Recurso / Ativo" required>
            <Input
              type="text"
              placeholder="Ex: Servidor de Email Zimbra, Roteador Firewall"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </Field>
          <Field label="Usuário de Acesso" required>
            <Input
              type="text"
              placeholder="Ex: admin, root, administrator"
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
            />
          </Field>
          <Field label="Senha" required>
            <Input
              type="password"
              placeholder="Digite a senha de segurança"
              value={formPasswordContent}
              onChange={(e) => setFormPasswordContent(e.target.value)}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
