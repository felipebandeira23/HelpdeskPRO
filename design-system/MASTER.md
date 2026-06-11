# HelpdeskPRO — Design System MASTER

> Fonte da verdade de design. Páginas com desvios documentam em `design-system/pages/<página>.md`.
> Gerado em 11/06/2026 aplicando as regras do skill ui-ux-pro-max (prioridades 1–10).

## Conceito

**"Sala de controle confiável"** — dark mode nativo (preferência de times de TI/NOC), profundidade
por camadas translúcidas (glass sutil, nunca decorativo), e um sistema semafórico de SLA que é a
assinatura visual do produto. Moderno vem da física das interações (150–300ms, ease-out) e da
tipografia tabular nos números; confiança vem do contraste AA, da consistência e da ausência de ruído.

**Anti-padrões proibidos:** emoji como ícone estrutural (usar SVG/Lucide), glass em tudo (só em
superfícies elevadas: cards de destaque, modais, popovers), animação >400ms, cor como único
indicador de estado, hex cru em componente (sempre token).

## Tokens

### Cores semânticas (tailwind.config)
| Token | Valor | Uso |
|---|---|---|
| `brand.500/600/700` | `#3b82f6 / #2563eb / #1d4ed8` | Ação primária, links, foco |
| `surface.base` | `#0b1220` | Fundo da aplicação |
| `surface.raised` | `#0f172a` (slate-900) | Cards, sidebar, topbar |
| `surface.overlay` | `slate-900/70 + backdrop-blur` | Modais, popovers, painéis elevados |
| `success` | `emerald-500/600` | OK, resolvido, SLA no prazo |
| `warning` | `amber-400/500` | SLA prestes a estourar, pausado |
| `danger` | `red-500/600` | SLA estourado, ações destrutivas |
| `line` | `white/5 a white/10` | Bordas e divisores (substituem slate-700 chapado em superfícies glass) |

### Semáforo SLA (assinatura do produto)
OK = emerald · WARNING = amber · BREACHED = red — sempre com **ícone ou texto junto da cor**
(regra `color-not-only`). Contadores usam `tabular-nums`.

### Tipografia
- Base 16px, `line-height` 1.5; escala 12/14/16/18/24/32.
- Números de SLA, IDs e métricas: classe utilitária `.tnum` (`font-variant-numeric: tabular-nums`).
- Hierarquia por peso: 700 títulos, 500 labels, 400 corpo.

### Espaçamento, raio, sombra
- Grid de 4/8px. Containers `p-6`; gaps `gap-4`/`gap-6`.
- Raio: `rounded-lg` (8px) padrão; `rounded-xl` (12px) para modais e cards hero.
- Elevação (escala única): `shadow-card` (sutil) → `shadow-pop` (modais). Nada de sombras ad-hoc.

### Movimento
- Micro-interações 150–200ms `ease-out`; saída ~70% da entrada.
- Pressed: `active:scale-[0.98]` em botões/cards clicáveis.
- `prefers-reduced-motion`: transições desativadas via CSS global.
- Skeleton shimmer para cargas >300ms (componente `Skeleton` em ui.tsx).

## Componentes (estados obrigatórios)
Todo interativo tem: default, hover, **focus-visible (anel 2px brand)**, active, disabled
(opacity-50 + cursor-not-allowed), loading (spinner, botão desabilitado).
Touch target mínimo 44px de altura em inputs/botões md.

## Acessibilidade (gate de entrega)
Contraste AA (4.5:1 texto, 3:1 UI), foco visível em tudo, `aria-label` em botões só-ícone,
labels visíveis em formulários (nunca só placeholder), erro abaixo do campo com `role="alert"`.

## Regras de página
- Uma única CTA primária por tela (`primary-action`).
- Navegação: item ativo destacado na sidebar (cor + indicador), nunca só cor.
- Tabelas: cabeçalho `text-slate-400 text-xs uppercase`, linhas com hover `bg-white/[0.02]`,
  números à direita com `.tnum`.
- Empty states sempre com ação sugerida; nunca tela em branco.
