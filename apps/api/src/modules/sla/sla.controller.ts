import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SLAService, SlaView } from './sla.service';
import { SlaConfigService, CreateSlaPolicyInput } from './sla-config.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { SlaPolicy, BusinessHours, Holiday } from '@prisma/client';

@Controller('api/slas')
export class SLAController {
  constructor(
    private slaService: SLAService,
    private config: SlaConfigService,
  ) {}

  // ─── Configuração (rotas fixas antes das rotas com :param) ───────────────

  @Get('policies')
  listPolicies(): Promise<SlaPolicy[]> {
    return this.config.listPolicies();
  }

  @Post('policies')
  createPolicy(@Body() input: CreateSlaPolicyInput): Promise<SlaPolicy> {
    return this.config.createPolicy(input);
  }

  @Patch('policies/:id')
  updatePolicy(
    @Param('id') id: string,
    @Body() input: Partial<CreateSlaPolicyInput>,
  ): Promise<SlaPolicy> {
    return this.config.updatePolicy(id, input);
  }

  @Delete('policies/:id')
  deletePolicy(@Param('id') id: string): Promise<{ message: string }> {
    return this.config.deletePolicy(id);
  }

  @Get('business-hours')
  getBusinessHours(): Promise<BusinessHours[]> {
    return this.config.getBusinessHours();
  }

  @Put('business-hours')
  setBusinessHours(
    @Body()
    body: {
      days: { weekday: number; start: string; end: string; enabled: boolean }[];
    },
  ): Promise<BusinessHours[]> {
    return this.config.setBusinessHours(body.days || []);
  }

  @Get('holidays')
  listHolidays(): Promise<Holiday[]> {
    return this.config.listHolidays();
  }

  @Post('holidays')
  createHoliday(
    @Body() input: { name: string; date: string; recurring?: boolean },
  ): Promise<Holiday> {
    return this.config.createHoliday(input);
  }

  @Delete('holidays/:id')
  deleteHoliday(@Param('id') id: string): Promise<{ message: string }> {
    return this.config.deleteHoliday(id);
  }

  // ─── Painel e consultas ───────────────────────────────────────────────────

  @Get('panel')
  getPanel(): Promise<Record<string, unknown>> {
    return this.slaService.getPanel();
  }

  @Get('breached')
  listBreached(): Promise<SlaView[]> {
    return this.slaService.listBreachedSLAs();
  }

  @Post(':ticketId/apply')
  applyPolicy(@Param('ticketId') ticketId: string): Promise<unknown> {
    return this.slaService.applyPolicyToTicket(ticketId);
  }

  @Get(':ticketId')
  getSLA(@Param('ticketId') ticketId: string): Promise<SlaView> {
    return this.slaService.getSLA(ticketId);
  }
}
