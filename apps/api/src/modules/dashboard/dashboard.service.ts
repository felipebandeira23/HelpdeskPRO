import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const [totalTickets, openTickets, closedTickets, byStatus, byPriority] =
      await Promise.all([
        this.prisma.ticket.count(),
        this.prisma.ticket.count({ where: { status: 'OPEN' } }),
        this.prisma.ticket.count({ where: { status: 'CLOSED' } }),
        this.getTicketsByStatus(),
        this.getTicketsByPriority(),
      ]);

    return {
      total_tickets: totalTickets,
      open_tickets: openTickets,
      closed_tickets: closedTickets,
      by_status: byStatus,
      by_priority: byPriority,
      close_rate: totalTickets > 0 ? (closedTickets / totalTickets) * 100 : 0,
    };
  }

  async getBreachedSLAs() {
    return this.prisma.sLA.findMany({
      where: {
        OR: [
          { responseStatus: 'BREACHED' },
          { solutionStatus: 'BREACHED' },
        ],
      },
      include: { ticket: { select: { id: true, title: true } } },
    });
  }

  async getWarningSLAs() {
    return this.prisma.sLA.findMany({
      where: {
        OR: [
          { responseStatus: 'WARNING' },
          { solutionStatus: 'WARNING' },
        ],
      },
      include: { ticket: { select: { id: true, title: true } } },
    });
  }

  async getTopRequesters(limit = 5) {
    const results = await this.prisma.ticket.groupBy({
      by: ['requesterId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const withNames = await Promise.all(
      results.map(async (r) => {
        const user = await this.prisma.user.findUnique({
          where: { id: r.requesterId },
          select: { name: true, email: true },
        });
        return { ...user, count: r._count.id };
      }),
    );

    return withNames;
  }

  async getTicketsByStatus() {
    const statuses = ['OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED', 'PAUSED'];
    const results = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.ticket.count({
          where: { status: status as any },
        }),
      })),
    );
    return results;
  }

  async getTicketsByPriority() {
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const results = await Promise.all(
      priorities.map(async (priority) => ({
        priority,
        count: await this.prisma.ticket.count({
          where: { priority: priority as any },
        }),
      })),
    );
    return results;
  }

  async getRecentTickets(limit = 10) {
    return this.prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { requester: true, assignedTo: true },
    });
  }
}
