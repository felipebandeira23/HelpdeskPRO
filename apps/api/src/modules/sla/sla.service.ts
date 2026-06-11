import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SLA, SLAStatus, TicketPriority, SlaPolicy } from '@prisma/client';
import { addBusinessMinutes } from './business-hours.util';

const EVALUATION_INTERVAL_MS = 60_000;
const WARNING_THRESHOLD = 0.25; // avisa quando resta <25% da janela

export interface SlaView extends SLA {
  responseTimeLeftMs: number | null;
  solutionTimeLeftMs: number | null;
}

@Injectable()
export class SLAService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SLAService.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // setInterval em vez de @nestjs/schedule para não adicionar dependência nova (PLANO.md §5)
  onModuleInit(): void {
    this.timer = setInterval(() => {
      this.evaluateAll().catch((err) =>
        this.logger.error(`Avaliação de SLA falhou: ${err}`),
      );
    }, EVALUATION_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  // ─── Aplicação de política ────────────────────────────────────────────────

  /**
   * Resolve a política aplicável e cria/atualiza o SLA do ticket.
   * Especificidade: categoria+prioridade > categoria > prioridade > global.
   */
  async applyPolicyToTicket(ticketId: string): Promise<SLA | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, priority: true, categoryId: true, createdAt: true },
    });
    if (!ticket) throw new NotFoundException('Ticket não encontrado');

    const policy = await this.resolvePolicy(ticket.priority, ticket.categoryId);
    if (!policy) return null; // sem política configurada — ticket fica sem SLA

    const start = new Date();
    const [responseTime, solutionTime] = await Promise.all([
      this.computeDeadline(start, policy.responseMinutes, policy.businessHoursOnly),
      this.computeDeadline(start, policy.solutionMinutes, policy.businessHoursOnly),
    ]);

    return this.prisma.sLA.upsert({
      where: { ticketId },
      update: { policyId: policy.id, responseTime, solutionTime },
      create: { ticketId, policyId: policy.id, responseTime, solutionTime },
    });
  }

  private async resolvePolicy(
    priority: TicketPriority,
    categoryId: string | null,
  ): Promise<SlaPolicy | null> {
    const candidates = await this.prisma.slaPolicy.findMany({
      where: { active: true },
    });

    const matches = candidates.filter(
      (p) =>
        (!p.priority || p.priority === priority) &&
        (!p.categoryId || p.categoryId === categoryId),
    );

    const score = (p: SlaPolicy): number =>
      (p.categoryId ? 2 : 0) + (p.priority ? 1 : 0);

    return matches.sort((a, b) => score(b) - score(a))[0] ?? null;
  }

  private async computeDeadline(
    start: Date,
    minutes: number,
    businessHoursOnly: boolean,
  ): Promise<Date> {
    if (!businessHoursOnly) {
      return new Date(start.getTime() + minutes * 60000);
    }
    const [hours, holidays] = await Promise.all([
      this.prisma.businessHours.findMany(),
      this.prisma.holiday.findMany(),
    ]);
    return addBusinessMinutes(start, minutes, hours, holidays);
  }

  // ─── Eventos do ciclo de vida do ticket ───────────────────────────────────

  /** Registra a primeira resposta pública do operador. */
  async markResponded(ticketId: string, at: Date = new Date()): Promise<void> {
    const sla = await this.prisma.sLA.findUnique({ where: { ticketId } });
    if (!sla || sla.respondedAt) return;

    const status: SLAStatus =
      sla.responseTime && at > sla.responseTime ? 'BREACHED' : 'OK';

    await this.prisma.sLA.update({
      where: { ticketId },
      data: { respondedAt: at, responseStatus: status },
    });
  }

  /** Registra a solução (fechamento do ticket). */
  async markSolved(ticketId: string, at: Date = new Date()): Promise<void> {
    const sla = await this.prisma.sLA.findUnique({ where: { ticketId } });
    if (!sla || sla.solvedAt) return;

    const status: SLAStatus =
      sla.solutionTime && at > sla.solutionTime ? 'BREACHED' : 'OK';

    await this.prisma.sLA.update({
      where: { ticketId },
      data: { solvedAt: at, solutionStatus: status },
    });
  }

  /** Pausa o contador (ticket em PAUSED). */
  async pause(ticketId: string): Promise<void> {
    const sla = await this.prisma.sLA.findUnique({ where: { ticketId } });
    if (!sla || sla.pausedAt) return;
    await this.prisma.sLA.update({
      where: { ticketId },
      data: { pausedAt: new Date() },
    });
  }

  /** Retoma o contador, deslocando os prazos pelo tempo pausado. */
  async resume(ticketId: string): Promise<void> {
    const sla = await this.prisma.sLA.findUnique({ where: { ticketId } });
    if (!sla || !sla.pausedAt) return;

    const pausedMs = Date.now() - sla.pausedAt.getTime();
    const shift = (d: Date | null): Date | null =>
      d ? new Date(d.getTime() + pausedMs) : null;

    await this.prisma.sLA.update({
      where: { ticketId },
      data: {
        pausedAt: null,
        totalPausedMinutes: sla.totalPausedMinutes + Math.round(pausedMs / 60000),
        responseTime: shift(sla.responseTime),
        solutionTime: shift(sla.solutionTime),
      },
    });
  }

  // ─── Avaliação periódica (persiste status e notifica transições) ──────────

  async evaluateAll(): Promise<{ updated: number }> {
    const now = new Date();
    const open = await this.prisma.sLA.findMany({
      where: {
        pausedAt: null,
        ticket: { status: { notIn: ['CLOSED'] } },
      },
      include: {
        ticket: {
          select: { id: true, ticketNumber: true, title: true, assignedToId: true },
        },
      },
    });

    let updated = 0;
    for (const sla of open) {
      const newResponse = sla.respondedAt
        ? sla.responseStatus
        : this.computeStatus(sla.createdAt, sla.responseTime, now);
      const newSolution = sla.solvedAt
        ? sla.solutionStatus
        : this.computeStatus(sla.createdAt, sla.solutionTime, now);

      if (newResponse === sla.responseStatus && newSolution === sla.solutionStatus) {
        continue;
      }

      await this.prisma.sLA.update({
        where: { id: sla.id },
        data: { responseStatus: newResponse, solutionStatus: newSolution },
      });
      updated++;

      // Notifica o responsável apenas na transição (não a cada minuto)
      const transitioned =
        (newResponse !== sla.responseStatus && newResponse !== 'OK') ||
        (newSolution !== sla.solutionStatus && newSolution !== 'OK');

      if (transitioned && sla.ticket.assignedToId) {
        const breached = newResponse === 'BREACHED' || newSolution === 'BREACHED';
        await this.notifications.notify({
          userId: sla.ticket.assignedToId,
          type: breached ? 'SLA_BREACHED' : 'SLA_WARNING',
          title: breached
            ? `SLA estourado — #${sla.ticket.ticketNumber}`
            : `SLA prestes a estourar — #${sla.ticket.ticketNumber}`,
          message: sla.ticket.title,
          link: `/tickets/${sla.ticket.id}`,
        });
      }
    }

    return { updated };
  }

  private computeStatus(
    createdAt: Date,
    deadline: Date | null,
    now: Date,
  ): SLAStatus {
    if (!deadline) return 'OK';
    if (now > deadline) return 'BREACHED';

    const total = deadline.getTime() - createdAt.getTime();
    const left = deadline.getTime() - now.getTime();
    return total > 0 && left / total < WARNING_THRESHOLD ? 'WARNING' : 'OK';
  }

  // ─── Consultas ────────────────────────────────────────────────────────────

  async getSLA(ticketId: string): Promise<SlaView> {
    const sla = await this.prisma.sLA.findUnique({
      where: { ticketId },
      include: { policy: true },
    });
    if (!sla) throw new NotFoundException('SLA não encontrado');
    return this.toView(sla);
  }

  /** Painel semafórico: pausados / prestes a estourar / estourados. */
  async getPanel(): Promise<Record<string, unknown>> {
    const base = { ticket: { status: { notIn: ['CLOSED' as const] } } };
    const include = {
      ticket: {
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          priority: true,
          assignedTo: { select: { id: true, name: true } },
        },
      },
    };

    const [paused, warning, breached] = await Promise.all([
      this.prisma.sLA.findMany({
        where: { ...base, pausedAt: { not: null } },
        include,
        take: 20,
      }),
      this.prisma.sLA.findMany({
        where: {
          ...base,
          pausedAt: null,
          OR: [{ responseStatus: 'WARNING' }, { solutionStatus: 'WARNING' }],
        },
        include,
        take: 20,
      }),
      this.prisma.sLA.findMany({
        where: {
          ...base,
          pausedAt: null,
          OR: [{ responseStatus: 'BREACHED' }, { solutionStatus: 'BREACHED' }],
        },
        include,
        take: 20,
      }),
    ]);

    return {
      paused: { count: paused.length, items: paused.map((s) => this.toView(s)) },
      warning: { count: warning.length, items: warning.map((s) => this.toView(s)) },
      breached: {
        count: breached.length,
        items: breached.map((s) => this.toView(s)),
      },
    };
  }

  async listBreachedSLAs(): Promise<SlaView[]> {
    const slas = await this.prisma.sLA.findMany({
      where: {
        OR: [
          { responseStatus: { in: ['WARNING', 'BREACHED'] } },
          { solutionStatus: { in: ['WARNING', 'BREACHED'] } },
        ],
      },
      include: { ticket: true },
    });
    return slas.map((s) => this.toView(s));
  }

  private toView(sla: SLA): SlaView {
    const now = Date.now();
    return {
      ...sla,
      responseTimeLeftMs: sla.responseTime
        ? Math.max(0, sla.responseTime.getTime() - now)
        : null,
      solutionTimeLeftMs: sla.solutionTime
        ? Math.max(0, sla.solutionTime.getTime() - now)
        : null,
    };
  }
}
