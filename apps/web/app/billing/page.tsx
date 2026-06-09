'use client';

import { useEffect, useState } from 'react';
import { PageHeader, Panel, StatCard, Button, Field, Input, Modal } from '@/components/ui';

interface Contract {
  id: string;
  client: string;
  plan: string;
  hours: number;
  usedHours: number;
  value: number; // numeric value (e.g. 4500)
  status: string; // 'Ativo' | 'Excedido' | 'Inadimplente' | 'Suspenso'
}

interface ServiceCatalog {
  id: string;
  code: string;
  name: string;
  type: string; // 'Por Hora Fracionada' | 'Valor Fixo (Avulso)'
  value: number; // e.g. 150
}

interface Invoice {
  id: string;
  client: string;
  plan: string;
  baseValue: number;
  overageHours: number;
  overageValue: number;
  totalValue: number;
  billingPeriod: string;
  status: 'Pendente' | 'Pago';
}

const DEFAULT_CONTRACTS: Contract[] = [
  { id: '1', client: 'TechCorp', plan: 'Premium SLA 4h', hours: 40, usedHours: 35, value: 4500, status: 'Ativo' },
  { id: '2', client: 'Global Inc', plan: 'Basic SLA 8h', hours: 20, usedHours: 22, value: 2000, status: 'Excedido' },
  { id: '3', client: 'Local Shop', plan: 'Avulso', hours: 0, usedHours: 5, value: 0, status: 'Inadimplente' },
];

