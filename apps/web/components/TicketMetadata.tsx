'use client';

import { useState } from 'react';

interface TicketMetadataProps {
  ticket: {
    id: string;
    title: string;
    status: string;
    priority: string;
    progress: number;
    requester: { name: string; email: string };
    assignedTo: { id: string; name: string } | null;
    group: { id: string; name: string } | null;
    createdAt: string;
    updatedAt: string;
    closedAt: string | null;
  };
  onUpdate: (field: string, value: any) => Promise<void>;
  loading?: boolean;
}

const statusOptions = ['OPEN', 'IN_PROGRESS', 'WAITING', 'PAUSED', 'CLOSED'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TicketMetadata({ ticket, onUpdate, loading = false }: TicketMetadataProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (field: string, value: any) => {
    setUpdating(true);
    try {
      await onUpdate(field, value);
      setEditingField(null);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: 'bg-blue-900 text-blue-200',
      IN_PROGRESS: 'bg-yellow-900 text-yellow-200',
      WAITING: 'bg-purple-900 text-purple-200',
      CLOSED: 'bg-green-900 text-green-200',
      PAUSED: 'bg-gray-800 text-gray-200',
    };
    return colors[status] || 'bg-slate-700 text-slate-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-green-400',
      MEDIUM: 'text-yellow-400',
      HIGH: 'text-orange-400',
      URGENT: 'text-red-400',
    };
    return colors[priority] || 'text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{ticket.title}</h2>
        <p className="text-slate-400 text-xs font-mono">#{ticket.id}</p>
      </div>

      {/* Status - Editable */}
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
          Status
        </label>
        {editingField === 'status' ? (
          <select
            defaultValue={ticket.status}
            onChange={(e) => handleUpdate('status', e.target.value)}
            disabled={updating}
            autoFocus
            className="w-full bg-slate-800 border border-blue-500 rounded-lg px-3 py-2 text-slate-100 cursor-pointer"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace('_', ' ')}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setEditingField('status')}
            disabled={updating}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium ${getStatusColor(
              ticket.status,
            )} hover:opacity-80 transition-opacity`}
          >
            {ticket.status.replace('_', ' ')}
          </button>
        )}
      </div>

      {/* Priority - Editable */}
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
          Prioridade
        </label>
        {editingField === 'priority' ? (
          <select
            defaultValue={ticket.priority}
            onChange={(e) => handleUpdate('priority', e.target.value)}
            disabled={updating}
            autoFocus
            className="w-full bg-slate-800 border border-blue-500 rounded-lg px-3 py-2 text-slate-100 cursor-pointer"
          >
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setEditingField('priority')}
            disabled={updating}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium ${getPriorityColor(
              ticket.priority,
            )} hover:opacity-80 transition-opacity uppercase`}
          >
            {ticket.priority}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
          Progresso
        </label>
        <div className="space-y-2">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${ticket.progress}%` }}
            />
          </div>
          <p className="text-slate-300 text-sm text-right">{ticket.progress}%</p>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-6 space-y-4">
        {/* Requester */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
            Solicitante
          </label>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-slate-100 font-medium">{ticket.requester.name}</p>
            <p className="text-slate-400 text-sm">{ticket.requester.email}</p>
          </div>
        </div>

        {/* Assigned To */}
        {ticket.assignedTo ? (
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
              Atribuído a
            </label>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-100 font-medium">{ticket.assignedTo.name}</p>
              <button
                onClick={() => handleUpdate('assignedToId', null)}
                disabled={updating}
                className="text-xs text-slate-400 hover:text-red-400 mt-1 transition-colors"
              >
                Desatribuir
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
              Atribuído a
            </label>
            <button className="w-full text-left px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 border border-dashed border-slate-700 hover:border-slate-600 transition-colors text-sm">
              + Atribuir a
            </button>
          </div>
        )}

        {/* Group */}
        {ticket.group && (
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
              Grupo
            </label>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-100 font-medium">{ticket.group.name}</p>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="border-t border-slate-700 pt-4 space-y-2 text-xs text-slate-400">
          <p>Criado: {new Date(ticket.createdAt).toLocaleString('pt-BR')}</p>
          <p>Atualizado: {new Date(ticket.updatedAt).toLocaleString('pt-BR')}</p>
          {ticket.closedAt && (
            <p>Fechado: {new Date(ticket.closedAt).toLocaleString('pt-BR')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
