import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.asset.create({ data });
  }

  async findAll() {
    return this.prisma.asset.findMany({
      include: { tickets: true },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: { tickets: true },
    });

    if (!asset) throw new NotFoundException('Ativo não encontrado');
    return asset;
  }

  async update(id: string, data: any) {
    return this.prisma.asset.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.asset.delete({ where: { id } });
  }

  async getAssetTickets(assetId: string) {
    return this.prisma.ticket.findMany({
      where: { assetId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
