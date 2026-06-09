import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { SLAService } from './sla.service';

@Controller('api/slas')
export class SLAController {
  constructor(private slaService: SLAService) {}

  @Post(':ticketId')
  async createOrUpdateSLA(
    @Param('ticketId') ticketId: string,
    @Body() data: { responseTimeMinutes?: number; solutionTimeMinutes?: number },
  ): Promise<unknown> {
    return this.slaService.createOrUpdateSLA(
      ticketId,
      data.responseTimeMinutes,
      data.solutionTimeMinutes,
    );
  }

  @Get(':ticketId')
  async getSLA(@Param('ticketId') ticketId: string): Promise<unknown> {
    return this.slaService.getSLA(ticketId);
  }

  @Get()
  async listBreachedSLAs(): Promise<unknown[]> {
    return this.slaService.listBreachedSLAs();
  }
}
