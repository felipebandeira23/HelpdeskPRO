'use client';
import { PageHeader, Panel, Button, Input } from '@/components/ui';

export default function SecuritySettingsPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Segurança e Autenticação" subtitle="Configurações de acesso, 2FA e integração com Active Directory" />
        <Button variant="primary">Salvar Alterações</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="text-2xl">🔐</span> Políticas de Acesso</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
              <div>
                <h3 className="font-bold text-white">Autenticação em Duas Etapas (2FA)</h3>
                <p className="text-sm text-slate-400">Obrigar todos os operadores a utilizarem 2FA</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
              <div>
                <h3 className="font-bold text-white">Bloqueio por Inatividade</h3>
                <p className="text-sm text-slate-400">Deslogar automaticamente após</p>
              </div>
              <select className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2">
                <option>15 minutos</option>
                <option>30 minutos</option>
                <option>1 hora</option>
                <option>Nunca</option>
              </select>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><span className="text-2xl">🏢</span> Active Directory / LDAP</h2>
            <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded font-bold border border-green-700/30">Conectado</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700 mb-4">
              <div>
                <h3 className="font-bold text-white">Ativar Sincronização LDAP</h3>
                <p className="text-sm text-slate-400">Permitir login com contas do domínio</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Servidor LDAP</label>
              <Input type="text" defaultValue="ldap://192.168.0.10:389" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Base DN</label>
              <Input type="text" defaultValue="dc=techcorp,dc=local" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Usuário Bind</label>
                <Input type="text" defaultValue="cn=admin,dc=techcorp,dc=local" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Senha Bind</label>
                <Input type="password" defaultValue="••••••••" />
              </div>
            </div>
            <Button variant="secondary" fullWidth>Testar Conexão</Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
