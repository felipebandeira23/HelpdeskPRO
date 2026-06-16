import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { User } from '@prisma/client';
import { requireJwtSecret } from '../../common/config/jwt-secret';

export interface JwtPayload {
  sub: string;
  email: string;
  profileId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: requireJwtSecret(),
    });
  }

  async validate(payload: JwtPayload): Promise<(User & { profile: { name: string } }) | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: { select: { name: true } } },
    });

    if (!user || !user.active) {
      return null;
    }

    return user;
  }
}
