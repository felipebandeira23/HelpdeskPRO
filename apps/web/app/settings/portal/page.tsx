'use client';
import { PageHeader, Panel, Button, Input } from '@/components/ui';

export default function PortalSettingsPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Configurações do Portal" subtitle="Personalização da área do cliente (White-label)" />
        <Button variant="primary">Salvar Alterações</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Panel>
          <h2 className="text-xl font-bold text-white mb-6">Identidade Visual</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome do Portal</label>
              <Input type="text" defaultValue="Central de Ajuda TechCorp" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cor Primária (Hexadecimal)</label>
              <div className="flex gap-2">
                <input type="color" defaultValue="#2563eb" className="h-10 w-10 rounded border-0 bg-transparent p-0 cursor-pointer" />
                <Input type="text" defaultValue="#2563eb" className="uppercase font-mono" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Logotipo</label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer text-slate-400 hover:text-white">
                <span className="text-3xl mb-2">📤</span>
                <span className="font-medium text-sm">Clique para fazer upload</span>
                <span className="text-xs mt-1">PNG ou SVG (Recomendado 200x50px)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mensagem de Boas-vindas</label>
              <textarea rows={3} defaultValue="Como podemos ajudar você hoje?" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none focus:border-blue-500 resize-none"></textarea>
            </div>
          </div>
        </Panel>

        {/* Live Preview */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <span className="ml-4 text-xs font-mono text-slate-500">Live Preview - Portal do Cliente</span>
          </div>
          
          <div className="flex-1 p-8 bg-slate-950 relative">
            <div className="w-full h-full border border-slate-800 bg-slate-900 rounded-lg shadow-2xl flex flex-col overflow-hidden">
              <header className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
                <span className="font-bold">TechCorp</span>
                <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">João Silva</span>
              </header>
              <div className="p-8 text-center bg-slate-950 flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">Como podemos ajudar você hoje?</h1>
                <input type="text" placeholder="Descreva seu problema..." disabled className="w-full max-w-md mx-auto mt-4 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-500 cursor-not-allowed" />
                
                <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="bg-slate-900 border border-slate-800 rounded p-4 text-slate-400">Abrir Chamado</div>
                  <div className="bg-slate-900 border border-slate-800 rounded p-4 text-slate-400">Meus Tickets</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
