/**
 * RBAC mínimo viável: @Roles('ADMIN') em handlers ou controllers.
 * Depende do JwtAuthGuard ter populado req.user (rodar depois dele).
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: { role?: UserRole } }>();

    if (!user?.role || !required.includes(user.role)) {
      throw new ForbiddenException(
        'Você não tem permissão para executar esta ação',
      );
    }
    return true;
  }
}
