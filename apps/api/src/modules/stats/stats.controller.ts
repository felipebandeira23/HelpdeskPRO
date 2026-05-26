import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('api/stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    const stats = await this.statsService.getDashboardStats();
    return stats;
  }

  @Get('recent-tickets')
  async getRecentTickets(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit) : 5;
    const tickets = await this.statsService.getRecentTickets(parsedLimit);
    return { data: tickets };
  }
}
