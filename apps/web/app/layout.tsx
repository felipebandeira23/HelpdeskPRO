import type { Metadata } from 'next';
import './globals.css';
import '../styles/theme.css';
import { TopBar } from '@/components/TopBar';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'HelpdeskPRO',
  description: 'Sistema de Help Desk e Gestão de Ativos de TI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-slate-950 text-slate-100">
        <AuthProvider>
          <TopBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
