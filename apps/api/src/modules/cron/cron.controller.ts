import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CronService } from './cron.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';
import { UpdateCronTaskDto } from './dto/update-cron-task.dto';

@Controller('api/cron-tasks')
@UseGuards(JwtAuthGuard)
export class CronController {
  constructor(private cronService: CronService) {}

  @Get()
  async list() {
    return this.cronService.list();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const task = await this.cronService.getById(id);
    const logs = await this.cronService.getLogs(id, 10);
    return { ...task, recentLogs: logs };
  }

  @Get(':id/logs')
  async getLogs(@Param('id') id: string) {
    return this.cronService.getLogs(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  async update(@Param('id') id: string, @Body() dto: UpdateCronTaskDto) {
    return this.cronService.update(id, dto);
  }

  @Post(':id/run')
  @UseGuards(RolesGuard)
  @Roles('Administrador')
  async runNow(@Param('id') id: string) {
    return this.cronService.runNow(id);
  }
}
