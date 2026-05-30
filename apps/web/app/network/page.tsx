'use client';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
export default function NetworkPage() {
  return (
    <div className="p-8">
      <PageHeader title="Topologia de Rede" subtitle="Mapa de dispositivos" />
      <Panel>
        <EmptyState icon="🌐" title="Sem dispositivos mapeados" />
      </Panel>
    </div>
  );
}
