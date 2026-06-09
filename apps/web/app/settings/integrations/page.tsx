'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader, Panel, Button, Field, Input, Modal } from '@/components/ui';

export default function IntegrationsSettingsPage() {
  const [oauthClients, setOauthClients] = useState([
    { id: '1', name: 'Google Cloud Identity', clientId: '7728103-googleusercontent.apps.google.com', provider: 'Google', active: true },
    { id: '2', name: 'Microsoft Entra ID (Azure)', clientId: '33af192-azure-aad-microsoft.com', provider: 'Microsoft', active: true },
  ]);

  const [apiKeys, setApiKeys] = useState([
    { id: 'k1', name: 'Agente Desktop Token Global', prefix: 'hdpro_live_d83e...', created: '01/06/2026' },
    { id: 'k2', name: 'Integradora Zabbix Monitoring', prefix: 'hdpro_live_99a1...', created: '05/06/2026' },
  ]);

  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // OAuth Modal states
  const [isOauthModalOpen, setIsOauthModalOpen] = useState(false);
  const [newOauthName, setNewOauthName] = useState('');
  const [newOauthClientId, setNewOauthClientId] = useState('');
  const [newOauthProvider, setNewOauthProvider] = useState('Google');

  useEffect(() => {
    const localKeys = localStorage.getItem('settings_api_keys');
    const localOauth = localStorage.getItem('settings_oauth_clients');
    if (localKeys) {
      try {
        setApiKeys(JSON.parse(localKeys));
      } catch (e) {
        console.error(e);
      }
    }
    if (localOauth) {
      try {
        setOauthClients(JSON.parse(localOauth));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const generateNewKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullKey = `hdpro_live_${randomHex}`;
    const updatedKeys = [
      ...apiKeys,
      {
        id: String(Date.now()),
        name: newKeyName,
        prefix: `${fullKey.substring(0, 15)}...`,
        created: new Date().toLocaleDateString('pt-BR'),
      },
    ];
    setApiKeys(updatedKeys);
    localStorage.setItem('settings_api_keys', JSON.stringify(updatedKeys));
    setGeneratedKey(fullKey);
    setNewKeyName('');
  };

  const deleteKey = (id: string) => {
    const updatedKeys = apiKeys.filter((k) => k.id !== id);
    setApiKeys(updatedKeys);
    localStorage.setItem('settings_api_keys', JSON.stringify(updatedKeys));
  };

  const handleAddOauthClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOauthName || !newOauthClientId) return;
    const updatedOauth = [
      ...oauthClients,
      {
        id: 'oa_' + Date.now(),
        name: newOauthName,
        clientId: newOauthClientId,
        provider: newOauthProvider,
        active: true,
      },
    ];
    setOauthClients(updatedOauth);
    localStorage.setItem('settings_oauth_clients', JSON.stringify(updatedOauth));
    setIsOauthModalOpen(false);
    setNewOauthName('');
    setNewOauthClientId('');
  };

  const deleteOauthClient = (id: string) => {
    if (!confirm('Deseja realmente remover este provedor OAuth?')) return;
    const updatedOauth = oauthClients.filter((cli) => cli.id !== id);
    setOauthClients(updatedOauth);
    localStorage.setItem('settings_oauth_clients', JSON.stringify(updatedOauth));
  };

  const toggleOauthClient = (id: string) => {
    const updatedOauth = oauthClients.map((cli) =>
      cli.id === id ? { ...cli, active: !cli.active } : cli
    );
    setOauthClients(updatedOauth);
    localStorage.setItem('settings_oauth_clients', JSON.stringify(updatedOauth));
  };

  return (
    <div className="p-8 space-y-6">
      <Link
        href="/settings"
        className="text-sm text-blue-400 hover:text-blue-300 mb-2 inline-block font-medium"
      >
        ← Voltar para Configurações
      </Link>
      <PageHeader
        title="Links Externos & Integrações"
        subtitle="Gerencie clientes de autenticação única (SSO) e chaves de API do HelpdeskPRO"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Keys Panel */}
        <Panel className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Chaves de Acesso da API</h2>
            <p className="text-xs text-slate-400">Tokens de portador (Bearer tokens) para autenticar scripts, Zabbix ou agentes de terceiros</p>
          </div>

          {generatedKey && (
            <div className="bg-emerald-950/20 border border-emerald-700/60 p-4 rounded-xl space-y-2">
              <p className="text-xs text-emerald-400 font-bold">Chave de API gerada com sucesso! Copie-a agora pois não será exibida novamente:</p>
              <div className="flex gap-2">
                <Input type="text" readOnly value={generatedKey} className="font-mono text-sm bg-black/40 text-emerald-300 border-emerald-800" />
                <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(generatedKey); alert('Copiado!'); }}>Copiar</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 text-sm">
                <div className="space-y-1">
                  <p className="font-bold text-white">{k.name}</p>
                  <p className="text-xs text-slate-400 font-mono">Prefixo: {k.prefix}</p>
                  <p className="text-[10px] text-slate-500">Gerado em: {k.created}</p>
                </div>
                <button onClick={() => deleteKey(k.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Excluir</button>
              </div>
            ))}
          </div>

          <form onSubmit={generateNewKey} className="border-t border-slate-700/50 pt-4 flex gap-3 items-end">
            <div className="flex-1">
              <Field label="Nome do novo Token" required>
                <Input
                  type="text"
                  placeholder="Ex: Monitoramento GLPI Integrador"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </Field>
            </div>
            <Button variant="primary" type="submit">Gerar Token</Button>
          </form>
        </Panel>

        {/* OAuth Clients Panel */}
        <Panel className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Clientes OAuth 2.0 (SSO)</h2>
            <p className="text-xs text-slate-400">Permita que usuários façam login com suas contas corporativas externas</p>
          </div>

          <div className="space-y-4">
            {oauthClients.map((cli) => (
              <div key={cli.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-white">{cli.name}</span>
                  <span className="bg-indigo-950/30 text-indigo-400 border border-indigo-800/30 px-2 py-0.5 rounded font-bold uppercase">{cli.provider}</span>
                </div>
                <div className="space-y-1 font-mono text-[10px] text-slate-400">
                  <p className="truncate">Client ID: {cli.clientId}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <button
                    onClick={() => toggleOauthClient(cli.id)}
                    className={`text-[10px] font-bold uppercase ${cli.active ? 'text-green-400 hover:text-green-300' : 'text-slate-500 hover:text-slate-400'}`}
                  >
                    Status: {cli.active ? 'Ativo' : 'Inativo'}
                  </button>
                  <button onClick={() => deleteOauthClient(cli.id)} className="text-red-400 hover:text-red-300 font-medium">Excluir</button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="secondary" fullWidth onClick={() => setIsOauthModalOpen(true)}>
            + Adicionar Provedor OAuth
          </Button>
        </Panel>
      </div>

      {/* OAuth Addition Modal */}
      <Modal
        open={isOauthModalOpen}
        onClose={() => setIsOauthModalOpen(false)}
        title="Adicionar Provedor OAuth 2.0 / SSO"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsOauthModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleAddOauthClient} disabled={!newOauthName || !newOauthClientId}>Salvar Provedor</Button>
          </div>
        }
      >
        <form onSubmit={handleAddOauthClient} className="space-y-4">
          <Field label="Nome da Integração" required>
            <Input
              type="text"
              placeholder="Ex: Keycloak Corporativo, GitHub SSO"
              value={newOauthName}
              onChange={(e) => setNewOauthName(e.target.value)}
            />
          </Field>
          <Field label="Provedor" required>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
              value={newOauthProvider}
              onChange={(e) => setNewOauthProvider(e.target.value)}
            >
              <option value="Google">Google Workspace</option>
              <option value="Microsoft">Microsoft Entra ID</option>
              <option value="Keycloak">Keycloak</option>
              <option value="GitHub">GitHub</option>
              <option value="LDAP">LDAP / Active Directory</option>
            </select>
          </Field>
          <Field label="Client ID" required>
            <Input
              type="text"
              placeholder="Ex: 8831093-client.oauth.company.com"
              value={newOauthClientId}
              onChange={(e) => setNewOauthClientId(e.target.value)}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
