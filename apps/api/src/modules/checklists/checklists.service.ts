import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChecklistItemStatus, Checklist, ChecklistItem } from '@prisma/client';

export interface ChecklistWithItems extends Checklist {
  items: ChecklistItem[];
}

@Injectable()
export class ChecklistsService {
  constructor(private prisma: PrismaService) {}

  async createChecklist(
    ticketId: string,
    items?: { title: string; description?: string }[],
  ): Promise<ChecklistWithItems> {
    await this.prisma.ticket.findUniqueOrThrow({
      where: { id: ticketId },
    });

    const checklist = await this.prisma.checklist.create({
      data: {
        ticketId,
        items: {
          create:
            items?.map((item, index) => ({
              title: item.title,
              description: item.description,
              order: index,
            })) || [],
        },
      },
      include: { items: true },
    });

    return checklist;
  }

  async getChecklist(ticketId: string): Promise<unknown> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { ticketId },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!checklist) {
      throw new NotFoundException('Checklist não encontrado');
    }

    return this.calculateProgress(checklist);
  }

  async addChecklistItem(
    ticketId: string,
    title: string,
    description?: string,
  ): Promise<ChecklistItem> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { ticketId },
    });

    if (!checklist) {
      throw new NotFoundException('Checklist não encontrado');
    }

    const maxOrder = await this.prisma.checklistItem.aggregate({
      where: { checklistId: checklist.id },
      _max: { order: true },
    });

    return this.prisma.checklistItem.create({
      data: {
        checklistId: checklist.id,
        title,
        description,
        order: (maxOrder._max.order || 0) + 1,
      },
    });
  }

  async updateChecklistItem(
    itemId: string,
    status: string,
  ): Promise<ChecklistItem> {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Item de checklist não encontrado');
    }

    const completedAt = status === 'COMPLETED' ? new Date() : null;

    return this.prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        status: status as ChecklistItemStatus,
        completedAt,
      },
    });
  }

  async deleteChecklistItem(itemId: string): Promise<ChecklistItem> {
    return this.prisma.checklistItem.delete({
      where: { id: itemId },
    });
  }

  private calculateProgress(checklist: ChecklistWithItems) {
    const total = checklist.items.length;
    const completed = checklist.items.filter(
      (item) => item.status === ChecklistItemStatus.COMPLETED,
    ).length;

    return {
      ...checklist,
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
      completedCount: completed,
      totalCount: total,
    };
  }
}
