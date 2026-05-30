# EXECUTION PLAN — Terminar HelpDesk Pro Completo

**Data:** 2026-05-29  
**Objetivo:** Implementar Fases 0-6 completamente (25 sprints)  
**Estratégia:** MVP primeiro (Gate 1), depois Fases 1-6 progressivamente

---

## PHASE 0 — MVP (Gate 1) — Sprint 0.7-0.8

### Status Atual
- ✅ Sprint 0.1-0.6 completo (Turborepo, Auth, Layout, CRUD, Dashboard)
- ⚠️ Faltam testes, Docker validate, e tag v0.1.0-mvp

### Tarefas (this sprint)

#### 0.7.1 — Setup Banco de Dados Local
- [ ] Docker: Iniciar PostgreSQL localmente (docker-compose up db)
- [ ] Prisma: Rodar migrações (`npx prisma migrate deploy`)
- [ ] Prisma: Rodar seed (`npm run db:seed`)
- [ ] Validação: Verificar dados no banco

#### 0.7.2 — Testes Backend (Jest)
- [ ] Arquivo: `apps/api/src/modules/tickets/tickets.service.spec.ts`
- [ ] Arquivo: `apps/api/src/modules/auth/auth.service.spec.ts`
- [ ] Arquivo: `apps/api/test/app.e2e-spec.ts`
- [ ] Meta: 60% cobertura mínima
- [ ] Run: `npm run test:cov`

#### 0.7.3 — Build & Docker Validate
- [ ] Build API: `npm run build --workspace @helpdeskpro/api`
- [ ] Build Web: `npm run build --workspace @helpdeskpro/web`
- [ ] Docker: `docker-compose build` (validar Dockerfiles)
- [ ] Docker: `docker-compose up` (testar stack completa)

#### 0.7.4 — Tag MVP Release
- [ ] Commit de ajustes finais (se houver)
- [ ] Git tag: `v0.1.0-mvp`
- [ ] Git push: tags para GitHub
- [ ] Validação: Confirmar tag no GitHub

---

## PHASE 1 — Tickets Completos (Sprints 1.1-1.7) — ~8 sprints

**Objetivo:** Atingir UX Milvus-like com split layout, SLA, templates, múltiplas visualizações.

### Sprint 1.1 — Split Layout do Ticket (70/30)
- [ ] Novo layout: `apps/web/app/tickets/[id]/detail-layout.tsx`
- [ ] Timeline: Chat-style com avatares, timestamps relativos
- [ ] Sidebar: Metadados, progresso 0-100%, SLA badges
- [ ] Barra fixa: Resposta no rodapé

### Sprint 1.2 — Metadados Editáveis Inline
- [ ] Editar prioridade, responsável, categoria, mesa de trabalho (inline)
- [ ] Lista de seguidores com botão `+`
- [ ] API: PATCH `/api/tickets/:id` (apenas metadados)

### Sprint 1.3 — Checklists e Progresso
- [ ] Model: `Checklist`, `ChecklistItem`
- [ ] UI: CRUD de checklists configuráveis por tipo
- [ ] Progresso automático 0-100%

### Sprint 1.4 — SLA Básico
- [ ] Model: `SLA` (resposta, solução)
- [ ] Cálculo: Respeitar expediente do cliente
- [ ] UI: Badge + contagem regressiva no header

### Sprint 1.5 — Histórico do Cliente
- [ ] Painel: "Últimos 5 tickets"
- [ ] Badge: "Situação do Contrato"
- [ ] Quem viu este ticket (avatares)
- [ ] Página: Histórico completo

### Sprint 1.6 — Templates de Tickets
- [ ] Model: `TicketType`, `TicketTemplate`
- [ ] CRUD: Customizáveis por ícone, cor, SLA, checklist padrão
- [ ] UI: Aplicar template ao criar

### Sprint 1.7 — Múltiplas Visualizações
- [ ] Kanban view (por status)
- [ ] Cards view
- [ ] Lista comprimida
- [ ] Filtros como chips removíveis
- [ ] **Tag:** `v0.2.0` when done

---

## PHASE 2 — Dashboards e Automação (Sprints 2.1-2.4) — ~4 sprints

### Sprint 2.1 — Dashboard Principal
- [ ] Cards: Total, Em aberto, Atrasados, Sem categoria
- [ ] Gráfico: Tickets por status
- [ ] Gráfico: Top requerentes
- [ ] Gráfico: Top categorias

### Sprint 2.2 — Dashboard de SLA Semafórico
- [ ] Painel: Pausados (resposta + solução)
- [ ] Painel: Prestes a Estourar
- [ ] Painel: Estourados
- [ ] Links: Filtrar por status

### Sprint 2.3 — Automação de Tickets
- [ ] Model: `AutomationRule` (Quando, Condições, Ações)
- [ ] CRUD: Rules admin interface
- [ ] UI: Editor visual (futuro)
- [ ] Engine: Gatilhos (criação, atualização, SLA)

### Sprint 2.4 — LDAP/AD Auth
- [ ] Config: Servidor LDAP em .env
- [ ] Auth: Implementar LDAP no NestJS
- [ ] Sync: Usuários do AD
- [ ] Toggle: Auth local vs LDAP
- [ ] **Tag:** `v0.3.0` when done

