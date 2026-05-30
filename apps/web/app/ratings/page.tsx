'use client';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
export default function RatingsPage() {
  return (
    <div className="p-8">
      <PageHeader title="Avaliações de Satisfação" subtitle="Feedback dos clientes" />
      <Panel>
        <EmptyState icon="⭐" title="Nenhuma avaliação" />
      </Panel>
    </div>
  );
}
