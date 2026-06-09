import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TicketTypesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    icon?: string;
    color?: string;
    description?: string;
    slaResponseTime?: number;
    slaSolutionTime?: number;
  }) {
    return this.prisma.ticketType.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.ticketType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const type = await this.prisma.ticketType.findUnique({
      where: { id },
    });

    if (!type) {
      throw new NotFoundException('Tipo de ticket não encontrado');
    }

    return type;
  }

  async update(id: string, data: {
    name?: string;
    icon?: string;
    color?: string;
    description?: string;
    slaResponseTime?: number;
    slaSolutionTime?: number;
  }) {
    return this.prisma.ticketType.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.ticketType.delete({
      where: { id },
    });
  }
}
