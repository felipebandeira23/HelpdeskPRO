# Testes da API de Settings

## Endpoints Implementados

### 1. Obter Configurações de uma Categoria
```bash
GET /api/settings/:category
```

**Exemplo:**
```bash
curl -X GET http://localhost:3000/api/settings/notifications
```

**Resposta esperada:**
```json
{
  "smtp": {
    "host": "smtp.workspace.ufrj.br",
    "port": 587,
    "user": "helpdesk@coppead.ufrj.br",
    "password": "",
    "sender": "Suporte HelpdeskPRO",
    "secure": false
  },
  "webhooks": [
    {
      "id": "1",
      "name": "Alertas de Tickets (Discord)",
      "url": "https://discord.com/api/webhooks/...",
      "event": "ticket.created",
      "active": true
    }
  ]
}
```

### 2. Atualizar Configurações
```bash
PUT /api/settings/:category
Content-Type: application/json

{
  "smtp": {
    "host": "novo-smtp.example.com",
    "port": 587,
    "user": "user@example.com",
    "password": "senha",
    "sender": "Novo Nome",
    "secure": true
  },
  "webhooks": []
}
```

### 3. Listar Todas as Categorias
```bash
GET /api/settings
```

**Resposta esperada:**
```json
[
  {
    "category": "notifications",
    "updatedAt": "2026-06-15T20:30:00Z",
    "updatedBy": {
      "id": "user123",
      "name": "Admin",
      "email": "admin@example.com"
    }
  }
]
```

### 4. Resetar uma Categoria para Defaults
```bash
DELETE /api/settings/:category
```

## Categorias Disponíveis

1. **notifications** - SMTP, webhooks, regras
2. **tickets** - Prioridade padrão, status, auto-close
3. **system** - Nome, timezone, idioma, manutenção
4. **security** - Políticas de senha, sessão, 2FA
5. **session** - Timeout, idle, sessões simultâneas
6. **roles** - RBAC - papéis e permissões
7. **agent** - URL do servidor, token global
8. **localization** - Formato de data, moeda
9. **portal** - Configurações do portal do cliente
10. **cron** - Agendamento de tarefas

## Testes Manuais (PowerShell)

```powershell
# Teste 1: Obter notificações
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/settings/notifications" `
  -Method GET -Headers @{ "Authorization" = "Bearer YOUR_TOKEN" }
$response.Content | ConvertFrom-Json | ConvertTo-Json

# Teste 2: Salvar notificações
$body = @{
  smtp = @{
    host = "novo-smtp.example.com"
    port = 587
    user = "user@example.com"
    password = "senha"
    sender = "Helpdesk"
    secure = $true
  }
  webhooks = @()
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/settings/notifications" `
  -Method PUT `
  -Body $body `
  -ContentType "application/json" `
  -Headers @{ "Authorization" = "Bearer YOUR_TOKEN" }
```

## Integração com Módulos

### TicketsService
```typescript
// Lê configuração padrão na criação de tickets
const ticketConfig = await this.settings.getSettings('tickets', {
  defaultPriority: 'MEDIUM',
  defaultStatus: 'OPEN',
});

ticket.priority = ticketConfig.defaultPriority;
ticket.status = ticketConfig.defaultStatus;
```

### NotificationsService
```typescript
// Lê configuração SMTP para enviar e-mails
const smtpConfig = await this.notificationConfig.getSmtpConfig();
// host, port, user, password, sender, secure
```

### SecurityModule
```typescript
// Valida senha contra política configurada
await this.passwordValidation.validatePassword(userPassword);

// Lê configurações de sessão
const sessionTimeout = await this.securityConfig.getSessionTimeout();
const requireTwoFactor = await this.securityConfig.isTwoFactorRequired();
```

### SystemModule
```typescript
// Lê configurações globais
const timezone = await this.systemConfig.getTimezone();
const isMaintenanceMode = await this.systemConfig.isMaintenanceMode();
```

## Frontend Hook Usage

```typescript
'use client';

import { useSettings } from '@/lib/use-settings';

interface NotificationSettings {
  smtp: SmtpConfig;
  webhooks: Webhook[];
}

export default function NotificationsPage() {
  const { data: settings, loading, saving, save, error } = useSettings<NotificationSettings>(
    'notifications',
    { /* defaults */ }
  );

  const handleSave = async () => {
    try {
      await save({ ...settings, /* changes */ });
    } catch (err) {
      console.error('Falha ao salvar:', err);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      {/* form fields using settings.* */}
      <button disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
```

## Status da Implementação

✅ Backend completo
✅ Database migrations aplicadas
✅ Frontend hook criado
✅ Build compilada com sucesso
⏳ Testes de integração aguardando servidor

## Notas

- Todos os endpoints requerem autenticação JWT
- O SettingsService usa genéricos para type-safety
- Defaults são mesclados automaticamente com valores salvos
- Cache com TTL pode ser implementado no futuro para melhor performance
