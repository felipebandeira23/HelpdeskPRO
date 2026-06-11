import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { NetworkService } from './network.service';

@Controller('api/network')
@UseGuards(JwtAuthGuard)
export class NetworkController {
  constructor(private service: NetworkService) {}

  @Get('topology')
  async getTopology(): Promise<unknown> {
    return this.service.getNetworkTopology();
  }

  @Get('device/:id')
  async getDeviceStatus(@Param('id') id: string): Promise<unknown> {
    return this.service.getDeviceStatus(id);
  }

  @Get('stats')
  async getStats(): Promise<unknown> {
    return this.service.getNetworkStats();
  }

  @Get('alerts')
  async getAlerts(@Query('limit') limit?: string): Promise<unknown> {
    return this.service.getAlerts(limit ? parseInt(limit) : 10);
  }

  @Post('rules')
  async createRule(
    @Body()
    data: {
      deviceId: string;
      metric: string;
      threshold: number;
      action: string;
    },
  ): Promise<unknown> {
    return this.service.createMonitoringRule(data);
  }

  @Post('test-connectivity')
  async testConnectivity(@Body() data: { ip: string }): Promise<unknown> {
    return this.service.testConnectivity(data.ip);
  }
}
