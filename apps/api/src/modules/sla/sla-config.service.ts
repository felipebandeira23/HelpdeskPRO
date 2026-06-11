import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  SlaPolicy,
  BusinessHours,
  Holiday,
  Prisma,
  TicketPriority,
} from '@prisma/client';

export interface CreateSlaPolicyInput {
  name: string;
  priority?: TicketPriority | null;
  categoryId?: string | null;
  responseMinutes: number;
  solutionMinutes: number;
  businessHoursOnly?: boolean;
  active?: boolean;
}

@Injectable()
export class SlaConfigService {
  constructor(private prisma: PrismaService) {}

  // ─── Políticas ────────────────────────────────────────────────────────────

  async listPolicies(): Promise<SlaPolicy[]> {
    return this.prisma.slaPolicy.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createPolicy(input: CreateSlaPolicyInput): Promise<SlaPolicy> {
    if (input.responseMinutes <= 0 || input.solutionMinutes <= 0) {
      throw new BadRequestException('Prazos devem ser maiores que zero');
    }
    try {
      return await this.prisma.slaPolicy.create({
        data: {
          name: input.name,
          priority: input.priority ?? null,
          categoryId: input.categoryId ?? null,
          responseMinutes: input.responseMinutes,
          solutionMinutes: input.solutionMinutes,
          businessHoursOnly: input.businessHoursOnly ?? true,
          active: input.active ?? true,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Já existe uma política para essa combinação de prioridade e categoria',
        );
      }
      throw err;
    }
  }

  async updatePolicy(
    id: string,
    input: Partial<CreateSlaPolicyInput>,
  ): Promise<SlaPolicy> {
    const exists = await this.prisma.slaPolicy.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Política não encontrada');
    return this.prisma.slaPolicy.update({ where: { id }, data: input });
  }

  async deletePolicy(id: string): Promise<{ message: string }> {
    const exists = await this.prisma.slaPolicy.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Política não encontrada');
    await this.prisma.slaPolicy.delete({ where: { id } });
    return { message: 'Política excluída com sucesso' };
  }

  // ─── Expediente ───────────────────────────────────────────────────────────

  async getBusinessHours(): Promise<BusinessHours[]> {
    return this.prisma.businessHours.findMany({ orderBy: { weekday: 'asc' } });
  }

  /** Substitui a configuração da semana inteira de uma vez (UI envia os 7 dias). */
  async setBusinessHours(
    days: { weekday: number; start: string; end: string; enabled: boolean }[],
  ): Promise<BusinessHours[]> {
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    for (const d of days) {
      if (d.weekday < 0 || d.weekday > 6) {
        throw new BadRequestException(`Dia da semana inválido: ${d.weekday}`);
      }
      if (!timePattern.test(d.start) || !timePattern.test(d.end)) {
        throw new BadRequestException('Horário inválido — use o formato HH:MM');
      }
      if (d.start >= d.end) {
        throw new BadRequestException(
          'Horário de início deve ser anterior ao de fim',
        );
      }
    }

    await this.prisma.$transaction(
      days.map((d) =>
        this.prisma.businessHours.upsert({
          where: { weekday: d.weekday },
          update: { start: d.start, end: d.end, enabled: d.enabled },
          create: d,
        }),
      ),
    );
    return this.getBusinessHours();
  }

  // ─── Feriados ─────────────────────────────────────────────────────────────

  async listHolidays(): Promise<Holiday[]> {
    return this.prisma.holiday.findMany({ orderBy: { date: 'asc' } });
  }

  async createHoliday(input: {
    name: string;
    date: string;
    recurring?: boolean;
  }): Promise<Holiday> {
    const date = new Date(input.date);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Data inválida');
    }
    return this.prisma.holiday.create({
      data: { name: input.name, date, recurring: input.recurring ?? false },
    });
  }

  async deleteHoliday(id: string): Promise<{ message: string }> {
    const exists = await this.prisma.holiday.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Feriado não encontrado');
    await this.prisma.holiday.delete({ where: { id } });
    return { message: 'Feriado excluído com sucesso' };
  }
}
