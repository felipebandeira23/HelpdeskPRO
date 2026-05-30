'use client';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
export default function ReportsPage() {
  return (
    <div className="p-8">
      <PageHeader title="Relatórios" subtitle="Analytics e estatísticas" />
      <Panel>
        <EmptyState icon="📊" title="Nenhum relatório" />
      </Panel>
    </div>
  );
}
