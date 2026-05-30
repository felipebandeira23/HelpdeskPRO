import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('metrics')
  getMetrics() {
    return this.service.getMetrics();
  }

  @Get('sla/breached')
  getBreachedSLAs() {
    return this.service.getBreachedSLAs();
  }

  @Get('sla/warning')
  getWarningSLAs() {
    return this.service.getWarningSLAs();
  }

  @Get('requesters')
  getTopRequesters() {
    return this.service.getTopRequesters();
  }

  @Get('recent')
  getRecentTickets() {
    return this.service.getRecentTickets();
  }
}
