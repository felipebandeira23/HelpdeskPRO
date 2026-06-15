import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

/**
 * Gerenciador central de configurações do sistema.
 * Todas as categorias são armazenadas em uma única tabela (SystemSetting)
 * com data como JSON blob, permitindo escalabilidade sem schema changes.
 */
@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obter configurações de uma categoria (com valores padrão como fallback)
   */
  async getSettings<T extends Record<string, any> = Record<string, any>>(
    category: string,
    defaults: T,
  ): Promise<T> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { category },
    });

    if (!setting) {
      return defaults;
    }

    // Mescla valores salvos com defaults (respeitando salvos)
    return { ...defaults, ...((setting.data as Record<string, any>) || {}) } as T;
  }

  /**
   * Salvar configurações de uma categoria
   */
  async updateSettings(
    category: string,
    data: Record<string, any>,
    updatedById?: string,
  ) {
    const setting = await this.prisma.systemSetting.upsert({
      where: { category },
      update: {
        data,
        updatedById,
        updatedAt: new Date(),
      },
      create: {
        category,
        data,
        updatedById,
      },
    });

    return setting;
  }

  /**
   * Obter um valor específico de uma categoria
   */
  async getValue(category: string, key: string, defaultValue: any = null) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { category },
    });

    if (!setting || !setting.data) return defaultValue;

    return (setting.data as Record<string, any>)[key] ?? defaultValue;
  }

  /**
   * Listar todas as categorias (para admin)
   */
  async listCategories() {
    return this.prisma.systemSetting.findMany({
      select: {
        category: true,
        updatedAt: true,
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Deletar uma categoria (reset para defaults)
   */
  async deleteSettings(category: string) {
    await this.prisma.systemSetting.deleteMany({
      where: { category },
    });

    return { message: `Configurações de "${category}" foram resetadas` };
  }

  /**
   * Usado por outros módulos em runtime para ler configs dinamicamente
   * Ex: const priorityDefault = await settings.getOrThrow('tickets', 'defaultPriority')
   */
  async getOrThrow(category: string, key: string) {
    const value = await this.getValue(category, key);
    if (value === null || value === undefined) {
      throw new Error(
        `Configuração obrigatória não encontrada: ${category}.${key}`,
      );
    }
    return value;
  }
}
