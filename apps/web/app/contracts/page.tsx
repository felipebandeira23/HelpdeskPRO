'use client';

import { PageHeader, Panel } from '@/components/ui';

export default function ContractsPage() {
  const today = new Date('2026-06-09');

  const rawContracts = [
    { id: '1', supplier: 'Dell Computadores', type: 'Garantia NBD (ProSupport)', assetsCovered: 45, expireAt: '2028-05-10', cost: 'Incluso no Hardware' },
    { id: '2', supplier: 'Claro Empresa', type: 'Link Dedicado 1Gbps', assetsCovered: 2, expireAt: '2026-10-15', cost: 'R$ 2.500/mês' },
    { id: '3', supplier: 'Mundo do Ar Condicionado', type: 'Manutenção Preventiva Semestral', assetsCovered: 15, expireAt: '2026-06-25', cost: 'R$ 1.200/semestre' },
    { id: '4', supplier: 'Localiza Tech', type: 'Leasing de Notebooks', assetsCovered: 120, expireAt: '2025-12-31', cost: 'R$ 15.000/mês' },
  ];

  const getContractStatus = (expireStr: string) => {
    const expireDate = new Date(expireStr);
    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'EXPIRADO';
    if (diffDays <= 30) return 'VENCE EM BREVE';
    return 'ATIVO';
  };

  const contracts = rawContracts.map(c => ({
    ...c,
    status: getContractStatus(c.expireAt)
  }));

  const activeCount = contracts.filter(c => c.status !== 'EXPIRADO').length;
  const expiringCount = contracts.filter(c => c.status === 'VENCE EM BREVE').length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Contratos e Fornecedores" subtitle="Gestão de garantias, SLAs de terceiros e controle de vencimentos" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-lg shadow-blue-900/20">
          + Novo Contrato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Contratos Ativos</h3>
          <p className="text-3xl font-bold text-white">{activeCount}</p>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-xl border border-amber-700/50 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <h3 className="text-amber-400/80 text-sm font-medium uppercase tracking-wider mb-2">Vencendo nos próximos 30 dias</h3>
          <p className="text-3xl font-bold text-amber-400">{expiringCount}</p>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Custo Mensal (Terceiros)</h3>
          <p className="text-3xl font-bold text-white">R$ 18.450</p>
        </div>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider bg-slate-800/30">
                <th className="py-3 px-4 font-bold rounded-tl-lg">Fornecedor</th>
                <th className="py-3 px-4 font-bold">Tipo de Contrato / Objeto</th>
                <th className="py-3 px-4 font-bold text-center">Ativos Vinculados</th>
                <th className="py-3 px-4 font-bold">Custo</th>
                <th className="py-3 px-4 font-bold">Vencimento</th>
                <th className="py-3 px-4 font-bold rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {contracts.map(contract => (
                <tr key={contract.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-4 text-white font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs border border-slate-600">
                      {contract.supplier.substring(0, 1)}
                    </div>
                    {contract.supplier}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-300">{contract.type}</td>
                  <td className="py-4 px-4 text-sm text-center">
                    <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs border border-slate-700 font-mono">
                      {contract.assetsCovered}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-300">{contract.cost}</td>
                  <td className="py-4 px-4 text-sm text-slate-400">
                    {new Date(contract.expireAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      contract.status === 'ATIVO' ? 'bg-green-900/30 text-green-400 border border-green-700/30' : 
                      contract.status === 'VENCE EM BREVE' ? 'bg-amber-900/30 text-amber-400 border border-amber-700/30' : 
                      'bg-red-900/30 text-red-400 border border-red-700/30'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
