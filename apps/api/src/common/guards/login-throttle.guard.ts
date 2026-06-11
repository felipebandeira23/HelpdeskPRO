/**
 * Rate-limit do login em memória — sem dependência nova (PLANO.md §5).
 * 10 tentativas falhas por IP a cada 15 minutos; sucesso zera o contador.
 * Para múltiplas instâncias atrás de load balancer, migrar para Redis.
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

interface Entry {
  count: number;
  windowStart: number;
}

const attempts = new Map<string, Entry>();

export function registerLoginFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count++;
  }
}

export function registerLoginSuccess(ip: string): void {
  attempts.delete(ip);
}

@Injectable()
export class LoginThrottleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ ip?: string }>();
    const ip = req.ip || 'unknown';
    const entry = attempts.get(ip);

    if (entry && Date.now() - entry.windowStart <= WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
      throw new HttpException(
        'Muitas tentativas de login. Tente novamente em alguns minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
