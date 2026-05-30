# Integração Obsidian — Rede Neural de Contexto

**Vault Location:** `E:\JARVIS\JARVIS BRAIN\JARVIS BRAIN`  
**Last Updated:** 2026-05-29  
**Status:** ✅ Ativo

---

## Propósito

O Obsidian vault em `E:\JARVIS` funciona como **rede neural de contexto** para o Claude Code. Todas as sessões devem começar consultando os arquivos de Neural_Net para manter continuidade de conhecimento sobre:

- **Identity:** Contexto pessoal (Felipe Bandeira)
- **Projects:** Projetos ativos (HelpDesk Pro, GLPI, Concursos Públicos TI)
- **Preferences:** Preferências de trabalho e estudo
- **General:** Conceitos e observações gerais
- **Notes:** Anotações e contexto ambiental

---

## Estrutura do Vault

```
JARVIS BRAIN/
├── Neural_Net/
│   ├── Identity.md         # Dados pessoais, colegas, amigos
│   ├── Projects.md         # Projetos em andamento
│   ├── Preferences.md      # Estilos de trabalho, preferências
│   ├── General.md          # Conceitos aprendidos
│   ├── Notes.md            # Observações gerais
│   ├── Relationships.md    # Relações profissionais
│   └── Wishes.md           # Objetivos futuros
└── [Outros]                # Documentação de domínio específico
```

---

## Como o Claude Code Deve Usar

### A cada sessão:
1. Ler `Neural_Net/Projects.md` para confirmar projeto ativo
2. Ler `Neural_Net/Preferences.md` para adaptar abordagem
3. Consultar notas específicas do projeto (ex: `HelpDesk Pro.md` se existir)
4. Manter coerência com decisões anteriores documentadas

### Ao finalizar sessão:
1. Atualizar `Neural_Net/Projects.md` com progresso
2. Adicionar insights novo a `Neural_Net/General.md`
3. Documentar decisões em `PLANO.md` do projeto (não no Obsidian)

---

## Referência Rápida — Estado Atual (2026-05-29)

**Felipe Bandeira**
- Máquina: Gaming machine, 16GB RAM
- Preparação: Concursos Públicos TI (Rio de Janeiro, UERJ/TCE-RJ)
- Projeto Principal: HelpDesk Pro (MVP em progresso)
- Email: felipe.bandeira.3@email.com

**Projeto HelpDesk Pro**
- Status: Sprint 0.5+ (quase MVP)
- Stack: NestJS + Next.js + Prisma + PostgreSQL
- Próximo Gate: `v0.1.0-mvp` tag + testes verdes

**Preferências**
- Conversação explícita (não passivo)
- Processamento local (Gema 4) pra economizar API tokens
- Método de estudo: 55% fundamentos, 30% especialização, 15% complementar
