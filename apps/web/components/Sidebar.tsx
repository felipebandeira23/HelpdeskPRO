'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
  icon: string;
  label: string;
  href?: string;
  color: string;
  children?: MenuItem[];
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
      { icon: '📅', label: 'Planejamento', href: '/planning', color: 'text-cyan-500' },
      { icon: '💬', label: 'Chat', href: '/chat', color: 'text-green-500' },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        icon: '💻',
        label: 'Ativos',
        color: 'text-orange-500',
        children: [
          { icon: '💻', label: 'Computadores', href: '/assets?type=COMPUTER', color: 'text-orange-500' },
          { icon: '💻', label: 'Notebooks', href: '/assets?type=LAPTOP', color: 'text-orange-500' },
          { icon: '🖥️', label: 'Servidores', href: '/assets?type=SERVER', color: 'text-orange-500' },
          { icon: '🖥️', label: 'Monitores', href: '/assets?type=MONITOR', color: 'text-orange-500' },
          { icon: '🖨️', label: 'Impressoras', href: '/assets?type=PRINTER', color: 'text-orange-500' },
          { icon: '🔀', label: 'Switches', href: '/assets?type=SWITCH', color: 'text-orange-500' },
          { icon: '📡', label: 'Roteadores', href: '/assets?type=ROUTER', color: 'text-orange-500' },
          { icon: '📶', label: 'Pontos de Acesso', href: '/assets?type=ACCESS_POINT', color: 'text-orange-500' },
          { icon: '🌐', label: 'Equipamentos de Rede', href: '/assets?type=NETWORK_EQUIPMENT', color: 'text-orange-500' },
          { icon: '⌨️', label: 'Periféricos', href: '/assets?type=PERIPHERAL', color: 'text-orange-500' },
          { icon: '☎️', label: 'Telefones', href: '/assets?type=PHONE', color: 'text-orange-500' },
          { icon: '📱', label: 'Tablets', href: '/assets?type=TABLET', color: 'text-orange-500' },
          { icon: '🎨', label: 'Cartuchos', href: '/assets?type=CARTRIDGE', color: 'text-orange-500' },
          { icon: '📦', label: 'Insumos', href: '/assets?type=CONSUMABLE', color: 'text-orange-500' },
          { icon: '🗄️', label: 'Racks', href: '/assets?type=RACK', color: 'text-orange-500' },
          { icon: '📦', label: 'Chassis', href: '/assets?type=ENCLOSURE', color: 'text-orange-500' },
          { icon: '🔌', label: 'PDUs', href: '/assets?type=PDU', color: 'text-orange-500' },
          { icon: '🔗', label: 'Dispositivos Passivos', href: '/assets?type=PASSIVE_DEVICE', color: 'text-orange-500' },
          { icon: '🔗', label: 'Cabos', href: '/assets?type=CABLE', color: 'text-orange-500' },
          { icon: '🔍', label: 'Dispositivos não gerenciados', href: '/discovery', color: 'text-orange-500' },
          { icon: '💻', label: 'Global', href: '/assets', color: 'text-orange-500' },
        ],
      },
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

function MenuItemComponent({ item, isCollapsed, pathname }: { item: MenuItem; isCollapsed: boolean; pathname: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) : isExpanded;

  return (
    <div>
      {hasChildren ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group ${
            isCollapsed ? 'justify-center' : ''
          } ${
            isExpanded
              ? 'bg-slate-800 border-l-2 border-blue-500'
              : 'hover:bg-slate-800'
          }`}
        >
          <span className={`text-xl ${item.color}`}>{item.icon}</span>
          {!isCollapsed && (
            <>
              <span className={`text-sm font-medium text-slate-300 group-hover:text-white flex-1 text-left`}>
                {item.label}
              </span>
              <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </>
          )}
        </button>
      ) : (
        <Link
          href={item.href || '#'}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors group ${
            isCollapsed ? 'justify-center' : ''
          } ${
            isActive
              ? 'bg-slate-800 border-l-2 border-blue-500'
              : 'hover:bg-slate-800'
          }`}
        >
          <span className={`text-xl ${item.color}`}>{item.icon}</span>
          {!isCollapsed && (
            <span
              className={`text-sm font-medium ${
                isActive
                  ? 'text-white'
                  : 'text-slate-300 group-hover:text-white'
              }`}
            >
              {item.label}
            </span>
          )}
        </Link>
      )}

      {hasChildren && isExpanded && !isCollapsed && (
        <div className="space-y-1 mt-1 ml-2 border-l border-slate-700 pl-2">
          {item.children!.map((child) => (
            <MenuItemComponent key={child.href || child.label} item={child} isCollapsed={isCollapsed} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

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
              {section.items.map((item) => (
                <MenuItemComponent key={item.label} item={item} isCollapsed={isCollapsed} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
