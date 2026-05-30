'use client';
import { PageHeader, Panel, EmptyState } from '@/components/ui';
export default function ChatPage() {
  return (
    <div className="p-8">
      <PageHeader title="Chat ao Vivo" subtitle="Comunicação em tempo real" />
      <Panel>
        <EmptyState icon="💬" title="Sem conversas" />
      </Panel>
    </div>
  );
}
