'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Section, ErrorBanner } from '@/components/ui';

interface TelemetryRecord {
  id: string;
  cpuUsage: number | null;
  memoryUsed: number | null;
  memoryTotal: number | null;
  diskUsage: Array<{ mount: string; used: number; total: number }> | null;
  networkIn: number | null;
  networkOut: number | null;
  uptime: number | null;
  processes: number | null;
  temperature: number | null;
  recordedAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB/s`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB/s`;
  return `${(bytes / 1e3).toFixed(0)} KB/s`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function GaugeRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" strokeWidth="8" className="stroke-slate-700" />
          <circle
            cx="44" cy="44" r={r} fill="none" strokeWidth="8"
            stroke={color} strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
          {Math.round(pct)}%
        </span>
      </div>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 240;
  const h = 48;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function AssetTelemetry({ assetId }: { assetId: string }) {
  const [latest, setLatest] = useState<TelemetryRecord | null>(null);
  const [history, setHistory] = useState<TelemetryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [lat, hist] = await Promise.all([
        api.get<TelemetryRecord | null>(`/api/assets/${assetId}/telemetry/latest`).catch(() => null),
        api.get<TelemetryRecord[]>(`/api/assets/${assetId}/telemetry`).catch(() => []),
      ]);
      setLatest(lat);
      setHistory(Array.isArray(hist) ? hist.reverse() : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar telemetria');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [assetId]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh a cada 30s
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshing(true);
      load();
    }, 30000);
    return () => clearInterval(timer);
  }, [load]);

  const memPct = latest?.memoryTotal && latest?.memoryUsed
    ? (latest.memoryUsed / latest.memoryTotal) * 100
    : null;

  const cpuHistory = history.map((r) => r.cpuUsage ?? 0);
  const memHistory = history.map((r) =>
    r.memoryTotal && r.memoryUsed ? (r.memoryUsed / r.memoryTotal) * 100 : 0
  );

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}

      {/* Banner de aviso: agente em desenvolvimento */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 flex items-start gap-3">
        <span className="text-amber-400 mt-0.5">⚙️</span>
        <div>
          <p className="text-amber-300 text-sm font-medium">Agente em desenvolvimento</p>
          <p className="text-amber-400/80 text-xs mt-0.5">
            O agente HelpdeskPRO ainda está em desenvolvimento e não está enviando dados. Quando instalado no dispositivo,
            enviará métricas em tempo real via <code className="font-mono bg-amber-500/10 px-1 rounded">POST /api/assets/{assetId}/telemetry</code>.
          </p>
        </div>
      </div>

      {!loading && !latest ? (
        <Section title="Monitoramento em tempo real">
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📡</div>
            <p className="text-slate-300 font-medium">Aguardando dados do agente</p>
            <p className="text-slate-500 text-sm mt-1">Nenhuma leitura de telemetria recebida ainda.</p>
          </div>
        </Section>
      ) : (
        <>
          {/* Gauges */}
          <Section title="Uso em tempo real">
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-xs text-slate-400">
                {latest ? `Última leitura: ${new Date(latest.recordedAt).toLocaleString('pt-BR')}` : 'Sem dados'}
              </span>
            </div>
            <div className="flex flex-wrap gap-8 justify-center md:justify-start">
              {latest?.cpuUsage != null && (
                <GaugeRing value={latest.cpuUsage} label="CPU" color="#3b82f6" />
              )}
              {memPct != null && (
                <GaugeRing value={memPct} label="Memória" color="#8b5cf6" />
              )}
              {latest?.temperature != null && (
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${latest.temperature > 80 ? 'border-red-500' : latest.temperature > 65 ? 'border-amber-500' : 'border-emerald-500'}`}>
                    <div className="text-center">
                      <p className="text-xl font-bold text-white">{Math.round(latest.temperature)}°</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Temperatura</span>
                </div>
              )}
            </div>

            {/* Métricas extras */}
            {latest && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/[0.06]">
                {latest.memoryUsed != null && latest.memoryTotal != null && (
                  <div>
                    <p className="text-slate-500 text-xs">Memória</p>
                    <p className="text-slate-200 text-sm font-medium">
                      {latest.memoryUsed.toFixed(1)} / {latest.memoryTotal.toFixed(1)} GB
                    </p>
                  </div>
                )}
                {latest.networkIn != null && (
                  <div>
                    <p className="text-slate-500 text-xs">Rede ↓</p>
                    <p className="text-slate-200 text-sm font-medium">{formatBytes(latest.networkIn)}</p>
                  </div>
                )}
                {latest.networkOut != null && (
                  <div>
                    <p className="text-slate-500 text-xs">Rede ↑</p>
                    <p className="text-slate-200 text-sm font-medium">{formatBytes(latest.networkOut)}</p>
                  </div>
                )}
                {latest.uptime != null && (
                  <div>
                    <p className="text-slate-500 text-xs">Uptime</p>
                    <p className="text-slate-200 text-sm font-medium">{formatUptime(latest.uptime)}</p>
                  </div>
                )}
                {latest.processes != null && (
                  <div>
                    <p className="text-slate-500 text-xs">Processos</p>
                    <p className="text-slate-200 text-sm font-medium">{latest.processes}</p>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Discos */}
          {latest?.diskUsage && Array.isArray(latest.diskUsage) && latest.diskUsage.length > 0 && (
            <Section title="Discos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(latest.diskUsage as Array<{ mount: string; used: number; total: number }>).map((d) => {
                  const pct = d.total > 0 ? Math.round((d.used / d.total) * 100) : 0;
                  const color = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#3b82f6';
                  return (
                    <div key={d.mount} className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-200 text-sm font-medium">💽 {d.mount}</span>
                        <span className="text-slate-400 text-xs">{d.used.toFixed(1)} / {d.total.toFixed(1)} GB</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 text-right">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Histórico em gráfico */}
          {history.length > 1 && (
            <Section title="Histórico (últimas 60 leituras)">
              <div className="space-y-4">
                {cpuHistory.some((v) => v > 0) && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-400">CPU</span>
                      <span className="text-xs text-blue-400">{Math.round(cpuHistory[cpuHistory.length - 1])}%</span>
                    </div>
                    <div className="bg-slate-800/60 rounded border border-white/[0.04] px-2 py-1">
                      <MiniChart data={cpuHistory} color="#3b82f6" />
                    </div>
                  </div>
                )}
                {memHistory.some((v) => v > 0) && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-slate-400">Memória</span>
                      <span className="text-xs text-purple-400">{Math.round(memHistory[memHistory.length - 1])}%</span>
                    </div>
                    <div className="bg-slate-800/60 rounded border border-white/[0.04] px-2 py-1">
                      <MiniChart data={memHistory} color="#8b5cf6" />
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}
        </>
      )}

      {/* Exemplo de payload para integração do agente */}
      <Section title="Integração do agente">
        <p className="text-slate-400 text-sm mb-3">
          O agente deve enviar um <code className="text-blue-400 font-mono bg-blue-500/10 px-1 rounded">POST</code> com JWT no header para:
        </p>
        <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto">
{`POST /api/assets/${assetId}/telemetry
Authorization: Bearer <token>
Content-Type: application/json

{
  "cpuUsage": 34.5,
  "memoryUsed": 6.2,
  "memoryTotal": 16.0,
  "diskUsage": [
    { "mount": "C:", "used": 120.5, "total": 476.9 }
  ],
  "networkIn": 1048576,
  "networkOut": 524288,
  "uptime": 86400,
  "processes": 142,
  "temperature": 52.0
}`}
        </pre>
      </Section>
    </div>
  );
}
