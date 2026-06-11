import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TicketRating } from '@prisma/client';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async submitRating(data: {
    ticketId: string;
    userId: string;
    rating: number;
    comment?: string;
  }): Promise<TicketRating> {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException('Avaliação deve ser entre 1 e 5');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: data.ticketId },
      select: { id: true, status: true, requesterId: true },
    });
    if (!ticket) throw new NotFoundException('Ticket não encontrado');
    if (ticket.status !== 'CLOSED') {
      throw new BadRequestException(
        'Apenas tickets fechados podem ser avaliados',
      );
    }
    if (ticket.requesterId !== data.userId) {
      throw new BadRequestException(
        'Apenas o solicitante pode avaliar o atendimento',
      );
    }

    return this.prisma.ticketRating.upsert({
      where: { ticketId: data.ticketId },
      update: { rating: data.rating, comment: data.comment },
      create: {
        ticketId: data.ticketId,
        raterId: data.userId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }

  async getTicketRating(ticketId: string): Promise<TicketRating | null> {
    return this.prisma.ticketRating.findUnique({
      where: { ticketId },
      include: { rater: { select: { id: true, name: true } } },
    });
  }

  /** Agregados reais para o dashboard de satisfação. */
  async getSurveyResults(): Promise<Record<string, unknown>> {
    const [agg, distribution, recent, allRatings] = await Promise.all([
      this.prisma.ticketRating.aggregate({
        _avg: { rating: true },
        _count: true,
      }),
      this.prisma.ticketRating.groupBy({
        by: ['rating'],
        _count: true,
        orderBy: { rating: 'asc' },
      }),
      this.prisma.ticketRating.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          ticket: { select: { id: true, ticketNumber: true, title: true } },
          rater: { select: { name: true } },
        },
      }),
      this.prisma.ticketRating.findMany({
        include: {
          ticket: {
            select: { assignedTo: { select: { id: true, name: true } } },
          },
        },
      }),
    ]);

    // Média por operador (em memória — volume de ratings é pequeno)
    const operatorMap = new Map<
      string,
      { name: string; sum: number; count: number }
    >();
    for (const r of allRatings) {
      const op = r.ticket.assignedTo;
      if (!op) continue;
      const entry = operatorMap.get(op.id) || { name: op.name, sum: 0, count: 0 };
      entry.sum += r.rating;
      entry.count++;
      operatorMap.set(op.id, entry);
    }

    const total = agg._count;
    const satisfied = distribution
      .filter((d) => d.rating >= 4)
      .reduce((acc, d) => acc + d._count, 0);

    return {
      averageRating: agg._avg.rating ? Number(agg._avg.rating.toFixed(2)) : null,
      totalSurveys: total,
      satisfactionRate: total > 0 ? Math.round((satisfied / total) * 100) : null,
      distribution: distribution.map((d) => ({
        rating: d.rating,
        count: d._count,
      })),
      byOperator: [...operatorMap.entries()].map(([id, e]) => ({
        operatorId: id,
        name: e.name,
        average: Number((e.sum / e.count).toFixed(2)),
        count: e.count,
      })),
      recent,
    };
  }
}
