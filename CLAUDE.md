# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HelpdeskPRO é um sistema ITSM (helpdesk + gestão de ativos de TI). Monorepo TypeScript com:
- `apps/api` — NestJS 10 backend, porta 3000
- `apps/web` — Next.js 14 frontend, porta 3001
- `packages/shared` — tipos compartilhados
- `prisma/` — schema e migrations centralizadas (PostgreSQL em todos os ambientes)

## Running Locally

### Pré-requisitos
- Docker rodando (para o PostgreSQL)
- Node.js 20+

### Setup inicial (primeira vez)
```bash
# 1. Subir o banco
docker compose up db -d

# 2. Criar o .env na raiz (copiar de .env.example — valores já corretos para dev local)

# 3. Instalar dependências
npm install
cd apps/api && npm install && cd ../..

# 4. Sincronizar schema e popular banco
npx prisma generate
npx prisma db push
node prisma/seed.js

# 5. Subir API e frontend (terminais separados)
cd apps/api && npm run dev   # porta 3000
cd apps/web && npm run dev   # porta 3001
```

### Credenciais de desenvolvimento
| Usuário | Email | Senha |
|---|---|---|
| Admin | admin@helpdeskpro.local | admin123 |
| Técnico | tecnico@helpdeskpro.local | tech123 |
| Viewer | usuario@helpdeskpro.local | user123 |

### Banco já existente com dados
`npx prisma migrate deploy` falha em banco populado sem histórico de migrations — usar `npx prisma db push`. O seed usa upsert e pode ser reexecutado a qualquer momento para recriar os usuários padrão.

## Commands

```bash
# Rodar tudo em paralelo (turbo)
npm run dev

# Banco de dados
npm run db:push        # sincronizar schema
npm run db:seed        # popular dados iniciais
npm run db:studio      # GUI do banco

# Qualidade de código
npm run lint           # ESLint em todos os pacotes
npm run format         # Prettier em todos os arquivos
cd apps/api && npm run typecheck   # tsc --noEmit

# Testes
cd apps/api && npm test
cd apps/api && npm test -- --testPathPattern=tickets   # teste específico
cd apps/web && npm test
```

## Architecture

### Backend (NestJS) — 26 módulos

Cada feature: `module.ts` / `controller.ts` / `service.ts`. Registrados em `apps/api/src/app.module.ts`.

**Core:**
- `tickets` — core do sistema; ao criar/atualizar, dispara SLA, notificações e automação
- `sla` — políticas, business hours, feriados, avaliação periódica (a cada 60s)
- `automation` — motor de regras condicionais (trigger → conditions → actions)
- `notifications` — notificações internas; falhas nunca propagam

**Infraestrutura:**
- `auth` — JWT + Passport + rate limiting de login
- `users`, `groups`, `customers` — pessoas e contas
- `assets` — inventário de dispositivos TI
- `attachments`, `audit`, `categories`, `ratings`, `checklists` — auxiliares

**Canais e extras:**
- `chat`, `whatsapp`, `portal` — atendimento ao cliente
- `ldap`, `vault` — AD e cofre de credenciais criptografadas
- `dashboard`, `reports`, `stats`, `tvmode`, `billing`, `network` — operações e relatórios

`PrismaService` (`apps/api/src/common/prisma/prisma.service.ts`) é injetado diretamente em cada service — sem repositório genérico.

### Prefixo das rotas

**Não há prefixo global.** Cada controller define o próprio path:
- Auth: `/auth/login`, `/auth/logout`, `/auth/me` (sem `/api`)
- Todos os outros: `/api/[recurso]` (ex: `/api/tickets`, `/api/slas/policies`, `/api/automation-rules`)

### Segurança e Guards

**`JwtAuthGuard`** — protege a maioria das rotas; extrai e valida o JWT Bearer, popula `req.user` com `{ id, email, name, role }`.

**`RolesGuard`** — usado junto com `@Roles('ADMIN')`. Se nenhum decorator, qualquer usuário autenticado passa. Se decorator presente, verifica `req.user.role`.

