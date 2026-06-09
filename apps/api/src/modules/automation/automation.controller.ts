import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { AutomationService } from './automation.service';
import { Prisma, AutomationRule } from '@prisma/client';

@Controller('api/automation-rules')
@UseGuards(JwtGuard)
export class AutomationController {
  constructor(private service: AutomationService) {}

  @Post()
  create(@Body() data: Prisma.AutomationRuleCreateInput): Promise<AutomationRule> {
    return this.service.createRule(data);
  }

  @Get()
  list(): Promise<AutomationRule[]> {
    return this.service.listRules();
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<AutomationRule> {
    return this.service.getRule(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Prisma.AutomationRuleUpdateInput,
  ): Promise<AutomationRule> {
    return this.service.updateRule(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<AutomationRule> {
    return this.service.deleteRule(id);
  }
}
