import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface DateRange {
  from: Date;
  to: Date;
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(
    type: string,
    dateRange: DateRange,
  ): Promise<Record<string, unknown>> {
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
      throw new BadRequestException('Período inválido');
    }

    const data = await this.buildReport(type, from, to);
    return { type, dateRange: { from, to }, data, generatedAt: new Date() };
  }

  private async buildReport(
    type: string,
    from: Date,
    to: Date,
  ): Promise<Record<string, unknown>> {
    switch (type) {
      case 'overview':
        return this.overview(from, to);
      case 'by-status':
        return this.byField('status', from, to);
      case 'by-priority':
        return this.byField('priority', from, to);
      case 'by-category':
        return this.byCategory(from, to);
      case 'by-operator':
        return this.byOperator(from, to);
      case 'sla':
        return this.slaCompliance(from, to);
      default:
        throw new BadRequestException(
          `Tipo de relatório desconhecido: ${type}. ` +
            'Disponíveis: overview, by-status, by-priority, by-category, by-operator, sla',
        );
    }
  }

  private createdBetween(from: Date, to: Date): Prisma.TicketWhereInput {
    return { createdAt: { gte: from, lte: to } };
  }

  private async overview(from: Date, to: Date): Promise<Record<string, unknown>> {
    const where = this.createdBetween(from, to);

    const [total, closed, closedTickets] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.count({ where: { ...where, status: 'CLOSED' } }),
      this.prisma.ticket.findMany({
        where: { ...where, status: 'CLOSED', closedAt: { not: null } },
        select: { createdAt: true, closedAt: true },
      }),
    ]);

    const resolutionHours = closedTickets.map(
      (t) => (t.closedAt!.getTime() - t.createdAt.getTime()) / 3600000,
    );
    const avgResolutionHours =
      resolutionHours.length > 0
        ? resolutionHours.reduce((a, b) => a + b, 0) / resolutionHours.length
        : null;

    return {
      totalTickets: total,
      resolvedTickets: closed,
      openTickets: total - closed,
      averageResolutionHours: avgResolutionHours
        ? Number(avgResolutionHours.toFixed(1))
        : null,
    };
  }

  private async byField(
    field: 'status' | 'priority',
    from: Date,
    to: Date,
  ): Promise<Record<string, unknown>> {
    const groups = await this.prisma.ticket.groupBy({
      by: [field],
      where: this.createdBetween(from, to),
      _count: true,
    });
    return {
      groups: groups.map((g) => ({
        key: g[field],
        count: g._count,
      })),
    };
  }

  private async byCategory(from: Date, to: Date): Promise<Record<string, unknown>> {
    const groups = await this.prisma.ticket.groupBy({
      by: ['categoryId'],
      where: this.createdBetween(from, to),
      _count: true,
    });

    const categoryIds = groups
      .map((g) => g.categoryId)
      .filter((id): id is string => !!id);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(categories.map((c) => [c.id, c.name]));

    return {
      groups: groups
        .map((g) => ({
          categoryId: g.categoryId,
          name: g.categoryId
            ? (nameById.get(g.categoryId) ?? 'Desconhecida')
            : 'Sem categoria',
          count: g._count,
        }))
        .sort((a, b) => b.count - a.count),
    };
  }

  private async byOperator(from: Date, to: Date): Promise<Record<string, unknown>> {
    const groups = await this.prisma.ticket.groupBy({
      by: ['assignedToId'],
      where: this.createdBetween(from, to),
      _count: true,
    });

    const userIds = groups
      .map((g) => g.assignedToId)
      .filter((id): id is string => !!id);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(users.map((u) => [u.id, u.name]));

    const closedByOperator = await this.prisma.ticket.groupBy({
      by: ['assignedToId'],
      where: { ...this.createdBetween(from, to), status: 'CLOSED' },
      _count: true,
    });
    const closedById = new Map(
      closedByOperator.map((g) => [g.assignedToId, g._count]),
    );

    return {
      groups: groups
        .map((g) => ({
          operatorId: g.assignedToId,
          name: g.assignedToId
            ? (nameById.get(g.assignedToId) ?? 'Desconhecido')
            : 'Não atribuído',
          assigned: g._count,
          resolved: closedById.get(g.assignedToId) ?? 0,
        }))
        .sort((a, b) => b.assigned - a.assigned),
    };
  }

  private async slaCompliance(from: Date, to: Date): Promise<Record<string, unknown>> {
    const slas = await this.prisma.sLA.findMany({
      where: { ticket: this.createdBetween(from, to) },
      select: {
        responseStatus: true,
        solutionStatus: true,
        respondedAt: true,
        solvedAt: true,
        responseTime: true,
        solutionTime: true,
      },
    });

    const responded = slas.filter((s) => s.respondedAt);
    const solved = slas.filter((s) => s.solvedAt);

    const responseOnTime = responded.filter(
      (s) => !s.responseTime || s.respondedAt! <= s.responseTime,
    ).length;
    const solutionOnTime = solved.filter(
      (s) => !s.solutionTime || s.solvedAt! <= s.solutionTime,
    ).length;

    return {
      totalWithSla: slas.length,
      response: {
        total: responded.length,
        onTime: responseOnTime,
        complianceRate:
          responded.length > 0
            ? Math.round((responseOnTime / responded.length) * 100)
            : null,
      },
      solution: {
        total: solved.length,
        onTime: solutionOnTime,
        complianceRate:
          solved.length > 0
            ? Math.round((solutionOnTime / solved.length) * 100)
            : null,
      },
      currentlyBreached: slas.filter(
        (s) => s.responseStatus === 'BREACHED' || s.solutionStatus === 'BREACHED',
      ).length,
    };
  }
}
