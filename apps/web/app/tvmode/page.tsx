'use client';
import { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui';

export default function TVModePage() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('pt-BR'));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="text-blue-500">HD PRO</span> NOC Dashboard
          </h1>
          <p className="text-slate-400 text-lg mt-1">Status operacional em tempo real</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-mono font-bold text-white">{time}</div>
          <div className="text-slate-400">Atualização a cada 30s</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 shrink-0">
        <StatCard title="Tickets Abertos" value="42" icon="🎫" accent="bg-blue-600" />
        <StatCard title="Em Atendimento" value="18" icon="👨‍💻" accent="bg-amber-500" />
        <StatCard title="SLA Prestes a Estourar" value="5" icon="⚠️" accent="bg-orange-500" />
        <StatCard title="SLA Estourado" value="2" icon="🔴" accent="bg-red-600" />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold text-white mb-6">Fila de Atendimento Prioritário</h2>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="pb-4 text-sm font-medium text-slate-400">Ticket</th>
                    <th className="pb-4 text-sm font-medium text-slate-400">Assunto</th>
                    <th className="pb-4 text-sm font-medium text-slate-400">Cliente</th>
                    <th className="pb-4 text-sm font-medium text-slate-400">SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr className="bg-red-900/10">
                    <td className="py-5 text-lg font-mono text-slate-300">#1024</td>
                    <td className="py-5 text-lg text-white font-medium">Servidor Principal Offline</td>
                    <td className="py-5 text-lg text-slate-300">TechCorp</td>
                    <td className="py-5 text-lg font-bold text-red-400">-15 min</td>
                  </tr>
                  <tr className="bg-orange-900/10">
                    <td className="py-5 text-lg font-mono text-slate-300">#1025</td>
                    <td className="py-5 text-lg text-white font-medium">Falha de Backup Database</td>
                    <td className="py-5 text-lg text-slate-300">Global Inc</td>
                    <td className="py-5 text-lg font-bold text-orange-400">05 min</td>
                  </tr>
                  <tr>
                    <td className="py-5 text-lg font-mono text-slate-300">#1026</td>
                    <td className="py-5 text-lg text-white font-medium">Lentidão no ERP</td>
                    <td className="py-5 text-lg text-slate-300">Local Shop</td>
                    <td className="py-5 text-lg font-bold text-green-400">45 min</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold text-white mb-6">Status da Rede</h2>
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between border border-green-500/30">
              <div>
                <h3 className="text-lg font-bold text-white">Link Principal</h3>
                <p className="text-slate-400">Fibra 1Gbps</p>
              </div>
              <div className="h-4 w-4 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse"></div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between border border-green-500/30">
              <div>
                <h3 className="text-lg font-bold text-white">VPN Matriz</h3>
                <p className="text-slate-400">IPSec Tunnel</p>
              </div>
              <div className="h-4 w-4 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse"></div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between border border-red-500/30">
              <div>
                <h3 className="text-lg font-bold text-white">Filial Sul</h3>
                <p className="text-slate-400">Down (15m)</p>
              </div>
              <div className="h-4 w-4 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Exit Button (only shows on mouse hover in real app, keeping visible for now) */}
      <button 
        onClick={() => window.history.back()}
        className="absolute top-6 right-6 opacity-20 hover:opacity-100 bg-slate-800 p-2 rounded-lg text-slate-300 transition-opacity"
      >
        Sair do Modo TV (Esc)
      </button>
    </div>
  );
}
