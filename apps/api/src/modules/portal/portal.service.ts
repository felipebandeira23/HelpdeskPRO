import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Ticket, TicketFollowup } from '@prisma/client';

@Injectable()
export class PortalService {
  constructor(private prisma: PrismaService) {}

  async createTicketPublic(data: {
    email: string;
    name: string;
    title: string;
    description: string;
  }): Promise<Ticket> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    return this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        requesterId: user?.id || 'public-user',
      },
    });
  }

  async getTicketsPublic(email: string): Promise<unknown[]> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return [];

    return this.prisma.ticket.findMany({
      where: { requesterId: user.id },
      select: { id: true, title: true, status: true, createdAt: true },
    });
  }

  async getTicketPublic(ticketId: string): Promise<unknown> {
    return this.prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        description: true,
        followups: {
          where: { isInternal: false },
          select: {
            message: true,
            author: { select: { name: true } },
            createdAt: true,
          },
        },
      },
    });
  }

  async addPublicFollowup(
    ticketId: string,
    email: string,
    message: string,
  ): Promise<TicketFollowup> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error('User not found');

    return this.prisma.ticketFollowup.create({
      data: {
        ticketId,
        authorId: user.id,
        message,
        isInternal: false,
      },
    });
  }
}
