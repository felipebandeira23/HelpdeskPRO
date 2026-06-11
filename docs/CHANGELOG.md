# CHANGELOG

## 2026-06-11 (noite) — Design system + Fases A/B/C

### Design System v2 (`design-system/MASTER.md`)
- Conceito "sala de controle confiável": dark base #0b1220 com gradientes radiais sutis, glass apenas em superfícies elevadas, semáforo SLA como assinatura visual, números tabulares (`.tnum`), micro-interações 150-200ms com `active:scale-[0.98]`, foco visível global, `prefers-reduced-motion` respeitado, scrollbar e skeleton shimmer próprios.
- Tokens novos no tailwind (brand/surface/shadow-card/shadow-pop/glow-brand) e componentes `Section` e `Skeleton` em ui.tsx. Classes fixadas pelos testes preservadas — 46/46 verdes.

### Fase A — Telas ligadas ao backend real (com design novo)
- **/assets**: inventário real (busca, badge de agente com dot, CRUD, link p/ detalhe). **/assets/[id]**: specs + tickets vinculados via `GET /api/assets/:id/tickets`.
- **/customers**: CRUD real com badge de contrato (ativo/vencendo/inadimplente).
- **/vault**: lista sem senha, revelar sob demanda (auto-oculta em 15s), criar/excluir.
- **/tasks**: tarefas reais (filtro, concluir via checkbox, iniciar, vencimento com atraso destacado).
- **/ratings**: agregados reais de `survey-results` (distribuição, média por operador, recentes).
- **Dashboard**: painel semafórico agora consome `GET /api/slas/panel` (inclui pausados com itens) e atualiza a cada 60s.
- **/settings/categories**: reescrita — gerencia categorias REAIS em árvore (sub-categorias, cor, ativar/desativar). ⚠️ A UI antiga de ticket-types foi substituída; CRUD de tipos segue via `/api/ticket-types`.

### Fase B — Segurança
- **Vault criptografado**: AES-256-GCM (`vault-crypto.ts`, chave via scrypt de `VAULT_KEY`/`JWT_SECRET`); listagem NUNCA retorna senha; `GET /api/vault/:id/reveal` descriptografa sob demanda; identidade sempre do token (antes vinha do body — forjável); valores legados em texto puro são tolerados na leitura e re-criptografados na próxima escrita.
- **JWT sem fallback**: `requireJwtSecret()` — API se recusa a subir sem `JWT_SECRET` (≥16 chars). Eliminado o secret hardcoded em 2 arquivos.
- **RBAC mínimo** (`roles.guard.ts`): `@Roles('ADMIN')` em users (mutações), audit-logs, categorias (mutações), config de SLA (mutações) e exclusão de tickets; `GET /api/users` restrito a ADMIN/TECHNICIAN. Verificado: viewer recebe 403.
- **Rate-limit no login**: 10 falhas/IP por 15min, em memória (sem dependência nova); sucesso zera o contador.

### Fase C — Automação real
- `automation-engine.ts`: condições com operadores equals/not_equals/contains/not_contains/in/is_empty/is_not_empty (AND entre condições; formato inválido = não executa, fail-safe). 7 specs.
- Ações implementadas: `assign` (com notificação), `set_priority`, `set_group`, `add_follower`, `notify`.
- `executeRules` agora É chamado: gatilhos `ticket_created` e `ticket_updated` no TicketsService. Ações usam prisma direto para não disparar nova rodada de regras (anti-loop). Falha de automação nunca quebra a operação (log + segue).
- Smoke test: regra "urgente sem responsável → atribuir ao técnico" funcionou na criação real de ticket.

### Testes
- API: 14/14 (business-hours 7 + automation-engine 7). Web: 46/46.

### Pendências movidas para próxima sessão
- Fase D (email IMAP→ticket, SMTP, portal público) e Fase E (decidir mocks restantes: chat/whatsapp/billing/network/tvmode).
- UI do editor de regras de automação ainda é a antiga (regras criadas via API funcionam; tela precisa expor o formato condições/ações).
- Definir `VAULT_KEY` própria no .env de produção.

## 2026-06-11 (tarde) — Auditoria de segurança e correções

- 🔴 **SEGURANÇA**: 14 controllers estavam sem `JwtAuthGuard` — `/api/users` (criação de admin sem login!), `/api/vault`, `/api/customers`, `/api/groups`, `/api/dashboard`, `/api/ticket-types`, `/api/tasks`, checklists, tvmode, billing, chat, ldap, whatsapp, network. Todos protegidos; `portal` mantido público por design; verificado 401 em runtime.
- 🔴 **Vault sem criptografia**: schema prometia "encrypted at rest", mas senhas são gravadas em texto puro e `findAll` as retorna sem máscara. Guard aplicado estanca a exposição externa; criptografia AES-256-GCM segue pendente (ver plano).
- 🐛 **46 testes do frontend falhavam**: a máquina de dev tem `NODE_ENV=production` global no Windows, fazendo o Jest carregar o React de produção (`act()` indisponível). Corrigido com `jest.env.js` forçando `NODE_ENV=test` via `setupFiles`. 46/46 verdes.
- Auditoria mapeou: engine de automação é placeholder (conditions sempre `true`, actions não fazem nada, `executeRules` nunca é chamado); só 9 de ~37 páginas do frontend consomem API (assets, customers, vault e tasks têm backend real mas telas estáticas); JWT secret com fallback hardcoded em `auth.module.ts` e `jwt.strategy.ts`.
- `.gitignore`: + `uploads/` e `api-dev.log`.

