import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, Asset, Ticket } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AssetCreateInput): Promise<Asset> {
    return this.prisma.asset.create({ data });
  }

  async findAll(): Promise<Asset[]> {
    return this.prisma.asset.findMany({
      include: { tickets: true },
    });
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: { tickets: true },
    });

    if (!asset) throw new NotFoundException('Ativo não encontrado');
    return asset;
  }

  async update(id: string, data: Prisma.AssetUpdateInput): Promise<Asset> {
    return this.prisma.asset.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Asset> {
    return this.prisma.asset.delete({ where: { id } });
  }

  async getAssetTickets(assetId: string): Promise<Ticket[]> {
    return this.prisma.ticket.findMany({
      where: { assetId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
