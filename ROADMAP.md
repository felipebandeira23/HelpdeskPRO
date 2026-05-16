# ROADMAP.md — Sprints e Tarefas

> **Fonte cruzada:** este arquivo é o espelho do Notion (page id `3605f1e7-d34c-8114-bef8-da3c38b66f64`). Quando uma tarefa é concluída, marcar aqui **e** no Notion.

> **Atenção:** as estimativas de tempo são para alguém trabalhando full-time. Em paralelo com outras atividades, dobre ou triplique.

---

## Fase 0 — Bootstrap (2-3 semanas)

**Objetivo:** Ter o esqueleto do projeto rodando em Docker, com auth local funcionando e um CRUD básico de ticket.

### Sprint 0.1 — Setup do monorepo
- [ ] Inicializar Turborepo
- [ ] Criar `apps/api` (NestJS) com hello world
- [ ] Criar `apps/web` (Next.js) com hello world
- [ ] Criar `packages/shared` com TS config base
- [ ] Configurar ESLint + Prettier
- [ ] Configurar Husky com pre-commit (lint + format)
- [ ] Configurar `.gitignore` apropriado
- [ ] Primeiro commit + push pro GitHub

### Sprint 0.2 — Banco e ORM
- [ ] Adicionar PostgreSQL ao `docker-compose.yml`
- [ ] Inicializar Prisma em `prisma/`
- [ ] Modelar primeiras entidades: `User`, `Group`, `Ticket`, `TicketFollowup`
- [ ] Rodar primeira migration
- [ ] Criar seed inicial com usuário admin

### Sprint 0.3 — Autenticação local
- [ ] Implementar endpoint `POST /auth/login` (NestJS)
- [ ] Implementar endpoint `POST /auth/logout`
- [ ] Implementar guard JWT
- [ ] Implementar telas de login (Next.js)
- [ ] Integrar NextAuth no frontend
- [ ] Proteger rotas privadas
- [ ] Testes de integração da auth

### Sprint 0.4 — Layout base Milvus-style
- [ ] TopBar com logo, busca, botões de ação rápida (Novo Ticket, Nova Tarefa) e avatar
- [ ] Sidebar colapsável com ícones coloridos por módulo
- [ ] Tema com cores definidas (`#2B73C9`, `#2DB87D`, `#E85D2D`)
- [ ] Tipografia e design tokens em `packages/ui`
- [ ] Layout responsivo básico

### Sprint 0.5 — CRUD básico de ticket
- [ ] Endpoint `POST /tickets` (criar)
- [ ] Endpoint `GET /tickets` (listar com paginação)
- [ ] Endpoint `GET /tickets/:id` (detalhe)
- [ ] Endpoint `PATCH /tickets/:id` (atualizar)
- [ ] Tela de listagem de tickets (tabela simples)
- [ ] Modal de criação de ticket (campos essenciais)
- [ ] Tela de detalhe do ticket (versão simples, ainda sem split layout)
- [ ] Tag `v0.1.0-mvp` quando completar

---

## Fase 1 — Tickets completos (4-6 semanas)

**Objetivo:** Atingir paridade com a experiência Milvus de gestão de tickets.

### Sprint 1.1 — Split layout do ticket
- [ ] Layout 70/30 (timeline / sidebar de metadados)
- [ ] Header com ID, título editável inline, badge de status, botões de ação
- [ ] Barra de resposta fixa no rodapé
- [ ] Timeline estilo chat com avatars
- [ ] Timestamps relativos ("há 2 horas") com tooltip de data absoluta
- [ ] Badges de origem por mensagem (Helpdesk / Portal / Email)

### Sprint 1.2 — Metadados editáveis inline
- [ ] Editar prioridade direto na sidebar
- [ ] Editar responsável (operador) direto na sidebar
- [ ] Editar categoria direto na sidebar
- [ ] Editar mesa de trabalho direto na sidebar
- [ ] Lista de seguidores com botão `+`

### Sprint 1.3 — Barra de progresso e checklists
- [ ] Slider 0-100% na sidebar do ticket
- [ ] CRUD de checklists configuráveis por tipo de ticket
- [ ] Checklist embutido no ticket
- [ ] Progresso automático quando checklist é marcado

### Sprint 1.4 — SLA básico
- [ ] Modelagem de SLA Resposta e SLA Solução
- [ ] Cálculo de prazo respeitando expediente do cliente
- [ ] Badge visual de status do SLA no ticket
- [ ] Contagem regressiva no header do ticket

### Sprint 1.5 — Histórico do cliente e tracking
- [ ] Painel "Últimos 5 tickets deste cliente" na sidebar
- [ ] Badge "Situação do Contrato" (sem contrato / ativo / inadimplente)
- [ ] "Quem viu este ticket" (avatars com tooltip)
- [ ] Página de histórico completo do cliente

### Sprint 1.6 — Tipos de tickets e templates
- [ ] CRUD de tipos de ticket customizáveis (ícone, cor, SLA, checklist padrão)
- [ ] CRUD de templates de ticket
- [ ] Aplicação de template ao criar ticket

### Sprint 1.7 — Visualizações da lista
- [ ] Visão Kanban
- [ ] Visão Cards
- [ ] Visão Lista comprimida
- [ ] Indicadores visuais (dot de prioridade, barra SLA, avatar)
- [ ] Filtros como chips removíveis no topo
- [ ] Tag `v0.2.0` quando completar

