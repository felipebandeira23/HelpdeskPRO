'use client';

import { useEffect, useState } from 'react';
import { PageHeader, Panel, Button, Field, Input, Modal } from '@/components/ui';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condField: string;
  condOp: string;
  condVal: string;
  action: string;
  active: boolean;
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  label: string;
  detail: string;
  x: number;
  y: number;
}

const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'r1',
    name: 'Alerta de SLA Estourado',
    trigger: 'Gatilho baseado em Tempo (SLA)',
    condField: 'Tempo restante SLA',
    condOp: '<',
    condVal: '0',
    action: 'Notificar NOC por Telegram',
    active: true,
  },
  {
    id: 'r2',
    name: 'Auto-Atribuição de Impressoras',
    trigger: 'Quando um ticket for criado',
    condField: 'Categoria',
    condOp: '=',
    condVal: 'Impressoras',
    action: 'Alterar Atribuição para Suporte Faturamento',
    active: true,
  }
];

const DEFAULT_NODES: WorkflowNode[] = [
  { id: 'n1', type: 'trigger', label: 'Quando Ticket Criado', detail: 'Qualquer categoria', x: 80, y: 120 },
  { id: 'n2', type: 'condition', label: 'Prioridade = Alta', detail: 'Critério de Urgência', x: 340, y: 80 },
  { id: 'n3', type: 'condition', label: 'Categoria = Redes', detail: 'Critério de Infra', x: 340, y: 220 },
  { id: 'n4', type: 'action', label: 'Notificar no Slack', detail: 'Enviar para #alertas', x: 600, y: 120 },
];

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'workflow'>('rules');

  // Rules list state
  const [rules, setRules] = useState<AutomationRule[]>(DEFAULT_RULES);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState('Quando um ticket for criado');
  const [newRuleCondField, setNewRuleCondField] = useState('Prioridade');
  const [newRuleCondOp, setNewRuleCondOp] = useState('=');
  const [newRuleCondVal, setNewRuleCondVal] = useState('Alta');
  const [newRuleAction, setNewRuleAction] = useState('Alterar Status');

  // Modal rules toggle
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  // Workflow Builder states
  const [nodes, setNodes] = useState<WorkflowNode[]>(DEFAULT_NODES);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Selected node config form
  const [nodeLabel, setNodeLabel] = useState('');
  const [nodeDetail, setNodeDetail] = useState('');

  // Load state on client mount
  useEffect(() => {
    const localRules = localStorage.getItem('automation_rules');
    const localNodes = localStorage.getItem('automation_workflow_nodes');
    if (localRules) {
      try {
        setRules(JSON.parse(localRules));
      } catch (e) {
        console.error(e);
      }
    }
    if (localNodes) {
      try {
        setNodes(JSON.parse(localNodes));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Rules Handlers
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName) return;

    let fullAction = newRuleAction;
    if (newRuleAction === 'Alterar Status') {
      fullAction = 'Alterar Status para EM ANDAMENTO';
    } else if (newRuleAction === 'Alterar Prioridade') {
      fullAction = 'Alterar Prioridade para ALTA';
    } else {
      fullAction = 'Enviar E-mail para Técnico Responsável';
    }

    const newRule: AutomationRule = {
      id: 'rule_' + Date.now(),
      name: newRuleName,
      trigger: newRuleTrigger,
      condField: newRuleCondField,
      condOp: newRuleCondOp,
      condVal: newRuleCondVal,
      action: fullAction,
      active: true,
    };

    const updated = [...rules, newRule];
    setRules(updated);
    localStorage.setItem('automation_rules', JSON.stringify(updated));
    setNewRuleName('');
    setIsRuleModalOpen(false);
  };

  const handleDeleteRule = (id: string) => {
    if (!confirm('Deseja excluir esta regra de automação?')) return;
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    localStorage.setItem('automation_rules', JSON.stringify(updated));
  };

  const toggleRuleActive = (id: string) => {
    const updated = rules.map(r => r.id === id ? { ...r, active: !r.active } : r);
    setRules(updated);
    localStorage.setItem('automation_rules', JSON.stringify(updated));
  };

  // Workflow Drag & Drop handlers
  const startDrag = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setDraggingId(id);
    setSelectedNodeId(id);
    const node = nodes.find(n => n.id === id);
    if (node) {
      setDragOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y
      });
      setNodeLabel(node.label);
      setNodeDetail(node.detail);
    }
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!draggingId) return;
    // Bounded dragging coordinates
    const updated = nodes.map(n => {
      if (n.id === draggingId) {
        const newX = Math.max(10, Math.min(800, e.clientX - dragOffset.x));
        const newY = Math.max(10, Math.min(480, e.clientY - dragOffset.y));
        return { ...n, x: newX, y: newY };
      }
      return n;
    });
    setNodes(updated);
  };

  const endDrag = () => {
    if (draggingId) {
      setDraggingId(null);
      localStorage.setItem('automation_workflow_nodes', JSON.stringify(nodes));
    }
  };

  const addWorkflowNode = (type: 'trigger' | 'condition' | 'action') => {
    const defaultLabels = {
      trigger: 'Novo Gatilho',
      condition: 'Nova Condição',
      action: 'Nova Ação',
    };
    const defaultDetails = {
      trigger: 'Quando evento disparar',
      condition: 'Se campo for igual a...',
      action: 'Executar tarefa...',
    };

    // Calculate a good spot
    const count = nodes.filter(n => n.type === type).length;
    const xPositions = { trigger: 80, condition: 340, action: 600 };
    const yPosition = 120 + (count * 110);

    const newNode: WorkflowNode = {
      id: 'node_' + Date.now(),
      type,
      label: defaultLabels[type],
      detail: defaultDetails[type],
      x: xPositions[type],
      y: Math.min(420, yPosition),
    };

    const updated = [...nodes, newNode];
    setNodes(updated);
    localStorage.setItem('automation_workflow_nodes', JSON.stringify(updated));
    setSelectedNodeId(newNode.id);
    setNodeLabel(newNode.label);
    setNodeDetail(newNode.detail);
  };

  const updateSelectedNode = () => {
    if (!selectedNodeId) return;
    const updated = nodes.map(n =>
      n.id === selectedNodeId ? { ...n, label: nodeLabel, detail: nodeDetail } : n
    );
    setNodes(updated);
    localStorage.setItem('automation_workflow_nodes', JSON.stringify(updated));
    alert('Informações do bloco atualizadas!');
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    if (!confirm('Deseja excluir este bloco do fluxo?')) return;
    const updated = nodes.filter(n => n.id !== selectedNodeId);
    setNodes(updated);
    localStorage.setItem('automation_workflow_nodes', JSON.stringify(updated));
    setSelectedNodeId(null);
  };

  // SVG Line Connections Generator
  const renderConnections = () => {
    const paths: JSX.Element[] = [];
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    const conditionNodes = nodes.filter(n => n.type === 'condition');
    const actionNodes = nodes.filter(n => n.type === 'action');

    // Connect triggers to conditions
    triggerNodes.forEach(t => {
      conditionNodes.forEach(c => {
        // Draw path trigger -> condition
        const x1 = t.x + 200; // Output port right
        const y1 = t.y + 35;
        const x2 = c.x;       // Input port left
        const y2 = c.y + 35;
        paths.push(
          <path
            key={`conn-${t.id}-${c.id}`}
            d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke="#475569"
            strokeWidth="2.5"
            strokeDasharray="4, 4"
            className="animate-[dash_20s_linear_infinite]"
          />
        );
      });
    });

    // Connect conditions to actions
    conditionNodes.forEach(c => {
      actionNodes.forEach(a => {
        const x1 = c.x + 200;
        const y1 = c.y + 35;
        const x2 = a.x;
        const y2 = a.y + 35;
        paths.push(
          <path
            key={`conn-${c.id}-${a.id}`}
            d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
          />
        );
      });
    });

    return paths;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader title="Automação e Workflows" subtitle="Motor de regras de negócios e fluxos visuais de suporte" />
        <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
          <Button
            variant={activeTab === 'rules' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('rules')}
          >
            📋 Regras de Automação
          </Button>
          <Button
            variant={activeTab === 'workflow' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab('workflow')}
          >
            🧩 Workflow Canvas
          </Button>
        </div>
      </div>

      {activeTab === 'rules' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Minhas Regras de Operação</h2>
              <p className="text-xs text-slate-400 mt-1">Automatize atribuições, alteração de status e disparos de alertas baseado em gatilhos e condições</p>
            </div>
            <Button variant="primary" onClick={() => setIsRuleModalOpen(true)}>+ Nova Regra</Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {rules.length === 0 ? (
              <Panel className="text-center py-12">
                <span className="text-4xl block mb-2">⚡</span>
                <p className="text-slate-400">Nenhuma regra de automação cadastrada.</p>
              </Panel>
            ) : (
              rules.map(rule => (
                <div
                  key={rule.id}
                  className={`bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col md:flex-row md:items-center gap-6 transition-all ${
                    rule.active ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full shadow-lg ${
                        rule.active ? 'bg-green-500 shadow-green-500/50' : 'bg-slate-600'
                      }`}></div>
                      <h3 className="text-lg font-bold text-white">{rule.name}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 font-mono text-xs font-bold text-blue-400">QUANDO</span>
                      <span className="font-semibold text-slate-200">{rule.trigger}</span>

                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 font-mono text-xs font-bold text-yellow-500 ml-1">SE</span>
                      <span className="bg-slate-900/60 text-slate-300 px-1.5 py-0.5 rounded font-mono text-xs">{rule.condField}</span>
                      <span className="font-bold text-slate-400">{rule.condOp}</span>
                      <span className="bg-slate-900/60 text-slate-200 px-1.5 py-0.5 rounded font-semibold">{rule.condVal}</span>

                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 font-mono text-xs font-bold text-green-400 ml-1">ENTÃO</span>
                      <span className="text-emerald-400 font-medium">{rule.action}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-700/60">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={rule.active}
                        onChange={() => toggleRuleActive(rule.id)}
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Workflows Drag & Drop */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Node Controls / Configuration Tool */}
          <div className="xl:col-span-1 space-y-6">
            <Panel className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Adicionar Blocos</h3>
                <p className="text-xs text-slate-400 mt-1">Insira elementos na malha de automação</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" fullWidth onClick={() => addWorkflowNode('trigger')}>
                  🟢 + Novo Gatilho (Trigger)
                </Button>
                <Button variant="secondary" fullWidth onClick={() => addWorkflowNode('condition')}>
                  🟡 + Nova Condição (Filter)
                </Button>
                <Button variant="secondary" fullWidth onClick={() => addWorkflowNode('action')}>
                  🔵 + Nova Ação (Action)
                </Button>
              </div>
            </Panel>

            <Panel className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Propriedades do Bloco</h3>
                <p className="text-xs text-slate-400 mt-1">Configure o nó atualmente selecionado</p>
              </div>
              {selectedNodeId ? (
                <div className="space-y-4">
                  <Field label="Nome do Bloco">
                    <Input
                      type="text"
                      value={nodeLabel}
                      onChange={(e) => setNodeLabel(e.target.value)}
                    />
                  </Field>
                  <Field label="Detalhe/Valor">
                    <Input
                      type="text"
                      value={nodeDetail}
                      onChange={(e) => setNodeDetail(e.target.value)}
                    />
                  </Field>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={updateSelectedNode}>Salvar</Button>
                    <Button variant="danger" size="sm" onClick={deleteSelectedNode}>Excluir Bloco</Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4 text-center">Clique em qualquer bloco no Canvas para configurar</p>
              )}
            </Panel>
          </div>

          {/* Drag and Drop Canvas Grid Area */}
          <div className="xl:col-span-3">
            <div
              className="w-full h-[520px] bg-slate-950 border border-slate-700 rounded-2xl relative overflow-hidden select-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #334155 1.2px, transparent 1.2px)',
                backgroundSize: '24px 24px',
              }}
              onMouseMove={onDrag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
            >
              {/* Connection Line layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {renderConnections()}
              </svg>

              {/* Node Rendering list */}
              {nodes.map(node => (
                <div
                  key={node.id}
                  style={{ left: node.x, top: node.y }}
                  className={`absolute w-52 bg-slate-900 border-2 rounded-xl px-4 py-3 cursor-grab z-10 hover:shadow-lg transition-shadow select-none ${
                    selectedNodeId === node.id
                      ? 'border-blue-500 shadow-blue-500/10'
                      : 'border-slate-700'
                  }`}
                  onMouseDown={(e) => startDrag(e, node.id)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      node.type === 'trigger'
                        ? 'bg-green-500/10 text-green-400 border border-green-700/20'
                        : node.type === 'condition'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-700/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-700/20'
                    }`}>
                      {node.type === 'trigger' && 'Gatilho'}
                      {node.type === 'condition' && 'Condição'}
                      {node.type === 'action' && 'Ação'}
                    </span>
                    <span className="text-xs text-slate-500">☰</span>
                  </div>

                  <h4 className="text-white font-bold text-sm truncate">{node.label}</h4>
                  <p className="text-slate-400 text-[10px] mt-0.5 truncate">{node.detail}</p>

                  {/* Input / Output ports visual representation */}
                  {node.type !== 'trigger' && (
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-slate-800 border-2 border-slate-600 rounded-full"></div>
                  )}
                  {node.type !== 'action' && (
                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-800 border-2 border-slate-600 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Creation Rule Modal */}
      <Modal
        open={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        title="Nova Regra de Automação"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsRuleModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveRule} disabled={!newRuleName}>Criar Regra</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveRule} className="space-y-4">
          <Field label="Nome da Regra" required>
            <Input
              type="text"
              placeholder="Ex: Autoatribuir incidente de rede"
              value={newRuleName}
              onChange={(e) => setNewRuleName(e.target.value)}
            />
          </Field>

          <Field label="Gatilho Principal" required>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
              value={newRuleTrigger}
              onChange={(e) => setNewRuleTrigger(e.target.value)}
            >
              <option value="Quando um ticket for criado">Quando um ticket for criado</option>
              <option value="Quando um ticket for atualizado">Quando um ticket for atualizado</option>
              <option value="Quando um ticket for fechado">Quando um ticket for fechado</option>
              <option value="Gatilho baseado em Tempo (SLA)">Gatilho baseado em Tempo (SLA)</option>
            </select>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Field label="Se Campo">
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  value={newRuleCondField}
                  onChange={(e) => setNewRuleCondField(e.target.value)}
                >
                  <option value="Prioridade">Prioridade</option>
                  <option value="Categoria">Categoria</option>
                  <option value="Tempo restante SLA">Tempo restante SLA</option>
                  <option value="Status">Status</option>
                </select>
              </Field>
            </div>
            <div className="col-span-1">
              <Field label="Operador">
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  value={newRuleCondOp}
                  onChange={(e) => setNewRuleCondOp(e.target.value)}
                >
                  <option value="=">=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value="!=">!=</option>
                </select>
              </Field>
            </div>
            <div className="col-span-1">
              <Field label="Valor">
                <Input
                  type="text"
                  placeholder="Alta, 0, Redes..."
                  value={newRuleCondVal}
                  onChange={(e) => setNewRuleCondVal(e.target.value)}
                />
              </Field>
            </div>
          </div>

          <Field label="Ação do Sistema" required>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
              value={newRuleAction}
              onChange={(e) => setNewRuleAction(e.target.value)}
            >
              <option value="Alterar Status">Alterar Status para EM ANDAMENTO</option>
              <option value="Alterar Prioridade">Alterar Prioridade para ALTA</option>
              <option value="Notificar Técnico">Notificar Técnico Responsável por Email</option>
            </select>
          </Field>
        </form>
      </Modal>
    </div>
  );
}
