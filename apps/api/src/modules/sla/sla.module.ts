import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SLAService } from './sla.service';
import { SlaConfigService } from './sla-config.service';
import { SLAController } from './sla.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [SLAController],
  providers: [SLAService, SlaConfigService, PrismaService],
  exports: [SLAService, SlaConfigService],
})
export class SLAModule {}
