# Integração de Configurações com Módulos

## Visão Geral

Os services de configuração (SettingsService e seus dependentes) permitem que qualquer módulo leia configurações dinâmicas do banco de dados em tempo de execução, sem hardcoding de valores padrão.

## Services Disponíveis

### 1. SettingsService (Fundação)
**Localização:** `modules/settings/settings.service.ts`

Lê qualquer categoria de configuração:
```typescript
constructor(private settings: SettingsService) {}

async someMethod() {
  const config = await this.settings.getSettings('tickets', defaults);
  // config.defaultPriority, config.autoCloseDays, etc.
}
```

### 2. SystemConfigService
**Localização:** `modules/system/system-config.service.ts`

Centraliza acesso às configurações globais:
```typescript
constructor(private systemConfig: SystemConfigService) {}

async someMethod() {
  const timezone = await this.systemConfig.getTimezone();
  const language = await this.systemConfig.getLanguage();
  const isDown = await this.systemConfig.isMaintenanceMode();
}
```

### 3. NotificationConfigService
**Localização:** `modules/notifications/notification-config.service.ts`

Centraliza acesso às configurações de notificações:
```typescript
constructor(private notificationConfig: NotificationConfigService) {}

async sendNotification() {
  const smtp = await this.notificationConfig.getSmtpConfig();
  const rule = await this.notificationConfig.getRuleForEvent('ticket.created');
  const webhooks = await this.notificationConfig.getActiveWebhooks('sla.breached');
}
```

### 4. PasswordValidationService
**Localização:** `modules/security/password-validation.service.ts`

Valida senhas contra política configurada:
```typescript
constructor(private passwordValidation: PasswordValidationService) {}

async createUser(password: string) {
  try {
    await this.passwordValidation.validatePassword(password);
    // Password is valid
  } catch (error) {
    // Return validation errors to user
  }
}
```

### 5. SecurityConfigService
**Localização:** `modules/security/security-config.service.ts`

Centraliza acesso às políticas de segurança:
```typescript
constructor(private securityConfig: SecurityConfigService) {}

async manageSession() {
  const timeout = await this.securityConfig.getSessionTimeout();
  const maxSessions = await this.securityConfig.getMaxConcurrentSessions();
  const require2FA = await this.securityConfig.isTwoFactorRequired();
}
```

## Padrão de Uso

### 1. Injetar o Service no Constructor
```typescript
@Injectable()
export class MyService {
  constructor(
    private settings: SettingsService,
    // ou um dos config services específicos
    private notificationConfig: NotificationConfigService,
  ) {}
}
```

### 2. Ler Configuração em Runtime
```typescript
async myMethod() {
  const config = await this.notificationConfig.getSmtpConfig();
  // Use config.host, config.port, etc.
}
```

### 3. Fornecer Defaults
Se a configuração não existir no banco, o SettingsService usa os defaults fornecidos:
```typescript
const config = await this.settings.getSettings('my_category', {
  someKey: 'defaultValue',
});
```

## Onde Integrar

Adicione os config services aos seguintes módulos:

1. **TicketsModule** — lê `defaultPriority`, `autoCloseDays`, regras de auto-close
2. **NotificationsModule** — lê SMTP, webhooks, regras de notificação
3. **SecurityModule** — lê políticas de senha, sessão, RBAC
4. **AutomationModule** — lê regras de automação por evento
5. **AuditModule** — lê política de retenção de logs
6. **SlaModule** — lê políticas de SLA configuráveis

## Exemplo Completo

```typescript
import { Injectable } from '@nestjs/common';
import { SystemConfigService } from '../system/system-config.service';
import { PasswordValidationService } from '../security/password-validation.service';

@Injectable()
export class UsersService {
  constructor(
    private systemConfig: SystemConfigService,
    private passwordValidation: PasswordValidationService,
  ) {}

  async createUser(dto: CreateUserDto) {
    // Valida senha contra política configurada
    await this.passwordValidation.validatePassword(dto.password);

    // Usa idioma do sistema
    const language = await this.systemConfig.getLanguage();

    // Create user...
  }
}
```

## Registrar os Services

Adicione aos módulos:

```typescript
import { NotificationConfigService } from './notification-config.service';

@Module({
  providers: [NotificationsService, NotificationConfigService],
  exports: [NotificationsService, NotificationConfigService],
})
export class NotificationsModule {}
```

## Performance

- Configs são buscadas do banco em cada chamada
- Para melhorar performance futura, implemente cache em memória com TTL
- Use `SettingsService.getOrThrow()` se a config é obrigatória

## Adicionando Novas Categorias

1. Criar página UI em `/settings/nova-categoria/`
2. Adicionar defaults no SettingsController
3. Criar um service específico (ex: `NewCategoryConfigService`)
4. Injetar em módulos que usam essa categoria
