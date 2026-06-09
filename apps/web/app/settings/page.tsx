'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/ui';

const settingsCards = [
  {
    href: '/settings/users',
    icon: '👥',
    title: 'Usuários',
    description: 'Criar, editar e gerenciar operadores e perfis de acesso',
    color: 'text-purple-500',
  },
  {
    href: '/settings/groups',
    icon: '👨‍💼',
    title: 'Grupos / Mesas',
    description: 'Mesas de trabalho e equipes de suporte',
    color: 'text-blue-500',
  },
  {
    href: '/settings/categories',
    icon: '🏷️',
    title: 'Tipos de Ticket',
    description: 'Categorias e tipos de chamado com SLA padrão',
    color: 'text-emerald-500',
  },
  {
    href: '/settings/sla',
    icon: '⏱️',
    title: 'SLA',
    description: 'Configuração de tempos de resposta e solução',
    color: 'text-amber-500',
  },
  {
    href: '/settings/security',
    icon: '🔒',
    title: 'Segurança e Autenticação',
    description: '2FA, LDAP / Active Directory e políticas',
    color: 'text-red-500',
  },
  {
    href: '/settings/portal',
    icon: '🌐',
    title: 'Portal do Cliente',
    description: 'Customização visual e White-label',
    color: 'text-indigo-500',
  },
  {
    href: '/settings/notifications',
    icon: '🔔',
    title: 'Notificações & Webhooks',
    description: 'Alertas por email, canais Microsoft Teams, Slack e webhooks de eventos',
    color: 'text-yellow-500',
  },
  {
    href: '/settings/cron',
    icon: '⚙️',
    title: 'Ações Automáticas (Cron)',
    description: 'Gerenciamento de tarefas em segundo plano, expirações automáticas e limpezas',
    color: 'text-indigo-400',
  },
  {
    href: '/settings/integrations',
    icon: '🔗',
    title: 'Links Externos & OAuth',
    description: 'Clientes OAuth 2.0, chaves de API e conexões com sistemas externos',
    color: 'text-teal-400',
  },
  {
    href: '/settings/assets',
    icon: '🔌',
    title: 'Definições de Ativos',
    description: 'Gerenciamento de tipos de hardware, marcas, SOs e regras de unicidade',
    color: 'text-rose-400',
  },
];

export default function SettingsPage() {
  return (
    <div className="p-8">
      <PageHeader
        title="Configurações"
        subtitle="Administração do sistema HelpdeskPRO"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-slate-900 rounded-lg border border-slate-700 p-6 hover:border-slate-500 hover:bg-slate-800/40 transition-all group"
          >
            <span className={`text-3xl ${card.color}`}>{card.icon}</span>
            <h3 className="text-white font-bold mt-3 mb-1 group-hover:text-blue-400">
              {card.title}
            </h3>
            <p className="text-slate-400 text-sm">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
