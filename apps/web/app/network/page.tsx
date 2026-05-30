'use client';
import { PageHeader, Panel } from '@/components/ui';

export default function NetworkPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Topologia de Rede" subtitle="Monitoramento visual de ativos conectados" />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm hover:text-white transition-colors">
            Ver Lista
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors">
            Adicionar Dispositivo
          </button>
        </div>
      </div>

      <Panel className="flex-1 min-h-[600px] flex flex-col relative overflow-hidden bg-slate-900 border-slate-700">
        {/* Toolbar do mapa */}
        <div className="absolute top-4 left-4 z-10 bg-slate-800 border border-slate-700 p-2 rounded-lg flex gap-2">
          <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors" title="Zoom In">+</button>
          <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors" title="Zoom Out">-</button>
          <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors" title="Reset">⟲</button>
        </div>

        <div className="absolute top-4 right-4 z-10 bg-slate-800 border border-slate-700 p-4 rounded-lg text-sm">
          <h4 className="text-white font-bold mb-2">Legenda</h4>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-slate-300">Online</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-slate-300">Atenção</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-slate-300">Offline</span>
          </div>
        </div>

        {/* Mock representation of a network map */}
        <div className="flex-1 w-full h-full relative">
          {/* Linhas (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="50%" y1="20%" x2="30%" y2="50%" stroke="#334155" strokeWidth="2" />
            <line x1="50%" y1="20%" x2="70%" y2="50%" stroke="#334155" strokeWidth="2" />
            <line x1="30%" y1="50%" x2="20%" y2="80%" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="70%" y1="50%" x2="60%" y2="80%" stroke="#ef4444" strokeWidth="2" />
            <line x1="70%" y1="50%" x2="80%" y2="80%" stroke="#334155" strokeWidth="2" />
          </svg>

          {/* Nodes */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
            <div className="w-16 h-16 bg-blue-900 border-2 border-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform">
              🌐
            </div>
            <span className="mt-2 text-white font-bold bg-slate-800 px-2 py-0.5 rounded text-sm">Firewall Core</span>
            <span className="text-xs text-green-400">192.168.0.1</span>
          </div>

          <div className="absolute top-[50%] left-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
            <div className="w-14 h-14 bg-slate-800 border-2 border-green-500 rounded-xl flex items-center justify-center text-xl shadow-[0_0_10px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform">
              🖧
            </div>
            <span className="mt-2 text-white font-medium bg-slate-800 px-2 py-0.5 rounded text-sm">Switch Vendas</span>
            <span className="text-xs text-green-400">192.168.1.1</span>
          </div>

          <div className="absolute top-[50%] left-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
            <div className="w-14 h-14 bg-slate-800 border-2 border-yellow-500 rounded-xl flex items-center justify-center text-xl shadow-[0_0_10px_rgba(234,179,8,0.3)] group-hover:scale-110 transition-transform">
              🖧
            </div>
            <span className="mt-2 text-white font-medium bg-slate-800 px-2 py-0.5 rounded text-sm">Switch ADM</span>
            <span className="text-xs text-yellow-400">192.168.2.1 (Alta CPU)</span>
          </div>

          <div className="absolute top-[80%] left-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
            <div className="w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              🛜
            </div>
            <span className="mt-2 text-slate-300 font-medium text-xs">AP Visitantes</span>
          </div>

          <div className="absolute top-[80%] left-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
            <div className="w-12 h-12 bg-red-900/50 border-2 border-red-500 rounded-full flex items-center justify-center text-lg shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse group-hover:scale-110 transition-transform">
              🛜
            </div>
            <span className="mt-2 text-red-400 font-bold text-xs bg-red-900/20 px-2 rounded">AP Diretoria</span>
            <span className="text-[10px] text-red-500">OFFLINE</span>
          </div>

          <div className="absolute top-[80%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
            <div className="w-12 h-12 bg-slate-800 border-2 border-green-500 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              🖨️
            </div>
            <span className="mt-2 text-slate-300 font-medium text-xs">Impressora RH</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
