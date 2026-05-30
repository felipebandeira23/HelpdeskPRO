'use client';
import Link from 'next/link';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
export default function SLAPage() {
  return (
    <div className="p-8">
      <Link href="/settings" className="text-sm text-blue-400 mb-4 inline-block">← Config</Link>
      <PageHeader title="Configuração de SLA" subtitle="Tempos de resposta e solução" />
      <Panel>
        <EmptyState icon="⏱️" title="Nenhuma configuração" />
      </Panel>
    </div>
  );
}
