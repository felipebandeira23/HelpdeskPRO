import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

export interface SystemConfig {
  name: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
}

export interface LocalizationConfig {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: '24h' | '12h';
  currency: string;
  currencySymbol: string;
}

/**
 * Lê configurações de sistema do SettingsService
 * Centraliza acesso aos parâmetros globais (timezone, idioma, manutenção)
 */
@Injectable()
export class SystemConfigService {
  constructor(private settings: SettingsService) {}

  async getSystemConfig(): Promise<SystemConfig> {
    return this.settings.getSettings<SystemConfig>('system', {
      name: 'HelpdeskPRO',
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      maintenanceMode: false,
    });
  }

  async getLocalizationConfig(): Promise<LocalizationConfig> {
    return this.settings.getSettings<LocalizationConfig>('localization', {
      timezone: 'America/Sao_Paulo',
      language: 'pt-BR',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'BRL',
      currencySymbol: 'R$',
    });
  }

  async getTimezone(): Promise<string> {
    const config = await this.getLocalizationConfig();
    return config.timezone;
  }

  async getLanguage(): Promise<string> {
    const config = await this.getSystemConfig();
    return config.language;
  }

  async isMaintenanceMode(): Promise<boolean> {
    const config = await this.getSystemConfig();
    return config.maintenanceMode;
  }

  async getSystemName(): Promise<string> {
    const config = await this.getSystemConfig();
    return config.name;
  }
}
