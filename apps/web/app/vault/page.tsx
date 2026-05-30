'use client';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
export default function VaultPage() {
  return (
    <div className="p-8">
      <PageHeader title="Cofre de Credenciais" subtitle="Senhas e credenciais seguras" />
      <Panel>
        <EmptyState icon="🔐" title="Cofre vazio" description="Adicione credenciais seguras aqui" />
      </Panel>
    </div>
  );
}
