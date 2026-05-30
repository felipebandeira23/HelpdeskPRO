'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Panel, Spinner, EmptyState } from '@/components/ui';

interface Customer {
  id: string;
  name: string;
  email?: string;
  contractStatus?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Customer[]>('/api/customers').then((d) => {
      setCustomers(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8">
      <PageHeader title="Clientes" subtitle="Base de clientes" />
      {loading ? (
        <Spinner />
      ) : customers.length === 0 ? (
        <Panel>
          <EmptyState icon="👥" title="Nenhum cliente cadastrado" />
        </Panel>
      ) : (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2">Nome</th>
                  <th className="text-left py-2 px-2">Email</th>
                  <th className="text-left py-2 px-2">Contrato</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-800">
                    <td className="py-2 px-2 text-white">{c.name}</td>
                    <td className="py-2 px-2 text-slate-400">{c.email || '—'}</td>
                    <td className="py-2 px-2 text-slate-400">{c.contractStatus || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
