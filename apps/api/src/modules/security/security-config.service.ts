import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

export interface SessionConfig {
  sessionTimeoutMinutes: number;
  idleTimeoutMinutes: number;
  maxConcurrentSessions: number;
  requireTwoFactor: boolean;
  twoFactorMethods: string[];
}

export interface RbacConfig {
  roles: Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
}

/**
 * Lê configurações de segurança e sessão do SettingsService
 * Centraliza acesso às políticas de autenticação e autorização
 */
@Injectable()
export class SecurityConfigService {
  constructor(private settings: SettingsService) {}

  async getSessionConfig(): Promise<SessionConfig> {
    return this.settings.getSettings<SessionConfig>('session', {
      sessionTimeoutMinutes: 60,
      idleTimeoutMinutes: 30,
      maxConcurrentSessions: 3,
      requireTwoFactor: false,
      twoFactorMethods: ['email', 'totp'],
    });
  }

  async getRbacConfig(): Promise<RbacConfig> {
    return this.settings.getSettings<RbacConfig>('roles', {
      roles: [
        {
          id: 'admin',
          name: 'Administrador',
          permissions: [
            'tickets.view',
            'tickets.create',
            'tickets.edit',
            'tickets.close',
            'users.manage',
            'settings.edit',
          ],
        },
        {
          id: 'technician',
          name: 'Técnico',
          permissions: [
            'tickets.view',
            'tickets.create',
            'tickets.edit',
            'tickets.close',
            'assets.edit',
          ],
        },
        {
          id: 'viewer',
          name: 'Visualizador',
          permissions: ['tickets.view', 'assets.view'],
        },
      ],
    });
  }

  async getSessionTimeout(): Promise<number> {
    const config = await this.getSessionConfig();
    return config.sessionTimeoutMinutes * 60 * 1000; // converte para ms
  }

  async getIdleTimeout(): Promise<number> {
    const config = await this.getSessionConfig();
    return config.idleTimeoutMinutes * 60 * 1000; // converte para ms
  }

  async isTwoFactorRequired(): Promise<boolean> {
    const config = await this.getSessionConfig();
    return config.requireTwoFactor;
  }

  async getMaxConcurrentSessions(): Promise<number> {
    const config = await this.getSessionConfig();
    return config.maxConcurrentSessions;
  }

  async hasPermission(roleId: string, permission: string): Promise<boolean> {
    const rbac = await this.getRbacConfig();
    const role = rbac.roles.find((r) => r.id === roleId);
    return role ? role.permissions.includes(permission) : false;
  }
}
