import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [ticketsOpenCount, usersCount, groupsCount, assetsCount] =
      await Promise.all([
        this.prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
        this.prisma.user.count({ where: { active: true } }),
        this.prisma.group.count(),
        this.prisma.asset.count(),
      ]);

    return {
      ticketsOpen: ticketsOpenCount,
      users: usersCount,
      groups: groupsCount,
      assets: assetsCount,
    };
  }

  async getRecentTickets(limit: number = 5) {
    return this.prisma.ticket.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: true,
        assignedTo: true,
      },
    });
  }
}
