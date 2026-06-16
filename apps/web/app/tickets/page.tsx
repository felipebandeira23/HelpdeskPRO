'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CreateTicketModal } from '@/components/CreateTicketModal';
import { STATUS_LABELS, PRIORITY_LABELS, Panel, Modal, Field, Input, Select, Button } from '@/components/ui';

interface Ticket {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  requester: { name: string };
  assignedTo: { name: string } | null;
  createdAt: string;
}

interface RecurringTicket {
  id: string;
  title: string;
  frequency: string;
  nextRun: string;
  assignedTo: string;
  active: boolean;
}

const ITEMS_PER_PAGE = 20;

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'recurring'>('tickets');

  // Tickets States
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [currentPage, setCurrentPage] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState<{
    total: number;
    hasMore: boolean;
  }>({ total: 0, hasMore: false });

  // Recurring Tickets States
  const [recurring, setRecurring] = useState<RecurringTicket[]>([
    { id: '1', title: 'Manutenção Preventiva - Ar Condicionado Labs', frequency: 'A cada 6 Meses', nextRun: '2026-12-01 08:00', assignedTo: 'Equipe de Infra', active: true },
    { id: '2', title: 'Verificação Lâmpadas Datashow', frequency: 'Toda Sexta-feira', nextRun: '2026-06-12 14:00', assignedTo: 'Suporte N1', active: true },
    { id: '3', title: 'Limpeza de Cache Servidor Moodle', frequency: '1º Dia do Mês', nextRun: '2026-07-01 03:00', assignedTo: 'Suporte N3', active: false },
  ]);
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [editingRecItem, setEditingRecItem] = useState<RecurringTicket | null>(null);

  // Recurring Form States
  const [recTitle, setRecTitle] = useState('');
  const [recFrequency, setRecFrequency] = useState('');
  const [recNextRun, setRecNextRun] = useState('');
  const [recAssignedTo, setRecAssignedTo] = useState('');
  const [recActive, setRecActive] = useState(true);

  useEffect(() => {
    setCurrentPage(0);
    loadTickets(0);
    const handleTicketCreated = () => {
      setCurrentPage(0);
      loadTickets(0);
    };
    window.addEventListener('ticket-created', handleTicketCreated);
    return () => window.removeEventListener('ticket-created', handleTicketCreated);
  }, [filter]);

  const loadTickets = async (page: number) => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter.toUpperCase();
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('skip', String(page * ITEMS_PER_PAGE));
      params.append('take', String(ITEMS_PER_PAGE));

      const data = await api.get<any>(`/api/tickets?${params}`);
      setTickets(data.data || []);
      setPaginationInfo({
        total: data.pagination?.total || 0,
        hasMore: data.pagination?.hasMore || false,
      });
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadTickets();
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-blue-400',
      MEDIUM: 'text-yellow-400',
      HIGH: 'text-orange-400',
      URGENT: 'text-red-400',
    };
    return colors[priority] || 'text-gray-400';
  };

  // Recurring Actions
  const openCreateRecModal = () => {
    setEditingRecItem(null);
    setRecTitle('');
    setRecFrequency('');
    setRecNextRun('');
    setRecAssignedTo('');
    setRecActive(true);
    setIsRecModalOpen(true);
  };

  const openEditRecModal = (item: RecurringTicket) => {
    setEditingRecItem(item);
    setRecTitle(item.title);
    setRecFrequency(item.frequency);
    setRecNextRun(item.nextRun);
    setRecAssignedTo(item.assignedTo);
    setRecActive(item.active);
    setIsRecModalOpen(true);
  };

  const handleSaveRec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle || !recFrequency || !recNextRun || !recAssignedTo) return;

    if (editingRecItem) {
      setRecurring(recurring.map(item => item.id === editingRecItem.id ? {
        ...item,
        title: recTitle,
        frequency: recFrequency,
        nextRun: recNextRun,
        assignedTo: recAssignedTo,
        active: recActive
      } : item));
    } else {
      const newId = String(recurring.length > 0 ? Math.max(...recurring.map(r => parseInt(r.id))) + 1 : 1);
      setRecurring([...recurring, {
        id: newId,
        title: recTitle,
        frequency: recFrequency,
        nextRun: recNextRun,
        assignedTo: recAssignedTo,
        active: recActive
      }]);
    }
    setIsRecModalOpen(false);
  };

  const handleDeleteRec = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento recorrente?')) {
      setRecurring(recurring.filter(r => r.id !== id));
    }
  };

  const handleToggleRecActive = (id: string) => {
    setRecurring(recurring.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="p-8">
      {/* Top Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tickets</h1>
          <p className="text-slate-400">Gerencie chamados de suporte e preventivas automáticas</p>
        </div>
        {activeTab === 'tickets' ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            + Novo Ticket
          </button>
        ) : (
          <Button variant="primary" onClick={openCreateRecModal}>
            + Novo Agendamento
          </Button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-700 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${
            activeTab === 'tickets' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🎟️ Chamados
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`pb-3 font-semibold text-sm transition-colors relative ${
            activeTab === 'recurring' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🔄 Agendamentos Recorrentes
        </button>
      </div>

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* TAB CONTENT: TICKETS */}
      {activeTab === 'tickets' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              {(['all', 'open', 'in-progress', 'closed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'open' ? 'Abertos' : f === 'in-progress' ? 'Em Andamento' : 'Fechados'}
                </button>
              ))}
            </div>
            
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                ≡ Lista
              </button>
              <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${viewMode === 'kanban' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                ◫ Kanban
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Carregando tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Nenhum ticket encontrado</div>
          ) : viewMode === 'list' ? (
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
              <table className="w-full">
                <thead className="bg-slate-800/80 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">ID</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">Título do Chamado</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">Status</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">Prioridade</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">SLA Progresso</th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider font-bold text-slate-400">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-800/60 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                        <Link href={`/tickets/${ticket.id}`} className="hover:text-blue-400 transition-colors">
                          #{ticket.ticketNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200 font-medium">
                        <Link href={`/tickets/${ticket.id}`} className="hover:text-blue-400 transition-colors">
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border border-transparent ${
                          ticket.status === 'OPEN' ? 'bg-blue-900/30 text-blue-400 border-blue-700/30' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/30' :
                          ticket.status === 'CLOSED' ? 'bg-green-900/30 text-green-400 border-green-700/30' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {STATUS_LABELS[ticket.status] || ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-bold text-[11px] uppercase ${getPriorityColor(ticket.priority)}`}>
                          {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${ticket.progress > 80 ? 'bg-red-500' : ticket.progress > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${ticket.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{ticket.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center text-[10px] text-blue-200 font-bold" title={ticket.assignedTo.name}>
                              {ticket.assignedTo.name.substring(0,2).toUpperCase()}
                            </div>
                            <span className="text-slate-300">{ticket.assignedTo.name.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-xs">Não atribuído</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 min-h-[60vh]">
              {['OPEN', 'IN_PROGRESS', 'WAITING', 'PAUSED', 'RESOLVED', 'CLOSED'].map(statusCol => {
                const colTickets = tickets.filter(t => t.status === statusCol);
                const statusColors: Record<string, { border: string; label: string }> = {
                  OPEN: { border: 'border-blue-500', label: 'Abertos' },
                  IN_PROGRESS: { border: 'border-yellow-500', label: 'Em Andamento' },
                  WAITING: { border: 'border-purple-500', label: 'Aguardando' },
                  PAUSED: { border: 'border-orange-500', label: 'Pausados' },
                  RESOLVED: { border: 'border-teal-500', label: 'Resolvidos' },
                  CLOSED: { border: 'border-green-500', label: 'Fechados' },
                };
                return (
                  <div key={statusCol} className="flex-1 min-w-[260px] md:min-w-[320px] bg-slate-900/40 rounded-xl border border-slate-700/50 flex flex-col">
                    <div className={`p-4 border-t-4 rounded-t-xl bg-slate-800/60 ${statusColors[statusCol]?.border}`}>
                      <h3 className="text-white font-bold flex items-center gap-2">
                        {statusColors[statusCol]?.label}
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{colTickets.length}</span>
                      </h3>
                    </div>
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {colTickets.map(ticket => (
                        <div key={ticket.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-500 transition-colors shadow-lg shadow-black/20 cursor-pointer group">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                              ticket.priority === 'URGENT' ? 'bg-red-900/30 text-red-400 border-red-700/30' :
                              ticket.priority === 'HIGH' ? 'bg-orange-900/30 text-orange-400 border-orange-700/30' :
                              ticket.priority === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/30' :
                              'bg-blue-900/30 text-blue-400 border-blue-700/30'
                            }`}>
                              {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                            </span>
                            <Link href={`/tickets/${ticket.id}`} className="text-xs text-slate-500 hover:text-blue-400">#{ticket.ticketNumber}</Link>
                          </div>
                          <Link href={`/tickets/${ticket.id}`} className="block">
                            <h4 className="text-slate-200 font-medium mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">{ticket.title}</h4>
                          </Link>
                          
                          {/* SLA Progress Bar Mini */}
                          <div className="w-full h-1 bg-slate-700 rounded-full mb-4 overflow-hidden">
                            <div className={`h-full ${ticket.progress > 80 ? 'bg-red-500' : ticket.progress > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${ticket.progress}%` }}></div>
                          </div>

                          <div className="flex justify-between items-center mt-2 border-t border-slate-700/50 pt-3">
                            {ticket.assignedTo ? (
                              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white" title={ticket.assignedTo.name}>
                                {ticket.assignedTo.name.substring(0,2).toUpperCase()}
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border border-dashed border-slate-500 flex items-center justify-center text-slate-500 text-xs" title="Sem atribuição">?</div>
                            )}
                            <span className="text-[10px] text-slate-500">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      ))}
                      {colTickets.length === 0 && (
                         <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-lg">Nenhum ticket</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && tickets.length > 0 && (
            <div className="flex items-center justify-between mt-6 px-4 py-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div className="text-sm text-slate-400">
                Página <span className="font-bold text-white">{currentPage + 1}</span> de{' '}
                <span className="font-bold text-white">{Math.ceil(paginationInfo.total / ITEMS_PER_PAGE)}</span> •{' '}
                <span className="font-bold text-white">{paginationInfo.total}</span> tickets no total
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCurrentPage(Math.max(0, currentPage - 1));
                    loadTickets(Math.max(0, currentPage - 1));
                  }}
                  disabled={currentPage === 0}
                  className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded-lg transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => {
                    if (paginationInfo.hasMore) {
                      setCurrentPage(currentPage + 1);
                      loadTickets(currentPage + 1);
                    }
                  }}
                  disabled={!paginationInfo.hasMore}
                  className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded-lg transition-colors"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB CONTENT: RECURRING TICKETS */}
      {activeTab === 'recurring' && (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider bg-slate-800/30">
                  <th className="py-3 px-4 font-bold rounded-tl-lg">Gatilho (Título do Ticket)</th>
                  <th className="py-3 px-4 font-bold">Frequência</th>
                  <th className="py-3 px-4 font-bold">Próxima Execução</th>
                  <th className="py-3 px-4 font-bold">Atribuir Para</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right rounded-tr-lg">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recurring.map(rec => (
                  <tr key={rec.id} className={`transition-colors ${rec.active ? 'hover:bg-slate-800/50' : 'bg-slate-900/50 opacity-60'}`}>
                    <td className="py-4 px-4 text-white font-medium flex items-center gap-3">
                      <span className="text-blue-400">🕒</span>
                      {rec.title}
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded font-medium border border-slate-700">
                        {rec.frequency}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300">
                      {rec.nextRun}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-900 flex items-center justify-center text-[10px] text-indigo-200 border border-indigo-700">
                          {rec.assignedTo.substring(0, 2).toUpperCase()}
                        </div>
                        {rec.assignedTo}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={rec.active} onChange={() => handleToggleRecActive(rec.id)} />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => openEditRecModal(rec)} className="text-blue-400 hover:text-blue-300 text-sm font-medium mr-4">Editar</button>
                      <button onClick={() => handleDeleteRec(rec.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Excluir</button>
                    </td>
                  </tr>
                ))}
                {recurring.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 text-sm">Nenhum chamado recorrente agendado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* RECURRING MODAL */}
      <Modal
        open={isRecModalOpen}
        onClose={() => setIsRecModalOpen(false)}
        title={editingRecItem ? 'Editar Agendamento' : 'Novo Agendamento Recorrente'}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsRecModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveRec} disabled={!recTitle || !recFrequency || !recNextRun || !recAssignedTo}>Salvar</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveRec} className="space-y-4">
          <Field label="Título do Chamado" required>
            <Input
              type="text"
              value={recTitle}
              onChange={e => setRecTitle(e.target.value)}
              placeholder="Ex: Backup Semanal Servidor"
            />
          </Field>
          <Field label="Frequência / Intervalo" required>
            <Input
              type="text"
              value={recFrequency}
              onChange={e => setRecFrequency(e.target.value)}
              placeholder="Ex: Todo Domingo, A cada 15 dias"
            />
          </Field>
          <Field label="Próxima Execução (Data/Hora)" required>
            <Input
              type="text"
              value={recNextRun}
              onChange={e => setRecNextRun(e.target.value)}
              placeholder="Ex: 2026-06-15 08:00"
            />
          </Field>
          <Field label="Atribuir a (Grupo/Técnico)" required>
            <Input
              type="text"
              value={recAssignedTo}
              onChange={e => setRecAssignedTo(e.target.value)}
              placeholder="Ex: Suporte N1, Infraestrutura"
            />
          </Field>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="rec-active"
              checked={recActive}
              onChange={e => setRecActive(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="rec-active" className="text-slate-300 text-sm font-medium cursor-pointer">Agendamento ativo</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
