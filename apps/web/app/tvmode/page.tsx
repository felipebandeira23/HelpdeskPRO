'use client';
import { PageHeader, Panel } from '@/components/ui';
export default function TVModePage() {
  return (
    <div className="p-8">
      <PageHeader title="Modo TV" subtitle="Painel grande para salas de suporte" />
      <Panel>
        <div className="text-center py-16">
          <p className="text-white text-2xl">📺 Modo TV</p>
          <p className="text-slate-400 text-sm mt-2">Exibição em tela grande para mesas de suporte</p>
        </div>
      </Panel>
    </div>
  );
}
