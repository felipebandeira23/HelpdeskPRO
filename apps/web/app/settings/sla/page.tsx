'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PageHeader, Panel, Button, Modal, Field, Input } from '@/components/ui';

interface SLARule {
  id: number;
  name: string;
  criteria: string;
  response: string;
  solution: string;
  active: boolean;
}

export default function SLAPage() {
  const [slaRules, setSlaRules] = useState<SLARule[]>([
    { id: 1, name: 'SLA Prioridade Urgente', criteria: 'Prioridade = URGENTE', response: '15m', solution: '4h', active: true },
    { id: 2, name: 'SLA Prioridade Alta', criteria: 'Prioridade = ALTA', response: '30m', solution: '8h', active: true },
    { id: 3, name: 'SLA Contrato Premium', criteria: 'Cliente.Contrato = Premium', response: '1h', solution: '24h', active: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SLARule | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCriteria, setFormCriteria] = useState('');
  const [formResponse, setFormResponse] = useState('');
  const [formSolution, setFormSolution] = useState('');
  const [formActive, setFormActive] = useState(true);

  const openCreateModal = () => {
    setEditingRule(null);
    setFormName('');
    setFormCriteria('');
    setFormResponse('');
    setFormSolution('');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: SLARule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormCriteria(rule.criteria);
    setFormResponse(rule.response);
    setFormSolution(rule.solution);
    setFormActive(rule.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCriteria || !formResponse || !formSolution) return;
    
    if (editingRule) {
      // Edit
      setSlaRules(slaRules.map(r => r.id === editingRule.id ? {
        ...r,
        name: formName,
        criteria: formCriteria,
        response: formResponse,
        solution: formSolution,
        active: formActive
      } : r));
    } else {
      // Create
      const newId = slaRules.length > 0 ? Math.max(...slaRules.map(r => r.id)) + 1 : 1;
      setSlaRules([...slaRules, {
        id: newId,
        name: formName,
        criteria: formCriteria,
        response: formResponse,
        solution: formSolution,
        active: formActive
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta regra de SLA?')) {
      setSlaRules(slaRules.filter(r => r.id !== id));
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <Link href="/settings" className="text-sm text-blue-400 mb-4 inline-block hover:text-blue-300">← Voltar para Configurações</Link>
      
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Motor de SLA" subtitle="Gerenciamento de Acordos de Nível de Serviço" />
        <Button variant="primary" onClick={openCreateModal}>+ Criar Regra SLA</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 overflow-y-auto">
          <Panel>
            <h2 className="text-lg font-bold text-white mb-4">Políticas Ativas</h2>
            <div className="space-y-4">
              {slaRules.map(rule => (
                <div key={rule.id} className="bg-slate-900 border border-slate-700 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-500 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white">{rule.name}</h3>
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${rule.active ? 'bg-green-900/30 text-green-400 border border-green-700/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                        {rule.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center text-sm">
                      <span className="text-slate-500">Se</span>
                      <span className="bg-slate-800 text-blue-400 px-2 py-0.5 rounded font-mono text-xs">{rule.criteria}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="text-center bg-slate-800/50 px-3 py-2 rounded">
                      <div className="text-xs text-slate-500 uppercase font-bold">Resposta</div>
                      <div className="text-lg font-bold text-amber-400">{rule.response}</div>
                    </div>
                    <div className="text-center bg-slate-800/50 px-3 py-2 rounded">
                      <div className="text-xs text-slate-500 uppercase font-bold">Solução</div>
                      <div className="text-lg font-bold text-green-400">{rule.solution}</div>
                    </div>
                    <div className="flex flex-col gap-2 ml-2 justify-center">
                      <span onClick={() => openEditModal(rule)} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm" title="Editar">✏️</span>
                      <span onClick={() => handleDelete(rule.id)} className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer text-sm" title="Excluir">🗑️</span>
                    </div>
                  </div>
                </div>
              ))}
              {slaRules.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-lg">Nenhuma regra de SLA configurada</div>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-6 overflow-y-auto">
          <Panel>
            <h2 className="text-lg font-bold text-white mb-4">Horário de Atendimento</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
                <span className="text-slate-300">Dias Úteis (Seg - Sex)</span>
                <span className="font-mono text-white bg-slate-800 px-2 py-1 rounded">08:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
                <span className="text-slate-300">Sábados</span>
                <span className="font-mono text-white bg-slate-800 px-2 py-1 rounded">08:00 - 12:00</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Domingos e Feriados</span>
                <span className="font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">Sem Expediente</span>
              </div>
            </div>
            <button className="w-full mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">Editar Calendário / Feriados</button>
          </Panel>

          <Panel>
            <h2 className="text-lg font-bold text-white mb-4">Regra de Pausa de SLA</h2>
            <p className="text-sm text-slate-400 mb-4">Quais status pausam a contagem regressiva do SLA?</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
                <span className="text-slate-300 text-sm">Aguardando Cliente</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
                <span className="text-slate-300 text-sm">Aguardando Fornecedor / Terceiro</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors">
                <input type="checkbox" className="w-4 h-4 accent-blue-500" />
                <span className="text-slate-300 text-sm">Em Análise Técnica</span>
              </label>
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? 'Editar Regra de SLA' : 'Criar Regra de SLA'}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={!formName || !formCriteria || !formResponse || !formSolution}>Salvar</Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Nome da Política" required>
            <Input
              type="text"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="Ex: SLA Prioridade Alta"
            />
          </Field>
          <Field label="Critério (Filtro)" required>
            <Input
              type="text"
              value={formCriteria}
              onChange={e => setFormCriteria(e.target.value)}
              placeholder="Ex: Prioridade = HIGH"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tempo de Resposta" required>
              <Input
                type="text"
                value={formResponse}
                onChange={e => setFormResponse(e.target.value)}
                placeholder="Ex: 30m"
              />
            </Field>
            <Field label="Tempo de Solução" required>
              <Input
                type="text"
                value={formSolution}
                onChange={e => setFormSolution(e.target.value)}
                placeholder="Ex: 8h"
              />
            </Field>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="rule-active"
              checked={formActive}
              onChange={e => setFormActive(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="rule-active" className="text-slate-300 text-sm font-medium cursor-pointer">Ativar esta regra</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
