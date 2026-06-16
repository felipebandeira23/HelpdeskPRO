import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateTicketTaskDto } from './dto/create-ticket-task.dto';
import { UpdateTicketTaskDto } from './dto/update-ticket-task.dto';
import { CreateTicketCostDto } from './dto/create-ticket-cost.dto';
import { CreateTicketSolutionDto } from './dto/create-ticket-solution.dto';
import { UpdateTicketSolutionDto } from './dto/update-ticket-solution.dto';
import { CreateTicketValidationDto } from './dto/create-ticket-validation.dto';
import { UpdateTicketValidationDto } from './dto/update-ticket-validation.dto';
import { CreateTicketRelationDto } from './dto/create-ticket-relation.dto';
import { SLAService } from '../sla/sla.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AutomationService } from '../automation/automation.service';
import { SettingsService } from '../settings/settings.service';
import { TicketContext } from '../automation/automation-engine';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketUrgency,
  TicketImpact,
  Prisma,
  TicketFollowup,
  TicketFollower,
  TicketTask,
  TicketCost,
  TicketSolution,
  TicketValidation,
  TicketRelation,
} from '@prisma/client';

interface ListOptions {
  skip?: number;
  take?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: string;
  customerId?: string;
  assignedToId?: string;
}

const TICKET_INCLUDE = {
  requester: true,
  assignedTo: true,
  group: true,
  asset: true,
  category: true,
  customer: true,
} satisfies Prisma.TicketInclude;

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private slaService: SLAService,
    private notifications: NotificationsService,
    private automation: AutomationService,
    private settings: SettingsService,
  ) {}

  async create(dto: CreateTicketDto, userId: string): Promise<Ticket> {
    // Lê configurações de tickets do SettingsService
    const ticketConfig = await this.settings.getSettings('tickets', {
      defaultPriority: 'MEDIUM',
      defaultStatus: 'OPEN',
    });

    let priority = dto.priority as TicketPriority | undefined;

    // Calcula prioridade via matriz GLPI se urgency/impact fornecidos
    if (dto.urgency && dto.impact) {
      priority = this.glpiPriority(dto.urgency, dto.impact);
    } else if (!priority) {
      priority = ticketConfig.defaultPriority as TicketPriority;
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority,
        status: (ticketConfig.defaultStatus || 'OPEN') as any,
        kind: dto.kind || 'INCIDENT',
        urgency: dto.urgency || 'MEDIUM',
        impact: dto.impact || 'MEDIUM',
        externalId: dto.externalId,
        openedAt: dto.openedAt ? new Date(dto.openedAt) : undefined,
        requesterId: dto.requesterId || userId,
        groupId: dto.groupId,
        assetId: dto.assetId,
        assignedToId: dto.assignedToId,
        categoryId: dto.categoryId,
        customerId: dto.customerId,
        locationId: dto.locationId,
      },
      include: TICKET_INCLUDE,
    });

    // Aplica política de SLA automaticamente (não bloqueia a criação se falhar)
    await this.slaService.applyPolicyToTicket(ticket.id).catch(() => null);

    if (ticket.assignedToId && ticket.assignedToId !== userId) {
      await this.notifications.notify({
        userId: ticket.assignedToId,
        type: 'TICKET_ASSIGNED',
        title: `Ticket atribuído a você — #${ticket.ticketNumber}`,
        message: ticket.title,
        link: `/tickets/${ticket.id}`,
      });
    }

    // Regras de automação do gatilho de criação (nunca lança)
    await this.automation.executeRules(
      'ticket_created',
      ticket as unknown as TicketContext,
    );

    return ticket;
  }

  async findAll(options: ListOptions = {}): Promise<{
    data: Ticket[];
    pagination: { total: number; skip: number; take: number; hasMore: boolean };
  }> {
    const {
      skip = 0,
      take = 20,
      status,
      priority,
      categoryId,
      customerId,
      assignedToId,
    } = options;

    const where: Prisma.TicketWhereInput = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (customerId) where.customerId = customerId;
    if (assignedToId) where.assignedToId = assignedToId;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take,
        include: { ...TICKET_INCLUDE, sla: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      pagination: { total, skip, take, hasMore: skip + take < total },
    };
  }

  async findById(id: string, user?: { id: string; profileId: string }): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        ...TICKET_INCLUDE,
        followups: {
          include: { author: true, attachments: true },
          orderBy: { createdAt: 'asc' },
        },
        sla: { include: { policy: true } },
        followers: { include: { user: { select: { id: true, name: true } } } },
        attachments: {
          include: { uploadedBy: { select: { id: true, name: true } } },
        },
        rating: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} não encontrado`);
    }

    if (user) {
      const userProfile = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { profile: { select: { name: true } } },
      });
      const isAgent = userProfile?.profile?.name === 'Administrador' || userProfile?.profile?.name === 'Técnico';
      const isRequester = ticket.requesterId === user.id;

      ticket.followups = ticket.followups.filter((followup) => {
        if (followup.isInternal) {
          return isAgent;
        }
        return true;
      });
    }

    return ticket;
  }

  /** Últimos tickets do mesmo solicitante — sidebar estilo Milvus. */
  async findRecentByRequester(
    ticketId: string,
    limit = 5,
  ): Promise<Ticket[]> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { requesterId: true },
    });
    if (!ticket) throw new NotFoundException('Ticket não encontrado');

    return this.prisma.ticket.findMany({
      where: { requesterId: ticket.requesterId, id: { not: ticketId } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
      } as Prisma.TicketSelect,
    }) as unknown as Promise<Ticket[]>;
  }

  async update(
    id: string,
    dto: UpdateTicketDto,
    actorId?: string,
  ): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (dto.status && dto.status !== ticket.status) {
      if (!this.isValidStatusTransition(ticket.status, dto.status)) {
        throw new BadRequestException(
          `Transição de status inválida: ${ticket.status} -> ${dto.status}`,
        );
      }
      if (dto.status === 'PAUSED' && !dto.pauseReason) {
        throw new BadRequestException(
          'Informe o motivo da pausa (pauseReason)',
        );
      }
    }

    const data: Prisma.TicketUpdateInput = {
      ...this.scalarUpdates(dto),
    };

    // Recalcula prioridade se urgency/impact fornecidos
    if (dto.urgency || dto.impact) {
      const urgency = (dto.urgency || ticket.urgency) as TicketUrgency;
      const impact = (dto.impact || ticket.impact) as TicketImpact;
      data.priority = this.glpiPriority(urgency, impact);
    }

    // Parse openedAt se fornecido
    if (dto.openedAt) {
      data.openedAt = new Date(dto.openedAt);
    }

    // Ciclo de pausa: registra/limpa motivo e sincroniza o contador de SLA
    if (dto.status && dto.status !== ticket.status) {
      if (dto.status === 'PAUSED') {
        data.pauseReason = dto.pauseReason;
        data.pausedAt = new Date();
        await this.slaService.pause(id);
      } else if (ticket.status === 'PAUSED') {
        data.pauseReason = null;
        data.pausedAt = null;
        await this.slaService.resume(id);
      }

      // Ciclo de solução: proposta de solução (RESOLVED) → aprovação/recusa (CLOSED)
      if (dto.status === 'RESOLVED') {
        data.resolvedAt = new Date();
        await this.slaService.markSolved(id);
      } else if (ticket.status === 'RESOLVED') {
        data.resolvedAt = null; // recusa da solução
      }

      if (dto.status === 'CLOSED') {
        data.closedAt = new Date();
        // Calcula totalDuration: diferença entre fechamento e abertura
        data.totalDuration = this.calculateDuration(ticket.createdAt, new Date());
        await this.slaService.markSolved(id);
      } else if (ticket.status === 'CLOSED') {
        data.closedAt = null; // reabertura
        data.totalDuration = null;
      }
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data,
      include: TICKET_INCLUDE,
    });

    // Notificações de eventos relevantes
    if (
      dto.assignedToId &&
      dto.assignedToId !== ticket.assignedToId &&
      dto.assignedToId !== actorId
    ) {
      await this.notifications.notify({
        userId: dto.assignedToId,
        type: 'TICKET_ASSIGNED',
        title: `Ticket atribuído a você — #${updated.ticketNumber}`,
        message: updated.title,
        link: `/tickets/${updated.id}`,
      });
    }

    if (dto.status === 'CLOSED') {
      await this.notifyFollowersAndRequester(updated, actorId, {
        type: 'TICKET_CLOSED',
        title: `Ticket fechado — #${updated.ticketNumber}`,
        message: updated.title,
        link: `/tickets/${updated.id}`,
      });
    }

    // Regras de automação do gatilho de atualização (nunca lança)
    await this.automation.executeRules(
      'ticket_updated',
      updated as unknown as TicketContext,
    );

    return updated;
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.findById(id);
    await this.prisma.ticket.delete({ where: { id } });
    return { message: 'Ticket deletado com sucesso' };
  }

  async addFollowup(
    ticketId: string,
    authorId: string,
    message: string,
    isInternal = false,
  ): Promise<TicketFollowup> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        requesterId: true,
        assignedToId: true,
        firstResponseAt: true,
      },
    });
    if (!ticket) throw new NotFoundException('Ticket não encontrado');

    const followup = await this.prisma.ticketFollowup.create({
      data: { ticketId, authorId, message, isInternal },
      include: { author: true },
    });

    // Primeira resposta pública de um operador (não o solicitante) conta para o SLA
    if (
      !isInternal &&
      !ticket.firstResponseAt &&
      authorId !== ticket.requesterId
    ) {
      const author = await this.prisma.user.findUnique({
        where: { id: authorId },
        select: { profileId: true, profile: { select: { name: true } } },
      });
      if (author && author.profile?.name !== 'Visualizador') {
        await this.prisma.ticket.update({
          where: { id: ticketId },
          data: { firstResponseAt: followup.createdAt },
        });
        await this.slaService.markResponded(ticketId, followup.createdAt);
      }
    }

    // Notifica seguidores + envolvidos (exceto o autor); notas internas não vão ao solicitante
    if (!isInternal) {
      const followers = await this.prisma.ticketFollower.findMany({
        where: { ticketId },
        select: { userId: true },
      });
      const targets = [
        ticket.requesterId,
        ticket.assignedToId,
        ...followers.map((f) => f.userId),
      ].filter((u): u is string => !!u && u !== authorId);

      await this.notifications.notifyMany(targets, {
        type: 'TICKET_FOLLOWUP',
        title: `Nova mensagem — #${ticket.ticketNumber}`,
        message: message.slice(0, 140),
        link: `/tickets/${ticketId}`,
      });
    }

    return followup;
  }

  // ─── Seguidores ───────────────────────────────────────────────────────────

  async addFollower(ticketId: string, userId: string): Promise<TicketFollower> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, ticketNumber: true, title: true },
    });
    if (!ticket) throw new NotFoundException('Ticket não encontrado');

    const follower = await this.prisma.ticketFollower.upsert({
      where: { ticketId_userId: { ticketId, userId } },
      update: {},
      create: { ticketId, userId },
      include: { user: { select: { id: true, name: true } } },
    });

    await this.notifications.notify({
      userId,
      type: 'FOLLOWER_ADDED',
      title: `Você agora segue o ticket #${ticket.ticketNumber}`,
      message: ticket.title,
      link: `/tickets/${ticketId}`,
    });

    return follower;
  }

  async removeFollower(
    ticketId: string,
    userId: string,
  ): Promise<{ message: string }> {
    await this.prisma.ticketFollower.deleteMany({ where: { ticketId, userId } });
    return { message: 'Seguidor removido' };
  }

  // ─── Privados ─────────────────────────────────────────────────────────────

  private scalarUpdates(dto: UpdateTicketDto): Prisma.TicketUpdateInput {
    const { pauseReason: _omit, ...rest } = dto;
    return rest as Prisma.TicketUpdateInput;
  }

  private async notifyFollowersAndRequester(
    ticket: Ticket,
    actorId: string | undefined,
    data: {
      type: 'TICKET_CLOSED';
      title: string;
      message: string;
      link: string;
    },
  ): Promise<void> {
    const followers = await this.prisma.ticketFollower.findMany({
      where: { ticketId: ticket.id },
      select: { userId: true },
    });
    const targets = [
      ticket.requesterId,
      ...followers.map((f) => f.userId),
    ].filter((u): u is string => !!u && u !== actorId);

    await this.notifications.notifyMany(targets, data);
  }

  private isValidStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): boolean {
    // Reabertura de CLOSED permitida (padrão GLPI); OPEN→WAITING liberado
    // RESOLVED: proposta de solução esperando aprovação do solicitante
    const validTransitions: Record<string, string[]> = {
      OPEN: ['IN_PROGRESS', 'WAITING', 'PAUSED', 'CLOSED'],
      IN_PROGRESS: ['WAITING', 'PAUSED', 'RESOLVED', 'CLOSED'],
      WAITING: ['IN_PROGRESS', 'PAUSED', 'RESOLVED', 'CLOSED'],
      PAUSED: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
      RESOLVED: ['IN_PROGRESS', 'CLOSED'], // recusa ou aprovação da solução
      CLOSED: ['OPEN', 'IN_PROGRESS'],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  // ─── Matriz GLPI de Prioridade (FASE 4) ────────────────────────────────────

  private glpiPriority(urgency: TicketUrgency, impact: TicketImpact): TicketPriority {
    const urgencyMap: Record<TicketUrgency, number> = {
      VERY_LOW: 0,
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      VERY_HIGH: 4,
    };

    const impactMap: Record<TicketImpact, number> = {
      VERY_LOW: 0,
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      VERY_HIGH: 4,
    };

    const u = urgencyMap[urgency];
    const i = impactMap[impact];

    // Matriz 5×5: VERY_HIGH×VERY_HIGH, qualquer VERY_HIGH×HIGH → URGENT
    if ((u === 4 && i === 4) || (u === 4 && i === 3) || (u === 3 && i === 4)) {
      return 'URGENT';
    }

    // HIGH×HIGH → HIGH
    if (u === 3 && i === 3) {
      return 'HIGH';
    }

    // Médios e baixos
    if ((u >= 2 && i >= 2) || (u === 3 && i === 2) || (u === 2 && i === 3)) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  private calculateDuration(startDate: Date, endDate: Date): number {
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffMs / (1000 * 60)); // minutos
  }

  // ─── Sub-Recursos: Tarefas (FASE 3) ───────────────────────────────────────

  async createTask(ticketId: string, dto: CreateTicketTaskDto): Promise<TicketTask> {
    await this.findById(ticketId);
    return this.prisma.ticketTask.create({
      data: {
        ticketId,
        content: dto.content,
        isDone: dto.isDone || false,
        assignedToId: dto.assignedToId,
        actionTime: dto.actionTime,
        plannedAt: dto.plannedAt ? new Date(dto.plannedAt) : undefined,
        plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : undefined,
        isPrivate: dto.isPrivate || false,
      },
    });
  }

  async getTasks(ticketId: string): Promise<TicketTask[]> {
    await this.findById(ticketId);
    return this.prisma.ticketTask.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTask(ticketId: string, taskId: string, dto: UpdateTicketTaskDto): Promise<TicketTask> {
    await this.findById(ticketId);
    const task = await this.prisma.ticketTask.findUnique({ where: { id: taskId } });
    if (!task || task.ticketId !== ticketId) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    return this.prisma.ticketTask.update({
      where: { id: taskId },
      data: {
        content: dto.content,
        isDone: dto.isDone,
        assignedToId: dto.assignedToId,
        actionTime: dto.actionTime,
        plannedAt: dto.plannedAt ? new Date(dto.plannedAt) : undefined,
        plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : undefined,
        isPrivate: dto.isPrivate,
      },
    });
  }

  async deleteTask(ticketId: string, taskId: string): Promise<{ message: string }> {
    await this.findById(ticketId);
    const task = await this.prisma.ticketTask.findUnique({ where: { id: taskId } });
    if (!task || task.ticketId !== ticketId) {
      throw new NotFoundException('Tarefa não encontrada');
    }
    await this.prisma.ticketTask.delete({ where: { id: taskId } });
    return { message: 'Tarefa deletada' };
  }

  // ─── Sub-Recursos: Custos (FASE 3) ────────────────────────────────────────

  async createCost(ticketId: string, dto: CreateTicketCostDto): Promise<TicketCost> {
    await this.findById(ticketId);
    return this.prisma.ticketCost.create({
      data: {
        ticketId,
        costTime: dto.costTime,
        actionTime: dto.actionTime,
        costFixed: dto.costFixed,
        costMaterial: dto.costMaterial,
      },
    });
  }

  async getCosts(ticketId: string): Promise<{
    costs: TicketCost[];
    totals: {
      timeTotal: number;
      fixedTotal: number;
      materialTotal: number;
      grandTotal: number;
    };
  }> {
    await this.findById(ticketId);
    const costs = await this.prisma.ticketCost.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });

    const timeTotal = costs.reduce((sum, c) => sum + ((c.costTime || 0) * (c.actionTime || 0)), 0);
    const fixedTotal = costs.reduce((sum, c) => sum + (c.costFixed || 0), 0);
    const materialTotal = costs.reduce((sum, c) => sum + (c.costMaterial || 0), 0);
    const grandTotal = timeTotal + fixedTotal + materialTotal;

    return { costs, totals: { timeTotal, fixedTotal, materialTotal, grandTotal } };
  }

  // ─── Sub-Recursos: Solução (FASE 3) ───────────────────────────────────────

  async createSolution(ticketId: string, dto: CreateTicketSolutionDto): Promise<TicketSolution> {
    await this.findById(ticketId);
    // TODO: limpar soluções PENDING_APPROVAL anteriores?
    return this.prisma.ticketSolution.create({
      data: {
        ticketId,
        content: dto.content,
        status: 'PENDING_APPROVAL',
      },
    });
  }

  async getSolutions(ticketId: string): Promise<TicketSolution[]> {
    await this.findById(ticketId);
    return this.prisma.ticketSolution.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSolution(
    ticketId: string,
    solutionId: string,
    dto: UpdateTicketSolutionDto,
  ): Promise<TicketSolution> {
    await this.findById(ticketId);
    const solution = await this.prisma.ticketSolution.findUnique({ where: { id: solutionId } });
    if (!solution || solution.ticketId !== ticketId) {
      throw new NotFoundException('Solução não encontrada');
    }

    return this.prisma.ticketSolution.update({
      where: { id: solutionId },
      data: {
        status: dto.status,
        refusalReason: dto.refusalReason,
      },
    });
  }

  // ─── Sub-Recursos: Validação (FASE 3) ─────────────────────────────────────

  async createValidation(ticketId: string, dto: CreateTicketValidationDto): Promise<TicketValidation> {
    await this.findById(ticketId);
    return this.prisma.ticketValidation.create({
      data: {
        ticketId,
        content: dto.content,
        status: 'PENDING',
      },
    });
  }

  async getValidations(ticketId: string): Promise<TicketValidation[]> {
    await this.findById(ticketId);
    return this.prisma.ticketValidation.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateValidation(
    ticketId: string,
    validationId: string,
    dto: UpdateTicketValidationDto,
  ): Promise<TicketValidation> {
    await this.findById(ticketId);
    const validation = await this.prisma.ticketValidation.findUnique({
      where: { id: validationId },
    });
    if (!validation || validation.ticketId !== ticketId) {
      throw new NotFoundException('Validação não encontrada');
    }

    return this.prisma.ticketValidation.update({
      where: { id: validationId },
      data: {
        status: dto.status,
        validatorId: dto.validatorId,
      },
    });
  }

  // ─── Sub-Recursos: Relações (FASE 3) ──────────────────────────────────────

  async createRelation(ticketId: string, dto: CreateTicketRelationDto): Promise<TicketRelation> {
    await this.findById(ticketId);
    await this.findById(dto.relatedTicketId);

    return this.prisma.ticketRelation.create({
      data: {
        ticketId,
        relatedTicketId: dto.relatedTicketId,
        type: dto.type,
      },
    });
  }

  async getRelations(ticketId: string): Promise<TicketRelation[]> {
    await this.findById(ticketId);
    return this.prisma.ticketRelation.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteRelation(ticketId: string, relationId: string): Promise<{ message: string }> {
    await this.findById(ticketId);
    const relation = await this.prisma.ticketRelation.findUnique({ where: { id: relationId } });
    if (!relation || relation.ticketId !== ticketId) {
      throw new NotFoundException('Relação não encontrada');
    }
    await this.prisma.ticketRelation.delete({ where: { id: relationId } });
    return { message: 'Relação deletada' };
  }
}
