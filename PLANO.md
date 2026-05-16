# PLANO.md — Plano Mestre do HelpdeskPRO

> **Este arquivo é a fonte da verdade do projeto.** Toda sessão do Claude Code deve começar lendo este arquivo. Toda decisão arquitetural deve ser registrada aqui ou em `docs/ARCHITECTURE.md`.

---

## 1. Visão do produto

Construir um sistema de Help Desk e Gestão de Ativos de TI que combine:

- A **modelagem de domínio do GLPI** (tickets, ativos, SLA, contratos, regras)
- A **experiência de usuário do Milvus** (dashboards realtime, split layout, chat-style timeline, sidebar fixa)

O resultado é um sistema independente, em stack moderna, que resolve as dores de adoção do GLPI sem perder a profundidade ITSM.

## 2. Decisões travadas

Estas decisões **não são reabertas** sem registro formal aqui:

| Decisão | Valor | Quando travada |
|---|---|---|
| Stack backend | NestJS (TypeScript) | 15/05/2026 |
| Stack frontend | Next.js 14 + Tailwind + shadcn/ui | 15/05/2026 |
| ORM | Prisma | 15/05/2026 |
| Banco | PostgreSQL (não MySQL) | 15/05/2026 |
| Monorepo | Turborepo | 15/05/2026 |
| Auth no MVP | Local (email + senha bcrypt) | 15/05/2026 |
| Auth na Fase 2 | LDAP/AD | 15/05/2026 |
| Modelo de trabalho | Sessões guiadas (não agentic longo) | 15/05/2026 |
| DB do GLPI atual | **Não migrar.** Começar do zero. | 15/05/2026 |
| GLPI atual | Continua rodando até gate de homologação | 15/05/2026 |
| Containerização | Docker desde Sprint 0 | 15/05/2026 |
| Idioma do projeto | Português Brasil (UI, commits, docs) | 15/05/2026 |

**Por que PostgreSQL e não MySQL?** GLPI usa MySQL por razões históricas. PostgreSQL tem suporte nativo melhor a JSON, full-text search, e tipos complexos que vão ser úteis pra automação de tickets. Prisma trata os dois igualmente.

## 3. Gates obrigatórios

### Gate 1 — Fim do MVP (Fase 0 + Fase 1)
Antes de continuar pra Fase 2, o sistema precisa:
- [ ] Login local funcionando
- [ ] Criar, listar e visualizar tickets
- [ ] Sistema rodando em Docker
- [ ] Testes automatizados verdes (pelo menos backend)
- [ ] Push pro GitHub com tag `v0.1.0-mvp`

### Gate 2 — Antes de desligar o GLPI
**O GLPI atual NÃO PODE ser desligado** até que:
- [ ] HelpdeskPRO esteja em produção paralela por **no mínimo 3 meses**
- [ ] Pelo menos **3 usuários reais** tenham aberto chamados no HelpdeskPRO em produção
- [ ] Zero bugs críticos registrados nos últimos 30 dias
- [ ] Backup automatizado configurado e testado

Este gate é **não-negociável**. Software novo tem bugs que só aparecem com uso real.

## 4. Princípios de implementação

Estes princípios guiam toda escolha do Claude Code:

1. **Tipagem estrita.** TypeScript em modo `strict`. Nada de `any` sem justificativa explícita em comentário.
2. **Testes acompanham features.** Toda rota de API tem teste de integração. Componentes complexos têm teste unitário. Cobertura mínima de 60% no backend.
3. **Pequeno > grande.** Funções de no máximo ~50 linhas. Arquivos de no máximo ~300 linhas. Se passar, refatora.
4. **Convencional.** Commits em [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, etc.) em português. Branches `feat/sprint-N-nome`.
5. **Nunca quebrar `main`.** Toda feature em branch própria, merge via PR (mesmo que solo).
6. **Documentar decisões, não implementação.** Comentários no código devem explicar **por quê**, não **o quê** (o código já mostra o quê).
7. **GLPI é referência, não cola.** Quando consultar `/var/www/html/glpi`, é pra entender lógica de negócio. Nunca copiar código PHP literal.
8. **UI em português.** Toda string visível ao usuário em pt-BR. Sem i18n no MVP (adiciona complexidade desnecessária).

