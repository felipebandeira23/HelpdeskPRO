'use client';

import { useState } from 'react';
import {
  STATUS_STYLES,
  STATUS_LABELS,
  PRIORITY_STYLES,
  PRIORITY_LABELS,
} from '@/components/ui';

interface TicketMetadataProps {
  ticket: {
    id: string;
    ticketNumber: number;
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
    contractStatus?: 'ACTIVE' | 'INACTIVE' | 'NO_CONTRACT';
    recentTickets?: { id: string; title: string; status: string }[];
    viewers?: { id: string; name: string; avatarUrl?: string }[];
    checklists?: { id: string; text: string; done: boolean }[];
  };
  onUpdate: (field: string, value: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  onSolve?: (solution: string) => Promise<void>;
  loading?: boolean;
}

const statusOptions = ['OPEN', 'IN_PROGRESS', 'WAITING', 'PAUSED', 'CLOSED'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TicketMetadata({ ticket, onUpdate, onDelete, onSolve, loading = false }: TicketMetadataProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [localProgress, setLocalProgress] = useState(ticket.progress);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [showSolveModal, setShowSolveModal] = useState(false);
  const [solutionText, setSolutionText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleUpdate = async (field: string, value: any) => {
    if (field === 'status' && value === 'PAUSED') {
      setShowPauseModal(true);
      return;
    }
    
    if (field === 'status' && value === 'CLOSED') {
      setShowSolveModal(true);
      return;
    }

    setUpdating(true);
    try {
      await onUpdate(field, value);
      setEditingField(null);
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2000);
    } finally {
      setUpdating(false);
    }
  };

  const handlePauseSubmit = async () => {
    if (!pauseReason.trim()) return;
    setUpdating(true);
    try {
      await onUpdate('status', 'PAUSED');
      await onUpdate('pauseReason', pauseReason);
      setShowPauseModal(false);
      setEditingField(null);
      setPauseReason('');
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2000);
    } finally {
      setUpdating(false);
    }
  };

  const handleSolveSubmit = async () => {
    if (!solutionText.trim() || !onSolve) return;
    setUpdating(true);
    try {
      await onSolve(solutionText);
      setShowSolveModal(false);
      setEditingField(null);
      setSolutionText('');
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!onDelete) return;
    setUpdating(true);
    try {
      await onDelete();
    } finally {
      setUpdating(false);
    }
  };

  const handleProgressChangeEnd = async () => {
    if (localProgress !== ticket.progress) {
      await handleUpdate('progress', localProgress);
    }
  };

  const handleChecklistToggle = async (checklistId: string, currentDone: boolean) => {
    // Optimistic or just trigger update
    const updatedChecklists = ticket.checklists?.map(c => 
      c.id === checklistId ? { ...c, done: !currentDone } : c
    );
    
    // Auto-calculate progress if we have checklists
    if (updatedChecklists && updatedChecklists.length > 0) {
      const completed = updatedChecklists.filter(c => c.done).length;
      const newProgress = Math.round((completed / updatedChecklists.length) * 100);
      setLocalProgress(newProgress);
      
      // Update both
      await onUpdate('checklists', updatedChecklists);
      await onUpdate('progress', newProgress);
    } else {
      await onUpdate('checklists', updatedChecklists);
    }
  };

  // Cores/labels vêm da fonte única em components/ui (border incluso).
  const getStatusColor = (status: string) =>
    `border ${STATUS_STYLES[status] || 'bg-slate-500/15 text-slate-300 border-slate-500/30'}`;

  const getPriorityColor = (priority: string) =>
    PRIORITY_STYLES[priority]?.split(' ').find((c) => c.startsWith('text-')) ||
    'text-slate-300';

  const getContractStatusColor = (status?: string) => {
    if (status === 'ACTIVE') return 'bg-green-500/20 text-green-400 border border-green-500/30';
    if (status === 'INACTIVE') return 'bg-red-500/20 text-red-400 border border-red-500/30';
    return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  };

  const getContractStatusLabel = (status?: string) => {
    if (status === 'ACTIVE') return 'Contrato Ativo';
    if (status === 'INACTIVE') return 'Inadimplente';
    return 'Sem Contrato';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold text-white">{ticket.title}</h2>
          {showSavedFeedback && (
            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded animate-pulse">
              ✓ Salvo
            </span>
          )}
        </div>
        <p className="text-slate-400 text-xs font-mono">#{ticket.ticketNumber}</p>
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
                {STATUS_LABELS[option] || option}
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
            {STATUS_LABELS[ticket.status] || ticket.status}
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
                {PRIORITY_LABELS[option] || option}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setEditingField('priority')}
            disabled={updating}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium ${getPriorityColor(
              ticket.priority,
            )} hover:opacity-80 transition-opacity`}
          >
            {PRIORITY_LABELS[ticket.priority] || ticket.priority}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
          Progresso ({localProgress}%)
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={localProgress}
            onChange={(e) => setLocalProgress(parseInt(e.target.value))}
            onMouseUp={handleProgressChangeEnd}
            onTouchEnd={handleProgressChangeEnd}
            disabled={updating}
            className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Checklists */}
      {ticket.checklists && ticket.checklists.length > 0 && (
        <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
          <label className="block text-xs font-medium text-slate-400 uppercase mb-3">
            Checklist de Atendimento
          </label>
          <div className="space-y-2">
            {ticket.checklists.map((item) => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-start pt-0.5">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => handleChecklistToggle(item.id, item.done)}
                    disabled={updating}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 transition-colors"
                  />
                </div>
                <span className={`text-sm transition-colors ${item.done ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-slate-200'}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-slate-700 pt-6 space-y-4">
        {/* Requester & Contract Status */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
            Solicitante
          </label>
          <div className="bg-slate-800/50 rounded-lg p-3 space-y-3 border border-slate-700/50">
            <div>
              <p className="text-slate-100 font-medium">{ticket.requester.name}</p>
              <p className="text-slate-400 text-sm">{ticket.requester.email}</p>
            </div>
            
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getContractStatusColor(ticket.contractStatus)}`}>
              {getContractStatusLabel(ticket.contractStatus)}
            </div>
          </div>
        </div>

        {/* Effort & Billing (Apontamento de Horas) */}
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
            Esforço e Faturamento
          </label>
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-300">Horas Apontadas:</span>
              <span className="text-sm font-bold font-mono text-white">
                {String(Math.floor(((localProgress / 5) * 15) / 60)).padStart(2, '0')}h {String(((localProgress / 5) * 15) % 60).padStart(2, '0')}m
              </span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-3">
              <div className="bg-blue-500 h-full" style={{ width: `${localProgress}%` }}></div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
              <span className="text-sm text-slate-400">Custo Estimado:</span>
              <span className="text-sm font-bold text-green-400">
                {(((localProgress / 5) * 15) / 60 * 150).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            {ticket.contractStatus === 'INACTIVE' && (
              <p className="text-[10px] text-red-400 mt-2 font-medium bg-red-900/20 p-1.5 rounded border border-red-900/50">
                Atenção: Contrato Inadimplente. Este serviço será cobrado avulso se autorizado.
              </p>
            )}
          </div>
        </div>

        {/* Recent Tickets from Requester */}
        {ticket.recentTickets && ticket.recentTickets.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
              Últimos tickets deste cliente
            </label>
            <div className="space-y-2">
              {ticket.recentTickets.map(rt => (
                <div key={rt.id} className="bg-slate-800/30 hover:bg-slate-800/60 p-2 rounded-lg border border-slate-700/50 transition-colors text-sm cursor-pointer">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300 text-xs font-mono">#{rt.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStatusColor(rt.status)}`}>
                      {rt.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-200 line-clamp-1">{rt.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Viewers */}
        {ticket.viewers && ticket.viewers.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase mb-2">
              Quem viu este ticket
            </label>
            <div className="flex flex-wrap gap-2">
              {ticket.viewers.map(viewer => (
                <div key={viewer.id} title={viewer.name} className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs text-slate-300 font-medium uppercase cursor-help hover:ring-2 hover:ring-blue-500 transition-all">
                  {viewer.avatarUrl ? (
                    <img src={viewer.avatarUrl} alt={viewer.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    viewer.name.substring(0, 2)
                  )}
                </div>
              ))}
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

        {/* Delete Button */}
        {onDelete && (
          <div className="border-t border-slate-700 pt-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={updating}
              className="w-full py-2 text-sm text-red-400 border border-red-900/50 hover:bg-red-900/20 rounded-lg transition-colors font-medium"
            >
              Excluir Ticket
            </button>
          </div>
        )}
      </div>

      {/* Pause Reason Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Pausar Ticket</h3>
            <p className="text-slate-400 text-sm mb-4">
              Ao pausar um ticket, o tempo de SLA para de contar. Por favor, insira o motivo da pausa (obrigatório).
            </p>
            
            <textarea
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="Ex: Aguardando peça do fornecedor..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 min-h-[100px] mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
            />
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPauseModal(false);
                  setEditingField(null);
                  setPauseReason('');
                }}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handlePauseSubmit}
                disabled={!pauseReason.trim() || updating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
              >
                {updating ? 'Salvando...' : 'Confirmar Pausa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Solve Reason Modal */}
      {showSolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Solucionar Ticket</h3>
            <p className="text-slate-400 text-sm mb-4">
              Por favor, descreva a solução aplicada a este ticket antes de fechá-lo.
            </p>
            
            <textarea
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              placeholder="Ex: Atualizei o driver e reiniciei a máquina..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 min-h-[100px] mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              autoFocus
            />
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSolveModal(false);
                  setEditingField(null);
                  setSolutionText('');
                }}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSolveSubmit}
                disabled={!solutionText.trim() || updating}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
              >
                {updating ? 'Salvando...' : 'Solucionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Excluir Ticket</h3>
            <p className="text-slate-400 text-sm mb-6">
              Tem certeza que deseja excluir o ticket <strong>#{ticket.id}</strong>? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={updating}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg transition-colors font-medium text-sm"
              >
                {updating ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
