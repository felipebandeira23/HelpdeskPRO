'use client';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
export default function PortalPage() {
  return (
    <div className="p-8">
      <PageHeader title="Portal do Cliente" subtitle="Gerenciamento de acesso externo" />
      <Panel>
        <EmptyState icon="🔓" title="Portal desativado" />
      </Panel>
    </div>
  );
}
