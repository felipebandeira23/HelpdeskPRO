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

@Controller('api/automation-rules')
@UseGuards(JwtGuard)
export class AutomationController {
  constructor(private service: AutomationService) {}

  @Post()
  create(@Body() data: any) {
    return this.service.createRule(data);
  }

  @Get()
  list() {
    return this.service.listRules();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getRule(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.updateRule(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteRule(id);
  }
}