**`LoginThrottleGuard`** — aplicado apenas em `/auth/login`. Máximo 10 tentativas falhas por IP a cada 15 min (armazenamento em memória — não escala para múltiplas instâncias).

**Pipes globais:** `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` — campos extras na request são rejeitados.

**JWT:** `JWT_SECRET` é validado na inicialização (`apps/api/src/common/config/jwt-secret.ts`); sem ele, a aplicação não sobe. Mínimo 16 caracteres.

### Auth no Frontend

Token salvo em `localStorage.access_token` **e** em cookie `access_token` (max-age=604800). O hook `useAuth()` de `apps/web/lib/auth-context.tsx` lê ambos na inicialização. Logout limpa o storage. Contexto expõe `{ user, token, isLoading, logout }`.

`apiFetch` de `apps/web/lib/api.ts` injeta o header `Authorization: Bearer {token}` automaticamente. Também há helpers: `api.get()`, `api.post()`, `api.patch()`, `api.delete()`. Nunca fazer `fetch` diretamente nas páginas.

**`NEXT_PUBLIC_API_URL` deve ser apenas a origem, sem `/api` no final:**
```
NEXT_PUBLIC_API_URL=http://localhost:3000   ✅
NEXT_PUBLIC_API_URL=http://localhost:3000/api   ❌  → gera /api/api/tickets
```

### Database — Entidades Principais

Schema em `prisma/schema.prisma` (raiz do monorepo). IDs usam `cuid()` — **não UUID**; não usar `@IsUUID()` em validações.

**Ticket** — entidade central:
- `ticketNumber` — auto-increment único (número legível para usuários)
- `status`: OPEN, IN_PROGRESS, WAITING, PAUSED, **RESOLVED**, CLOSED
- `priority`: LOW, MEDIUM, HIGH, URGENT — pode ser calculada automaticamente via matriz GLPI (urgência × impacto)
- `kind`: INCIDENT, REQUEST, PROBLEM, CHANGE (tipo de chamado)
- `urgency` / `impact`: VERY_LOW, LOW, MEDIUM, HIGH, VERY_HIGH — matriz 5×5 define `priority` automaticamente
- `requestOrigin`: HELPDESK, PORTAL, EMAIL, PHONE, WRITTEN, DIRECT
- `externalId` — ID em sistema externo (GLPI, etc.)
- `openedAt` — data/hora manual de abertura (diferente de `createdAt`)
- `resolvedAt` — preenchido ao mover para RESOLVED
- `totalDuration` — duração total em minutos
- `locationId` — FK para `Location` (localização física)
- `progress` (0-100), `pauseReason`, `pausedAt`, `firstResponseAt`
- FKs: `requesterId` (obrigatório), `assignedToId`, `groupId`, `assetId`, `categoryId`, `customerId`

**SLA** — 1:1 com Ticket:
- `responseTime`/`solutionTime` (deadline em DateTime)
- `responseStatus`/`solutionStatus`: OK, WARNING, BREACHED
- `totalPausedMinutes` (Int, não BigInt — evita problemas de serialização JSON)
- `pausedAt` — quando o ticket está pausado, o contador para

**SlaPolicy** — define prazos:
- Unique: `[priority, categoryId]` — máximo 1 política por combinação
- Especificidade: categoria+prioridade > categoria > prioridade > global (sem ambos)
- `businessHoursOnly`: se true, cálculo respeita BusinessHours e Holidays

**BusinessHours** — unique por `weekday` (0=domingo...6=sábado), campos `start`/`end` em "HH:MM".

**Category** — hierárquica (`parentId` auto-referência). Unique: `[name, parentId]`.

**AutomationRule** — `trigger` (string), `conditions` (JSON), `actions` (JSON), `enabled`.

**AuditLog** — `action`, `module`, `recordId`, `changes` (JSON), `ip`.

