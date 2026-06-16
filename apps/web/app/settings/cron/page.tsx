'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Play, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { PageHeader, Panel, Button, Spinner } from '@/components/ui';
import { api } from '@/lib/api';

interface CronTask {
  id: string;
  name: string;
  label: string;
  description: string;
  itemType: string;
  status: 'SCHEDULED' | 'DISABLED' | 'RUNNING';
  frequency: number;
  runStartHour: number;
  runEndHour: number;
  param?: Record<string, any>;
  lastRun?: string;
  lastDuration?: number;
  lastStatus?: 'SUCCESS' | 'ERROR' | 'SKIPPED';
  lastMessage?: string;
}

interface CategoryTasks {
  [key: string]: CronTask[];
}

const CATEGORIES = {
  'Chamados': { icon: '🎫', color: 'from-blue-600 to-blue-700' },
  'Notificação': { icon: '🔔', color: 'from-purple-600 to-purple-700' },
  'Ativo': { icon: '💻', color: 'from-orange-600 to-orange-700' },
  'Auditoria': { icon: '📋', color: 'from-slate-600 to-slate-700' },
  'E-mail': { icon: '✉️', color: 'from-indigo-600 to-indigo-700' },
  'Cliente': { icon: '👥', color: 'from-pink-600 to-pink-700' },
};

