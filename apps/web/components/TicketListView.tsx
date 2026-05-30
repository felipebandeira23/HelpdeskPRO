'use client';

import Link from 'next/link';

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  progress: number;
  requester: { name: string };
  assignedTo?: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketListViewProps {
  tickets: Ticket[];
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    OPEN: 'bg-blue-900 text-blue-200',
    IN_PROGRESS: 'bg-yellow-900 text-yellow-200',
    WAITING: 'bg-orange-900 text-orange-200',
    CLOSED: 'bg-green-900 text-green-200',
  };
  return colors[status] || 'bg-slate-700 text-slate-200';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

export default function TicketListView({ tickets }: TicketListViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-800 border-b border-slate-700 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-slate-300 font-semibold">#ID</th>
            <th className="px-4 py-3 text-left text-slate-300 font-semibold">Título</th>
            <th className="px-4 py-3 text-center text-slate-300 font-semibold">Status</th>
            <th className="px-4 py-3 text-center text-slate-300 font-semibold">Prioridade</th>
            <th className="px-4 py-3 text-center text-slate-300 font-semibold">Progresso</th>
            <th className="px-4 py-3 text-left text-slate-300 font-semibold">Requerente</th>
            <th className="px-4 py-3 text-left text-slate-300 font-semibold">Atualizado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {tickets.map(ticket => (
            <tr key={ticket.id} className="hover:bg-slate-800 transition">
              <td className="px-4 py-3">
                <Link href={`/tickets/${ticket.id}`} className="text-blue-400 hover:text-blue-300">
                  #{ticket.id.slice(0, 8)}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Link href={`/tickets/${ticket.id}`} className="text-white hover:text-blue-300 line-clamp-1">
                  {ticket.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-slate-300 text-xs font-medium">{ticket.priority}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-700 rounded h-2">
                    <div
                      className="bg-blue-500 h-2 rounded transition-all"
                      style={{ width: `${ticket.progress}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-xs w-8 text-right">{ticket.progress}%</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-slate-300 text-xs">{ticket.requester.name}</span>
              </td>
              <td className="px-4 py-3">
                <span className="text-slate-400 text-xs">{formatDate(ticket.updatedAt)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