**TicketFollowup** — `isInternal` (boolean), `origin` (HELPDESK/PORTAL/EMAIL). A primeira resposta pública de um operador (não solicitante, não interna) marca `ticket.firstResponseAt` e atualiza o SLA de resposta.

### Lógica de Tickets

**Criar ticket:** cria → aplica SLA → notifica assignee → executa automações `ticket_created`.

**Atualizar ticket:** valida transição de status → se PAUSED exige `pauseReason` → atualiza SLA (pausa/resume/solução) → notifica (assignee, followers, requester) → executa automações `ticket_updated`.

**Transições de status válidas:**
- OPEN → IN_PROGRESS, WAITING, PAUSED, CLOSED
- IN_PROGRESS → WAITING, PAUSED, RESOLVED, CLOSED
- WAITING → IN_PROGRESS, PAUSED, CLOSED
- PAUSED → OPEN, IN_PROGRESS, CLOSED
- RESOLVED → IN_PROGRESS (recusa da solução), CLOSED (aprovação da solução)
- CLOSED → OPEN, IN_PROGRESS (reabertura)

**Fluxo de Solução (TicketSolution):**
1. Técnico propõe solução → ticket vai para RESOLVED, `resolvedAt` é preenchido, solicitante é notificado
2. Solicitante aprova → `SolutionStatus` = APPROVED, ticket vai para CLOSED
3. Solicitante recusa (com motivo) → `SolutionStatus` = REFUSED, ticket volta para IN_PROGRESS, `resolvedAt` é limpo
- Só pode haver 1 solução PENDING_APPROVAL por vez; nova proposta recusa a anterior automaticamente

**Sub-recursos de ticket** (servidos por `TicketSubresourcesService`):
- `TicketTask` — tarefas internas; estados: TODO, IN_PROGRESS, DONE; campos: `content`, `isPrivate`, `actionTime` (min), `plannedAt`, `plannedEnd`, `assignedToId`
- `TicketCost` — custos; `costTime` (R$/h) × `actionTime` + `costFixed` + `costMaterial`; endpoint `GET /costs` retorna `{ costs, totals, grandTotal }`
- `TicketSolution` — solução proposta; `SolutionStatus`: PENDING_APPROVAL, APPROVED, REFUSED, CLOSED
- `TicketValidation` — validação formal; `ValidationStatus`: PENDING, APPROVED, REFUSED; aprovador recebe notificação
- `TicketRelation` — relação entre tickets; `TicketRelationType`: LINKED, DUPLICATE, PARENT_CHILD, CAUSED_BY, CAUSES

**Matriz de prioridade GLPI** (função `glpiPriority(urgency, impact)` em `tickets.service.ts`):
- VERY_HIGH × VERY_HIGH = URGENT; qualquer VERY_HIGH com HIGH = URGENT
- HIGH × HIGH = HIGH; combinações médias = MEDIUM; baixas = LOW
- Quando `urgency` e `impact` são fornecidos, `priority` é sempre recalculada automaticamente

**Location** — hierarquia de localização física:
- `parentId` auto-referência (prédio > andar > sala)
- `GET /api/locations` retorna lista com campo `path` (ex: "Prédio A > 2º Andar > Sala 201")
- Endpoints: `GET/POST /api/locations`, `PATCH/DELETE /api/locations/:id`

**`TICKET_INCLUDE`** — constante que centraliza as relações Prisma padrão (requester, assignedTo, group, asset, category, customer). Usar ao consultar tickets para consistência.

### Motor de Automação

Regras avaliadas em cada criação/atualização de ticket. Todas as conditions devem passar (AND). Nunca lança erro — automação quebrada não mata a operação.

**Condições disponíveis:** `equals`, `not_equals`, `contains`, `not_contains`, `in`, `is_empty`, `is_not_empty`.

**Ações disponíveis:** `assign` (+ notifica assignee), `set_priority`, `set_group`, `add_follower`, `notify`.

Ações executam Prisma direto (não via TicketsService) para evitar loops de trigger.

### SLA — Business Hours

