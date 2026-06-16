import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = { id: string; email: string; name: string; profileId: string }>(
    err: unknown,
    user: TUser | null,
    _info: unknown,
  ): TUser {
    if (err || !user) {
      throw (err as Error) || new UnauthorizedException();
    }
    return user;
  }
}
