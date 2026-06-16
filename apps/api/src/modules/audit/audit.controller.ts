import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLog, Prisma } from '@prisma/client';

@Controller('api/audit-logs')
export class AuditController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(
    @Query('module') module?: string,
    @Query('userId') userId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const where: Prisma.AuditLogWhereInput = {};
    if (module) where.module = module;
    if (userId) where.userId = userId;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: skip ? parseInt(skip, 10) : 0,
        take: take ? Math.min(parseInt(take, 10), 100) : 50,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }
}
