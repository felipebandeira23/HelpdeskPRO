import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const MUTATING_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];

// Rotas que não devem ser auditadas (ruído ou dados sensíveis)
const SKIP_PATTERNS = [/^\/api\/auth\/login/, /^\/api\/notifications/];

interface AuditableRequest {
  method: string;
  originalUrl?: string;
  url: string;
  ip?: string;
  user?: { id: string };
  body?: Record<string, unknown>;
  params?: Record<string, string>;
}

/**
 * Grava AuditLog para toda mutação autenticada bem-sucedida.
 * Por quê interceptor global: garante cobertura de todos os módulos sem
 * exigir disciplina manual em cada service (compliance LGPD/ISO 27001).
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuditableRequest>();
    const url = req.originalUrl || req.url;

    const shouldAudit =
      MUTATING_METHODS.includes(req.method) &&
      req.user?.id &&
      !SKIP_PATTERNS.some((p) => p.test(url));

    if (!shouldAudit) return next.handle();

    return next.handle().pipe(
      tap(() => {
        const module = url.split('/')[2] || 'unknown'; // /api/<module>/...
        const recordId = req.params?.id || req.params?.ticketId || null;

        this.prisma.auditLog
          .create({
            data: {
              userId: req.user!.id,
              action: req.method,
              module,
              recordId,
              changes: this.sanitize(req.body) as
                | Prisma.InputJsonObject
                | undefined,
              ip: req.ip || null,
            },
          })
          .catch((err) =>
            this.logger.warn(`Falha ao gravar audit log: ${err}`),
          );
      }),
    );
  }

  /** Remove campos sensíveis antes de persistir. */
  private sanitize(
    body: Record<string, unknown> | undefined,
  ): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const SENSITIVE = ['password', 'senha', 'token', 'secret'];
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      clean[key] = SENSITIVE.some((s) => key.toLowerCase().includes(s))
        ? '***'
        : value;
    }
    return clean;
  }
}
