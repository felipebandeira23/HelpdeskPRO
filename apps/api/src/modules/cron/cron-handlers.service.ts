import {
  Injectable,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SLAService } from '../sla/sla.service';
import { MailInboxService } from '../mail/mail-inbox.service';
import { SettingsService } from '../settings/settings.service';
import { DiscoveryService } from '../discovery/discovery.service';
import { CronRunStatus } from '@prisma/client';

export interface CronHandlerResult {
  status: CronRunStatus;
  message: string;
}

@Injectable()
export class CronHandlersService {
  private readonly logger = new Logger(CronHandlersService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    @Inject(SLAService) private slaService: SLAService,
    @Inject(MailInboxService) private mailInboxService: MailInboxService,
    private settingsService: SettingsService,
    @Inject(DiscoveryService) private discoveryService: DiscoveryService,
  ) {}

  async slaEvaluation(): Promise<CronHandlerResult> {
    try {
      const result = await this.slaService.evaluateAll();
      return {
        status: 'SUCCESS',
        message: `SLA avaliado: ${result.updated} tickets atualizados`,
      };
    } catch (err) {
      this.logger.error(`SLA evaluation failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao avaliar SLA: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async mailCollector(): Promise<CronHandlerResult> {
    try {
      if (!process.env.IMAP_HOST) {
        return { status: 'SKIPPED', message: 'IMAP_HOST não configurado' };
      }
      const result = await this.mailInboxService.poll();
      return {
        status: 'SUCCESS',
        message: `E-mails processados: ${result.created} novos chamados criados`,
      };
    } catch (err) {
      this.logger.error(`Mail collector failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao coletar e-mails: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async closeResolvedTickets(): Promise<CronHandlerResult> {
    try {
      const settings = await this.settingsService.getSettings('tickets', {
        autoCloseDays: 0,
      });
      const autoCloseDays = settings.autoCloseDays || 0;

      if (autoCloseDays <= 0) {
        return { status: 'SKIPPED', message: 'Fechamento automático desabilitado' };
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - autoCloseDays);

      const tickets = await this.prisma.ticket.findMany({
        where: {
          status: 'RESOLVED',
          resolvedAt: { lte: cutoffDate },
        },
        select: { id: true, requesterId: true },
      });

      if (tickets.length === 0) {
        return { status: 'SUCCESS', message: 'Nenhum chamado para fechar' };
      }

      await this.prisma.ticket.updateMany({
        where: { id: { in: tickets.map((t) => t.id) } },
        data: { status: 'CLOSED', closedAt: new Date() },
      });

      for (const ticket of tickets) {
        await this.notifications.notify({
          userId: ticket.requesterId,
          type: 'TICKET_CLOSED',
          title: 'Chamado Encerrado',
          message: 'Seu chamado foi automaticamente encerrado após estar resolvido.',
        });
      }

      return {
        status: 'SUCCESS',
        message: `${tickets.length} chamados fechados automaticamente`,
      };
    } catch (err) {
      this.logger.error(`Close resolved tickets failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao fechar chamados: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async purgeNotifications(): Promise<CronHandlerResult> {
    try {
      const settings = (await this.settingsService.getSettings('cron', {})) as Record<
        string,
        any
      >;
      const taskParam = (settings.purgeNotifications as Record<string, any>) || {
        retentionDays: 60,
      };
      const retentionDays = taskParam.retentionDays || 60;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.notification.deleteMany({
        where: {
          read: true,
          createdAt: { lte: cutoffDate },
        },
      });

      return {
        status: 'SUCCESS',
        message: `${result.count} notificações removidas`,
      };
    } catch (err) {
      this.logger.error(`Purge notifications failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao limpar notificações: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async purgeAuditLogs(): Promise<CronHandlerResult> {
    try {
      const settings = (await this.settingsService.getSettings('cron', {})) as Record<
        string,
        any
      >;
      const taskParam = (settings.purgeAuditLogs as Record<string, any>) || {
        retentionDays: 365,
      };
      const retentionDays = taskParam.retentionDays || 365;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.auditLog.deleteMany({
        where: { createdAt: { lte: cutoffDate } },
      });

      return {
        status: 'SUCCESS',
        message: `${result.count} logs de auditoria removidos`,
      };
    } catch (err) {
      this.logger.error(`Purge audit logs failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao limpar logs: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async agentOfflineCheck(): Promise<CronHandlerResult> {
    try {
      const settings = (await this.settingsService.getSettings('cron', {})) as Record<
        string,
        any
      >;
      const taskParam = (settings.agentOfflineCheck as Record<string, any>) || {
        offlineMinutes: 10,
      };
      const offlineMinutes = taskParam.offlineMinutes || 10;

      const cutoffTime = new Date(Date.now() - offlineMinutes * 60_000);

      const result = await this.prisma.agent.updateMany({
        where: {
          status: 'ONLINE',
          lastSeen: { lte: cutoffTime },
        },
        data: { status: 'OFFLINE' },
      });

      return {
        status: 'SUCCESS',
        message: `${result.count} agentes marcados como offline`,
      };
    } catch (err) {
      this.logger.error(`Agent offline check failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao verificar agentes: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async contractExpiration(): Promise<CronHandlerResult> {
    try {
      const settings = (await this.settingsService.getSettings('cron', {})) as Record<
        string,
        any
      >;
      const taskParam = (settings.contractExpiration as Record<string, any>) || {
        warningDays: 30,
      };
      const warningDays = taskParam.warningDays || 30;

      const now = new Date();
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + warningDays);

      // Mark as EXPIRING
      const expiring = await this.prisma.customer.updateMany({
        where: {
          contractStatus: { in: ['NONE', 'ACTIVE'] },
          contractEnd: {
            lte: warningDate,
            gt: now,
          },
        },
        data: { contractStatus: 'EXPIRING' },
      });

      // Mark as OVERDUE
      const overdue = await this.prisma.customer.updateMany({
        where: {
          contractStatus: { in: ['NONE', 'ACTIVE', 'EXPIRING'] },
          contractEnd: { lte: now },
        },
        data: { contractStatus: 'OVERDUE' },
      });

      // Notify admins
      const admins = await this.prisma.user.findMany({
        where: { profile: { name: 'Administrador' } },
        select: { id: true },
      });

      if (admins.length > 0) {
        const adminIds = admins.map((a) => a.id);
        await this.notifications.notifyMany(adminIds, {
          type: 'SYSTEM',
          title: 'Contratos com Vencimento',
          message: `${expiring.count + overdue.count} contratos expirados ou para expirar`,
        });
      }

      return {
        status: 'SUCCESS',
        message: `${expiring.count} expiração próxima, ${overdue.count} expirados`,
      };
    } catch (err) {
      this.logger.error(`Contract expiration check failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao verificar contratos: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async satisfactionSurvey(): Promise<CronHandlerResult> {
    try {
      const settings = (await this.settingsService.getSettings('cron', {})) as Record<
        string,
        any
      >;
      const taskParam = (settings.satisfactionSurvey as Record<string, any>) || {
        lookbackDays: 7,
      };
      const lookbackDays = taskParam.lookbackDays || 7;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

      const tickets = await this.prisma.ticket.findMany({
        where: {
          status: 'CLOSED',
          closedAt: { gte: cutoffDate },
          rating: null,
        },
        select: { id: true, requesterId: true },
      });

      for (const ticket of tickets) {
        await this.notifications.notify({
          userId: ticket.requesterId,
          type: 'SURVEY_REQUEST',
          title: 'Pesquisa de Satisfação',
          message: 'Seu chamado foi resolvido. Ajude-nos avaliando nosso atendimento.',
          link: `/tickets/${ticket.id}`,
        });
      }

      return {
        status: 'SUCCESS',
        message: `${tickets.length} convites de pesquisa enviados`,
      };
    } catch (err) {
      this.logger.error(`Satisfaction survey failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao disparar pesquisas: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async waitingTicketReminder(): Promise<CronHandlerResult> {
    try {
      const settings = (await this.settingsService.getSettings('cron', {})) as Record<
        string,
        any
      >;
      const taskParam = (settings.waitingTicketReminder as Record<string, any>) || {
        thresholdHours: 48,
      };
      const thresholdHours = taskParam.thresholdHours || 48;

      const cutoffTime = new Date(Date.now() - thresholdHours * 3600_000);

      const tickets = await this.prisma.ticket.findMany({
        where: {
          status: { in: ['WAITING', 'PAUSED'] },
          updatedAt: { lte: cutoffTime },
        },
        select: { id: true, assignedToId: true, ticketNumber: true },
      });

      for (const ticket of tickets) {
        if (ticket.assignedToId) {
          await this.notifications.notify({
            userId: ticket.assignedToId,
            type: 'SYSTEM',
            title: 'Lembrete de Chamado Parado',
            message: `Chamado #${ticket.ticketNumber} está aguardando há mais de ${thresholdHours}h`,
            link: `/tickets/${ticket.id}`,
          });
        }
      }

      return {
        status: 'SUCCESS',
        message: `${tickets.length} lembretes enviados`,
      };
    } catch (err) {
      this.logger.error(`Waiting ticket reminder failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao enviar lembretes: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async purgeTelemetry(): Promise<CronHandlerResult> {
    try {
      const settings = (await this.settingsService.getSettings('cron', {})) as Record<
        string,
        any
      >;
      const taskParam = (settings.purgeTelemetry as Record<string, any>) || {
        keepRecords: 1440,
      };
      const keepRecords = taskParam.keepRecords || 1440;

      const assets = await this.prisma.asset.findMany({
        select: { id: true },
      });

      let totalDeleted = 0;

      for (const asset of assets) {
        const records = await this.prisma.assetTelemetry.findMany({
          where: { assetId: asset.id },
          orderBy: { recordedAt: 'desc' },
          skip: keepRecords,
          select: { id: true },
        });

        if (records.length > 0) {
          const result = await this.prisma.assetTelemetry.deleteMany({
            where: { id: { in: records.map((r) => r.id) } },
          });
          totalDeleted += result.count;
        }
      }

      return {
        status: 'SUCCESS',
        message: `${totalDeleted} registros de telemetria removidos`,
      };
    } catch (err) {
      this.logger.error(`Purge telemetry failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao limpar telemetria: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async recurringTickets(): Promise<CronHandlerResult> {
    try {
      const now = new Date();
      const recurring = await this.prisma.recurringTicket.findMany({
        where: {
          enabled: true,
          nextRun: { lte: now },
        },
      });

      let created = 0;

      for (const rec of recurring) {
        try {
          await this.prisma.ticket.create({
            data: {
              title: rec.title,
              description: rec.description,
              priority: rec.priority,
              status: 'OPEN',
              requesterId: rec.requesterId,
              assignedToId: rec.assignedToId || undefined,
              categoryId: rec.categoryId || undefined,
            },
          });
          created++;

          // Recalculate next run
          const nextRun = new Date(rec.nextRun || now);
          nextRun.setSeconds(nextRun.getSeconds() + rec.frequency);

          await this.prisma.recurringTicket.update({
            where: { id: rec.id },
            data: { lastRun: now, nextRun },
          });
        } catch (innerErr) {
          this.logger.warn(
            `Failed to create recurring ticket ${rec.id}: ${innerErr instanceof Error ? innerErr.message : String(innerErr)}`,
          );
        }
      }

      return {
        status: 'SUCCESS',
        message: `${created} chamados recorrentes gerados`,
      };
    } catch (err) {
      this.logger.error(`Recurring tickets failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro ao gerar recorrentes: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async networkDiscovery(): Promise<CronHandlerResult> {
    try {
      const settings = (await this.settingsService.getSettings('discovery', {})) as Record<
        string,
        any
      >;

      const subnet = settings.subnet || settings.defaultSubnet;
      if (!subnet) {
        return { status: 'SKIPPED', message: 'Subnet não configurada em discovery' };
      }

      const community = settings.community || 'public';
      const version = settings.version || 2;

      const scanRun = await this.discoveryService.runScan(subnet, community, version, 'cron');

      return {
        status: 'SUCCESS',
        message: `Varredura concluída: ${scanRun.hostsAlive} hosts, ${scanRun.devicesFound} dispositivos, ${scanRun.newDevices} novos`,
      };
    } catch (err) {
      this.logger.error(`Network discovery failed: ${err}`);
      return {
        status: 'ERROR',
        message: `Erro na descoberta de rede: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  async execute(taskName: string): Promise<CronHandlerResult> {
    const method = this[taskName as keyof CronHandlersService] as
      | (() => Promise<CronHandlerResult>)
      | undefined;

    if (!method) {
      return {
        status: 'ERROR',
        message: `Handler "${taskName}" não encontrado`,
      };
    }

    return (method as () => Promise<CronHandlerResult>).call(this);
  }
}
