import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CronTask, CronTaskLog } from '@prisma/client';
import { UpdateCronTaskDto } from './dto/update-cron-task.dto';
import { CronSchedulerService } from './cron-scheduler.service';

@Injectable()
export class CronService {
  constructor(
    private prisma: PrismaService,
    private scheduler: CronSchedulerService,
  ) {}

  async list(): Promise<CronTask[]> {
    return this.prisma.cronTask.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string): Promise<CronTask> {
    const task = await this.prisma.cronTask.findUnique({
      where: { id },
    });

    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  async update(id: string, dto: UpdateCronTaskDto): Promise<CronTask> {
    const task = await this.getById(id);

    const data: any = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.frequency !== undefined) data.frequency = dto.frequency;
    if (dto.runStartHour !== undefined) data.runStartHour = dto.runStartHour;
    if (dto.runEndHour !== undefined) data.runEndHour = dto.runEndHour;
    if (dto.param !== undefined) data.param = dto.param;

    return this.prisma.cronTask.update({
      where: { id },
      data,
    });
  }

  async getLogs(taskId: string, limit = 50): Promise<CronTaskLog[]> {
    await this.getById(taskId); // verifica existência

    return this.prisma.cronTaskLog.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async runNow(taskId: string): Promise<CronTaskLog> {
    await this.getById(taskId); // verifica existência
    return this.scheduler.runNow(taskId);
  }
}