`addBusinessMinutes()` pula fins de semana, feriados (recorrentes e pontuais) e respeita o expediente configurado. O avaliador roda a cada 60s e notifica na transição de status (não a cada minuto).

### Variáveis de Ambiente

**Obrigatórias no backend:**
- `DATABASE_URL` — string PostgreSQL
- `JWT_SECRET` — mínimo 16 caracteres (a API não sobe sem isso)

**Opcionais no backend:**
- `API_PORT` (default 3000), `JWT_EXPIRES_IN` (default `7d`)
- `WHATSAPP_API_KEY`, `WHATSAPP_BUSINESS_PHONE_ID`, `WHATSAPP_WEBHOOK_URL`
- `LDAP_ENABLED`, `LDAP_SERVER`, `LDAP_BASE_DN`
- `VAULT_KEY` (fallback: `JWT_SECRET`)

**Frontend:**
- `NEXT_PUBLIC_API_URL` — URL base da API sem `/api` (ex: `http://localhost:3000`)

### Frontend — Páginas (36 rotas)

App Router em `apps/web/app/`. Principais áreas:
- `/auth/login` — única rota pública
- `/` e `/dashboard` — painel com métricas
- `/tickets` e `/tickets/[id]` — listagem e detalhe
- `/assets` e `/assets/[id]` — inventário de TI
- `/automation`, `/reports`, `/chat`, `/billing`, `/vault`, `/tvmode`
- `/settings/*` — users, groups, sla, categories, security, portal, integrations, notifications, cron

### Módulo de Ativos — expandido estilo GLPI (`apps/api/src/modules/assets/` + `apps/web/app/assets/`)

Inventário de dispositivos TI com rastreamento de agente e vínculo com tickets.

**Modelo Prisma (`Asset`):**
- `hostname` — único, obrigatório; identifica o dispositivo
- `ip`, `manufacturer`, `model`, `os` — opcionais
- `agentStatus`: `ONLINE | OFFLINE | UNKNOWN` — status do agente remoto
- `lastSeen` — DateTime; quando o agente fez último check-in (`null` = nunca visto)
- `tickets` — relação 1:N com Ticket (`assetId` FK no Ticket)

**Endpoints (todos requerem JWT):**

| Método | Rota | Ação |
|--------|------|------|
| POST | `/api/assets` | Criar ativo |
| GET | `/api/assets` | Listar todos (inclui tickets relacionados) |
| GET | `/api/assets/:id` | Detalhe do ativo + tickets; lança 404 "Ativo não encontrado" |
| PATCH | `/api/assets/:id` | Atualizar ativo |
| DELETE | `/api/assets/:id` | Excluir ativo |
| GET | `/api/assets/:id/tickets` | Tickets do ativo, ordenados por `createdAt DESC` |

**Páginas do frontend:**
- `apps/web/app/assets/page.tsx` — tabela com busca em tempo real (hostname, IP, fabricante, modelo, SO); modal de criação/edição; exclusão com confirmação; badge de `agentStatus` (verde = ONLINE, vermelho = OFFLINE, cinza = UNKNOWN)
- `apps/web/app/assets/[id]/page.tsx` — painel esquerdo: especificações; painel direito: tickets vinculados clicáveis (`/tickets/:id`) com badge de prioridade e status
- `apps/web/app/settings/assets/page.tsx` — regras de unicidade (hostname, serial, MAC, IP) e catálogo de componentes de hardware; **sem backend** — persiste em `localStorage`

**Integração com Tickets:**
- `CreateTicketModal` tem campo opcional "Dispositivo / Ativo" que envia `assetId`
- `UpdateTicketDto` também aceita `assetId` para vincular/desvincular
- Detalhe do ticket exibe `asset.hostname` com link para `/assets/:id`
- `TICKET_INCLUDE` já carrega a relação `asset`

