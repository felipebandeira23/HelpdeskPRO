'use client';

import { useState } from 'react';

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface TicketKanbanProps {
  tickets: Ticket[];
  onStatusChange?: (ticketId: string, status: string) => void;
}

export default function TicketKanban({ tickets, onStatusChange }: TicketKanbanProps) {
  const statuses = ['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED'];

  const groupedTickets = statuses.reduce(
    (acc, status) => {
      acc[status] = tickets.filter(t => t.status === status);
      return acc;
    },
    {} as Record<string, Ticket[]>,
  );

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {statuses.map(status => (
        <div key={status} className="flex-shrink-0 w-80 bg-slate-800 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-4">{status}</h3>
          <div className="space-y-3">
            {groupedTickets[status]?.map(ticket => (
              <div
                key={ticket.id}
                className="bg-slate-700 p-3 rounded cursor-move hover:bg-slate-600"
                draggable
              >
                <p className="text-white text-sm font-medium">{ticket.title}</p>
                <p className="text-slate-400 text-xs mt-1">#{ticket.id}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
