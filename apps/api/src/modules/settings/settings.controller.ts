import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('api/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  /**
   * Obter configurações de uma categoria
   * GET /api/settings/notifications
   */
  @Get(':category')
  async getSettings(@Param('category') category: string) {
    // Busca a categoria real; se não existir, retorna vazio
    // (o frontend deve fornecer defaults)
    const defaults = this.getDefaultsForCategory(category);
    return this.settingsService.getSettings(category, defaults);
  }

  /**
   * Atualizar configurações de uma categoria
   * PUT /api/settings/notifications
   */
  @Put(':category')
  async updateSettings(
    @Param('category') category: string,
    @Body() data: Record<string, any>,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    return this.settingsService.updateSettings(category, data, userId);
  }

  /**
   * Listar todas as categorias com metadata
   * GET /api/settings
   */
  @Get()
  async listCategories() {
    return this.settingsService.listCategories();
  }

  /**
   * Resetar uma categoria para defaults
   * DELETE /api/settings/notifications
   */
  @Delete(':category')
  async deleteSettings(@Param('category') category: string) {
    return this.settingsService.deleteSettings(category);
  }

  /**
   * Retorna valores padrão por categoria
   * Usado quando categoria não existe ainda no banco
   */
  private getDefaultsForCategory(category: string): Record<string, any> {
    const defaults: Record<string, Record<string, any>> = {
      notifications: {
        smtp: {
          host: '',
          port: 587,
          user: '',
          password: '',
          sender: 'HelpdeskPRO',
          secure: false,
        },
        webhooks: [],
        rules: [],
      },
      tickets: {
        defaultPriority: 'MEDIUM',
        defaultStatus: 'OPEN',
        autoCloseDays: 0,
        allowReopening: true,
      },
      system: {
        name: 'HelpdeskPRO',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        maintenanceMode: false,
        logo: '',
      },
      security: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecial: false,
          expireDays: 0,
        },
        sessionTimeout: 3600,
        requireTwoFactor: false,
      },
      agent: {
        serverUrl: 'http://localhost:3000',
        globalToken: '',
        minVersion: '1.0.0',
        autoUpdate: true,
      },
      portal: {
        name: 'HelpdeskPRO Portal',
        primaryColor: '#3b82f6',
        welcomeMessage: 'Bem-vindo ao nosso portal de suporte',
        logo: '',
      },
      cron: {
        closeResolvedTickets: { enabled: true, intervalDays: 7 },
        ldapImport: { enabled: false, intervalHours: 24 },
        slaAlerts: { enabled: true, intervalMinutes: 60 },
      },
    };

    return defaults[category] || {};
  }
}
