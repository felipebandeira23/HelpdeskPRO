# STATUS — Onde paramos

> **Leia este arquivo no início de cada sessão.** Atualizado a cada fase concluída.
> Última atualização: 11/06/2026 fim do dia — fases A/B/C CONCLUÍDAS e verificadas em runtime.

## Plano vigente (acordado em 11/06)

| Fase | Conteúdo | Status |
|---|---|---|
| Design System | Tokens "sala de controle" (MASTER.md), glass sutil, semáforo SLA, tnum | ✅ |
| A — Ligar telas ao backend real | assets (+detalhe), customers, vault, tasks, ratings, dashboard SLA panel, admin categorias | ✅ |
| B — Segurança | Vault AES-256-GCM + reveal, JWT sem fallback, RBAC (@Roles), rate-limit login | ✅ (403 verificado) |
| C — Automação real | 7 operadores de condição + 5 ações + gatilhos created/updated | ✅ (smoke: auto-atribuição funcionou) |
| **D — Email + Portal** | IMAP→ticket, SMTP de notificação, portal público | ⬜ **PRÓXIMO PASSO** |
| E — Decisão sobre mocks | chat/whatsapp/billing/network/tvmode: remover do menu ou "em breve" | ⬜ |

## Pendências pontuais (rápidas)
- UI do editor de automação ainda não expõe o formato condições/ações (regras via API funcionam).
- Definir `VAULT_KEY` própria no .env (hoje deriva de JWT_SECRET).
- Commitar: a sessão de 11/06 inteira está sem commit — fazer commits por fase (conventional commits).
- Considerar remover NODE_ENV=production das variáveis globais do Windows.

## Estado do código (resumo)

- **Backend sólido**: tickets (SLA auto, seguidores, pausa, anexos), categorias, SLA engine
  (políticas/expediente/feriados/cron 60s), notificações, auditoria global, reports/ratings reais.
- **14 controllers protegidos** com JwtAuthGuard em 11/06 (estavam abertos). Portal é público por design.
- **Frontend**: dashboard, tickets, settings/sla, settings/users, settings/groups, reports e login
  usam API real. Demais páginas: ver Fase A.
- **Testes**: api 7/7 (business-hours), web 46/46. ⚠️ A máquina tem NODE_ENV=production global —
  `jest.env.js` contorna; considerar remover a variável do Windows.

## Decisões de design (resumo do MASTER.md)

Dark "sala de controle"; brand azul #3b82f6; glass só em superfícies elevadas; semáforo SLA
emerald/amber/red sempre com ícone+texto; números tabulares (.tnum); micro-interações 150-200ms;
foco visível em tudo; nada de emoji como ícone estrutural em telas novas (migração gradual).

## Histórico de sessões

- **11/06 manhã**: fundamentos (categorias, anexos, SLA real, notificações, auditoria, mocks
  de reports/ratings eliminados) — ver CHANGELOG 11/06.
- **11/06 tarde**: auditoria de segurança (guards), fix dos 46 testes web, design system, fases A-C.
