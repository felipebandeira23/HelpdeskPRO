import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendNotification(data: {
    userId: string;
    type: 'email' | 'push' | 'in-app';
    subject: string;
    message: string;
  }) {
    return {
      id: 'notif-' + Date.now(),
      userId: data.userId,
      type: data.type,
      subject: data.subject,
      sentAt: new Date(),
    };
  }

  async getNotifications(userId: string) {
    return [];
  }

  async markAsRead(notificationId: string) {
    return { notificationId, read: true };
  }

  async setNotificationPreferences(userId: string, preferences: any) {
    return { userId, preferences };
  }
}