const DEFAULT_SERVICES: ServiceCatalog[] = [
  { id: 's1', code: 'SV-001', name: 'Hora Técnica (Nível 1 e 2)', type: 'Por Hora Fracionada', value: 150 },
  { id: 's2', code: 'SV-002', name: 'Hora Técnica (Especialista/Nível 3)', type: 'Por Hora Fracionada', value: 250 },
  { id: 's3', code: 'SV-003', name: 'Visita Técnica Presencial (Deslocamento)', type: 'Valor Fixo (Avulso)', value: 100 },
  { id: 's4', code: 'SV-004', name: 'Formatação de Máquina / Reinstalação de SO', type: 'Valor Fixo (Avulso)', value: 350 },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contracts' | 'services' | 'invoices'>('dashboard');

  const [contracts, setContracts] = useState<Contract[]>(DEFAULT_CONTRACTS);
  const [services, setServices] = useState<ServiceCatalog[]>(DEFAULT_SERVICES);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Contract Modal States
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [cClient, setCClient] = useState('');
  const [cPlan, setCPlan] = useState('');
  const [cHours, setCHours] = useState('0');
  const [cUsedHours, setCUsedHours] = useState('0');
  const [cValue, setCValue] = useState('0');
  const [cStatus, setCStatus] = useState('Ativo');

  // Service Modal States
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [sCode, setSCode] = useState('');
  const [sName, setSName] = useState('');
  const [sType, setSType] = useState('Por Hora Fracionada');
  const [sValue, setSValue] = useState('0');

  // Load state
  useEffect(() => {
    const localContracts = localStorage.getItem('billing_contracts');
    const localServices = localStorage.getItem('billing_services');
    const localInvoices = localStorage.getItem('billing_invoices');
    if (localContracts) {
      try {
        setContracts(JSON.parse(localContracts));
      } catch (e) {
        console.error(e);
      }
    }
    if (localServices) {
      try {
        setServices(JSON.parse(localServices));
      } catch (e) {
        console.error(e);
      }
    }
    if (localInvoices) {
      try {
        setInvoices(JSON.parse(localInvoices));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Stats Calculations
  const plannedValue = contracts.reduce((acc, c) => acc + (c.status !== 'Suspenso' ? c.value : 0), 0);
  const overageHours = contracts.reduce((acc, c) => {
    if (c.hours > 0 && c.usedHours > c.hours) {
      return acc + (c.usedHours - c.hours);
    }
    return acc;
  }, 0);
  const estimatedOverageValue = overageHours * 150;
  const totalBilledThisMonth = invoices.reduce((acc, inv) => acc + inv.totalValue, 0);
  const defaultTotalBilled = plannedValue + estimatedOverageValue;

  const handleOpenContractAdd = () => {
    setEditingContractId(null);
    setCClient('');
    setCPlan('Mensal SLA Básico');
    setCHours('20');
    setCUsedHours('0');
    setCValue('1500');
    setCStatus('Ativo');
    setIsContractModalOpen(true);
  };

  const handleOpenContractEdit = (c: Contract) => {
    setEditingContractId(c.id);
    setCClient(c.client);
    setCPlan(c.plan);
    setCHours(String(c.hours));
    setCUsedHours(String(c.usedHours));
    setCValue(String(c.value));
    setCStatus(c.status);
    setIsContractModalOpen(true);
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cClient || !cPlan) return;

    const numHours = parseFloat(cHours) || 0;
    const numUsed = parseFloat(cUsedHours) || 0;
    const numValue = parseFloat(cValue) || 0;

    let finalStatus = cStatus;
    if (numHours > 0 && numUsed > numHours) {
      finalStatus = 'Excedido';
    }

    let updated: Contract[];
    if (editingContractId) {
      updated = contracts.map(c =>
        c.id === editingContractId
          ? { ...c, client: cClient, plan: cPlan, hours: numHours, usedHours: numUsed, value: numValue, status: finalStatus }
          : c
      );
    } else {
      updated = [
        ...contracts,
        {
          id: 'contract_' + Date.now(),
          client: cClient,
          plan: cPlan,
          hours: numHours,
          usedHours: numUsed,
          value: numValue,
          status: finalStatus
        }
      ];
    }

    setContracts(updated);
    localStorage.setItem('billing_contracts', JSON.stringify(updated));
    setIsContractModalOpen(false);
  };

  const handleDeleteContract = (id: string) => {
    if (!confirm('Deseja realmente remover este contrato?')) return;
    const updated = contracts.filter(c => c.id !== id);
    setContracts(updated);
    localStorage.setItem('billing_contracts', JSON.stringify(updated));
  };

  const handleOpenServiceAdd = () => {
    setEditingServiceId(null);
    setSCode(`SV-00${services.length + 1}`);
    setSName('');
    setSType('Por Hora Fracionada');
    setSValue('150');
    setIsServiceModalOpen(true);
  };

  const handleOpenServiceEdit = (s: ServiceCatalog) => {
    setEditingServiceId(s.id);
    setSCode(s.code);
    setSName(s.name);
    setSType(s.type);
    setSValue(String(s.value));
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sCode || !sName) return;

    let updated: ServiceCatalog[];
    if (editingServiceId) {
      updated = services.map(s =>
        s.id === editingServiceId ? { ...s, code: sCode, name: sName, type: sType, value: parseFloat(sValue) || 0 } : s
      );
    } else {
      updated = [
        ...services,
        {
          id: 'service_' + Date.now(),
          code: sCode,
          name: sName,
          type: sType,
          value: parseFloat(sValue) || 0
        }
      ];
    }

    setServices(updated);
    localStorage.setItem('billing_services', JSON.stringify(updated));
    setIsServiceModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    if (!confirm('Deseja excluir este serviço do catálogo?')) return;
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    localStorage.setItem('billing_services', JSON.stringify(updated));
  };

  const handleGenerateInvoices = () => {
    const today = new Date();
    const periodStr = `${today.getMonth() + 1}/${today.getFullYear()}`;

    const newInvoices: Invoice[] = contracts.map(c => {
      const overHrs = c.hours > 0 && c.usedHours > c.hours ? (c.usedHours - c.hours) : 0;
      const overVal = overHrs * 150; // R$150 fixed rate per excess hour
      return {
        id: 'inv_' + c.id + '_' + Date.now().toString().slice(-4),
        client: c.client,
        plan: c.plan,
        baseValue: c.value,
        overageHours: overHrs,
        overageValue: overVal,
        totalValue: c.value + overVal,
        billingPeriod: periodStr,
        status: 'Pendente'
      };
    });

    setInvoices(newInvoices);
    localStorage.setItem('billing_invoices', JSON.stringify(newInvoices));
    setActiveTab('invoices');
    alert(`Fechamento concluído! Foram geradas ${newInvoices.length} faturas para o período ${periodStr}.`);
  };

  const handlePayInvoice = (id: string) => {
    const updated = invoices.map(inv => inv.id === id ? { ...inv, status: 'Pago' as const } : inv);
    setInvoices(updated);
    localStorage.setItem('billing_invoices', JSON.stringify(updated));
  };

  const handleClearInvoices = () => {
    if (!confirm('Limpar histórico de faturamento atual?')) return;
    setInvoices([]);
    localStorage.removeItem('billing_invoices');
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader title="Faturamento e Contratos" subtitle="Gestão financeira, faturamento de horas e contratos SLA" />
        <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
          <Button
            variant={activeTab === 'dashboard' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </Button>
          <Button
            variant={activeTab === 'contracts' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('contracts')}
          >
            📄 Contratos
          </Button>
          <Button
            variant={activeTab === 'services' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('services')}
          >
            🛠️ Serviços
          </Button>
          <Button
            variant={activeTab === 'invoices' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('invoices')}
          >
            🧾 Faturas ({invoices.length})
          </Button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Faturamento Previsto" value={`R$ ${plannedValue.toLocaleString('pt-BR')},00`} icon="💰" accent="bg-green-600" />
            <StatCard title="Fechamento do Mês" value={`R$ ${(totalBilledThisMonth || defaultTotalBilled).toLocaleString('pt-BR')},00`} icon="🧾" accent="bg-blue-600" />
            <StatCard title="Faturado (Pago)" value={`R$ ${invoices.filter(i => i.status === 'Pago').reduce((a,b)=>a+b.totalValue, 0).toLocaleString('pt-BR')},00`} icon="✅" accent="bg-emerald-600" />
            <StatCard title="Horas Excedentes" value={`${overageHours}h`} icon="⏱️" accent="bg-amber-500" />
          </div>

          <Panel>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Próximos Fechamentos de SLA</h2>
                <p className="text-xs text-slate-400 mt-1">Gere faturamento automaticamente cruzando consumo mensal de chamados vs franquia de horas</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleGenerateInvoices}>
                Gerar Faturas do Mês
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Contrato / SLA</th>
                    <th className="pb-3 font-semibold">Consumo Atual</th>
                    <th className="pb-3 font-semibold">Excedente Estimado</th>
                    <th className="pb-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {contracts.map(c => {
                    const pct = c.hours > 0 ? Math.min(100, (c.usedHours / c.hours) * 100) : 100;
                    const isOver = c.hours > 0 && c.usedHours > c.hours;
                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 text-white font-medium">{c.client}</td>
                        <td className="py-4 text-slate-300">{c.plan}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                              <div
                                className={`h-full ${isOver ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-400">{c.usedHours} / {c.hours > 0 ? `${c.hours}h` : 'Franquia ilimitada'}</span>
                          </div>
                        </td>
                        <td className="py-4 font-semibold text-amber-400">
                          {isOver ? `R$ ${(c.usedHours - c.hours) * 150},00` : '-'}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleOpenContractEdit(c)}
                            className="text-xs text-blue-400 hover:text-blue-300 font-bold"
                          >
                            Rever Consumo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'contracts' && (
        <Panel>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Gestão de Contratos de TI</h2>
              <p className="text-xs text-slate-400 mt-1">Configure o valor mensal e franquias de horas de suporte para cada cliente</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleOpenContractAdd}>
              + Novo Contrato
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Plano / SLA</th>
                  <th className="pb-3 font-semibold">Valor Mensal</th>
                  <th className="pb-3 font-semibold">Franquia (horas)</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {contracts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 text-white font-medium">{c.client}</td>
                    <td className="py-4 text-slate-300">{c.plan}</td>
                    <td className="py-4 text-slate-300 font-semibold">R$ {c.value.toLocaleString('pt-BR')},00</td>
                    <td className="py-4 text-slate-400">{c.hours > 0 ? `${c.hours} horas` : 'Ilimitado / Avulso'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        c.status === 'Ativo'
                          ? 'bg-green-950/20 text-green-400 border-green-800/30'
                          : c.status === 'Excedido'
                          ? 'bg-amber-950/20 text-amber-400 border-amber-800/30'
                          : 'bg-red-950/20 text-red-400 border-red-800/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-3">
                      <button onClick={() => handleOpenContractEdit(c)} className="text-blue-400 hover:text-blue-300 text-xs font-bold">Editar</button>
                      <button onClick={() => handleDeleteContract(c.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {activeTab === 'services' && (
        <Panel>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white font-medium">Catálogo de Serviços e Valores</h2>
              <p className="text-xs text-slate-400 mt-1">Defina valores padrão para horas extras ou manutenções adicionais faturadas avulsas</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleOpenServiceAdd}>
              + Novo Serviço
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider text-xs">
                  <th className="pb-3 font-semibold px-2">Código</th>
                  <th className="pb-3 font-semibold px-2">Nome do Serviço</th>
                  <th className="pb-3 font-semibold px-2">Tipo de Cobrança</th>
                  <th className="pb-3 font-semibold px-2">Valor Unitário</th>
                  <th className="pb-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {services.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-2 font-mono text-xs text-slate-300">{s.code}</td>
                    <td className="py-4 px-2 font-semibold text-white">{s.name}</td>
                    <td className="py-4 px-2">
                      <span className="bg-slate-800 border border-slate-750 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                        {s.type}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-green-400 font-bold">R$ {s.value.toLocaleString('pt-BR')},00</td>
                    <td className="py-4 text-right space-x-3">
                      <button onClick={() => handleOpenServiceEdit(s)} className="text-blue-400 hover:text-blue-300 text-xs font-bold">Editar</button>
                      <button onClick={() => handleDeleteService(s.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {activeTab === 'invoices' && (
        <Panel>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Faturas Emitidas no Fechamento</h2>
              <p className="text-xs text-slate-400 mt-1">Histórico de faturas geradas no último fechamento de SLA</p>
            </div>
            {invoices.length > 0 && (
              <Button variant="danger" size="sm" onClick={handleClearInvoices}>
                Limpar Faturas
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-2">🧾</span>
                <p className="text-slate-400">Nenhuma fatura gerada. Vá na aba Dashboard e clique em <b>&quot;Gerar Faturas do Mês&quot;</b>.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="pb-3 font-semibold">Fatura ID</th>
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Valor Base</th>
                    <th className="pb-3 font-semibold">Consumo SLA Extra</th>
                    <th className="pb-3 font-semibold">Valor Total</th>
                    <th className="pb-3 font-semibold">Vencimento</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 font-mono text-xs text-slate-400">{inv.id}</td>
                      <td className="py-4">
                        <div className="font-bold text-white">{inv.client}</div>
                        <div className="text-[10px] text-slate-400">{inv.plan}</div>
                      </td>
                      <td className="py-4 text-slate-300">R$ {inv.baseValue.toLocaleString('pt-BR')},00</td>
                      <td className="py-4 text-amber-400 font-mono text-xs">
                        {inv.overageHours > 0 ? `+${inv.overageHours}h (R$ ${inv.overageValue.toLocaleString('pt-BR')},00)` : 'Sem adicionais'}
                      </td>
                      <td className="py-4 font-bold text-green-400">R$ {inv.totalValue.toLocaleString('pt-BR')},00</td>
                      <td className="py-4 font-mono text-xs text-slate-400">{inv.billingPeriod}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          inv.status === 'Pago'
                            ? 'bg-green-950/20 text-green-400 border-green-800/30'
                            : 'bg-amber-950/20 text-amber-400 border-amber-800/30'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {inv.status === 'Pendente' && (
                          <button
                            onClick={() => handlePayInvoice(inv.id)}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded transition-colors font-bold"
                          >
                            Dar Baixa (Pago)
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Panel>
      )}

      {/* Contract Modal */}
      <Modal
        open={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        title={editingContractId ? 'Editar Contrato de TI' : 'Cadastrar Novo Contrato'}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsContractModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveContract} disabled={!cClient || !cPlan}>Salvar Contrato</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveContract} className="space-y-4">
          <Field label="Nome do Cliente" required>
            <Input type="text" placeholder="Ex: TechCorp Ltda" value={cClient} onChange={(e) => setCClient(e.target.value)} />
          </Field>
          <Field label="Nome do Plano / Nível de SLA" required>
            <Input type="text" placeholder="Ex: Premium SLA 4h" value={cPlan} onChange={(e) => setCPlan(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor Fixo Mensal (R$)">
              <Input type="number" placeholder="4500" value={cValue} onChange={(e) => setCValue(e.target.value)} />
            </Field>
            <Field label="Status do Contrato">
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                value={cStatus}
                onChange={(e) => setCStatus(e.target.value)}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inadimplente">Inadimplente</option>
                <option value="Suspenso">Suspenso</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Franquia de Horas SLA">
              <Input type="number" placeholder="40" value={cHours} onChange={(e) => setCHours(e.target.value)} />
            </Field>
            <Field label="Horas Usadas no Mês Atual">
              <Input type="number" placeholder="35" value={cUsedHours} onChange={(e) => setCUsedHours(e.target.value)} />
            </Field>
          </div>
        </form>
      </Modal>

      {/* Service Modal */}
      <Modal
        open={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title={editingServiceId ? 'Editar Item do Catálogo' : 'Cadastrar Novo Serviço'}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsServiceModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveService} disabled={!sCode || !sName}>Salvar Serviço</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveService} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Field label="Código" required>
                <Input type="text" placeholder="SV-001" value={sCode} onChange={(e) => setSCode(e.target.value)} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Nome do Serviço" required>
                <Input type="text" placeholder="Ex: Backup em Nuvem" value={sName} onChange={(e) => setSName(e.target.value)} />
              </Field>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de Cobrança">
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
                value={sType}
                onChange={(e) => setSType(e.target.value)}
              >
                <option value="Por Hora Fracionada">Por Hora Fracionada</option>
                <option value="Valor Fixo (Avulso)">Valor Fixo (Avulso)</option>
              </select>
            </Field>
            <Field label="Valor Unitário / Base (R$)">
              <Input type="number" placeholder="150" value={sValue} onChange={(e) => setSValue(e.target.value)} />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
