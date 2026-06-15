import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PortalService } from './portal.service';
import { PortalController } from './portal.controller';
import { SLAModule } from '../sla/sla.module';

@Module({
  imports: [SLAModule],
  controllers: [PortalController],
  providers: [PortalService, PrismaService],
  exports: [PortalService],
})
export class PortalModule {}
