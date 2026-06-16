import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; user: { id: string; email: string; name: string; profileId: string } }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    if (!user.active) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      profileId: user.profileId,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileId: user.profileId,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.active) {
      return null;
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return null;
    }

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}
