'use client';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
export default function BillingPage() {
  return (
    <div className="p-8">
      <PageHeader title="Faturamento" subtitle="Gestão de receitas" />
      <Panel>
        <EmptyState icon="💳" title="Sem cobranças" />
      </Panel>
    </div>
  );
}
