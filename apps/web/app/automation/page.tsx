'use client';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
export default function AutomationPage() {
  return (
    <div className="p-8">
      <PageHeader title="Automação" subtitle="Regras e fluxos automáticos" />
      <Panel>
        <EmptyState icon="⚙️" title="Nenhuma automação" />
      </Panel>
    </div>
  );
}
