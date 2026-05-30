import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SLAService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateSLA(
    ticketId: string,
    responseTimeMinutes?: number,
    solutionTimeMinutes?: number,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado');
    }

    const now = new Date();
    const responseTime = responseTimeMinutes
      ? new Date(now.getTime() + responseTimeMinutes * 60000)
      : null;
    const solutionTime = solutionTimeMinutes
      ? new Date(now.getTime() + solutionTimeMinutes * 60000)
      : null;

    return this.prisma.sLA.upsert({
      where: { ticketId },
      update: {
        responseTime,
        solutionTime,
      },
      create: {
        ticketId,
        responseTime,
        solutionTime,
      },
    });
  }

  async getSLA(ticketId: string) {
    const sla = await this.prisma.sLA.findUnique({
      where: { ticketId },
    });

    if (!sla) {
      throw new NotFoundException('SLA não encontrado');
    }

    return this.calculateStatus(sla);
  }

  async listBreachedSLAs() {
    const slas = await this.prisma.sLA.findMany({
      where: {
        OR: [
          { responseStatus: { in: ['WARNING', 'BREACHED'] } },
          { solutionStatus: { in: ['WARNING', 'BREACHED'] } },
        ],
      },
      include: {
        ticket: true,
      },
    });

    return slas.map((sla) => this.calculateStatus(sla));
  }

  private calculateStatus(sla: any) {
    const now = new Date();

    const getStatus = (dueDate: Date | null) => {
      if (!dueDate) return 'OK';
      const timeLeft = dueDate.getTime() - now.getTime();
      const percentage = (timeLeft / (dueDate.getTime() - new Date(sla.createdAt).getTime())) * 100;

      if (timeLeft < 0) return 'BREACHED';
      if (percentage < 25) return 'WARNING';
      return 'OK';
    };

    return {
      ...sla,
      responseStatus: getStatus(sla.responseTime),
      solutionStatus: getStatus(sla.solutionTime),
      responseTimeLeft: sla.responseTime
        ? Math.max(0, sla.responseTime.getTime() - now.getTime())
        : null,
      solutionTimeLeft: sla.solutionTime
        ? Math.max(0, sla.solutionTime.getTime() - now.getTime())
        : null,
    };
  }
}