function formatFrequency(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function formatLastRun(date?: string): string {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Agora';
  if (mins < 60) return `${mins}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  return d.toLocaleDateString('pt-BR');
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    SUCCESS: 'bg-green-950/50 text-green-400 border border-green-800/50',
    ERROR: 'bg-red-950/50 text-red-400 border border-red-800/50',
    SKIPPED: 'bg-yellow-950/50 text-yellow-400 border border-yellow-800/50',
  };
  const style = styles[status as keyof typeof styles] || 'bg-gray-800/50 text-gray-400';
  return (
    <span className={`text-xs px-2 py-1 rounded font-semibold uppercase ${style}`}>
      {status}
    </span>
  );
}

function TaskCard({
  task,
  onToggle,
  onRun,
  onLogs,
  isRunning,
}: {
  task: CronTask;
  onToggle: (id: string, status: string) => void;
  onRun: (id: string) => void;
  onLogs: (id: string) => void;
  isRunning: boolean;
}) {
  const isActive = task.status === 'SCHEDULED';
  const catColor = CATEGORIES[task.itemType]?.color || 'from-slate-600 to-slate-700';

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors">
      {/* Header com cor da categoria */}
      <div className={`h-1 w-full bg-gradient-to-r ${catColor} rounded-t-lg mb-4 -m-4 mb-4`} />

      {/* Título e Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm leading-snug break-words">{task.label}</h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded inline-block mt-1.5">
            {task.name}
          </span>
        </div>

        {/* Status Badge */}
        {task.lastStatus && (
          <div className="flex-shrink-0">
            <StatusBadge status={task.lastStatus} />
          </div>
        )}
      </div>

      {/* Metadata em duas colunas mobile, flex desktop */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div>
          <p className="text-slate-500 font-medium">Frequência</p>
          <p className="text-slate-200 font-mono">{formatFrequency(task.frequency)}</p>
        </div>
        <div>
          <p className="text-slate-500 font-medium">Última Execução</p>
          <p className="text-slate-200 font-mono">{formatLastRun(task.lastRun)}</p>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onToggle(task.id, task.status)}
        >
          {isActive ? (
            <>
              <ToggleRight size={14} className="mr-1" />
              <span className="text-xs">Ativo</span>
            </>
          ) : (
            <>
              <ToggleLeft size={14} className="mr-1" />
              <span className="text-xs">Inativo</span>
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          loading={isRunning}
          onClick={() => onRun(task.id)}
        >
          <Play size={14} className="mr-1" />
          <span className="text-xs">Executar</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onLogs(task.id)}
        >
          <Eye size={14} className="mr-1" />
          <span className="text-xs">Logs</span>
        </Button>
      </div>
    </div>
  );
}

function CollapsibleCategory({
  title,
  icon,
  color,
  tasks,
  onToggle,
  onRun,
  onLogs,
  runningId,
}: {
  title: string;
  icon: string;
  color: string;
  tasks: CronTask[];
  onToggle: (id: string, status: string) => void;
  onRun: (id: string) => void;
  onLogs: (id: string) => void;
  runningId: string | null;
}) {
  const [expanded, setExpanded] = useState(true);

  if (tasks.length === 0) return null;

  const activeCount = tasks.filter((t) => t.status === 'SCHEDULED').length;
  const successCount = tasks.filter((t) => t.lastStatus === 'SUCCESS').length;

  return (
    <div className="mb-6">
      {/* Cabeçalho colapsável */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 p-4 rounded-lg border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 transition-colors mb-3 group`}
      >
        <span className="text-xl">{icon}</span>
        <div className="flex-1 text-left">
          <h2 className="font-bold text-white text-sm">{title}</h2>
          <p className="text-xs text-slate-400">
            {activeCount} ativo{activeCount !== 1 ? 's' : ''} • {successCount} com sucesso
          </p>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-slate-400 group-hover:text-slate-300" />
        ) : (
          <ChevronDown size={18} className="text-slate-400 group-hover:text-slate-300" />
        )}
      </button>

      {/* Grid de cards */}
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onRun={onRun}
              onLogs={onLogs}
              isRunning={runningId === task.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LogsModal({
  isOpen,
  logs,
  onClose,
}: {
  isOpen: boolean;
  logs: any[];
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-2xl max-h-96 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="font-bold text-white">Histórico de Execuções</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {logs.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhum log disponível</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-slate-800/30 border border-slate-800 p-3 rounded text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={log.status} />
                  <span className="text-slate-400 text-[10px]">{log.duration}ms</span>
                  <span className="text-slate-500">
                    {new Date(log.startedAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-slate-300">{log.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function CronSettingsPage() {
  const [tasks, setTasks] = useState<CronTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [logsId, setLogsId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/cron-tasks');
      console.log('Cron tasks loaded:', data);
      setTasks(data);
    } catch (err) {
      console.error('Error loading cron tasks:', err);
      alert(`Erro ao carregar tarefas: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    try {
      const newStatus = current === 'SCHEDULED' ? 'DISABLED' : 'SCHEDULED';
      await api.patch(`/api/cron-tasks/${id}`, { status: newStatus });
      await loadTasks();
    } catch (err) {
      alert(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const runNow = async (id: string) => {
    try {
      setRunningId(id);
      const result = await api.post(`/api/cron-tasks/${id}/run`, {});
      alert(`Executado: ${result.message}`);
      await loadTasks();
    } catch (err) {
      alert(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunningId(null);
    }
  };

  const openLogs = async (id: string) => {
    try {
      setLogsId(id);
      const data = await api.get(`/api/cron-tasks/${id}/logs`);
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // Agrupar tasks por categoria
  const categorizedTasks = tasks.reduce((acc, task) => {
    const category = task.itemType;
    if (!acc[category]) acc[category] = [];
    acc[category].push(task);
    return acc;
  }, {} as CategoryTasks);

  // Ordenar categorias por número de tarefas
  const sortedCategories = Object.entries(categorizedTasks).sort(
    ([, a], [, b]) => b.length - a.length
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <Link
        href="/settings"
        className="text-sm text-blue-400 hover:text-blue-300 inline-block font-medium"
      >
        ← Voltar para Configurações
      </Link>

      <PageHeader
        title="Ações Automáticas (Cron)"
        subtitle="Agendador de tarefas automatizadas e rotinas de manutenção em background"
      />

      <Panel className="p-0 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white">Gerenciamento de Ações do Sistema</h2>
          <p className="text-xs text-slate-400 mt-1">
            {tasks.length} ações agendadas • {tasks.filter((t) => t.status === 'SCHEDULED').length} ativas
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {sortedCategories.map(([itemType, catTasks]) => {
            const catData = CATEGORIES[itemType] || {
              icon: '⚙️',
              color: 'from-slate-600 to-slate-700',
            };

            return (
              <CollapsibleCategory
                key={itemType}
                title={itemType}
                icon={catData.icon}
                color={catData.color}
                tasks={catTasks}
                onToggle={toggleStatus}
                onRun={runNow}
                onLogs={openLogs}
                runningId={runningId}
              />
            );
          })}
        </div>
      </Panel>

      {/* Logs Modal */}
      <LogsModal isOpen={!!logsId} logs={logs} onClose={() => setLogsId(null)} />
    </div>
  );
}
