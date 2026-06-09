import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('api/reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Post('generate')
  generateReport(
    @Body()
    data: {
      type: string;
      dateRange: { from: Date; to: Date };
    },
  ): Promise<unknown> {
    return this.service.generateReport(data.type, data.dateRange);
  }

  @Get('history/:userId')
  getReportHistory(@Param('userId') userId: string): Promise<unknown[]> {
    return this.service.getReportHistory(userId);
  }

  @Get('export/:reportId')
  exportReport(
    @Param('reportId') reportId: string,
    @Query('format') format: 'pdf' | 'csv' | 'xlsx',
  ): Promise<unknown> {
    return this.service.exportReport(reportId, format);
  }
}
