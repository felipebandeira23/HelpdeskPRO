import type { Metadata } from 'next';
import './globals.css';

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
      <body className="antialiased bg-white dark:bg-slate-950">
        {children}
      </body>
    </html>
  );
}
