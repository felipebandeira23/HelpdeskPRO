'use client';
import { useState } from 'react';
import { PageHeader, Panel, StatCard } from '@/components/ui';

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(1);

  const customers = [
    { id: 1, name: 'TechCorp Industries', email: 'contato@techcorp.com', contractStatus: 'Ativo', sla: '98%', tickets: 45, hoursUsed: 35, hoursTotal: 40 },
    { id: 2, name: 'Global Inc', email: 'suporte@globalinc.net', contractStatus: 'Ativo', sla: '92%', tickets: 112, hoursUsed: 45, hoursTotal: 40 },
    { id: 3, name: 'Local Shop', email: 'gerencia@localshop.com', contractStatus: 'Inadimplente', sla: '85%', tickets: 12, hoursUsed: 5, hoursTotal: 0 },
    { id: 4, name: 'Studio Design', email: 'art@studiodesign.co', contractStatus: 'S/ Contrato', sla: '100%', tickets: 3, hoursUsed: 2, hoursTotal: 0 },
  ];

  const c = customers.find(x => x.id === selectedCustomer);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Clientes e Organizações" subtitle="CRM e Perfil 360º de contas" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors">
          + Novo Cliente
        </button>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Lista de Clientes */}
        <div className="w-1/3 flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/50">
            <input type="text" placeholder="Buscar cliente..." className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white outline-none focus:border-blue-500" />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50">
            {customers.map(cust => (
              <div 
                key={cust.id} 
                onClick={() => setSelectedCustomer(cust.id)}
                className={`p-4 cursor-pointer transition-colors ${selectedCustomer === cust.id ? 'bg-blue-900/20 border-l-4 border-blue-500' : 'hover:bg-slate-800/50 border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold ${selectedCustomer === cust.id ? 'text-blue-400' : 'text-white'}`}>{cust.name}</h3>
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${cust.contractStatus === 'Ativo' ? 'bg-green-900/30 text-green-400' : cust.contractStatus === 'Inadimplente' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                    {cust.contractStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{cust.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Perfil 360 */}
        <div className="flex-1 overflow-y-auto">
          {c ? (
            <div className="space-y-6">
              <Panel className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl text-white font-bold shadow-lg shadow-blue-500/20">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{c.name}</h2>
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span>📧 {c.email}</span>
                      <span>📱 (11) 9999-9999</span>
                      <span>🏢 CNPJ: 00.000.000/0001-00</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">SLA Global</div>
                    <div className={`text-2xl font-bold ${parseInt(c.sla) >= 95 ? 'text-green-400' : parseInt(c.sla) >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>{c.sla}</div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Tickets (Total)</div>
                    <div className="text-2xl font-bold text-white">{c.tickets}</div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Ativos Monitorados</div>
                    <div className="text-2xl font-bold text-white">14</div>
                  </div>
                </div>
              </Panel>

              <div className="grid grid-cols-2 gap-6">
                <Panel>
                  <h3 className="text-lg font-bold text-white mb-4">Consumo de Franquia</h3>
                  {c.hoursTotal > 0 ? (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Horas consumidas este mês</span>
                        <span className="text-white font-bold">{c.hoursUsed}h / {c.hoursTotal}h</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-4 mb-2 overflow-hidden">
                        <div className={`h-4 ${c.hoursUsed > c.hoursTotal ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min((c.hoursUsed / c.hoursTotal) * 100, 100)}%` }}></div>
                      </div>
                      {c.hoursUsed > c.hoursTotal && (
                        <p className="text-xs text-red-400 mt-2">⚠️ Excedente de {c.hoursUsed - c.hoursTotal} horas será faturado à parte.</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-400">Cliente sem franquia de horas (Faturamento Avulso)</p>
                      <p className="text-2xl font-bold text-white mt-2">{c.hoursUsed}h registradas</p>
                    </div>
                  )}
                </Panel>

                <Panel>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Últimos Tickets</h3>
                    <button className="text-xs text-blue-400 hover:text-blue-300">Ver Todos</button>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-800 p-3 rounded flex justify-between items-center cursor-pointer hover:bg-slate-700">
                      <div>
                        <p className="text-sm text-white font-medium">Servidor fora do ar</p>
                        <p className="text-xs text-slate-400">Há 2 horas • Fechado</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">Resolvido</span>
                    </div>
                    <div className="bg-slate-800 p-3 rounded flex justify-between items-center cursor-pointer hover:bg-slate-700">
                      <div>
                        <p className="text-sm text-white font-medium">Lentidão no Wi-Fi</p>
                        <p className="text-xs text-slate-400">Há 1 dia • Em atendimento</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded">Aberto</span>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-900 border border-slate-700 rounded-xl">
              <p className="text-slate-500">Selecione um cliente para visualizar o perfil completo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
