import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    document?: string;
    email?: string;
    phone?: string;
    address?: string;
    contractStatus?: string;
    notes?: string;
  }) {
    return this.prisma.customer.create({ data });
  }

  async findAll() {
    return this.prisma.customer.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    return customer;
  }

  async update(id: string, data: any) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.customer.delete({ where: { id } });
    return { success: true };
  }
}
