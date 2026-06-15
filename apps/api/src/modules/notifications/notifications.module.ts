import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationConfigService } from './notification-config.service';
import { SettingsModule } from '../settings/settings.module';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  imports: [SettingsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationConfigService, PrismaService],
  exports: [NotificationsService, NotificationConfigService],
})
export class NotificationsModule {}
