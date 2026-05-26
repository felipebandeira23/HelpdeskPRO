'use client';

import { Sidebar } from '@/components/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-slate-950 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