---

## PHASE 3 — Inventário (Sprints 3.1-3.3) — ~4 sprints

### Sprint 3.1 — Modelagem de Ativos
- [ ] Models: Computer, Monitor, Software, Printer, NetworkDevice
- [ ] Relações: Asset relationships
- [ ] UI: Listagem e detalhe

### Sprint 3.2 — Integração com Agente Electron
- [ ] Referência: Existente em `Support.pm`
- [ ] Proxy Local: Adaptar pra falar com API HelpdeskPRO
- [ ] Endpoint: Inventário no NestJS
- [ ] Tests: Ponta-a-ponta

### Sprint 3.3 — Vinculação Ticket ↔ Ativo
- [ ] UI: Selecionar ativo afetado
- [ ] Timeline: Histórico de tickets por ativo
- [ ] **Tag:** `v0.4.0` when done

---

## PHASE 4 — Portal do Cliente (Sprints 4.1-4.3) — ~4 sprints

### Sprint 4.1 — Portal Público
- [ ] Route: `/portal`
- [ ] UI: Tema customizável (logo, cores)
- [ ] Form: Abertura simplificada
- [ ] List: Tickets do cliente

### Sprint 4.2 — Pesquisa de Satisfação
- [ ] Model: `Rating`
- [ ] UI: Estrelas 1-5 no fechamento
- [ ] Email: Link de avaliação automático
- [ ] Dashboard: NPS/CSAT

### Sprint 4.3 — Relatórios
- [ ] Pré-definidos: Horas trabalhadas, tickets por período
- [ ] Builder: Customizados
- [ ] Agendados: Email automático
- [ ] Export: PDF
- [ ] **Tag:** `v0.5.0` when done

---

## PHASE 5 — Chat Multicanal (Sprints 5.1-5.4) — ~6 sprints

### Sprint 5.1 — Infraestrutura Realtime
- [ ] Socket.io: NestJS + Next.js
- [ ] Models: Chat, Message, Channel
- [ ] Comms: Realtime messages

### Sprint 5.2 — Widget de Chat
- [ ] Widget: Embedável em sites externos
- [ ] Config: Cores, mensagem inicial
- [ ] Queue: Fila de atendimento

### Sprint 5.3 — WhatsApp Integration
- [ ] Provider: Decidir (API oficial vs gateway)
- [ ] Integration: API WhatsApp
- [ ] UI: Chat unificado

### Sprint 5.4 — Dashboards Chat
- [ ] Métricas: TME, TMA, % abandono
- [ ] Status: Operadores online
- [ ] **Tag:** `v0.6.0` when done

---

## PHASE 6 — Funcionalidades Avançadas (Sprints 6.1-6.4) — ~8 sprints

### Sprint 6.1 — Cofre de Senhas
- [ ] Model: Criptografia em repouso
- [ ] CRUD: Vinculado a ativos
- [ ] Permissões: Grupos de senhas

### Sprint 6.2 — Faturamento
- [ ] Catálogo: Serviços
- [ ] Conferência: Faturamento
- [ ] Contratos: Gerenciamento
- [ ] Bloqueio: Por inadimplência

### Sprint 6.3 — Modo TV
- [ ] Layout: Fullscreen dashboards
- [ ] Refresh: Auto-refresh sem flicker
- [ ] Painéis: Múltiplos intercalados

### Sprint 6.4 — Monitoramento e Topologia
- [ ] Monitoring: Links de rede
- [ ] Topologia: Visual
- [ ] Alertas: Configuráveis
- [ ] **Tag:** `v1.0.0` when done

---

## GATES FINAIS

### Gate de Homologação (antes de desligar GLPI)
- [ ] 3 meses em produção paralela
- [ ] 3+ usuários reais com chamados abertos
- [ ] Zero bugs críticos em 30 dias
- [ ] Backup automatizado (+ restore validado)
- [ ] Documentação de operação
- [ ] Plano de rollback

---

## Estimativas de Tempo

| Fase | Sprints | Tempo Full-Time | Tempo Paralelo |
|------|---------|-----------------|-----------------|
| **0 (MVP)** | 0.7-0.8 | 1-2 semanas | 3-4 semanas |
| **1** | 1.1-1.7 | 8 semanas | 16-24 semanas |
| **2** | 2.1-2.4 | 4 semanas | 8-12 semanas |
| **3** | 3.1-3.3 | 4 semanas | 8-12 semanas |
| **4** | 4.1-4.3 | 4 semanas | 8-12 semanas |
| **5** | 5.1-5.4 | 6 semanas | 12-18 semanas |
| **6** | 6.1-6.4 | 8 semanas | 16-24 semanas |
| **TOTAL** | 25 sprints | ~35 semanas | ~10 meses |

---

## Próximas Ações (Agora)

1. ✅ Setup .env.local
2. ✅ Docker-compose verificado
3. **→ Iniciar Docker (banco de dados)**
4. **→ Rodar migrações Prisma**
5. **→ Executar Sprint 0.7 (testes + Docker)**
6. **→ Tag v0.1.0-mvp**
7. **→ Proceder com Phase 1**

---

**Status:** 🟡 Em andamento  
**Último update:** 2026-05-29 (initialization)
