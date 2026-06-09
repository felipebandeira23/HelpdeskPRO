'use client';
import { useState } from 'react';
import { PageHeader, Panel, Button, Modal, Field, Input } from '@/components/ui';

interface RecurringTicket {
  id: string;
  title: string;
  frequency: string;
  nextRun: string;
  assignedTo: string;
  active: boolean;
}

export default function RecurringTicketsPage() {
  const [recurring, setRecurring] = useState<RecurringTicket[]>([
    { id: '1', title: 'Manutenção Preventiva - Ar Condicionado Labs', frequency: 'A cada 6 Meses', nextRun: '2026-12-01 08:00', assignedTo: 'Equipe de Infra', active: true },
    { id: '2', title: 'Verificação Lâmpadas Datashow', frequency: 'Toda Sexta-feira', nextRun: '2026-06-12 14:00', assignedTo: 'Suporte N1', active: true },
    { id: '3', title: 'Limpeza de Cache Servidor Moodle', frequency: '1º Dia do Mês', nextRun: '2026-07-01 03:00', assignedTo: 'Suporte N3', active: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTicket | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formFrequency, setFormFrequency] = useState('');
  const [formNextRun, setFormNextRun] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formActive, setFormActive] = useState(true);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormFrequency('');
    setFormNextRun('');
    setFormAssignedTo('');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: RecurringTicket) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormFrequency(item.frequency);
    setFormNextRun(item.nextRun);
    setFormAssignedTo(item.assignedTo);
    setFormActive(item.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formFrequency || !formNextRun || !formAssignedTo) return;

    if (editingItem) {
      // Edit
      setRecurring(recurring.map(item => item.id === editingItem.id ? {
        ...item,
        title: formTitle,
        frequency: formFrequency,
        nextRun: formNextRun,
        assignedTo: formAssignedTo,
        active: formActive
      } : item));
    } else {
      // Create
      const newId = String(recurring.length > 0 ? Math.max(...recurring.map(r => parseInt(r.id))) + 1 : 1);
      setRecurring([...recurring, {
        id: newId,
        title: formTitle,
        frequency: formFrequency,
        nextRun: formNextRun,
        assignedTo: formAssignedTo,
        active: formActive
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento recorrente?')) {
      setRecurring(recurring.filter(r => r.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setRecurring(recurring.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Chamados Recorrentes" subtitle="Agendamento automático de demandas e manutenções preventivas" />
        <Button variant="primary" onClick={openCreateModal}>
          + Novo Agendamento
        </Button>
      </div>

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
                      <input type="checkbox" className="sr-only peer" checked={rec.active} onChange={() => handleToggleActive(rec.id)} />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => openEditModal(rec)} className="text-blue-400 hover:text-blue-300 text-sm font-medium mr-4">Editar</button>
                    <button onClick={() => handleDelete(rec.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Excluir</button>
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

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Editar Agendamento' : 'Novo Agendamento Recorrente'}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={!formTitle || !formFrequency || !formNextRun || !formAssignedTo}>Salvar</Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Título do Chamado" required>
            <Input
              type="text"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="Ex: Backup Semanal Servidor"
            />
          </Field>
          <Field label="Frequência / Intervalo" required>
            <Input
              type="text"
              value={formFrequency}
              onChange={e => setFormFrequency(e.target.value)}
              placeholder="Ex: Todo Domingo, A cada 15 dias"
            />
          </Field>
          <Field label="Próxima Execução (Data/Hora)" required>
            <Input
              type="text"
              value={formNextRun}
              onChange={e => setFormNextRun(e.target.value)}
              placeholder="Ex: 2026-06-15 08:00"
            />
          </Field>
          <Field label="Atribuir a (Grupo/Técnico)" required>
            <Input
              type="text"
              value={formAssignedTo}
              onChange={e => setFormAssignedTo(e.target.value)}
              placeholder="Ex: Suporte N1, Infraestrutura"
            />
          </Field>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="rec-active"
              checked={formActive}
              onChange={e => setFormActive(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="rec-active" className="text-slate-300 text-sm font-medium cursor-pointer">Agendamento ativo</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
