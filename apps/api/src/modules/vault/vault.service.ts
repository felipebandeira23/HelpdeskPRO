import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class VaultService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    username: string;
    password: string;
    url?: string;
    notes?: string;
    ownerId: string;
  }) {
    return this.prisma.vaultCredential.create({
      data,
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(userId: string) {
    return this.prisma.vaultCredential.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const cred = await this.prisma.vaultCredential.findUnique({
      where: { id },
    });
    if (!cred || cred.ownerId !== userId) {
      throw new NotFoundException('Credencial não encontrada');
    }
    return {
      ...cred,
      password: '***',
    };
  }

  async update(
    id: string,
    userId: string,
    data: { name?: string; username?: string; password?: string; url?: string; notes?: string },
  ) {
    const cred = await this.prisma.vaultCredential.findUnique({
      where: { id },
    });
    if (!cred || cred.ownerId !== userId) {
      throw new NotFoundException('Credencial não encontrada');
    }
    return this.prisma.vaultCredential.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const cred = await this.prisma.vaultCredential.findUnique({
      where: { id },
    });
    if (!cred || cred.ownerId !== userId) {
      throw new NotFoundException('Credencial não encontrada');
    }
    await this.prisma.vaultCredential.delete({ where: { id } });
    return { success: true };
  }
}
