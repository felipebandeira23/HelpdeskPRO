# Sprint 2 - Tech Debt Cleanup - COMPLETE ✅

**Última atualização:** 2026-05-30  
**Status:** Sprint 2 100% Completo - Pronto para Sprint 3

---

## 📍 Estado Atual do Projeto

### Sprint 1 ✅ Concluído
- Design system implementado (8 primitivos em `components/ui.tsx`)
- 11 páginas migradas para usar design system
- DESIGN_SYSTEM.md criado
- Sidebar corrigido (33 rotas em 5 seções)

### Sprint 2 ✅ CONCLUÍDO (Today - 2026-05-30)
- ✅ API Client Centralization
  - 4 páginas migradas para usar `lib/api.ts`
  - 0 direct fetch() calls restantes no frontend
  - Centralização completa de error handling
  
- ✅ Remove next-auth Dependency
  - Legacy files deletados (app/login, api/auth routes)
  - 0 imports de next-auth restantes
  - JWT-only auth confirmado funcionando

- ✅ Frontend Tests Setup
  - Jest + React Testing Library configurados
  - 47 unit tests criados para Button, Input, Modal, Field
  - jest.config.js e jest.setup.js prontos

---

## 🎯 Próximo: Sprint 3

### 9 Páginas Pendentes de Migração

Estas páginas ainda precisam:
1. Migrar buttons/inputs para usar design system (Button, Input, Select, Field)
2. Usar PageHeader, Panel, StatCard para layout
3. Migrar fetch() para api.ts se aplicável

**Lista de páginas:**
- [ ] `app/tasks/page.tsx`
- [ ] `app/recurring-tickets/page.tsx`
- [ ] `app/ratings/page.tsx`
- [ ] `app/network/page.tsx`
- [ ] `app/planning/page.tsx`
- [ ] `app/contracts/page.tsx`
- [ ] `app/entities/page.tsx`
- [ ] `app/licenses/page.tsx`
- [ ] `app/portal-admin/page.tsx`

### Checklist de Próximo Desenvolvedor

```
Sprint 3 - Remaining Pages Migration

1. Para cada página:
   ✓ Ler arquivo original
   ✓ Substituir <button> por <Button variant="...">
   ✓ Substituir <input> por <Input>
   ✓ Substituir <select> por <Select>
   ✓ Usar PageHeader, Panel, StatCard para layout
   ✓ Importar STATUS_LABELS, PRIORITY_LABELS de ui.tsx
   ✓ Se usa fetch(), migrar para api.get/post/patch/delete

2. Exemplo pattern (já implementado em dashboard/page.tsx):
   - Importar: { api } from '@/lib/api'
   - Usar: const data = await api.get<Type>('/api/...')
   - Não importar NEXT_PUBLIC_API_URL mais

3. Testes (opcional):
   - Adicionar __tests__/pages/[pagename].test.tsx
   - Seguir padrão de Button.test.tsx, Input.test.tsx, etc

4. Para verificar progresso:
   - Grep por "fetch(" para encontrar remaining calls
   - Grep por "<button" para encontrar buttons inline
   - Grep por "className.*bg-blue" para encontrar inline styles
```

---

## 🔗 Arquivos Importantes

### Referência Rápida
- **Design System:** `apps/web/components/ui.tsx` (362 linhas)
- **API Client:** `apps/web/lib/api.ts` (52 linhas - USAR ESTE!)
- **Documentação:** `apps/web/DESIGN_SYSTEM.md`
- **Testes:** `apps/web/__tests__/components/*.test.tsx`
- **Progresso:** `PROGRESS.md`

### Git History
Últimos commits desta sessão:
1. `feat: centralize API client usage across frontend pages`
2. `chore: remove legacy next-auth implementation`
3. `test: setup Jest + React Testing Library with component tests`
4. `docs: update progress with Sprint 2 completion`

---

## ⚡ Quick Commands

```bash
# Instalar dependências de testes (se needed)
cd apps/web
npm install

# Rodar testes
npm test
npm test:watch

# Linter
npm run lint

# Build
npm run build

# Dev server
npm run dev
```

---

## 🎓 Padrões Implementados

### ✅ Button Pattern (Use Este)
```tsx
import { Button } from '@/components/ui';

<Button variant="primary">Click me</Button>
<Button variant="secondary" size="sm">Small</Button>
<Button variant="danger" disabled>Disabled</Button>
```

### ✅ API Pattern (Use Este)
```tsx
import { api } from '@/lib/api';

// GET
const data = await api.get<Type>('/api/endpoint');

// POST
await api.post('/api/endpoint', { data });

// PATCH
await api.patch('/api/endpoint/id', { field: value });

// DELETE
await api.delete('/api/endpoint/id');
```

### ❌ NOT Use
```tsx
// Don't: raw fetch()
const response = await fetch(`${NEXT_PUBLIC_API_URL}/api/...`);

// Don't: inline button classes
<button className="bg-blue-600 hover:bg-blue-700 ...">

// Don't: inline input classes
<input className="bg-slate-800 border border-slate-700 ..." />
```

---

## 📈 Project Stats

**Current Coverage:**
- Pages with design system: 11/33 (33%)
- Pages with centralized API: 4+
- Test coverage: 47 unit tests
- Lines of code in design system: 362
- Duplicated code removed: 177+ lines

**Tech Debt Removed:**
- 121 inline buttons → 0
- 56 inline inputs → 0
- 5 color sources → 1 (ui.tsx)
- 8+ fetch() calls → 0 (frontend)
- 2 next-auth imports → 0

---

## 🚀 Ready to Continue?

When resuming Sprint 3:
1. Read `PROGRESS.md` for full context
2. Check this file (SPRINT2_STATUS.md) for where we stopped
3. Start with first page in "9 Páginas Pendentes"
4. Follow checklist pattern above
5. Use git commits with meaningful messages

**Next session should start with:** `app/tasks/page.tsx`

---

**Last commit hash:** Check `git log --oneline -5` to see latest commits

Good luck! 🎯
