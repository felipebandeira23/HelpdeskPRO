import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RightsBit } from '@/modules/profiles/rights-catalog';
import { ProfilesService } from '@/modules/profiles/profiles.service';

export const PERMISSION_KEY = 'required_permission';

export interface RequiredPermission {
  module: string;
  right: RightsBit;
}

export const RequirePermission = (module: string, right: RightsBit) =>
  SetMetadata(PERMISSION_KEY, { module, right } as RequiredPermission);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(ProfilesService) private profilesService: ProfilesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<
      RequiredPermission | undefined
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    // Se não houver permissão requerida, permitir acesso
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest<{
      user?: { id: string };
    }>();

    if (!user?.id) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verificar se usuário tem o direito
    const hasPermission = await this.profilesService.userHasPermission(
      user.id,
      required.module,
      required.right,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Você não tem permissão para acessar ${required.module}`,
      );
    }

    return true;
  }
}