---

## Fase 2 — Dashboards e Automação (3-4 semanas)

### Sprint 2.1 — Dashboard principal
- [ ] Cards de métricas (Total / Em aberto / Atrasados / Sem categoria)
- [ ] Gráfico de tickets por status
- [ ] Gráfico de top requerentes
- [ ] Gráfico de top categorias

### Sprint 2.2 — Dashboard de SLA semafórico
- [ ] Painel "Pausados" (resposta + solução)
- [ ] Painel "Prestes a Estourar" (resposta + solução)
- [ ] Painel "Estourados" (resposta + solução)
- [ ] Link "Ver mais" pra lista filtrada

### Sprint 2.3 — Automação de tickets
- [ ] Modelagem de regras (Quando, Condições, Ações)
- [ ] CRUD de regras de automação
- [ ] Editor visual de regras
- [ ] Engine de execução (gatilhos: criação, atualização, SLA prestes a estourar)

### Sprint 2.4 — LDAP/AD
- [ ] Configuração de servidor LDAP em `.env`
- [ ] Implementação de auth LDAP no NestJS
- [ ] Sincronização inicial de usuários do AD
- [ ] Toggle entre auth local e LDAP
- [ ] Tag `v0.3.0` quando completar

---

## Fase 3 — Inventário (3-4 semanas)

### Sprint 3.1 — Modelagem de ativos
- [ ] Computer, Monitor, Software, Printer, NetworkDevice
- [ ] Relações entre ativos
- [ ] Telas de listagem e detalhe

### Sprint 3.2 — Integração com Agente Electron
- [ ] Importar `Support.pm` existente como referência
- [ ] Adaptar Proxy Local pra falar com a API do HelpdeskPRO
- [ ] Endpoint de inventário no NestJS
- [ ] Testes ponta-a-ponta

### Sprint 3.3 — Vinculação ticket ↔ ativo
- [ ] Selecionar ativo afetado na criação do ticket
- [ ] Histórico de tickets por ativo
- [ ] Tag `v0.4.0` quando completar

---

## Fase 4 — Portal do cliente e satisfação (4-5 semanas)

### Sprint 4.1 — Portal do cliente
- [ ] Rota `/portal` (URL pública customizável)
- [ ] Tema configurável (logo, cores)
- [ ] Formulário de abertura simplificado
- [ ] Listagem dos próprios tickets

### Sprint 4.2 — Pesquisa de satisfação
- [ ] Modelagem de avaliação
- [ ] Estrelas 1-5 no fechamento do ticket
- [ ] Email automático com link de avaliação
- [ ] Dashboard de NPS / CSAT

### Sprint 4.3 — Relatórios
- [ ] Relatórios pré-definidos (horas trabalhadas, tickets por período)
- [ ] Builder de relatórios customizados
- [ ] Relatórios agendados por email
- [ ] Export PDF
- [ ] Tag `v0.5.0` quando completar

---

## Fase 5 — Chat multicanal (6-8 semanas)

### Sprint 5.1 — Infraestrutura realtime
- [ ] Socket.io no NestJS
- [ ] Socket.io client no Next.js
- [ ] Modelagem de Chat, Message, Channel

### Sprint 5.2 — Widget de chat
- [ ] Widget embedável em sites externos
- [ ] Configuração do widget (cores, mensagem inicial)
- [ ] Fila de atendimento

### Sprint 5.3 — Integração WhatsApp
- [ ] Avaliar provider (WhatsApp Business API oficial vs gateways)
- [ ] Integração com API escolhida
- [ ] UI de chat unificada

### Sprint 5.4 — Dashboards de chat
- [ ] TME (Tempo Médio de Espera)
- [ ] TMA (Tempo Médio de Atendimento)
- [ ] % de abandono
- [ ] Operadores online
- [ ] Tag `v0.6.0` quando completar

---

## Fase 6 — Funcionalidades avançadas (8+ semanas)

### Sprint 6.1 — Cofre de senhas
- [ ] Modelagem com criptografia em repouso
- [ ] CRUD vinculado a ativos
- [ ] Grupos de senhas e permissões

### Sprint 6.2 — Faturamento
- [ ] Catálogo de serviços
- [ ] Conferência de faturamento
- [ ] Gerenciamento de contratos
- [ ] Bloqueio por inadimplência

### Sprint 6.3 — Modo TV
- [ ] Layout fullscreen dos dashboards
- [ ] Auto-refresh sem flicker
- [ ] Múltiplos painéis intercalados

### Sprint 6.4 — Monitoramento e topologia
- [ ] Monitoramento de links de rede
- [ ] Topologia visual
- [ ] Alertas configuráveis
- [ ] Tag `v1.0.0` quando completar

---

## Gate de homologação para desligar o GLPI

**Antes de desligar o GLPI atual, todos os itens abaixo devem estar marcados:**

- [ ] HelpdeskPRO em produção paralela por **no mínimo 3 meses**
- [ ] Pelo menos **3 usuários reais** abriram chamados em produção
- [ ] **Zero bugs críticos** registrados nos últimos 30 dias
- [ ] Backup automatizado configurado e testado (com restore validado)
- [ ] Documentação de operação escrita
- [ ] Plano de rollback documentado e testado
