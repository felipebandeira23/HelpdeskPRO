import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { TVModeService } from './tvmode.service';

interface PanelDto {
  id: string;
  type: string;
  position: { x: number; y: number; w: number; h: number };
  title: string;
  refreshInterval: number;
}

@Controller('api/tvmode')
export class TVModeController {
  constructor(private service: TVModeService) {}

  @Get('layout')
  getLayout(@Param('id') id?: string): unknown {
    return this.service.getDashboardLayout(id);
  }

  @Get('metrics')
  getMetrics(): Record<string, number> {
    return this.service.getMetricsPanel();
  }

  @Get('sla')
  getSLAStatus(): Record<string, unknown> {
    return this.service.getSLAPanelStatus();
  }

  @Get('tickets')
  getTickets(@Param('limit') limit?: string): Record<string, unknown> {
    return this.service.getTicketsList(limit ? parseInt(limit) : 20);
  }

  @Post('layouts')
  createLayout(@Body() data: { name: string; panels: PanelDto[] }): Record<string, unknown> {
    return this.service.createCustomLayout(data.name, data.panels);
  }

  @Post('schedule')
  scheduleRotation(@Body() data: { layouts: string[]; interval: number }): Record<string, unknown> {
    return this.service.scheduleLayoutRotation(data.layouts, data.interval);
  }
}
