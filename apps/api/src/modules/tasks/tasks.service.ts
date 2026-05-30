import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    assigneeId?: string;
    dueDate?: Date;
  }) {
    return this.prisma.task.create({ data, include: { assignee: true } });
  }

  async findAll() {
    return this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  async update(id: string, data: any) {
    return this.prisma.task.update({
      where: { id },
      data,
      include: { assignee: true },
    });
  }

  async delete(id: string) {
    await this.prisma.task.delete({ where: { id } });
    return { success: true };
  }
}
