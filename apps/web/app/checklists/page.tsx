'use client';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
export default function ChecklistsPage() {
  return (
    <div className="p-8">
      <PageHeader title="Checklists" subtitle="Roteiros e templates" />
      <Panel>
        <EmptyState icon="📋" title="Nenhum checklist" />
      </Panel>
    </div>
  );
}
