'use client';

import { useState } from 'react';
import Link from 'next/link';

const menuItems = [
  {
    icon: '📊',
    label: 'Dashboard',
    href: '/dashboard',
    color: 'text-blue-500',
  },
  {
    icon: '🎫',
    label: 'Tickets',
    href: '/tickets',
    color: 'text-emerald-500',
  },
  {
    icon: '💻',
    label: 'Ativos',
    href: '/assets',
    color: 'text-orange-500',
  },
  {
    icon: '👥',
    label: 'Usuários',
    href: '/users',
    color: 'text-purple-500',
  },
  {
    icon: '⚙️',
    label: 'Configurações',
    href: '/settings',
    color: 'text-gray-500',
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`sticky left-0 top-20 h-[calc(100vh-80px)] bg-slate-900 border-r border-slate-700 py-4 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'} px-4 mb-6`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          title={isCollapsed ? 'Expandir' : 'Recolher'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="space-y-2 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors group ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <span className={`text-xl ${item.color}`}>{item.icon}</span>
            {!isCollapsed && (
              <span className="text-slate-200 text-sm font-medium group-hover:text-white">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