## 2026-06-11 — Fundamentos do helpdesk completo (sessão Cowork)

### Banco (migration `20260611104939_init_helpdesk_completo`)
- ⚠️ Migration anterior (`20260529_add_sla_checklist_templates`) estava quebrada (referenciava enum inexistente — schema original havia sido aplicado via `db push`). Histórico foi rebaselineado em uma migration única; banco dev resetado e re-seedado.
- Novos models: `Category` (hierárquica), `Attachment`, `TicketFollower`, `SlaPolicy`, `BusinessHours`, `Holiday`, `Notification`, `TicketRating`.
- `Ticket`: + `categoryId`, `customerId`, `pauseReason`, `pausedAt`, `firstResponseAt`.
- `SLA`: + `policyId`, `respondedAt`, `solvedAt`, `pausedAt`, `totalPausedMinutes`.
- `Customer` agora se relaciona com `Ticket`.

### Backend
- **Categorias** (`/api/categories`): CRUD hierárquico com proteção contra ciclos, lista plana com caminho completo (`Hardware > Impressora`) e árvore com contagem de tickets.
- **Anexos** (`/api/attachments`): upload via multer (limite 25 MB, extensões executáveis bloqueadas), download por stream, exclusão restrita ao autor/admin. Arquivos em `uploads/` (gitignored).
- **SLA real**: políticas por escopo (categoria+prioridade > categoria > prioridade > global), cálculo respeitando expediente (`BusinessHours`) e feriados (`Holiday`, com recorrência anual), pausa do contador quando o ticket pausa (prazos deslocados na retomada), avaliação periódica a cada 60s que persiste `WARNING`/`BREACHED` e notifica o responsável **na transição**. Corrige bug em que o painel de estourados sempre vinha vazio (status persistido nunca era atualizado). `setInterval` em vez de `@nestjs/schedule` para não adicionar dependência (PLANO §5).
- **Tickets**: SLA aplicado automaticamente na criação; `firstResponseAt` marcado na primeira resposta pública de operador; pausa exige `pauseReason` (400 sem ele); transições corrigidas (OPEN→WAITING liberado, reabertura de CLOSED permitida); seguidores (`POST/DELETE /:id/followers`); histórico do solicitante (`GET /:id/requester-history`); filtros por categoria/cliente/operador na listagem.
- **Notificações reais** (`/api/notifications`): persistidas, eventos de atribuição, followup, fechamento, SLA e seguidor; endpoints unread-count/read/read-all. Falha de notificação nunca quebra a operação principal.
- **Auditoria**: interceptor global grava `AuditLog` em toda mutação autenticada (método, módulo, recordId, IP, body com campos sensíveis mascarados). Consulta em `/api/audit-logs`.
- **Mocks eliminados**: `reports` agora agrega dados reais (overview, by-status, by-priority, by-category, by-operator, sla compliance); `ratings` persiste em `TicketRating` (só solicitante, só ticket fechado, upsert 1–5).
- **Fix**: DTOs usavam `@IsUUID()` mas os IDs são `cuid()` — qualquer criação com `groupId`/`assetId` era rejeitada. Trocado por `@IsString()`.

### Frontend
- Sino de notificações no TopBar (polling 30s, badge de não lidas, marcar todas como lidas).
- CreateTicketModal: select de categoria.
- Detalhe do ticket: card de SLA (resposta/solução com prazo e status), categoria editável inline, seguidores (+ seguir/deixar de seguir), motivo de pausa visível, anexos com upload/download/exclusão, histórico real do solicitante. Pausa agora envia status+motivo num único PATCH.
- `settings/sla`: reescrita — CRUD de políticas, editor de expediente semanal e gestão de feriados, tudo persistido.
- `reports`: reescrita com dados reais (visão geral, cumprimento de SLA, por status/prioridade/categoria/operador).
- `lib/api.ts`: método `put` adicionado.

### Seed
- 11 categorias (4 raízes + 7 filhas), expediente seg–sex 08:00–18:00, 8 feriados nacionais recorrentes, 3 políticas de SLA (Padrão global, Alta, Urgente).

### Testes
- `business-hours.util.spec.ts`: 7 specs (mesmo dia, transbordo, fim de semana, feriado fixo, feriado recorrente, início antes do expediente, fallback 24/7). Todos verdes.

### Smoke test executado
Login → criação de ticket URGENT com categoria → SLA aplicado (resposta +1h útil, solução +8h úteis) → followup do técnico marca `respondedAt` (OK) → pausa sem motivo rejeitada → pausa com motivo pausa o SLA → seguidor adicionado → notificação entregue ao solicitante → reports e audit-logs com dados reais.

### Pendências conhecidas
- Página `settings/categories` ainda gerencia ticket-types (categorias administráveis só via API por enquanto).
- Dashboard principal ainda não consome `/api/slas/panel` (painel semafórico).
- Página `ratings` ainda não consome `/api/ratings/survey-results`.
- Chat, WhatsApp, billing, network e tvmode continuam mocks — marcar como "em breve" na UI ou remover do menu.