**Sidebar de navegação do detalhe (8 seções estilo GLPI):**
Sidebar esquerdo em `/assets/[id]` com seções lazy-loaded via `next/dynamic`:
- `computer` → `AssetMain.tsx` — formulário completo + QR Code gerado via `qrcode` npm
- `os` → `AssetOS.tsx` — sistemas operacionais (`GET/POST /api/assets/:id/os`, `DELETE .../os/:osId`)
- `components` → `AssetComponents.tsx` — componentes hardware (`/api/assets/:id/components`)
- `volumes` → `AssetVolumes.tsx` — discos/partições com barra de uso (`/api/assets/:id/volumes`)
- `software` → `AssetSoftware.tsx` — softwares instalados (`/api/assets/:id/software`)
- `ports` → `AssetNetworkPorts.tsx` — interfaces de rede (`/api/assets/:id/network-ports`)
- `tickets` → `AssetTickets.tsx` — chamados vinculados (existente)
- `telemetry` → `AssetTelemetry.tsx` — telemetria em tempo real com gauges SVG + mini-gráfico histórico

**Telemetria:** `POST /api/assets/:id/telemetry` recebe dados do agente (cpuUsage, memoryUsed, memoryTotal, diskUsage JSON, networkIn/Out bytes/s, uptime segundos, processes, temperature). Mantém máximo 1440 registros por ativo. `GET .../telemetry` retorna últimos 60. `GET .../telemetry/latest` retorna o mais recente.

**QR Code:** gerado client-side com `import('qrcode')` (dynamic import), aponta para `window.location.href` do ativo. Após `npm install` em `apps/web/` o pacote `qrcode@^1.5.4` estará disponível.

**Novos modelos Prisma:** `AssetOS`, `AssetComponent`, `AssetSoftware`, `AssetVolume`, `AssetNetworkPort`, `AssetTelemetry`. Novos enums: `AssetType`, `AssetStatus`, `ComponentType`. Após qualquer mudança no schema rodar `npx prisma db push` na raiz.

**Sidebar:** seção "Gestão", ícone 💻, cor orange-500, rota `/assets`.

### Módulo de Configurações — Arquitetura centralizada

**Fundação: SystemSetting store genérico**

- Tabela única `SystemSetting` (category + data JSON) permite escalabilidade sem schema changes
- `SettingsModule` NestJS com endpoints `GET/PUT/DELETE /api/settings/:category`
- Hook `useSettings<T>(category, defaults)` no frontend substitui `localStorage` por API real
- Cada módulo injeta `SettingsService` para ler config em runtime

**Organização do Hub: 6 grupos temáticos**

| Grupo | Seções | Status |
|---|---|---|
| **🎫 Chamados & Atendimento** | Tipos, SLA, Regras, Matriz Urg×Imp, Pesquisa | ✓ Tipos/SLA, 🔨 Regras (novo) |
| **💻 Ativos & Inventário** | Definições, Agente, Componentes, Dedup, Estados | ✓ Agente, 🔨 Componentes (novo) |
| **🔔 Notificações** | SMTP, Webhooks, Regras, Templates, Destinatários | 🔨 Migrando p/ API (novo) |
| **🔒 Segurança & Acesso** | Usuários, LDAP, Senhas, Sessão, OAuth, Perfis | ✓ Usuários/LDAP, 🔨 Perfis (novo) |
| **⚙️ Sistema** | Geral, Idioma, Cron, Limpeza, Cache, Manutenção | 🔨 Todos novos |
| **🔗 Integrações & Atualizações** | Updates, Links, Portal, WhatsApp, Faturamento, Backup | 🔨 Todos novos |

**Padrão de desenvolvimento: cada página é um `useSettings` hook**

```tsx
const { data, loading, saving, save } = useSettings<TicketRules>('tickets', defaults);
// data lido da API em tempo real, sincronizado bidirecionalmente
await save(updatedRules); // PUT /api/settings/tickets
```

## Settings Implementados (Fundação + 3 Domínios Completos)

### Backend — SettingsModule

- **Tabela única** `SystemSetting` (category + JSON) — sem migrations futuras
- **4 endpoints** em `api/settings/:category` (GET, PUT, DELETE)
- **Defaults codificados** por categoria no controller

