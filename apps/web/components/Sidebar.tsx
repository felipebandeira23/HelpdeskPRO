'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  color: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const sections: MenuSection[] = [
  {
    title: 'Operação',
    items: [
      { icon: '📊', label: 'Dashboard', href: '/dashboard', color: 'text-blue-500' },
      { icon: '🎫', label: 'Tickets', href: '/tickets', color: 'text-emerald-500' },
      { icon: '✅', label: 'Tarefas', href: '/tasks', color: 'text-cyan-400' },
      { icon: '🔄', label: 'Recorrentes', href: '/recurring-tickets', color: 'text-teal-400' },
      { icon: '📅', label: 'Planejamento', href: '/planning', color: 'text-cyan-500' },
      { icon: '💬', label: 'Chat', href: '/chat', color: 'text-green-500' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { icon: '💻', label: 'Ativos', href: '/assets', color: 'text-orange-500' },
      { icon: '🌐', label: 'Rede', href: '/network', color: 'text-teal-500' },
      { icon: '🔑', label: 'Licenças (SAM)', href: '/licenses', color: 'text-purple-400' },
      { icon: '🏢', label: 'Clientes', href: '/customers', color: 'text-amber-400' },
      { icon: '🏬', label: 'Entidades', href: '/entities', color: 'text-amber-500' },
      { icon: '📄', label: 'Contratos', href: '/contracts', color: 'text-pink-400' },
      { icon: '🧾', label: 'Faturamento', href: '/billing', color: 'text-emerald-400' },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      { icon: '📈', label: 'Relatórios', href: '/reports', color: 'text-pink-500' },
      { icon: '⚡', label: 'Automação', href: '/automation', color: 'text-yellow-500' },
      { icon: '⭐', label: 'Avaliações', href: '/ratings', color: 'text-yellow-400' },
    ],
  },
  {
    title: 'Recursos',
    items: [
      { icon: '🔐', label: 'Cofre de Senhas', href: '/vault', color: 'text-red-500' },
      { icon: '🌐', label: 'Portal', href: '/portal-admin', color: 'text-indigo-500' },
      { icon: '📺', label: 'Modo TV', href: '/tvmode', color: 'text-violet-500' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { icon: '👥', label: 'Usuários', href: '/settings/users', color: 'text-purple-500' },
      { icon: '⚙️', label: 'Configurações', href: '/settings', color: 'text-gray-400' },
    ],
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <aside
      className={`sticky left-0 top-20 h-[calc(100vh-80px)] overflow-y-auto bg-slate-900 border-r border-slate-700 py-4 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div
        className={`flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-end'
        } px-4 mb-4`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          title={isCollapsed ? 'Expandir' : 'Recolher'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="space-y-6 px-2">
        {sections.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <p className="px-4 mb-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group ${
                      isCollapsed ? 'justify-center' : ''
                    } ${
                      active
                        ? 'bg-slate-800 border-l-2 border-blue-500'
                        : 'hover:bg-slate-800'
                    }`}
                  >
                    <span className={`text-xl ${item.color}`}>{item.icon}</span>
                    {!isCollapsed && (
                      <span
                        className={`text-sm font-medium ${
                          active
                            ? 'text-white'
                            : 'text-slate-300 group-hover:text-white'
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
