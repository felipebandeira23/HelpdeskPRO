'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function TopBar() {
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HD</span>
          </div>
          <span className="font-bold text-lg text-white hidden sm:inline">HelpdeskPRO</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar tickets..."
            className="bg-transparent text-sm text-slate-200 placeholder-slate-400 outline-none w-48"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <span>+</span>
          Novo Ticket
        </button>

        <button className="hidden sm:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-colors">
          <span>+</span>
          Nova Tarefa
        </button>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm hover:shadow-lg transition-shadow"
        >
          {user.name.charAt(0).toUpperCase()}
          {showMenu && (
            <div className="absolute top-12 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg min-w-48 py-2">
              <div className="px-4 py-2 border-b border-slate-700">
                <p className="text-slate-200 text-sm font-medium">{user.name}</p>
                <p className="text-slate-400 text-xs">{user.email}</p>
              </div>
              <button className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-200 text-sm">
                Meu Perfil
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-200 text-sm">
                Configurações
              </button>
              <hr className="border-slate-700 my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-slate-700 text-red-400 text-sm"
              >
                Sair
              </button>
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
