import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, Asset, Ticket } from '@prisma/client';

const ASSET_INCLUDE = {
  technician: { select: { id: true, name: true, email: true } },
  assetUser: { select: { id: true, name: true, email: true } },
  tickets: { select: { id: true, ticketNumber: true, title: true, status: true, priority: true } },
} as const;

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AssetCreateInput): Promise<Asset> {
    return this.prisma.asset.create({ data });
  }

  async findAll(): Promise<Asset[]> {
    return this.prisma.asset.findMany({
      include: ASSET_INCLUDE,
      orderBy: { hostname: 'asc' },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: ASSET_INCLUDE,
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

  // ── Sistemas Operacionais ──────────────────────────────────────

  async getOS(assetId: string) {
    return this.prisma.assetOS.findMany({ where: { assetId }, orderBy: { createdAt: 'asc' } });
  }

  async addOS(assetId: string, data: { name: string; version?: string; architecture?: string; serialNumber?: string; installDate?: string }) {
    return this.prisma.assetOS.create({
      data: {
        assetId,
        name: data.name,
        version: data.version,
        architecture: data.architecture,
        serialNumber: data.serialNumber,
        installDate: data.installDate ? new Date(data.installDate) : undefined,
      },
    });
  }

  async removeOS(osId: string) {
    return this.prisma.assetOS.delete({ where: { id: osId } });
  }

  // ── Componentes ───────────────────────────────────────────────

  async getComponents(assetId: string) {
    return this.prisma.assetComponent.findMany({ where: { assetId }, orderBy: { type: 'asc' } });
  }

  async addComponent(assetId: string, data: { type: string; name: string; brand?: string; model?: string; serialNumber?: string; quantity?: number; specs?: string }) {
    return this.prisma.assetComponent.create({
      data: { assetId, ...data } as any,
    });
  }

  async removeComponent(componentId: string) {
    return this.prisma.assetComponent.delete({ where: { id: componentId } });
  }

  // ── Softwares ─────────────────────────────────────────────────

  async getSoftware(assetId: string) {
    return this.prisma.assetSoftware.findMany({ where: { assetId }, orderBy: { name: 'asc' } });
  }

  async addSoftware(assetId: string, data: { name: string; version?: string; vendor?: string; installDate?: string }) {
    return this.prisma.assetSoftware.create({
      data: {
        assetId,
        name: data.name,
        version: data.version,
        vendor: data.vendor,
        installDate: data.installDate ? new Date(data.installDate) : undefined,
      },
    });
  }

  async removeSoftware(softwareId: string) {
    return this.prisma.assetSoftware.delete({ where: { id: softwareId } });
  }

  // ── Volumes ───────────────────────────────────────────────────

  async getVolumes(assetId: string) {
    return this.prisma.assetVolume.findMany({ where: { assetId }, orderBy: { name: 'asc' } });
  }

  async addVolume(assetId: string, data: { name: string; mountPoint?: string; fileSystem?: string; totalGB?: number; freeGB?: number }) {
    return this.prisma.assetVolume.create({ data: { assetId, ...data } });
  }

  async removeVolume(volumeId: string) {
    return this.prisma.assetVolume.delete({ where: { id: volumeId } });
  }

  // ── Portas de Rede ────────────────────────────────────────────

  async getNetworkPorts(assetId: string) {
    return this.prisma.assetNetworkPort.findMany({ where: { assetId }, orderBy: { name: 'asc' } });
  }

  async addNetworkPort(assetId: string, data: { name: string; macAddress?: string; speed?: string; ipAddress?: string; isActive?: boolean }) {
    return this.prisma.assetNetworkPort.create({ data: { assetId, ...data } });
  }

  async removeNetworkPort(portId: string) {
    return this.prisma.assetNetworkPort.delete({ where: { id: portId } });
  }

  // ── Telemetria ────────────────────────────────────────────────

  async addTelemetry(assetId: string, data: {
    cpuUsage?: number;
    memoryUsed?: number;
    memoryTotal?: number;
    diskUsage?: any;
    networkIn?: number;
    networkOut?: number;
    uptime?: number;
    processes?: number;
    temperature?: number;
  }) {
    const record = await this.prisma.assetTelemetry.create({
      data: { assetId, ...data },
    });

    // Atualiza o status do agente e o lastSeen
    await this.prisma.asset.update({
      where: { id: assetId },
      data: { agentStatus: 'ONLINE', lastSeen: new Date() },
    });

    // Mantém apenas os últimos 1440 registros (24h a 1 reg/min)
    const count = await this.prisma.assetTelemetry.count({ where: { assetId } });
    if (count > 1440) {
      const oldest = await this.prisma.assetTelemetry.findMany({
        where: { assetId },
        orderBy: { recordedAt: 'asc' },
        take: count - 1440,
        select: { id: true },
      });
      await this.prisma.assetTelemetry.deleteMany({
        where: { id: { in: oldest.map((r) => r.id) } },
      });
    }

    return record;
  }

  async getTelemetry(assetId: string) {
    return this.prisma.assetTelemetry.findMany({
      where: { assetId },
      orderBy: { recordedAt: 'desc' },
      take: 60,
    });
  }

  async getLatestTelemetry(assetId: string) {
    return this.prisma.assetTelemetry.findFirst({
      where: { assetId },
      orderBy: { recordedAt: 'desc' },
    });
  }
}
