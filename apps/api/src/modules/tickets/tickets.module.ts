import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SLAModule } from '../sla/sla.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AutomationModule } from '../automation/automation.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SLAModule, NotificationsModule, AutomationModule, SettingsModule],
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService],
  exports: [TicketsService],
})
export class TicketsModule {}
