import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { SLAService } from '../sla/sla.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AutomationService } from '../automation/automation.service';
import { TicketContext } from '../automation/automation-engine';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  Prisma,
  TicketFollowup,
  TicketFollower,
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
  ) {}

  async create(dto: CreateTicketDto, userId: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        requesterId: dto.requesterId || userId,
        groupId: dto.groupId,
        assetId: dto.assetId,
        assignedToId: dto.assignedToId,
        categoryId: dto.categoryId,
        customerId: dto.customerId,
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

  async findById(id: string): Promise<Ticket> {
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

      if (dto.status === 'CLOSED') {
        data.closedAt = new Date();
        await this.slaService.markSolved(id);
      } else if (ticket.status === 'CLOSED') {
        data.closedAt = null; // reabertura
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
        select: { role: true },
      });
      if (author && author.role !== 'VIEWER') {
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
    const validTransitions: Record<string, string[]> = {
      OPEN: ['IN_PROGRESS', 'WAITING', 'PAUSED', 'CLOSED'],
      IN_PROGRESS: ['WAITING', 'PAUSED', 'CLOSED'],
      WAITING: ['IN_PROGRESS', 'PAUSED', 'CLOSED'],
      PAUSED: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
      CLOSED: ['OPEN', 'IN_PROGRESS'],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}
