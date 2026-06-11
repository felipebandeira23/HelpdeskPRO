import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AutomationService } from './automation.service';
import { AutomationController } from './automation.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AutomationController],
  providers: [AutomationService, PrismaService],
  exports: [AutomationService],
})
export class AutomationModule {}
