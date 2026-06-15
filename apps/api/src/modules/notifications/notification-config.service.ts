import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  sender: string;
  secure: boolean;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  event: string;
  active: boolean;
}

export interface NotificationRule {
  id: string;
  event: string;
  notifyAssigned: boolean;
  notifyRequester: boolean;
  notifyGroup: boolean;
  notifyFollowers: boolean;
}

interface NotificationSettings {
  smtp: SmtpConfig;
  webhooks: Webhook[];
  rules: NotificationRule[];
}

/**
 * Lê configurações de notificações do SettingsService
 * Centraliza acesso aos parâmetros de e-mail, webhooks e regras
 */
@Injectable()
export class NotificationConfigService {
  constructor(private settings: SettingsService) {}

  async getSmtpConfig(): Promise<SmtpConfig> {
    const config = await this.settings.getSettings<NotificationSettings>('notifications', {
      smtp: this.getDefaultSmtp(),
      webhooks: [],
      rules: [],
    });
    return config.smtp || this.getDefaultSmtp();
  }

  async getWebhooks(): Promise<Webhook[]> {
    const config = await this.settings.getSettings<NotificationSettings>('notifications', {
      smtp: this.getDefaultSmtp(),
      webhooks: [],
      rules: [],
    });
    return config.webhooks || [];
  }

  async getActiveWebhooks(event: string): Promise<Webhook[]> {
    const webhooks = await this.getWebhooks();
    return webhooks.filter((w) => w.active && w.event === event);
  }

  async getNotificationRules(): Promise<NotificationRule[]> {
    const config = await this.settings.getSettings<{ rules: NotificationRule[] }>(
      'notification_rules',
      { rules: this.getDefaultRules() },
    );
    return config.rules;
  }

  async getRuleForEvent(event: string): Promise<NotificationRule | null> {
    const rules = await this.getNotificationRules();
    return rules.find((r) => r.event === event) || null;
  }

  private getDefaultSmtp(): SmtpConfig {
    return {
      host: '',
      port: 587,
      user: '',
      password: '',
      sender: 'HelpdeskPRO',
      secure: false,
    };
  }

  private getDefaultRules(): NotificationRule[] {
    return [
      {
        id: 'ticket_created',
        event: 'ticket.created',
        notifyAssigned: true,
        notifyRequester: true,
        notifyGroup: false,
        notifyFollowers: false,
      },
      {
        id: 'ticket_assigned',
        event: 'ticket.assigned',
        notifyAssigned: true,
        notifyRequester: false,
        notifyGroup: false,
        notifyFollowers: false,
      },
      {
        id: 'followup_created',
        event: 'followup.created',
        notifyAssigned: true,
        notifyRequester: true,
        notifyGroup: false,
        notifyFollowers: true,
      },
      {
        id: 'sla_breached',
        event: 'sla.breached',
        notifyAssigned: true,
        notifyRequester: false,
        notifyGroup: true,
        notifyFollowers: false,
      },
    ];
  }
}
