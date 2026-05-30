import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SLAService } from './sla.service';
import { SLAController } from './sla.controller';

@Module({
  controllers: [SLAController],
  providers: [SLAService, PrismaService],
  exports: [SLAService],
})
export class SLAModule {}
