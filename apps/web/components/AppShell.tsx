'use client';

import { Sidebar } from '@/components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

/**
 * Shell padrão para todas as rotas autenticadas (exceto /auth).
 * Inclui proteção de rota + sidebar de navegação. A TopBar é global (root layout).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 bg-slate-950 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
