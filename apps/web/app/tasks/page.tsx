'use client';
import { useState } from 'react';
import { PageHeader, Select, Input, Textarea, Button } from '@/components/ui';

interface ChecklistItem {
  id: number;
  text: string;
  done: boolean;
}

interface Material {
  id: number;
  name: string;
  qty: number;
}

interface Comment {
  id: number;
  author: string;
  text: string;
  date: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  ticket: string | null;
  assignee: string;
  checklist: ChecklistItem[];
  materials: Material[];
  comments: Comment[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Revisar logs do servidor',
      description: 'Analisar logs de segurança do Active Directory e servidores de aplicação em busca de tentativas falhas de login.',
      status: 'TODO',
      priority: 'HIGH',
      ticket: '#1024',
      assignee: 'João Silva',
      checklist: [
        { id: 1, text: 'Exportar logs do firewall', done: true },
        { id: 2, text: 'Filtrar por eventos 4625', done: false },
        { id: 3, text: 'Gerar relatório consolidado', done: false },
      ],
      materials: [
        { id: 1, name: 'Armazenamento em Nuvem Extra (S3)', qty: 1 }
      ],
      comments: [
        { id: 1, author: 'João Silva', text: 'Iniciei a exportação dos arquivos primários de segurança.', date: '09/06/2026 14:30' }
      ]
    },
    {
      id: 2,
      title: 'Atualizar licenças do Office',
      description: 'Renovar e atribuir as novas licenças de Office 365 Business Premium para os novos colaboradores do setor de faturamento.',
      status: 'TODO',
      priority: 'MEDIUM',
      ticket: null,
      assignee: 'Ana Lima',
      checklist: [],
      materials: [],
      comments: []
    },
    {
      id: 3,
      title: 'Trocar cabo de rede mesa 5',
      description: 'Substituir cabo de rede antigo que está apresentando perda de pacotes e reconectar o telefone IP.',
      status: 'DOING',
      priority: 'LOW',
      ticket: '#1021',
      assignee: 'Pedro Costa',
      checklist: [
        { id: 1, text: 'Passar cabo novo pela canaleta', done: true },
        { id: 2, text: 'Grimpar pontas padrão T568B', done: true },
        { id: 3, text: 'Testar conexão com testador de cabo', done: false },
      ],
      materials: [
        { id: 1, name: 'Cabo de Rede CAT6 Azul', qty: 15 },
        { id: 2, name: 'Conector RJ45 CAT6', qty: 2 }
      ],
      comments: [
        { id: 1, author: 'Pedro Costa', text: 'Cabo já passado, falta apenas grimpar e testar.', date: '09/06/2026 11:15' }
      ]
    },
    {
      id: 4,
      title: 'Configurar novo firewall',
      description: 'Implementar o novo equipamento FortiGate no rack principal e configurar as regras de tráfego básicas (LAN -> WAN).',
      status: 'DONE',
      priority: 'URGENT',
      ticket: null,
      assignee: 'Maria Souza',
      checklist: [
        { id: 1, text: 'Fixar equipamento no rack', done: true },
        { id: 2, text: 'Configurar interface WAN e LAN', done: true },
        { id: 3, text: 'Restabelecer VPN filial', done: true },
      ],
      materials: [
        { id: 1, name: 'FortiGate 60F', qty: 1 },
        { id: 2, name: 'Abraçadeira de Nylon', qty: 10 }
      ],
      comments: [
        { id: 1, author: 'Maria Souza', text: 'VPN restabelecida e tráfego fluindo normalmente.', date: '09/06/2026 10:00' }
      ]
    },
  ]);

  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Auxiliary state variables for modal inputs
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQty, setNewMaterialQty] = useState(1);
  const [newCommentText, setNewCommentText] = useState('');

  const columns = [
    { id: 'TODO', title: 'A Fazer', color: 'border-slate-500' },
    { id: 'DOING', title: 'Em Andamento', color: 'border-blue-500' },
    { id: 'DONE', title: 'Concluído', color: 'border-green-500' },
  ];

  const moveTask = (taskId: number, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const updateTaskField = (taskId: number, field: keyof Task, value: any) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, [field]: value } : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim() || !selectedTask) return;
    const newItem: ChecklistItem = {
      id: Date.now(),
      text: newChecklistItem,
      done: false
    };
    const updatedChecklist = [...selectedTask.checklist, newItem];
    updateTaskField(selectedTask.id, 'checklist', updatedChecklist);
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (itemId: number) => {
    if (!selectedTask) return;
    const updatedChecklist = selectedTask.checklist.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    updateTaskField(selectedTask.id, 'checklist', updatedChecklist);
  };

  const deleteChecklistItem = (itemId: number) => {
    if (!selectedTask) return;
    const updatedChecklist = selectedTask.checklist.filter(item => item.id !== itemId);
    updateTaskField(selectedTask.id, 'checklist', updatedChecklist);
  };

  const addMaterial = () => {
    if (!newMaterialName.trim() || !selectedTask) return;
    const newItem: Material = {
      id: Date.now(),
      name: newMaterialName,
      qty: newMaterialQty
    };
    const updatedMaterials = [...selectedTask.materials, newItem];
    updateTaskField(selectedTask.id, 'materials', updatedMaterials);
    setNewMaterialName('');
    setNewMaterialQty(1);
  };

  const deleteMaterial = (materialId: number) => {
    if (!selectedTask) return;
    const updatedMaterials = selectedTask.materials.filter(m => m.id !== materialId);
    updateTaskField(selectedTask.id, 'materials', updatedMaterials);
  };

  const addComment = () => {
    if (!newCommentText.trim() || !selectedTask) return;
    const newComment: Comment = {
      id: Date.now(),
      author: 'Suporte Técnico',
      text: newCommentText,
      date: new Date().toLocaleString('pt-BR', { hour12: false }).substring(0, 16)
    };
    const updatedComments = [...selectedTask.comments, newComment];
    updateTaskField(selectedTask.id, 'comments', updatedComments);
    setNewCommentText('');
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Gestão de Tarefas" subtitle="Quadro Kanban de atividades da equipe" />
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-colors">
          + Nova Tarefa
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map(col => (
          <div
            key={col.id}
            className={`flex-1 min-w-[300px] bg-slate-900/50 rounded-xl border border-slate-700/50 flex flex-col transition-all duration-200 ${
              draggedOverCol === col.id ? 'bg-slate-800/60 border-blue-500/70 shadow-lg scale-[1.01]' : ''
            }`}
          >
            <div className={`p-4 border-t-4 ${col.color} rounded-t-xl bg-slate-800/80`}>
              <h3 className="text-white font-bold">
                {col.title}
                <span className="ml-2 text-xs bg-slate-700 px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </h3>
            </div>
            
            <div
              className="flex-1 p-4 space-y-3 overflow-y-auto"
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedOverCol !== col.id) {
                  setDraggedOverCol(col.id);
                }
              }}
              onDragLeave={() => {
                setDraggedOverCol(null);
              }}
              onDrop={(e) => {
                setDraggedOverCol(null);
                const idStr = e.dataTransfer.getData('taskId');
                if (idStr) {
                  moveTask(parseInt(idStr), col.id);
                }
              }}
            >
              {tasks.filter(t => t.status === col.id).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('taskId', task.id.toString());
                  }}
                  onClick={() => setSelectedTask(task)}
                  className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer shadow-lg shadow-black/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase
                      ${task.priority === 'URGENT' ? 'bg-red-900/50 text-red-400 border border-red-700/50' : 
                        task.priority === 'HIGH' ? 'bg-orange-900/50 text-orange-400 border border-orange-700/50' : 
                        task.priority === 'MEDIUM' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50' : 
                        'bg-green-900/50 text-green-400 border border-green-700/50'}`}>
                      {task.priority}
                    </span>
                    {task.ticket && (
                      <span className="text-xs text-blue-400 hover:underline cursor-pointer">Ticket {task.ticket}</span>
                    )}
                  </div>
                  <h4 className="text-white font-medium mb-3">{task.title}</h4>
                  
                  {/* Indicators */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    {task.description && <span title="Possui descrição">📝</span>}
                    {task.checklist.length > 0 && (
                      <span className="bg-slate-700 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                        ☑️ {task.checklist.filter(c => c.done).length}/{task.checklist.length}
                      </span>
                    )}
                    {task.materials.length > 0 && <span title="Materiais aplicados">🛠️ {task.materials.length}</span>}
                    {task.comments.length > 0 && <span title="Comentários">💬 {task.comments.length}</span>}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white" title={task.assignee}>
                      {task.assignee.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {col.id !== 'TODO' && <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, status: columns[columns.findIndex(c => c.id === col.id) - 1].id} : t))} className="text-slate-500 hover:text-white p-1">←</button>}
                      {col.id !== 'DONE' && <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, status: columns[columns.findIndex(c => c.id === col.id) + 1].id} : t))} className="text-slate-500 hover:text-white p-1">→</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Trello-like Rich Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-slate-700 bg-slate-800/50">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase text-blue-400 tracking-wider">
                  Detalhes da Tarefa {selectedTask.ticket ? `(Relacionada ao Ticket ${selectedTask.ticket})` : ''}
                </span>
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => updateTaskField(selectedTask.id, 'title', e.target.value)}
                  className="bg-transparent text-xl font-bold text-white border-b border-transparent hover:border-slate-600 focus:border-blue-500 focus:outline-none w-full py-1 transition-colors"
                />
                <p className="text-xs text-slate-400">
                  Na coluna <span className="font-semibold text-slate-300">{columns.find(c => c.id === selectedTask.status)?.title}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column (Rich Content) */}
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <span>📝</span> Descrição Detalhada
                  </h3>
                  <Textarea
                    value={selectedTask.description}
                    onChange={(e) => updateTaskField(selectedTask.id, 'description', e.target.value)}
                    placeholder="Adicione uma descrição mais detalhada para esta tarefa..."
                    rows={4}
                  />
                </div>

                {/* Checklist (Lista) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <span>☑️</span> Checklist de Subtarefas
                  </h3>
                  {selectedTask.checklist.length > 0 && (
                    <div className="space-y-2 pl-2">
                      {selectedTask.checklist.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-slate-800/40 p-2 rounded border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                          <label className="flex items-center gap-3 cursor-pointer select-none text-sm text-slate-300 flex-1">
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={() => toggleChecklistItem(item.id)}
                              className="rounded border-slate-600 text-blue-600 bg-slate-800 focus:ring-blue-500"
                            />
                            <span className={item.done ? 'line-through text-slate-500' : ''}>
                              {item.text}
                            </span>
                          </label>
                          <button
                            onClick={() => deleteChecklistItem(item.id)}
                            className="text-red-400 hover:text-red-300 text-xs px-2"
                          >
                            Excluir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pl-2">
                    <Input
                      type="text"
                      placeholder="Adicionar item à lista..."
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                    />
                    <Button variant="secondary" onClick={addChecklistItem}>
                      Inserir
                    </Button>
                  </div>
                </div>

                {/* Materials (Materiais e Recursos) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <span>🛠️</span> Materiais e Peças Utilizadas
                  </h3>
                  {selectedTask.materials.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                      {selectedTask.materials.map((m) => (
                        <div key={m.id} className="flex items-center justify-between bg-slate-800/40 px-3 py-2 rounded border border-slate-700/50 text-sm text-slate-300">
                          <span>
                            {m.name} <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full ml-1">x{m.qty}</span>
                          </span>
                          <button
                            onClick={() => deleteMaterial(m.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pl-2 items-center">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Nome do material/peça..."
                        value={newMaterialName}
                        onChange={(e) => setNewMaterialName(e.target.value)}
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min={1}
                        value={newMaterialQty}
                        onChange={(e) => setNewMaterialQty(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <Button variant="secondary" onClick={addMaterial}>
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Comments (Histórico/Comentários) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <span>💬</span> Comentários e Histórico
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pl-2">
                    {selectedTask.comments.length > 0 ? (
                      selectedTask.comments.map((c) => (
                        <div key={c.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-blue-400">{c.author}</span>
                            <span className="text-slate-500">{c.date}</span>
                          </div>
                          <p className="text-sm text-slate-300">{c.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Nenhum comentário registrado.</p>
                    )}
                  </div>
                  <div className="flex gap-2 pl-2">
                    <Input
                      type="text"
                      placeholder="Escreva um comentário..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addComment()}
                    />
                    <Button variant="primary" onClick={addComment}>
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column (Sidebar / Attributes) */}
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 h-fit space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Metadados</h3>
                
                {/* Assignee */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Responsável</label>
                  <Select
                    value={selectedTask.assignee}
                    onChange={(e) => updateTaskField(selectedTask.id, 'assignee', e.target.value)}
                  >
                    <option value="João Silva">João Silva</option>
                    <option value="Ana Lima">Ana Lima</option>
                    <option value="Pedro Costa">Pedro Costa</option>
                    <option value="Maria Souza">Maria Souza</option>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Prioridade</label>
                  <Select
                    value={selectedTask.priority}
                    onChange={(e) => updateTaskField(selectedTask.id, 'priority', e.target.value)}
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </Select>
                </div>

                {/* Status Column */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Status / Coluna</label>
                  <Select
                    value={selectedTask.status}
                    onChange={(e) => updateTaskField(selectedTask.id, 'status', e.target.value)}
                  >
                    <option value="TODO">A Fazer</option>
                    <option value="DOING">Em Andamento</option>
                    <option value="DONE">Concluído</option>
                  </Select>
                </div>

                {/* Ticket code */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Ticket Relacionado</label>
                  <Input
                    type="text"
                    placeholder="Ex: #1024"
                    value={selectedTask.ticket || ''}
                    onChange={(e) => updateTaskField(selectedTask.id, 'ticket', e.target.value || null)}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>
                Fechar Detalhes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
