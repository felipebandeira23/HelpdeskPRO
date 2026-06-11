'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  PageHeader,
  Section,
  StatCard,
  ErrorBanner,
  Skeleton,
  EmptyState,
} from '@/components/ui';

interface SurveyResults {
  averageRating: number | null;
  totalSurveys: number;
  satisfactionRate: number | null;
  distribution: { rating: number; count: number }[];
  byOperator: { operatorId: string; name: string; average: number; count: number }[];
  recent: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    ticket: { id: string; ticketNumber: number; title: string };
    rater: { name: string };
  }[];
}

function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-400 text-sm" aria-label={`${value} de 5 estrelas`}>
      {'★'.repeat(value)}
      <span className="text-slate-600">{'★'.repeat(5 - value)}</span>
    </span>
  );
}

export default function RatingsPage() {
  const [data, setData] = useState<SurveyResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<SurveyResults>('/api/ratings/survey-results')
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Erro ao carregar avaliações'),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const maxDist = Math.max(1, ...(data?.distribution.map((d) => d.count) || [1]));

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Pesquisa de Satisfação"
        subtitle="Avaliações reais dos solicitantes após o fechamento dos tickets"
      />

      {error && <ErrorBanner message={error} />}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Nota média"
              icon="⭐"
              accent="bg-amber-500"
              value={data.averageRating != null ? `${data.averageRating} / 5` : '—'}
            />
            <StatCard
              title="Satisfação (4-5 estrelas)"
              icon="😊"
              accent="bg-emerald-500"
              value={data.satisfactionRate != null ? `${data.satisfactionRate}%` : '—'}
            />
            <StatCard title="Avaliações recebidas" icon="📨" value={data.totalSurveys} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="Distribuição de notas">
              {data.totalSurveys === 0 ? (
                <EmptyState
                  icon="⭐"
                  title="Nenhuma avaliação ainda"
                  description="Quando solicitantes avaliarem tickets fechados, as notas aparecem aqui."
                />
              ) : (
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const row = data.distribution.find((d) => d.rating === star);
                    const count = row?.count ?? 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-sm">
                        <span className="w-10 text-slate-300 tnum">{star}★</span>
                        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              star >= 4
                                ? 'bg-emerald-500'
                                : star === 3
                                  ? 'bg-amber-400'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${(count / maxDist) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-200 tnum">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            <Section title="Média por operador">
              {data.byOperator.length === 0 ? (
                <p className="text-slate-400 text-sm">Sem dados por operador.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 text-xs uppercase border-b border-white/[0.06]">
                      <th className="py-2">Operador</th>
                      <th className="py-2 text-right">Média</th>
                      <th className="py-2 text-right">Avaliações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byOperator
                      .sort((a, b) => b.average - a.average)
                      .map((op) => (
                        <tr key={op.operatorId} className="border-b border-white/[0.04]">
                          <td className="py-2 text-slate-200">{op.name}</td>
                          <td className="py-2 text-right text-amber-400 tnum">
                            {op.average.toFixed(2)}
                          </td>
                          <td className="py-2 text-right text-slate-300 tnum">{op.count}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </Section>
          </div>

          <Section title="Avaliações recentes">
            {data.recent.length === 0 ? (
              <p className="text-slate-400 text-sm">Nenhuma avaliação registrada.</p>
            ) : (
              <ul className="space-y-2">
                {data.recent.map((r) => (
                  <li
                    key={r.id}
                    className="bg-white/[0.02] border border-white/[0.05] rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Link
                        href={`/tickets/${r.ticket.id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm truncate"
                      >
                        <span className="text-slate-500 tnum mr-1">
                          #{r.ticket.ticketNumber}
                        </span>
                        {r.ticket.title}
                      </Link>
                      <Stars value={r.rating} />
                    </div>
                    {r.comment && (
                      <p className="text-slate-300 text-sm mt-1">“{r.comment}”</p>
                    )}
                    <p className="text-slate-500 text-xs mt-1">
                      {r.rater.name} · {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
