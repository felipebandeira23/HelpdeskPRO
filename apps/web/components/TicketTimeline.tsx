'use client';

import { useState } from 'react';

interface Followup {
  id: string;
  message: string;
  isInternal: boolean;
  author: { id: string; name: string; avatar?: string };
  origin?: 'HELPDESK' | 'PORTAL' | 'EMAIL';
  createdAt: string;
}

interface TicketTimelineProps {
  followups: Followup[];
  onAddFollowup: (message: string, isInternal: boolean) => Promise<void>;
  loading?: boolean;
}

const getOriginBadge = (origin?: string) => {
  const badges: Record<string, { color: string; label: string }> = {
    HELPDESK: { color: 'bg-blue-900 text-blue-200', label: 'Helpdesk' },
    PORTAL: { color: 'bg-green-900 text-green-200', label: 'Portal' },
    EMAIL: { color: 'bg-orange-900 text-orange-200', label: 'Email' },
  };
  const badge = badges[origin || 'HELPDESK'];
  return badge;
};

const getRelativeTime = (date: string): string => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'há alguns segundos';
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `há ${Math.floor(seconds / 86400)}d`;

  return then.toLocaleDateString('pt-BR');
};

export default function TicketTimeline({
  followups,
  onAddFollowup,
  loading = false,
}: TicketTimelineProps) {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddFollowup(message, isInternal);
      setMessage('');
      setIsInternal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Timeline */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pb-4">
        {followups.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p className="text-sm">Nenhum acompanhamento ainda</p>
          </div>
        ) : (
          followups.map((followup, index) => {
            const badge = getOriginBadge(followup.origin);
            const isLast = index === followups.length - 1;

            return (
              <div key={followup.id} className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {followup.author.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-100">
                      {followup.author.name}
                    </span>
                    {followup.origin && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    )}
                    {followup.isInternal && (
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-900 text-purple-200">
                        Nota interna
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">
                      {getRelativeTime(followup.createdAt)}
                    </span>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-200 text-sm whitespace-pre-wrap break-words">
                      {followup.message}
                    </p>
                  </div>
                </div>

                {/* Timeline connector */}
                {!isLast && (
                  <div className="absolute left-12 top-12 w-0.5 h-8 bg-slate-700 -ml-4" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input area - Fixed at bottom */}
      <div className="border-t border-slate-700 pt-4 mt-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escreva seu acompanhamento..."
            rows={3}
            disabled={isSubmitting}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 resize-none"
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-300">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                disabled={isSubmitting}
                className="rounded border-slate-600"
              />
              Nota interna
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="ml-auto bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
