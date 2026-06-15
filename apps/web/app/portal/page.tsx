'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface PublicTicketSummary {
  ticketNumber: number;
  title: string;
  status: string;
  createdAt: string;
  closedAt: string | null;
}

interface PublicTicketDetail {
  ticketNumber: number;
  title: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
  followups: { message: string; createdAt: string; author: { name: string } }[];
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em atendimento',
  WAITING: 'Aguardando você',
  PAUSED: 'Pausado',
  CLOSED: 'Fechado',
};

async function publicFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.message || `Erro ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return res.json();
}

export default function PortalPage() {
  const [tab, setTab] = useState<'novo' | 'acompanhar'>('novo');

  // Abertura
  const [form, setForm] = useState({ name: '', email: '', title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [createdNumber, setCreatedNumber] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Acompanhamento
  const [lookupEmail, setLookupEmail] = useState('');
  const [tickets, setTickets] = useState<PublicTicketSummary[] | null>(null);
  const [detail, setDetail] = useState<PublicTicketDetail | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await publicFetch<{ ticketNumber: number }>(
        '/api/portal/tickets',
        { method: 'POST', body: JSON.stringify(form) },
      );
      setCreatedNumber(result.ticketNumber);
      setForm({ name: '', email: '', title: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao abrir chamado');
    } finally {
      setSubmitting(false);
    }
  };

  const lookup = async () => {
    setBusy(true);
    setError(null);
    setDetail(null);
    try {
      const data = await publicFetch<PublicTicketSummary[]>(
        `/api/portal/tickets?email=${encodeURIComponent(lookupEmail)}`,
      );
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na consulta');
    } finally {
      setBusy(false);
    }
  };

  const openDetail = async (n: number) => {
    setBusy(true);
    setError(null);
    try {
      const data = await publicFetch<PublicTicketDetail>(
        `/api/portal/tickets/${n}?email=${encodeURIComponent(lookupEmail)}`,
      );
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao abrir chamado');
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async () => {
    if (!detail || !reply.trim()) return;
    setBusy(true);
    try {
      await publicFetch(`/api/portal/tickets/${detail.ticketNumber}/followup`, {
        method: 'POST',
        body: JSON.stringify({ email: lookupEmail, message: reply }),
      });
      setReply('');
      await openDetail(detail.ticketNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao responder');
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500';

  return (
    <div className="py-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            HD
          </div>
          <span className="text-2xl font-bold text-white">HelpdeskPRO</span>
        </div>
        <p className="text-slate-400">
          Portal do Cliente — abra e acompanhe seus chamados sem precisar de senha
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-6" role="tablist">
        {(
          [
            ['novo', 'Abrir chamado'],
            ['acompanhar', 'Acompanhar chamados'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setTab(key);
              setError(null);
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="max-w-xl mx-auto bg-red-900/20 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm mb-4"
        >
          {error}
        </div>
      )}

      {tab === 'novo' && (
        <div className="max-w-xl mx-auto bg-slate-900/70 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
          {createdNumber ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-white text-xl font-bold mb-2">
                Chamado #{createdNumber} registrado!
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Você receberá atualizações por email. Guarde o número do chamado
                para acompanhar pelo portal.
              </p>
              <button
                onClick={() => setCreatedNumber(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
              >
                Abrir outro chamado
              </button>
            </div>
          ) : (
            <form onSubmit={submitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="p-name" className="block text-xs font-medium text-slate-400 uppercase mb-1.5">
                    Seu nome *
                  </label>
                  <input
                    id="p-name"
                    required
                    className={input}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="p-email" className="block text-xs font-medium text-slate-400 uppercase mb-1.5">
                    Seu email *
                  </label>
                  <input
                    id="p-email"
                    type="email"
                    required
                    className={input}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="p-title" className="block text-xs font-medium text-slate-400 uppercase mb-1.5">
                  Resumo do problema *
                </label>
                <input
                  id="p-title"
                  required
                  minLength={5}
                  className={input}
                  placeholder="Ex: Impressora da sala 101 não imprime"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="p-desc" className="block text-xs font-medium text-slate-400 uppercase mb-1.5">
                  Descreva com detalhes *
                </label>
                <textarea
                  id="p-desc"
                  required
                  minLength={10}
                  rows={5}
                  className={input}
                  placeholder="O que aconteceu? Desde quando? Alguma mensagem de erro?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {submitting ? 'Enviando...' : 'Abrir chamado'}
              </button>
            </form>
          )}
        </div>
      )}

      {tab === 'acompanhar' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-slate-900/70 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
            <label htmlFor="p-lookup" className="block text-xs font-medium text-slate-400 uppercase mb-1.5">
              Email usado na abertura
            </label>
            <div className="flex gap-3">
              <input
                id="p-lookup"
                type="email"
                className={input}
                placeholder="voce@empresa.com"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookup()}
              />
              <button
                onClick={lookup}
                disabled={busy || !lookupEmail.includes('@')}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 rounded-lg text-sm font-medium shrink-0"
              >
                Buscar
              </button>
            </div>
          </div>

          {tickets && !detail && (
            <div className="bg-slate-900/70 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
              {tickets.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">
                  Nenhum chamado encontrado para este email.
                </p>
              ) : (
                <ul className="space-y-2">
                  {tickets.map((t) => (
                    <li key={t.ticketNumber}>
                      <button
                        onClick={() => openDetail(t.ticketNumber)}
                        className="w-full flex items-center justify-between gap-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-lg px-4 py-3 text-left transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="text-slate-500 text-xs mr-2">
                            #{t.ticketNumber}
                          </span>
                          <span className="text-slate-200 text-sm">{t.title}</span>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">
                          {STATUS_LABEL[t.status] || t.status}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {detail && (
            <div className="bg-slate-900/70 backdrop-blur-sm border border-white/[0.06] rounded-xl p-6">
              <button
                onClick={() => setDetail(null)}
                className="text-blue-400 hover:text-blue-300 text-sm mb-3"
              >
                ← Voltar à lista
              </button>
              <h2 className="text-white font-bold text-lg">
                #{detail.ticketNumber} — {detail.title}
              </h2>
              <p className="text-slate-400 text-xs mb-4">
                {STATUS_LABEL[detail.status] || detail.status} · aberto em{' '}
                {new Date(detail.createdAt).toLocaleDateString('pt-BR')}
              </p>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 mb-4">
                <p className="text-slate-300 text-sm whitespace-pre-wrap">
                  {detail.description}
                </p>
              </div>

              {detail.followups.length > 0 && (
                <div className="space-y-2 mb-4">
                  {detail.followups.map((f, i) => (
                    <div
                      key={i}
                      className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3"
                    >
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">
                        {f.message}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        {f.author.name} ·{' '}
                        {new Date(f.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {detail.status !== 'CLOSED' && (
                <div className="flex gap-3">
                  <input
                    className={input}
                    placeholder="Responder ao atendimento..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                  />
                  <button
                    onClick={sendReply}
                    disabled={busy || !reply.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 rounded-lg text-sm font-medium shrink-0"
                  >
                    Enviar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
