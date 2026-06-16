import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';

const safeSelect = {
  id: true,
  email: true,
  name: true,
  profileId: true,
  active: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    email: string;
    name: string;
    password: string;
    profileId?: string;
    active?: boolean;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    const password = await bcrypt.hash(data.password, 12);

    let profileId = data.profileId;
    if (!profileId) {
      const viewerProfile = await this.prisma.profile.findFirst({
        where: { name: 'Visualizador' },
      });
      profileId = viewerProfile?.id || '';
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password,
        profileId,
        active: data.active ?? true,
      },
      select: safeSelect,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: safeSelect,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeSelect,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      profileId?: string;
      active?: boolean;
    },
  ) {
    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 12);
    }
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.profileId !== undefined && { profileId: data.profileId }),
        ...(data.active !== undefined && { active: data.active }),
        ...(hashedPassword !== undefined && { password: hashedPassword }),
      },
      select: safeSelect,
    });
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