### Frontend — Hook `useSettings<T>`

```tsx
const { data, loading, saving, save, reset, refetch } = useSettings('chamados', defaults);
```

#### ✅ **Notificações** (`/settings/notifications/`) — MIGRADO PARA API
- **E-mail/SMTP**: host, porta, usuário, senha, sender (TLS/SSL)
- **Webhooks**: Discord, Teams, custom (7 tipos de evento, enable/disable)
- **Regras**: matriz de destinatários por evento (técnico, solicitante, grupo, seguidores)

### Domínios Implementados

#### 1️⃣ **Chamados & Atendimento** (`/settings/tickets/`)
- **Regras**: auto-close, reabertura, requisitos de fechamento
- **Matriz Urgência × Impacto**: 5×5 células → prioridade automática (estilo ITIL)
- **Pesquisa de Satisfação**: trigger, perguntas, agendamento
- **Valores Padrão**: prioridade inicial, status, tipo, notificações

#### 2️⃣ **Sistema** (`/settings/system/`)
- **Geral**: nome, logo, tagline, contato
- **Localização & Idioma**: timezone, formato data/hora, moeda
- **Manutenção**: modo manutenção com IPs permitidos, backup automático
- **Performance**: cache, timeout de sessão, upload limit, rate limit
- **Limpeza & Retenção**: política por tipo de dado, agendamento automático

#### 3️⃣ **Segurança & Acesso** (`/settings/security/`)
- **Política de Senhas**: comprimento, complexidade (maiús/minús/números/especiais), expiração, histórico
- **Sessão & 2FA**: timeout, inatividade, sessões simultâneas, métodos 2FA, lembrar dispositivo
- **Perfis & Permissões**: RBAC granular, 3 papéis padrão (Admin/Tech/Viewer), 12+ permissões
- **Auditoria**: histórico completo de alterações (ação, módulo, usuário, IP, timestamp)

#### 4️⃣ **Integrações & Atualizações** (`/settings/integrations/`)
- **Atualizações**: canal (stable/beta/dev), auto-update com agendamento
- **Links Externos**: atalhos para sistemas integrados (GLPI, etc)
- **OAuth & API Keys**: gerenciamento de credenciais
- **Backup & Exportação**: backup manual, exportação em CSV/JSON

### Padrão de Implementação

Cada domínio tem:
- Layout com sidebar de sub-páginas
- **useSettings hook** para leitura/escrita de API real
- Pré-visualização do impacto (ex: força da senha em tempo real)
- Link de voltar + validação antes de salvar
- Estados de loading/saving com feedback visual

### Resumo Final — Módulo de Configurações Completo

| Item | Quantidade | Status |
|---|---|---|
| **Domínios** | 6 | ✅ Completos |
| **Sub-páginas** | 21 | ✅ Completas |
| **Endpoints API** | 4 base + defaults por categoria | ✅ Funcional |
| **Hook useSettings** | 1 universal | ✅ Reutilizável |
| **Linhas de código frontend** | ~2500+ | ✅ Pronto |
| **Páginas com API real** | 17 de 21 | ✅ Migradas |
| **Páginas com placeholder** | 4 (OAuth, Backup, etc) | 🔄 Prontas para expansão |

## Fase 5 — Integração com Módulos (✅ Implementada)

**Padrão:** Cada módulo injeta um ConfigService específico e lê configurações em runtime

### Services de Configuração Implementados

1. **SettingsService** (fundação)
   - Genérico para qualquer categoria
   - Método: `getSettings(category, defaults)`

2. **SystemConfigService**
   - Lê: timezone, idioma, nome, manutenção
   - Métodos: `getTimezone()`, `getLanguage()`, `isMaintenanceMode()`

3. **NotificationConfigService**
   - Lê: SMTP, webhooks, regras de notificação
   - Métodos: `getSmtpConfig()`, `getActiveWebhooks(event)`, `getRuleForEvent(event)`

