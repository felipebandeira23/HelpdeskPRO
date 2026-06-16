import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Profile, ProfileRight, ProfileInterface } from '@prisma/client';
import {
  getAllModuleNames,
  RightsBit,
  RIGHTS_CATALOG,
} from './rights-catalog';

export interface CreateProfileDto {
  name: string;
  interface?: ProfileInterface;
  isDefault?: boolean;
  twoFactorEnforced?: boolean;
  comment?: string;
  rights?: Record<string, number>;
}

export interface UpdateProfileDto {
  name?: string;
  interface?: ProfileInterface;
  isDefault?: boolean;
  twoFactorEnforced?: boolean;
  comment?: string;
  rights?: Record<string, number>;
}

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar novo perfil com direitos iniciais
   */
  async create(input: CreateProfileDto): Promise<Profile> {
    const profile = await this.prisma.profile.create({
      data: {
        name: input.name,
        interface: input.interface || ProfileInterface.CENTRAL,
        isDefault: input.isDefault === true,
        twoFactorEnforced: input.twoFactorEnforced || false,
        comment: input.comment,
      },
    });

    // Inicializar direitos para todos os módulos da interface
    const modules = getAllModuleNames(input.interface || ProfileInterface.CENTRAL);
    await Promise.all(
      modules.map((moduleName) =>
        this.prisma.profileRight.upsert({
          where: {
            profileId_name: {
              profileId: profile.id,
              name: moduleName,
            },
          },
          update: {
            rights: input.rights?.[moduleName] || 0,
          },
          create: {
            profileId: profile.id,
            name: moduleName,
            rights: input.rights?.[moduleName] || 0,
          },
        }),
      ),
    );

    return profile;
  }

  /**
   * Obter perfil com seus direitos
   */
  async findById(id: string): Promise<(Profile & { rights: ProfileRight[] }) | null> {
    return this.prisma.profile.findUnique({
      where: { id },
      include: { rights: true },
    });
  }

  /**
   * Listar todos os perfis (com contagem de usuários)
   */
  async findAll() {
    const profiles = await this.prisma.profile.findMany({
      include: {
        rights: true,
        _count: { select: { users: true } },
      },
      orderBy: { isDefault: 'desc' },
    });

    return profiles.map((p) => ({
      ...p,
      userCount: p._count.users,
    }));
  }

  /**
   * Atualizar perfil e direitos
   */
  async update(id: string, input: UpdateProfileDto): Promise<Profile> {
    // Atualizar perfil base
    const profile = await this.prisma.profile.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.interface && { interface: input.interface }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        ...(input.twoFactorEnforced !== undefined && {
          twoFactorEnforced: input.twoFactorEnforced,
        }),
        ...(input.comment !== undefined && { comment: input.comment }),
      },
    });

    // Atualizar direitos se fornecidos
    if (input.rights) {
      await Promise.all(
        Object.entries(input.rights).map(([moduleName, rights]) =>
          this.prisma.profileRight.upsert({
            where: {
              profileId_name: {
                profileId: id,
                name: moduleName,
              },
            },
            update: { rights },
            create: {
              profileId: id,
              name: moduleName,
              rights,
            },
          }),
        ),
      );
    }

    // Se setting como default, remover default de outros
    if (input.isDefault === true) {
      await this.prisma.profile.updateMany({
        where: {
          id: { not: id },
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return profile;
  }

  /**
   * Deletar perfil
   */
  async delete(id: string): Promise<boolean> {
    // Verificar se há usuários usando este perfil
    const userCount = await this.prisma.user.count({
      where: { profileId: id },
    });

    if (userCount > 0) {
      throw new Error(
        `Não é possível deletar perfil com ${userCount} usuários associados`,
      );
    }

    // Verificar se é o último perfil
    const totalProfiles = await this.prisma.profile.count();
    if (totalProfiles <= 1) {
      throw new Error('Deve existir pelo menos um perfil no sistema');
    }

    await this.prisma.profile.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Obter catálogo de direitos para a interface
   */
  getRightsCatalog(interfaceType: 'central' | 'simplified') {
    return RIGHTS_CATALOG[interfaceType];
  }

  /**
   * Verificar se usuário tem um direito específico
   */
  async userHasPermission(
    userId: string,
    moduleName: string,
    requiredRight: RightsBit,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: { rights: true },
        },
      },
    });

    if (!user || !user.profile) return false;

    const moduleRight = user.profile.rights.find(
      (r) => r.name === moduleName,
    );

    if (!moduleRight) return false;

    // Verificar se o direito está no bitmask
    return (moduleRight.rights & requiredRight) === requiredRight;
  }

  /**
   * Obter todos os direitos de um usuário
   */
  async getUserRights(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: { rights: true },
        },
      },
    });

    if (!user || !user.profile) return {};

    const result: Record<string, number> = {};
    user.profile.rights.forEach((r) => {
      result[r.name] = r.rights;
    });

    return result;
  }
}
