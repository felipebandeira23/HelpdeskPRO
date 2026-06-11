import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('api/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private service: ReportsService) {}

  /**
   * GET /api/reports?type=overview&from=2026-01-01&to=2026-06-30
   * Tipos: overview, by-status, by-priority, by-category, by-operator, sla
   */
  @Get()
  generate(
    @Query('type') type = 'overview',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<Record<string, unknown>> {
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setDate(defaultFrom.getDate() - 30);

    return this.service.generateReport(type, {
      from: from ? new Date(from) : defaultFrom,
      to: to ? new Date(to) : now,
    });
  }
}