4. **PasswordValidationService**
   - Lê: política de senhas
   - Método: `validatePassword(password)` — lança erro com requisitos não-atendidos

5. **SecurityConfigService**
   - Lê: sessão, RBAC, 2FA
   - Métodos: `getSessionTimeout()`, `isTwoFactorRequired()`, `hasPermission(roleId, permission)`

### Integrações Realizadas

- ✅ **TicketsService** — usa `defaultPriority` e `defaultStatus` do SettingsService
- 📋 **NotificationsService** — pronto para usar `NotificationConfigService`
- 📋 **UsersService** — pronto para usar `PasswordValidationService`
- 📋 **AuthService** — pronto para usar `SecurityConfigService`

### Como Usar

Arquivo: `apps/api/src/modules/settings/CONFIG-INTEGRATION.md`

Injetar + ler em runtime:
```typescript
constructor(private notificationConfig: NotificationConfigService) {}

async send() {
  const smtp = await this.notificationConfig.getSmtpConfig();
  // Use smtp.host, smtp.port, etc.
}
```

**Próximo passo (opcional):** Adicionar cache em memória com TTL para melhorar performance.

### Design System

Todos os componentes UI importados de `@/components/ui` (`apps/web/components/ui.tsx`). Nunca criar estilos ad-hoc.

- Formulários: `Button`, `Input`, `Select`, `Field`, `Label`
- Layout: `Modal`, `PageHeader`, `Panel`, `Spinner`, `EmptyState`, `ErrorBanner`, `StatCard`
- Badges: `StatusBadge`, `PriorityBadge`
- Constantes: `STATUS_LABELS`, `PRIORITY_LABELS`, `KIND_LABELS`, `KIND_STYLES`, `URGENCY_LABELS`, `IMPACT_LABELS`, `REQUEST_ORIGIN_LABELS`, `RELATION_TYPE_LABELS`

**Componentes de sub-recursos de ticket** (em `apps/web/components/`):
- `TicketTasks.tsx` — CRUD de tarefas com toggle de estado por clique no checkbox
- `TicketCosts.tsx` — CRUD de custos com cards de totalizadores (Tempo/Fixo/Material/Total)
- `TicketSolution.tsx` — proposta de solução (técnico) + aprovação/recusa com motivo (solicitante)
- `TicketValidation.tsx` — solicitação de validação + resposta do aprovador

**Página de detalhe de ticket** (`apps/web/app/tickets/[id]/page.tsx`) tem 5 abas:
- **Acompanhamento** — `TicketTimeline` + `TicketAttachments`
- **Tarefas** — `TicketTasks`
- **Custos** — `TicketCosts`
- **Solução** — `TicketSolution`
- **Validação** — `TicketValidation`
- Sub-recursos são carregados por demanda (lazy) ao trocar de aba
- `isRequester` = `ticket.requester.id === currentUser.id`; `isAgent` = role ADMIN ou TECHNICIAN

**Itens removidos do sidebar de detalhe de ticket:**
- "Esforço e Faturamento" (horas apontadas calculadas + custo estimado) — removido; custos reais ficam na aba Custos

Guia completo: `apps/web/DESIGN_SYSTEM.md`.

O sistema opera **sempre em dark mode** — classes `bg-gray-900`, `text-white` são a norma.

## Key Conventions

- **IDs:** `cuid()`, não UUID. Não usar `@IsUUID()` em DTOs.
- **Notificações:** o `NotificationsService` nunca lança exceção — falhas silenciosas intencionais.
- **Automação:** idem — regras quebradas não propagam erro.
- **Novos módulos NestJS:** criar `module / controller / service`, registrar em `AppModule`, prefixar controller com `/api/[nome]`.
- **Novas páginas:** `apps/web/app/[feature]/page.tsx`, importar de `@/components/ui`, usar `api.get/post/patch/delete`.
- **Commits:** Conventional Commits — `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- **CORS:** apenas `http://localhost:3001` liberado em dev. Alterar em `apps/api/src/main.ts` se necessário.
