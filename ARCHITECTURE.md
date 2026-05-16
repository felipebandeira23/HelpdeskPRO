# ARCHITECTURE.md — Decisões Técnicas do HelpdeskPRO

> Este arquivo registra **decisões técnicas e seu racional**. Atualizado a cada sprint quando uma decisão nova é tomada.

---

## ADR-001: Stack TypeScript ponta-a-ponta

**Data:** 15/05/2026
**Status:** Aceito

**Decisão:** Usar NestJS (backend) + Next.js (frontend) + Prisma (ORM) + TypeScript em todo o monorepo.

**Contexto:** O dono do projeto não é programador. O sistema será escrito majoritariamente pelo Claude Code com revisão por IA. Precisamos de uma stack que minimize erros silenciosos.

**Alternativas consideradas:**
- **Laravel (PHP):** Próximo do GLPI, curva curta. Rejeitado porque frontend moderno fica mais trabalhoso e tipagem é mais fraca.
- **Django (Python):** Backend produtivo. Rejeitado porque ecossistema ITSM é mais raso e não casa com o Agente Electron existente.

**Por que essa decisão:**
1. Tipagem forte protege quem não programa
2. Stack consistente com Agente Electron já existente (Node.js)
3. Visual Milvus-like (split layout, realtime) é trivial em Next.js + Tailwind
4. Ecossistema gigante = respostas fáceis quando algo quebrar

**Consequências:**
- Toda dependência precisa funcionar bem em monorepo TypeScript
- Builds podem ser mais lentos que linguagens compiladas, mas tooling moderno (Turborepo, SWC) mitiga

---

## ADR-002: PostgreSQL ao invés de MySQL

**Data:** 15/05/2026
**Status:** Aceito

**Decisão:** Usar PostgreSQL como banco principal.

**Contexto:** O GLPI usa MySQL/MariaDB. Faria sentido manter consistência?

**Decisão:** Não.

**Por quê:**
1. PostgreSQL tem suporte JSON nativo superior (útil pra campos customizáveis e regras de automação)
2. Full-text search nativo (sem precisar de Elasticsearch)
3. Transações mais robustas
4. Tipos avançados (arrays, enums, intervals) facilitam modelagem
5. Prisma trata os dois igualmente — não há custo de migração

---

## ADR-003: Monorepo com Turborepo

**Data:** 15/05/2026
**Status:** Aceito

**Decisão:** Monorepo único com Turborepo.

**Estrutura:**
- `apps/api` — backend NestJS
- `apps/web` — frontend Next.js
- `apps/desktop` — Agente Electron (a ser importado em fase futura)
- `packages/shared` — DTOs, enums, tipos compartilhados
- `packages/ui` — design system

**Por quê:**
1. DTOs e tipos compartilhados entre front e back sem duplicação
2. Atomic commits que tocam back+front juntos
3. Turborepo cacheia builds e reduz tempo de CI

**Alternativa rejeitada:** Repos separados. Aumenta atrito de manter tipos sincronizados.

---

## ADR-004: Docker desde Sprint 0

**Data:** 15/05/2026
**Status:** Aceito

**Decisão:** Docker + docker-compose desde o primeiro commit.

**Por quê:**
- O HelpdeskPRO começa rodando no WSL e migra pra Ubuntu Server. Docker torna essa migração trivial.
- Onboarding de qualquer dev futuro vira `docker-compose up`.

**Trade-off aceito:** Setup inicial mais complexo. Compensado pela portabilidade.

---

## ADR-005: Auth local no MVP, LDAP na Fase 2

**Data:** 15/05/2026
**Status:** Aceito

**MVP:** email + senha (bcrypt, salt rounds 12) com NextAuth.

**Fase 2:** integração LDAP/AD pra reaproveitar o diretório corporativo existente.

**Por quê escalonar:** LDAP exige configuração de servidor de teste, certificados, mapeamento de atributos. É custoso e bloqueia o MVP. Local resolve 100% do MVP.

---

## ADR-006: Português brasileiro como única língua

**Data:** 15/05/2026
**Status:** Aceito

**Decisão:** Toda UI, mensagem de log, commit e documentação em pt-BR. Sem i18n no MVP.

**Por quê:**
- Sistema interno de uma empresa brasileira
- i18n é complexidade não justificada no MVP
- Pode ser adicionado em fase futura se houver demanda

**Exceção:** Identificadores de código (variáveis, classes) ficam em inglês por convenção da indústria.

---

## ADR-007: Modelagem de domínio — inspirar-se no GLPI, sem copiar

**Data:** 15/05/2026
**Status:** Aceito

**Decisão:** Quando modelar entidades, ler o código PHP do GLPI em `/var/www/html/glpi/src/` pra entender a lógica de negócio. **Nunca traduzir literalmente** o schema do GLPI.

**Razões pra divergir do GLPI:**
1. GLPI carrega 20 anos de decisões legacy
2. Algumas tabelas do GLPI têm 50+ colunas (`glpi_computers`) — vamos quebrar em entidades menores
3. GLPI mistura responsabilidades (ex: `glpi_users` tem campos de configuração de UI)
4. GLPI usa nomenclatura francesa em alguns lugares (`itemtype`, `entities_id`)

**Quando registrar uma decisão de divergência:** sempre que o HelpdeskPRO modelar algo significativamente diferente do GLPI, adicionar uma seção em `docs/glpi-reference/` explicando por quê.

---

## Decisões futuras (placeholders)

- ADR-008: Estratégia de cache (Fase 2)
- ADR-009: Filas e jobs assíncronos (Fase 3 — provavelmente BullMQ)
- ADR-010: Storage de anexos (Fase 1 — S3-compatível ou local?)
- ADR-011: Realtime — Socket.io vs Server-Sent Events (Fase 5)
