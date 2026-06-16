# Plano: Módulo de Perfis

## Status: Fases 1-4 CONCLUÍDAS ✅

### Fase 1 — Schema & Migração ✅
- ✅ Prisma schema: adicionados `Profile`, `ProfileRight`, `ProfileInterface` enum
- ✅ User: removido `role UserRole`, adicionado `profileId` (FK)
- ✅ Database reset + push sincronizado
- ✅ Seeder executado: **3 perfis + 3 usuários padrão**

**Perfis criados:**
- **Administrador** (interface: CENTRAL, acesso completo)
- **Técnico** (interface: CENTRAL, atendimento + ativos)
- **Visualizador** (interface: SIMPLIFIED, somente leitura)

**Usuários de teste:**
```
admin@helpdesk.local → Administrador
technician@helpdesk.local → Técnico
user@helpdesk.local → Visualizador
```

---

### Fase 2 — Catálogo de Direitos ✅
**Arquivo:** `apps/api/src/modules/profiles/rights-catalog.ts`

Hierarquia de direitos mapeada aos módulos do Helpdesk:
```
CENTRAL interface:
  └─ Atendimento (10 módulos)
  └─ Ativos (3 módulos)
  └─ Gestão (3 módulos)
  └─ Ferramentas (4 módulos)
  └─ Administração (4 módulos)
  └─ Configuração (2 módulos)

SIMPLIFIED interface:
  └─ Atendimento (2 módulos: criar chamado, acompanhamentos)
  └─ Ferramentas (1 módulo: base de conhecimento)
```

**Bitmask:** READ=1, CREATE=2, UPDATE=4, DELETE=8, PURGE=16
- Acesso total = 31 (binary: 11111)
- Somente leitura = 1 (binary: 00001)

**Módulos:**
- ticket, ticket_template, ticket_followup, ticket_task, ticket_validation, ticket_cost
- problem, change, change_template, sla, category
- asset, software, license
- customer, contact, contract, document
- knowledge_base, automation, report, planning
- user, group, profile, entity, audit_log
- settings, notification, vault_credential

---

### Fase 3 — Backend Profiles ✅

#### ProfilesService
**Arquivo:** `apps/api/src/modules/profiles/profiles.service.ts`

Métodos principais:
- `create(input: CreateProfileDto)` — criar perfil com direitos iniciais
- `findById(id: string)` — obter perfil + direitos
- `findAll()` — listar perfis com contagem de usuários
- `update(id, input)` — atualizar perfil e direitos
- `delete(id)` — deletar perfil (verificações: usuários associados, último perfil)
- `userHasPermission(userId, module, right)` — validar se usuário tem direito específico
- `getUserRights(userId)` — obter todos direitos do usuário

#### ProfilesController
**Arquivo:** `apps/api/src/modules/profiles/profiles.controller.ts`

Endpoints REST:
```
GET    /api/profiles                      — listar perfis
GET    /api/profiles/:id                  — obter perfil por ID
POST   /api/profiles                      — criar perfil
PUT    /api/profiles/:id                  — atualizar perfil
DELETE /api/profiles/:id                  — deletar perfil
GET    /api/profiles/catalog/:interface   — obter catálogo de direitos
```

#### ProfilesModule
**Arquivo:** `apps/api/src/modules/profiles/profiles.module.ts`

Registra SettingsService e SettingsController, exporta ProfilesService.

---

### Fase 4 — PermissionsGuard ✅

**Arquivo:** `apps/api/src/common/guards/permissions.guard.ts`

Novo guard que substitui o `@Roles` rígido:

```typescript
@Controller('api/tickets')
export class TicketsController {
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('ticket', RightsBit.READ)
  async listTickets() { ... }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('ticket', RightsBit.CREATE)
  async createTicket() { ... }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('ticket', RightsBit.UPDATE)
  async updateTicket() { ... }
}
```

**Função:**
- Extrai `@RequirePermission(module, right)` do decorador
- Valida se usuário tem permissão no perfil
- Lança `ForbiddenException` se sem permissão

---

## Próximas Fases (a implementar)

### Fase 5 — Refatorar Controllers com PermissionsGuard
Substituir `@Roles('ADMIN')` nos 5 controllers:
- `tickets.controller.ts`
- `users.controller.ts`
- `sla.controller.ts`
- `categories.controller.ts`
- `audit.controller.ts`

Remover enum `UserRole` e `roles.guard.ts` do `common/guards`.

### Fase 6 — Frontend (Páginas de Perfis)
- `/settings/profiles/page.tsx` — lista com cards de perfis
- `/settings/profiles/[id]/page.tsx` — editor com abas + matriz CRUD
- Hooks `useProfiles()` e `useRightsCatalog()`

### Fase 7 — Build & Deploy
- Validar build sem erros
- Subir dev server
- Testar endpoints
- Testar UI

---

## Status Geral
✅ Fases 1-4: **COMPLETAS**
⏳ Fases 5-7: **PENDENTES**

Próximo passo: Validar build, depois refatorar controllers.
