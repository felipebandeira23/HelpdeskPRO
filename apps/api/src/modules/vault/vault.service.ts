import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { VaultCredential } from '@prisma/client';
import { encryptSecret, decryptSecret } from './vault-crypto';

type SafeCredential = Omit<VaultCredential, 'password'>;

function omitPassword(cred: VaultCredential): SafeCredential {
  const { password: _omit, ...rest } = cred;
  return rest;
}

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
  }): Promise<SafeCredential> {
    const cred = await this.prisma.vaultCredential.create({
      data: { ...data, password: encryptSecret(data.password) },
    });
    return omitPassword(cred);
  }

  /** Lista do dono — NUNCA inclui o campo password. */
  async findAll(userId: string): Promise<SafeCredential[]> {
    const creds = await this.prisma.vaultCredential.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return creds.map(omitPassword);
  }

  async findOne(id: string, userId: string): Promise<SafeCredential> {
    const cred = await this.getOwned(id, userId);
    return omitPassword(cred);
  }

  /** Descriptografa sob demanda — único caminho que expõe a senha. */
  async reveal(id: string, userId: string): Promise<{ password: string }> {
    const cred = await this.getOwned(id, userId);
    return { password: decryptSecret(cred.password) };
  }

  async update(
    id: string,
    userId: string,
    data: {
      name?: string;
      username?: string;
      password?: string;
      url?: string;
      notes?: string;
    },
  ): Promise<SafeCredential> {
    await this.getOwned(id, userId);
    const updateData = {
      ...data,
      ...(data.password ? { password: encryptSecret(data.password) } : {}),
    };
    const cred = await this.prisma.vaultCredential.update({
      where: { id },
      data: updateData,
    });
    return omitPassword(cred);
  }

  async delete(id: string, userId: string): Promise<{ success: boolean }> {
    await this.getOwned(id, userId);
    await this.prisma.vaultCredential.delete({ where: { id } });
    return { success: true };
  }

  private async getOwned(id: string, userId: string): Promise<VaultCredential> {
    const cred = await this.prisma.vaultCredential.findUnique({ where: { id } });
    if (!cred || cred.ownerId !== userId) {
      throw new NotFoundException('Credencial não encontrada');
    }
    return cred;
  }
}
