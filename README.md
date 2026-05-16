# HelpdeskPRO

Sistema de Help Desk e Gestão de Ativos de TI inspirado em [Milvus](https://www.milvus.com.br/) (referência primária de UX/UI) e em [GLPI](https://glpi-project.org) (referência técnica de modelagem de dados e lógica ITSM).

> ⚠️ **Status: em desenvolvimento inicial.** O sistema **não está pronto para uso em produção**. Sprint 0.1 (Setup do monorepo) ✅ concluído.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | NestJS (TypeScript) |
| Frontend | Next.js 14 (App Router) + Tailwind |
| ORM | Prisma |
| Banco | PostgreSQL |
| Monorepo | Turborepo |
| Containerização | Docker + docker-compose |

## Como rodar

### Pré-requisitos

- Node.js ≥ 20.0.0
- npm ≥ 10.0.0
- Docker + Docker Compose (para rodar banco de dados)

### Desenvolvimento local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Em terminais separados:
# Terminal 1: API (NestJS) no port 3001
# Terminal 2: Web (Next.js) no port 3000
```

### Com Docker Compose

```bash
# Rodar tudo junto
docker-compose up

# API: http://localhost:3001
# Web: http://localhost:3000
# Banco: postgresql://helpdeskpro:helpdeskpro@localhost:5432/helpdeskpro
```

## Estrutura do projeto

```
HelpdeskPRO/
├── apps/
│   ├── api/              # Backend NestJS
│   └── web/              # Frontend Next.js
├── packages/
│   ├── shared/           # Tipos compartilhados
│   └── ui/               # Design system (futuro)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
│   ├── PLANO.md          # Plano mestre do projeto
│   ├── ARCHITECTURE.md    # Decisões técnicas
│   ├── ROADMAP.md        # Sprints e tarefas
│   └── glpi-reference/   # Anotações do GLPI
└── docker-compose.yml
```

## Roadmap

- **Fase 0** — Bootstrap ✅ (Sprint 0.1 concluído), auth local, layout base, CRUD básico
- **Fase 1** — Tickets completos (split layout, timeline, SLA, checklist)
- **Fase 2** — Dashboards Milvus-style, automação básica, LDAP
- **Fase 3** — Inventário + Agente Electron
- **Fase 4** — Portal do cliente
- **Fase 5** — Chat multicanal
- **Fase 6** — Funcionalidades avançadas

Detalhes em [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Licença

Privado — Felipe Bandeira. Todos os direitos reservados.
