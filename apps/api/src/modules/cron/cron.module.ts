import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { CronSchedulerService } from './cron-scheduler.service';
import { CronHandlersService } from './cron-handlers.service';
import { SLAModule } from '../sla/sla.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { DiscoveryModule } from '../discovery/discovery.module';

@Module({
  imports: [SLAModule, MailModule, NotificationsModule, SettingsModule, DiscoveryModule],
  controllers: [CronController],
  providers: [
    PrismaService,
    CronHandlersService,
    CronSchedulerService,
    CronService,
  ],
  exports: [CronService],
})
export class CronModule {}
