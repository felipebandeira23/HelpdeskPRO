import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { TVModeService } from './tvmode.service';

@Controller('api/tvmode')
export class TVModeController {
  constructor(private service: TVModeService) {}

  @Get('layout')
  getLayout(@Param('id') id?: string) {
    return this.service.getDashboardLayout(id);
  }

  @Get('metrics')
  getMetrics() {
    return this.service.getMetricsPanel();
  }

  @Get('sla')
  getSLAStatus() {
    return this.service.getSLAPanelStatus();
  }

  @Get('tickets')
  getTickets(@Param('limit') limit?: string) {
    return this.service.getTicketsList(limit ? parseInt(limit) : 20);
  }

  @Post('layouts')
  createLayout(@Body() data: { name: string; panels: any[] }) {
    return this.service.createCustomLayout(data.name, data.panels);
  }

  @Post('schedule')
  scheduleRotation(@Body() data: { layouts: string[]; interval: number }) {
    return this.service.scheduleLayoutRotation(data.layouts, data.interval);
  }
}
