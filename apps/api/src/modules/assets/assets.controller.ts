import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { AssetsService } from './assets.service';
import { Prisma } from '@prisma/client';
import { isTelemetryCapable } from '../../common/constants/asset.constants';

@Controller('api/assets')
@UseGuards(JwtGuard)
export class AssetsController {
  constructor(private service: AssetsService) {}

  // ── CRUD principal ────────────────────────────────────────────

  @Post()
  create(@Body() data: Prisma.AssetCreateInput) {
    return this.service.create(data);
  }

  @Get()
  findAll(@Query('type') type?: string) {
    return this.service.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.AssetUpdateInput) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // ── Tickets ───────────────────────────────────────────────────

  @Get(':id/tickets')
  getTickets(@Param('id') id: string) {
    return this.service.getAssetTickets(id);
  }

  // ── Sistemas Operacionais ──────────────────────────────────────

  @Get(':id/os')
  getOS(@Param('id') id: string) {
    return this.service.getOS(id);
  }

  @Post(':id/os')
  addOS(@Param('id') id: string, @Body() data: any) {
    return this.service.addOS(id, data);
  }

  @Delete(':id/os/:osId')
  removeOS(@Param('osId') osId: string) {
    return this.service.removeOS(osId);
  }

  // ── Componentes ───────────────────────────────────────────────

  @Get(':id/components')
  getComponents(@Param('id') id: string) {
    return this.service.getComponents(id);
  }

  @Post(':id/components')
  addComponent(@Param('id') id: string, @Body() data: any) {
    return this.service.addComponent(id, data);
  }

  @Delete(':id/components/:cId')
  removeComponent(@Param('cId') cId: string) {
    return this.service.removeComponent(cId);
  }

  // ── Softwares ─────────────────────────────────────────────────

  @Get(':id/software')
  getSoftware(@Param('id') id: string) {
    return this.service.getSoftware(id);
  }

  @Post(':id/software')
  addSoftware(@Param('id') id: string, @Body() data: any) {
    return this.service.addSoftware(id, data);
  }

  @Delete(':id/software/:sId')
  removeSoftware(@Param('sId') sId: string) {
    return this.service.removeSoftware(sId);
  }

  // ── Volumes ───────────────────────────────────────────────────

  @Get(':id/volumes')
  getVolumes(@Param('id') id: string) {
    return this.service.getVolumes(id);
  }

  @Post(':id/volumes')
  addVolume(@Param('id') id: string, @Body() data: any) {
    return this.service.addVolume(id, data);
  }

  @Delete(':id/volumes/:vId')
  removeVolume(@Param('vId') vId: string) {
    return this.service.removeVolume(vId);
  }

  // ── Portas de Rede ────────────────────────────────────────────

  @Get(':id/network-ports')
  getNetworkPorts(@Param('id') id: string) {
    return this.service.getNetworkPorts(id);
  }

  @Post(':id/network-ports')
  addNetworkPort(@Param('id') id: string, @Body() data: any) {
    return this.service.addNetworkPort(id, data);
  }

  @Delete(':id/network-ports/:pId')
  removeNetworkPort(@Param('pId') pId: string) {
    return this.service.removeNetworkPort(pId);
  }

  // ── Telemetria ────────────────────────────────────────────────

  @Post(':id/telemetry')
  async addTelemetry(@Param('id') id: string, @Body() data: any) {
    const asset = await this.service.findOne(id);
    if (!isTelemetryCapable(asset.assetType)) {
      throw new BadRequestException(`O tipo de ativo ${asset.assetType} não suporta telemetria`);
    }
    return this.service.addTelemetry(id, data);
  }

  @Get(':id/telemetry')
  getTelemetry(@Param('id') id: string) {
    return this.service.getTelemetry(id);
  }

  @Get(':id/telemetry/latest')
  getLatestTelemetry(@Param('id') id: string) {
    return this.service.getLatestTelemetry(id);
  }

  // ── Conexões ──────────────────────────────────────────────────

  @Get(':id/connections')
  getConnections(@Param('id') id: string) {
    return this.service.getConnections(id);
  }

  @Post(':id/connections')
  addConnection(@Param('id') id: string, @Body() data: { childId: string; kind?: string }) {
    return this.service.addConnection(id, data.childId, data.kind);
  }

  @Delete(':id/connections/:connId')
  removeConnection(@Param('connId') connId: string) {
    return this.service.removeConnection(connId);
  }
}
