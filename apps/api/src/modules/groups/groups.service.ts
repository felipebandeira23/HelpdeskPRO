import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, Group, GroupMember } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.GroupCreateInput): Promise<Group> {
    return this.prisma.group.create({ data });
  }

  async findAll(): Promise<Group[]> {
    return this.prisma.group.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { members: true, tickets: true } },
      },
    });
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
    if (!group) throw new NotFoundException('Grupo não encontrado');
    return group;
  }

  async update(id: string, data: Prisma.GroupUpdateInput): Promise<Group> {
    return this.prisma.group.update({ where: { id }, data });
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.prisma.group.delete({ where: { id } });
    return { success: true };
  }

  async addMember(groupId: string, userId: string): Promise<GroupMember> {
    return this.prisma.groupMember.create({ data: { groupId, userId } });
  }

  async removeMember(groupId: string, userId: string): Promise<{ success: boolean }> {
    await this.prisma.groupMember.deleteMany({ where: { groupId, userId } });
    return { success: true };
  }
}
