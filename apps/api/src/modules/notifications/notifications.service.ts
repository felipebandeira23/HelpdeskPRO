import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Notification, NotificationType } from '@prisma/client';
import { sendMailQuick, emailTemplate } from '../mail/mailer';

// Tipos que também disparam email (os demais ficam só no sino)
const EMAIL_TYPES: NotificationType[] = [
  'TICKET_ASSIGNED',
  'TICKET_CLOSED',
  'TICKET_FOLLOWUP',
  'SLA_BREACHED',
];

export interface NotifyInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /** Cria uma notificação. Nunca lança — falha de notificação não pode quebrar a operação principal. */
  async notify(input: NotifyInput): Promise<Notification | null> {
    try {
      const notification = await this.prisma.notification.create({ data: input });
      this.maybeEmail(input); // fire-and-forget
      return notification;
    } catch {
      return null;
    }
  }

  /** Espelha notificações importantes por email (se SMTP configurado). */
  private maybeEmail(input: NotifyInput): void {
    if (!EMAIL_TYPES.includes(input.type)) return;
    this.prisma.user
      .findUnique({ where: { id: input.userId }, select: { email: true } })
      .then((user) => {
        if (!user?.email) return;
        return sendMailQuick(
          user.email,
          `[HelpdeskPRO] ${input.title}`,
          emailTemplate(input.title, input.message, input.link || undefined),
        );
      })
      .catch(() => undefined);
  }

  /** Notifica vários usuários de uma vez, ignorando duplicados na lista. */
  async notifyMany(
    userIds: string[],
    data: Omit<NotifyInput, 'userId'>,
  ): Promise<void> {
    const unique = [...new Set(userIds)].filter(Boolean);
    if (unique.length === 0) return;
    try {
      await this.prisma.notification.createMany({
        data: unique.map((userId) => ({ userId, ...data })),
      });
    } catch {
      // não propaga — ver comentário em notify()
    }
  }

  async list(userId: string, onlyUnread = false): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId, ...(onlyUnread ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string): Promise<{ success: boolean }> {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
    return { success: true };
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }
}
