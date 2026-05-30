'use client';

import Link from 'next/link';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  createdAt: string;
  requester: { name: string };
  assignedTo?: { name: string } | null;
}

interface TicketCardsViewProps {
  tickets: Ticket[];
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-green-500',
  };
  return colors[priority] || 'bg-slate-500';
};

export default function TicketCardsView({ tickets }: TicketCardsViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {tickets.map(ticket => (
        <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
          <div className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition cursor-pointer border border-slate-700">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold flex-1 line-clamp-2">{ticket.title}</h3>
              <span className={`${getPriorityColor(ticket.priority)} text-white text-xs px-2 py-1 rounded ml-2 flex-shrink-0`}>
                {ticket.priority}
              </span>
            </div>

            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{ticket.description}</p>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Progresso</span>
                <span className="text-slate-300">{ticket.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${ticket.progress}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{ticket.requester.name}</span>
              <span>#{ticket.id.slice(0, 8)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
