export interface CronTaskDef {
  name: string;
  label: string;
  description: string;
  itemType: string;
  defaultFrequency: number; // segundos
  defaultRunStartHour: number;
  defaultRunEndHour: number;
  defaultParam?: Record<string, any>;
}

export const CRON_REGISTRY: CronTaskDef[] = [
  {
    name: 'slaEvaluation',
    label: 'Verificador de SLA',
    description: 'Avalia prazos de chamados e gera alertas de Warning/Breach',
    itemType: 'Chamado',
    defaultFrequency: 60,
    defaultRunStartHour: 0,
    defaultRunEndHour: 24,
  },
  {
    name: 'mailCollector',
    label: 'Coletor de E-mail IMAP',
    description: 'Verifica caixa de entrada e cria chamados automáticos a partir de e-mails',
    itemType: 'E-mail',
    defaultFrequency: 120,
    defaultRunStartHour: 0,
    defaultRunEndHour: 24,
  },
  {
    name: 'closeResolvedTickets',
    label: 'Fechar Chamados Resolvidos',
    description: 'Encerra automaticamente chamados em estado RESOLVIDO após dias configurados',
    itemType: 'Chamado',
    defaultFrequency: 86400, // 1 dia
    defaultRunStartHour: 0,
    defaultRunEndHour: 24,
    defaultParam: { autoCloseDays: 3 },
  },
  {
    name: 'purgeNotifications',
    label: 'Limpeza de Notificações',
    description: 'Remove notificações lidas mais antigas que o período configurado',
    itemType: 'Notificação',
    defaultFrequency: 86400,
    defaultRunStartHour: 2,
    defaultRunEndHour: 3,
    defaultParam: { retentionDays: 60 },
  },
  {
    name: 'purgeAuditLogs',
    label: 'Limpeza de Logs de Auditoria',
    description: 'Remove registros de auditoria mais antigos que o período configurado',
    itemType: 'Auditoria',
    defaultFrequency: 86400,
    defaultRunStartHour: 3,
    defaultRunEndHour: 4,
    defaultParam: { retentionDays: 365 },
  },
  {
    name: 'agentOfflineCheck',
    label: 'Verificador de Agentes Offline',
    description: 'Marca agentes e ativos como offline se não reportarem nos últimos minutos',
    itemType: 'Ativo',
    defaultFrequency: 300, // 5 min
    defaultRunStartHour: 0,
    defaultRunEndHour: 24,
    defaultParam: { offlineMinutes: 10 },
  },
  {
    name: 'contractExpiration',
    label: 'Controle de Expiração de Contratos',
    description: 'Monitora vigência de contratos marcando EXPIRING/OVERDUE e notificando admins',
    itemType: 'Cliente',
    defaultFrequency: 86400,
    defaultRunStartHour: 0,
    defaultRunEndHour: 24,
    defaultParam: { warningDays: 30 },
  },
  {
    name: 'satisfactionSurvey',
    label: 'Disparador de Pesquisa de Satisfação',
    description: 'Notifica solicitante de chamados resolvidos para responder pesquisa de satisfação',
    itemType: 'Chamado',
    defaultFrequency: 3600, // 1 h
    defaultRunStartHour: 8,
    defaultRunEndHour: 18,
    defaultParam: { lookbackDays: 7 },
  },
  {
    name: 'waitingTicketReminder',
    label: 'Lembrete de Chamados em Espera',
    description: 'Notifica responsável de chamados WAITING/PAUSED há muito tempo sem movimento',
    itemType: 'Chamado',
    defaultFrequency: 3600,
    defaultRunStartHour: 8,
    defaultRunEndHour: 18,
    defaultParam: { thresholdHours: 48 },
  },
  {
    name: 'purgeTelemetry',
    label: 'Limpeza de Telemetria de Ativos',
    description: 'Remove dados de telemetria históricos deixando apenas os mais recentes',
    itemType: 'Ativo',
    defaultFrequency: 86400,
    defaultRunStartHour: 4,
    defaultRunEndHour: 5,
    defaultParam: { keepRecords: 1440 },
  },
  {
    name: 'recurringTickets',
    label: 'Disparador de Chamados Recorrentes',
    description: 'Gera chamados automáticos a partir de agendamentos preventivos/recorrentes',
    itemType: 'Chamado',
    defaultFrequency: 300,
    defaultRunStartHour: 0,
    defaultRunEndHour: 24,
  },
  {
    name: 'networkDiscovery',
    label: 'Descoberta de Rede (SNMP)',
    description: 'Verifica a sub-rede via SNMP e ping para encontrar dispositivos não gerenciados',
    itemType: 'Dispositivo',
    defaultFrequency: 86400, // 1 dia
    defaultRunStartHour: 1,
    defaultRunEndHour: 5,
    defaultParam: { subnet: '', community: 'public', version: 2 },
  },
];

export function getCronTaskDef(name: string): CronTaskDef | undefined {
  return CRON_REGISTRY.find((t) => t.name === name);
}
