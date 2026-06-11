'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  PageHeader,
  Panel,
  StatCard,
  Select,
  Spinner,
  ErrorBanner,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/components/ui';

type Period = '7d' | '30d' | '90d';

interface Overview {
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  averageResolutionHours: number | null;
}

interface GroupRow {
  key?: string;
  name?: string;
  count?: number;
  assigned?: number;
  resolved?: number;
}

interface SlaReport {
  totalWithSla: number;
  response: { total: number; onTime: number; complianceRate: number | null };
  solution: { total: number; onTime: number; complianceRate: number | null };
  currentlyBreached: number;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Panel>
      <h2 className="text-white font-semibold mb-4">{title}</h2>
      {children}
    </Panel>
  );
}

function periodToRange(period: Period): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (period === '7d' ? 7 : period === '30d' ? 30 : 90));
  return { from: from.toISOString(), to: to.toISOString() };
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [byStatus, setByStatus] = useState<GroupRow[]>([]);
  const [byPriority, setByPriority] = useState<GroupRow[]>([]);
  const [byCategory, setByCategory] = useState<GroupRow[]>([]);
  const [byOperator, setByOperator] = useState<GroupRow[]>([]);
  const [sla, setSla] = useState<SlaReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { from, to } = periodToRange(period);
    const q = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    try {
      const [ov, st, pr, cat, op, slaR] = await Promise.all([
        api.get(`/api/reports?type=overview&${q}`),
        api.get(`/api/reports?type=by-status&${q}`),
        api.get(`/api/reports?type=by-priority&${q}`),
        api.get(`/api/reports?type=by-category&${q}`),
        api.get(`/api/reports?type=by-operator&${q}`),
        api.get(`/api/reports?type=sla&${q}`),
      ]);
      setOverview(ov.data);
      setByStatus(st.data.groups || []);
      setByPriority(pr.data.groups || []);
      setByCategory(cat.data.groups || []);
      setByOperator(op.data.groups || []);
      setSla(slaR.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatórios');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const maxCount = (rows: GroupRow[]): number =>
    Math.max(1, ...rows.map((r) => r.count ?? r.assigned ?? 0));

  const Bar = ({ value, max }: { value: number; max: number }) => (
    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
      <div
        className="bg-blue-500 h-full rounded-full"
        style={{ width: `${Math.round((value / max) * 100)}%` }}
      />
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <PageHeader
          title="Relatórios e Analytics"
          subtitle="Métricas reais de atendimento, SLA e produtividade"
        />
        <div className="w-48">
          <Select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </Select>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading ? (
        <Spinner label="Gerando relatórios..." />
      ) : (
        <>
          {/* Visão geral */}
          {overview && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Total de tickets" icon="🎫" value={String(overview.totalTickets)} />
              <StatCard title="Resolvidos" icon="✅" value={String(overview.resolvedTickets)} />
              <StatCard title="Em aberto" icon="📬" value={String(overview.openTickets)} />
              <StatCard
                title="Tempo médio de resolução"
                icon="⏱️"
                value={
                  overview.averageResolutionHours != null
                    ? `${overview.averageResolutionHours}h`
                    : '—'
                }
              />
            </div>
          )}

          {/* SLA */}
          {sla && (
            <Section title="Cumprimento de SLA">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Resposta no prazo"
                  icon="⚡"
                  value={
                    sla.response.complianceRate != null
                      ? `${sla.response.complianceRate}%`
                      : '—'
                  }
                />
                <StatCard
                  title="Solução no prazo"
                  icon="🛠️"
                  value={
                    sla.solution.complianceRate != null
                      ? `${sla.solution.complianceRate}%`
                      : '—'
                  }
                />
                <StatCard title="Tickets com SLA" icon="📋" value={String(sla.totalWithSla)} />
                <StatCard title="Estourados agora" icon="🔴" value={String(sla.currentlyBreached)} />
              </div>
            </Section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="Tickets por status">
              <div className="space-y-3">
                {byStatus.map((r) => (
                  <div key={r.key} className="flex items-center gap-3 text-sm">
                    <span className="w-32 text-slate-300">
                      {STATUS_LABELS[r.key || ''] || r.key}
                    </span>
                    <Bar value={r.count || 0} max={maxCount(byStatus)} />
                    <span className="w-8 text-right text-slate-200 font-mono">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Tickets por prioridade">
              <div className="space-y-3">
                {byPriority.map((r) => (
                  <div key={r.key} className="flex items-center gap-3 text-sm">
                    <span className="w-32 text-slate-300">
                      {PRIORITY_LABELS[r.key || ''] || r.key}
                    </span>
                    <Bar value={r.count || 0} max={maxCount(byPriority)} />
                    <span className="w-8 text-right text-slate-200 font-mono">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Tickets por categoria">
              <div className="space-y-3">
                {byCategory.length === 0 ? (
                  <p className="text-slate-400 text-sm">Sem dados no período.</p>
                ) : (
                  byCategory.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-40 text-slate-300 truncate">{r.name}</span>
                      <Bar value={r.count || 0} max={maxCount(byCategory)} />
                      <span className="w-8 text-right text-slate-200 font-mono">
                        {r.count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Section>

            <Section title="Produtividade por operador">
              {byOperator.length === 0 ? (
                <p className="text-slate-400 text-sm">Sem dados no período.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-700">
                      <th className="py-2">Operador</th>
                      <th className="py-2 text-right">Atribuídos</th>
                      <th className="py-2 text-right">Resolvidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byOperator.map((r, i) => (
                      <tr key={i} className="border-b border-slate-800">
                        <td className="py-2 text-slate-200">{r.name}</td>
                        <td className="py-2 text-right text-slate-200 font-mono">
                          {r.assigned}
                        </td>
                        <td className="py-2 text-right text-green-400 font-mono">
                          {r.resolved}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>
          </div>
        </>
      )}
    </div>
  );
}
