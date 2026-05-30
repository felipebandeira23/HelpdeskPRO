'use client';
import { useState } from 'react';
import { PageHeader, Panel, StatCard, Button } from '@/components/ui';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contracts' | 'services'>('dashboard');

  const contracts = [
    { id: 1, client: 'TechCorp', plan: 'Premium SLA 4h', hours: 40, usedHours: 35, value: 'R$ 4.500', status: 'Ativo' },
    { id: 2, client: 'Global Inc', plan: 'Basic SLA 8h', hours: 20, usedHours: 22, value: 'R$ 2.000', status: 'Excedido' },
    { id: 3, client: 'Local Shop', plan: 'Avulso', hours: 0, usedHours: 5, value: 'Variável', status: 'Inadimplente' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Faturamento e Contratos" subtitle="Gestão financeira, faturamento de horas e contratos SLA" />
        <div className="flex gap-1">
          <Button
            variant={activeTab === 'dashboard' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === 'contracts' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('contracts')}
          >
            Contratos
          </Button>
          <Button
            variant={activeTab === 'services' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('services')}
          >
            Catálogo de Serviços
          </Button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Faturamento Previsto" value="R$ 42.500" icon="💰" accent="bg-green-600" />
            <StatCard title="Faturado no Mês" value="R$ 15.200" icon="🧾" accent="bg-blue-600" />
            <StatCard title="Inadimplência" value="R$ 3.400" icon="⚠️" accent="bg-red-600" />
            <StatCard title="Horas Excedentes" value="42h" icon="⏱️" accent="bg-amber-500" />
          </div>

          <Panel>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Próximos Fechamentos</h2>
              <Button variant="primary" size="sm">Gerar Faturas do Mês</Button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Contrato</th>
                  <th className="pb-3 font-medium">Consumo</th>
                  <th className="pb-3 font-medium">Excedente Estimado</th>
                  <th className="pb-3 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {contracts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 text-white font-medium">{c.client}</td>
                    <td className="py-4 text-slate-300">{c.plan}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${c.usedHours > c.hours && c.hours > 0 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: c.hours > 0 ? `${Math.min(100, (c.usedHours / c.hours) * 100)}%` : '100%' }}></div>
                        </div>
                        <span className="text-xs text-slate-400">{c.usedHours}/{c.hours > 0 ? c.hours : '∞'}h</span>
                      </div>
                    </td>
                    <td className="py-4 text-amber-400">{c.usedHours > c.hours && c.hours > 0 ? `R$ ${(c.usedHours - c.hours) * 150},00` : '-'}</td>
                    <td className="py-4"><Button variant="ghost" size="sm">Conferir</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      {activeTab === 'contracts' && (
        <Panel>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Gestão de Contratos</h2>
            <Button variant="primary" size="sm">+ Novo Contrato</Button>
          </div>
          <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Plano / SLA</th>
                  <th className="pb-3 font-medium">Valor Fixo</th>
                  <th className="pb-3 font-medium">Franquia (h)</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {contracts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 text-white font-medium">{c.client}</td>
                    <td className="py-4 text-slate-300">{c.plan}</td>
                    <td className="py-4 text-slate-300">{c.value}</td>
                    <td className="py-4 text-slate-300">{c.hours > 0 ? c.hours : 'Sem franquia'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'Ativo' ? 'bg-green-900/30 text-green-400 border border-green-700/30' : c.status === 'Inadimplente' ? 'bg-red-900/30 text-red-400 border border-red-700/30' : 'bg-amber-900/30 text-amber-400 border border-amber-700/30'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 flex gap-2">
                      <span className="text-slate-400 hover:text-white cursor-pointer">✏️</span>
                      <span className="text-slate-400 hover:text-red-400 cursor-pointer">🛑</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </Panel>
      )}

      {activeTab === 'services' && (
        <Panel>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Catálogo de Serviços e Valores</h2>
              <p className="text-sm text-slate-400">Defina os valores de hora técnica e serviços avulsos que serão faturados nos apontamentos de tickets.</p>
            </div>
            <Button variant="primary">+ Novo Serviço</Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-bold px-2">Código</th>
                  <th className="pb-3 font-bold px-2">Nome do Serviço</th>
                  <th className="pb-3 font-bold px-2">Tipo de Cobrança</th>
                  <th className="pb-3 font-bold px-2">Valor Base</th>
                  <th className="pb-3 font-bold px-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-2 text-sm text-slate-300 font-mono">SV-001</td>
                  <td className="py-4 px-2 text-white font-medium">Hora Técnica (Nível 1 e 2)</td>
                  <td className="py-4 px-2">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Por Hora Fracionada</span>
                  </td>
                  <td className="py-4 px-2 text-green-400 font-bold">R$ 150,00 /h</td>
                  <td className="py-4 px-2 text-right">
                    <Button variant="ghost" size="sm">Editar</Button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-2 text-sm text-slate-300 font-mono">SV-002</td>
                  <td className="py-4 px-2 text-white font-medium">Hora Técnica (Especialista/Nível 3)</td>
                  <td className="py-4 px-2">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">Por Hora Fracionada</span>
                  </td>
                  <td className="py-4 px-2 text-green-400 font-bold">R$ 250,00 /h</td>
                  <td className="py-4 px-2 text-right">
                    <Button variant="ghost" size="sm">Editar</Button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-2 text-sm text-slate-300 font-mono">SV-003</td>
                  <td className="py-4 px-2 text-white font-medium">Visita Técnica Presencial (Deslocamento)</td>
                  <td className="py-4 px-2">
                    <span className="bg-blue-900/30 text-blue-400 border border-blue-700/30 px-2 py-1 rounded text-xs">Valor Fixo (Avulso)</span>
                  </td>
                  <td className="py-4 px-2 text-green-400 font-bold">R$ 100,00</td>
                  <td className="py-4 px-2 text-right">
                    <Button variant="ghost" size="sm">Editar</Button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-2 text-sm text-slate-300 font-mono">SV-004</td>
                  <td className="py-4 px-2 text-white font-medium">Formatação de Máquina / Reinstalação de SO</td>
                  <td className="py-4 px-2">
                    <span className="bg-blue-900/30 text-blue-400 border border-blue-700/30 px-2 py-1 rounded text-xs">Valor Fixo (Avulso)</span>
                  </td>
                  <td className="py-4 px-2 text-green-400 font-bold">R$ 350,00</td>
                  <td className="py-4 px-2 text-right">
                    <Button variant="ghost" size="sm">Editar</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
