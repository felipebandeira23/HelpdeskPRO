import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { NetworkService } from './network.service';

@Controller('api/network')
export class NetworkController {
  constructor(private service: NetworkService) {}

  @Get('topology')
  async getTopology(): Promise<any> {
    return this.service.getNetworkTopology();
  }

  @Get('device/:id')
  async getDeviceStatus(@Param('id') id: string): Promise<any> {
    return this.service.getDeviceStatus(id);
  }

  @Get('stats')
  async getStats(): Promise<any> {
    return this.service.getNetworkStats();
  }

  @Get('alerts')
  async getAlerts(@Query('limit') limit?: string): Promise<any> {
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
  ): Promise<any> {
    return this.service.createMonitoringRule(data);
  }

  @Post('test-connectivity')
  async testConnectivity(@Body() data: { ip: string }): Promise<any> {
    return this.service.testConnectivity(data.ip);
  }
}
