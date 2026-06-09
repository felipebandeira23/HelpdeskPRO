import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatus, TicketPriority, Prisma, TicketFollowup } from '@prisma/client';

interface ListOptions {
  skip?: number;
  take?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
}

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTicketDto, userId: string): Promise<Ticket> {
    return this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        requesterId: dto.requesterId || userId,
        groupId: dto.groupId,
        assetId: dto.assetId,
        assignedToId: dto.assignedToId,
      },
      include: {
        requester: true,
        assignedTo: true,
        group: true,
        asset: true,
      },
    });
  }

  async findAll(options: ListOptions = {}): Promise<{
    data: Ticket[];
    pagination: { total: number; skip: number; take: number; hasMore: boolean };
  }> {
    const { skip = 0, take = 20, status, priority } = options;

    const where: Prisma.TicketWhereInput = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take,
        include: {
          requester: true,
          assignedTo: true,
          group: true,
          asset: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: true,
        assignedTo: true,
        group: true,
        asset: true,
        followups: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} não encontrado`);
    }

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findById(id);

    if (dto.status && !this.isValidStatusTransition(ticket.status, dto.status)) {
      throw new BadRequestException(
        `Transição de status inválida: ${ticket.status} -> ${dto.status}`,
      );
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...dto,
        closedAt: dto.status === 'CLOSED' ? new Date() : undefined,
      },
      include: {
        requester: true,
        assignedTo: true,
        group: true,
        asset: true,
      },
    });
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
    isInternal: boolean = false,
  ): Promise<TicketFollowup> {
    await this.findById(ticketId);

    return this.prisma.ticketFollowup.create({
      data: {
        ticketId,
        authorId,
        message,
        isInternal,
      },
      include: { author: true },
    });
  }

  private isValidStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): boolean {
    const validTransitions: Record<string, string[]> = {
      OPEN: ['IN_PROGRESS', 'PAUSED', 'CLOSED'],
      IN_PROGRESS: ['WAITING', 'PAUSED', 'CLOSED'],
      WAITING: ['IN_PROGRESS', 'PAUSED', 'CLOSED'],
      PAUSED: ['IN_PROGRESS', 'CLOSED'],
      CLOSED: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}
