'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const POLL_INTERVAL_MS = 30_000;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}

const TYPE_ICONS: Record<string, string> = {
  TICKET_ASSIGNED: '👤',
  TICKET_FOLLOWUP: '💬',
  TICKET_CLOSED: '✅',
  TICKET_PAUSED: '⏸️',
  SLA_WARNING: '⚠️',
  SLA_BREACHED: '🔴',
  FOLLOWER_ADDED: '👁️',
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const { count } = await api.get<{ count: number }>(
        '/api/notifications/unread-count',
      );
      setUnread(count);
    } catch {
      /* sem token ou API offline — silencioso */
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        const data = await api.get<Notification[]>('/api/notifications');
        setItems(data);
      } catch {
        setItems([]);
      }
    }
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      api.patch(`/api/notifications/${n.id}/read`).then(refresh).catch(() => {});
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const markAll = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      /* silencioso */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center text-slate-200 transition-colors"
        aria-label="Notificações"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-12 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-96 max-h-[70vh] overflow-y-auto z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 sticky top-0 bg-slate-800">
            <span className="text-white font-semibold text-sm">Notificações</span>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              Nenhuma notificação
            </p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors ${
                  n.read ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">
                    {TYPE_ICONS[n.type] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">
                      {n.title}
                    </p>
                    <p className="text-slate-400 text-xs truncate">{n.message}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {relativeTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
