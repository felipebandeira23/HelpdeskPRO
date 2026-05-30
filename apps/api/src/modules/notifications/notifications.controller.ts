import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Post('send')
  sendNotification(@Body() data: any) {
    return this.service.sendNotification(data);
  }

  @Get(':userId')
  getNotifications(@Param('userId') userId: string) {
    return this.service.getNotifications(userId);
  }

  @Patch(':notificationId/read')
  markAsRead(@Param('notificationId') notificationId: string) {
    return this.service.markAsRead(notificationId);
  }

  @Post(':userId/preferences')
  setPreferences(@Param('userId') userId: string, @Body() preferences: any) {
    return this.service.setNotificationPreferences(userId, preferences);
  }
}
