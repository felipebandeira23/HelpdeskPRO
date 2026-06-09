import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { VaultCredential } from '@prisma/client';

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
  }): Promise<VaultCredential> {
    return this.prisma.vaultCredential.create({
      data,
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
  }

  async findAll(userId: string): Promise<VaultCredential[]> {
    return this.prisma.vaultCredential.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: string, userId: string): Promise<VaultCredential> {
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
  ): Promise<VaultCredential> {
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

  async delete(id: string, userId: string): Promise<{ success: boolean }> {
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
