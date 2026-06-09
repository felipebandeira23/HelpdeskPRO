import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

interface SendNotificationDto {
  userId: string;
  type: 'email' | 'push' | 'in-app';
  subject: string;
  message: string;
}

@Controller('api/notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Post('send')
  sendNotification(@Body() data: SendNotificationDto): Promise<unknown> {
    return this.service.sendNotification(data);
  }

  @Get(':userId')
  getNotifications(@Param('userId') userId: string): Promise<unknown[]> {
    return this.service.getNotifications(userId);
  }

  @Patch(':notificationId/read')
  markAsRead(@Param('notificationId') notificationId: string): Promise<unknown> {
    return this.service.markAsRead(notificationId);
  }

  @Post(':userId/preferences')
  setPreferences(
    @Param('userId') userId: string,
    @Body() preferences: Record<string, unknown>,
  ): Promise<unknown> {
    return this.service.setNotificationPreferences(userId, preferences);
  }
}