## 5. Como o Claude Code deve operar

A cada sessão, o Claude Code deve:

1. **Ler** este `PLANO.md` inteiro.
2. **Ler** `docs/ROADMAP.md` pra identificar o sprint atual e o que falta.
3. **Confirmar com o usuário** qual tarefa específica vai executar nesta sessão.
4. **Implementar** apenas essa tarefa, sem expandir escopo.
5. **Escrever testes** junto com a implementação.
6. **Commitar** com mensagem clara em Conventional Commits.
7. **Atualizar** `docs/ROADMAP.md` marcando o que foi feito.
8. **Atualizar** `docs/CHANGELOG.md` com a entrega da sessão.
9. **Atualizar a página correspondente do Notion** via MCP (se conectado) ou avisar o usuário pra atualizar manualmente.
10. **Atualizar `README.md` SOMENTE SE** mudou: stack, escopo, instruções de instalação ou execução. Caso contrário, não tocar.

### Quando o Claude Code deve PARAR e perguntar

- Quando a tarefa solicitada conflita com uma "decisão travada" da seção 2.
- Quando precisar instalar uma dependência nova não listada na stack.
- Quando o usuário pedir algo que mude a arquitetura.
- Quando encontrar uma ambiguidade não resolvida nos documentos.

## 6. Estrutura do repositório (após bootstrap)

```
HelpdeskPRO/
├── apps/
│   ├── api/                    # NestJS
│   │   ├── src/
│   │   │   ├── modules/        # módulos de domínio (tickets, users, ...)
│   │   │   ├── common/         # filtros, guards, decorators
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                    # Next.js
│       ├── app/                # App Router
│       ├── components/
│       ├── lib/
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── shared/                 # DTOs, enums, tipos compartilhados
│   └── ui/                     # componentes de design system
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── docs/
│   ├── ARCHITECTURE.md         # decisões técnicas
│   ├── ROADMAP.md              # sprints + checkboxes
│   ├── CHANGELOG.md            # log de entregas (criado no Sprint 0)
│   └── glpi-reference/         # anotações de leitura do GLPI
├── docker-compose.yml          # orquestração local
├── turbo.json
├── .gitignore
├── .env.example
├── README.md
└── PLANO.md                    # este arquivo
```

## 7. Convenções

- **Língua:** português (BR) em UI, commits, documentação. Inglês apenas em código (variáveis, classes, funções) por convenção da indústria.
- **Nomenclatura de tabelas:** snake_case plural (`tickets`, `ticket_followups`, `users`).
- **Nomenclatura de classes TS:** PascalCase singular (`Ticket`, `User`).
- **Nomenclatura de rotas API:** kebab-case plural (`/tickets`, `/ticket-categories`).
- **Versionamento de API:** prefixo `/api/v1/...`.
- **Timezone:** `America/Sao_Paulo` em toda data exibida; UTC no banco.

## 8. Glossário de domínio

Termos do GLPI/Milvus que vamos usar no HelpdeskPRO:

| Termo | Significado |
|---|---|
| **Ticket** | Chamado aberto por um solicitante |
| **Operador / Técnico** | Usuário que atende tickets |
| **Solicitante** | Usuário que abre o ticket |
| **Mesa de Trabalho** | Grupo de operadores (equivalente a "Grupo" no GLPI) |
| **SLA Resposta** | Tempo máximo até primeira resposta |
| **SLA Solução** | Tempo máximo até resolução |
| **Ativo** | Equipamento ou software inventariado |
| **Categoria** | Classificação do ticket (ex: "Hardware > Impressora") |
| **Prioridade** | Crítica / Alta / Média / Baixa |
| **Followup** | Mensagem na timeline do ticket |
| **Nota Interna** | Followup visível só para operadores |
