import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendNotification(data: {
    userId: string;
    type: 'email' | 'push' | 'in-app';
    subject: string;
    message: string;
  }): Promise<unknown> {
    await Promise.resolve();
    return {
      id: 'notif-' + Date.now(),
      userId: data.userId,
      type: data.type,
      subject: data.subject,
      sentAt: new Date(),
    };
  }

  async getNotifications(_userId: string): Promise<unknown[]> {
    await Promise.resolve();
    return [];
  }

  async markAsRead(notificationId: string): Promise<unknown> {
    await Promise.resolve();
    return { notificationId, read: true };
  }

  async setNotificationPreferences(
    userId: string,
    preferences: Record<string, unknown>,
  ): Promise<unknown> {
    await Promise.resolve();
    return { userId, preferences };
  }
}
