import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { SLAService } from './sla.service';

@Controller('api/slas')
@UseGuards(JwtGuard)
export class SLAController {
  constructor(private slaService: SLAService) {}

  @Post(':ticketId')
  async createOrUpdateSLA(
    @Param('ticketId') ticketId: string,
    @Body() data: { responseTimeMinutes?: number; solutionTimeMinutes?: number },
  ) {
    return this.slaService.createOrUpdateSLA(
      ticketId,
      data.responseTimeMinutes,
      data.solutionTimeMinutes,
    );
  }

  @Get(':ticketId')
  async getSLA(@Param('ticketId') ticketId: string) {
    return this.slaService.getSLA(ticketId);
  }

  @Get()
  async listBreachedSLAs() {
    return this.slaService.listBreachedSLAs();
  }
}
