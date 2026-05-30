# Sprint 3 - Detailed Migration Guide

**Objetivo:** Migrar 9 páginas restantes para usar design system + API centralizado

---

## 📋 9 Páginas que Faltam Modificar

| # | Página | Status | Tipos de Changes |
|---|--------|--------|------------------|
| 1 | `app/tasks/page.tsx` | ⏳ Pending | Button, Input, Select, API |
| 2 | `app/recurring-tickets/page.tsx` | ⏳ Pending | Button, Modal, API |
| 3 | `app/ratings/page.tsx` | ⏳ Pending | Button, Modal, RatingModal |
| 4 | `app/network/page.tsx` | ⏳ Pending | Button, Input, Select |
| 5 | `app/planning/page.tsx` | ⏳ Pending | Button, Input, Select |
| 6 | `app/contracts/page.tsx` | ⏳ Pending | Button, Input, Select |
| 7 | `app/entities/page.tsx` | ⏳ Pending | Button, Input, Select |
| 8 | `app/licenses/page.tsx` | ⏳ Pending | Button, Input, Select |
| 9 | `app/portal-admin/page.tsx` | ⏳ Pending | Button, Input, Select |

---

## 🔄 Padrões de Modificação

### Pattern 1: BUTTON Replacement

**❌ ANTES (NÃO FAZER MAIS):**
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
  Criar
</button>

<button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs">
  Cancelar
</button>

<button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5">
  Deletar
</button>
```

**✅ DEPOIS (NOVO PADRÃO):**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary">Criar</Button>

<Button variant="secondary" size="sm">Cancelar</Button>

<Button variant="danger" size="lg">Deletar</Button>
```

**Mapeamento de Variantes:**
```
bg-blue-600         → variant="primary"
bg-slate-800        → variant="secondary"
bg-emerald-600      → variant="success"
bg-red-600          → variant="danger"
bg-transparent      → variant="ghost"
```

**Mapeamento de Tamanhos:**
```
text-xs px-3 py-1.5   → size="sm"
text-sm px-4 py-2     → size="md" (padrão)
text-base px-5 py-2.5 → size="lg"
```

---

### Pattern 2: INPUT Replacement

**❌ ANTES:**
```tsx
<input 
  type="text" 
  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100"
  placeholder="Buscar..."
/>

<input 
  type="email"
  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
  disabled
/>
```

**✅ DEPOIS:**
```tsx
import { Input } from '@/components/ui';

<Input type="text" placeholder="Buscar..." />

<Input type="email" disabled />
```

**Tipos suportados:**
```
type="text"
type="email"
type="password"
type="number"
type="date"
(qualquer tipo HTML5)
```

---

### Pattern 3: SELECT Replacement

**❌ ANTES:**
```tsx
<select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 cursor-pointer">
  <option value="low">Baixa</option>
  <option value="medium">Média</option>
  <option value="high">Alta</option>
</select>
```

**✅ DEPOIS:**
```tsx
import { Select } from '@/components/ui';

<Select>
  <option value="low">Baixa</option>
  <option value="medium">Média</option>
  <option value="high">Alta</option>
</Select>
```

---

### Pattern 4: FIELD (Label + Input) Wrapper

**❌ ANTES:**
```tsx
<div>
  <label className="block text-sm font-medium text-slate-300 mb-2">
    Email <span className="text-red-400">*</span>
  </label>
  <input type="email" required />
</div>

<div>
  <label className="block text-sm font-medium text-slate-300 mb-2">
    Senha (opcional)
  </label>
  <input type="password" />
</div>
```

**✅ DEPOIS:**
```tsx
import { Field, Input } from '@/components/ui';

<Field label="Email" required>
  <Input type="email" required />
</Field>

<Field label="Senha (opcional)">
  <Input type="password" />
</Field>
```

---

### Pattern 5: PAGE LAYOUT

**❌ ANTES:**
```tsx
export default function Page() {
  return (
    <div className="p-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Título</h1>
        <p className="text-slate-400">Subtítulo</p>
      </div>
      <button>Nova Ação</button>
    </div>
  );
}
```

**✅ DEPOIS:**
```tsx
import { PageHeader, Panel, Button } from '@/components/ui';

export default function Page() {
  return (
    <div className="p-8">
      <PageHeader 
        title="Título"
        subtitle="Subtítulo"
        action={<Button>Nova Ação</Button>}
      />
      <Panel>
        {/* Conteúdo aqui */}
      </Panel>
    </div>
  );
}
```

---

### Pattern 6: API Calls (fetch → api.ts)

**❌ ANTES:**
```tsx
const loadData = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Erro ao carregar');
  }
  
  const data = await response.json();
  return data;
};

// Para create
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify(formData),
  }
);
```

**✅ DEPOIS:**
```tsx
import { api } from '@/lib/api';

// GET
const loadData = async () => {
  const data = await api.get<Task[]>('/api/tasks');
  return data;
};

// POST
const createTask = async (formData: any) => {
  await api.post('/api/tasks', formData);
};

// PATCH (atualizar)
const updateTask = async (id: string, updates: any) => {
  await api.patch(`/api/tasks/${id}`, updates);
};

// DELETE
const deleteTask = async (id: string) => {
  await api.delete(`/api/tasks/${id}`);
};
```

---

## 🎯 Passo a Passo de Migração (Exemplo Completo)

Vamos usar `app/tasks/page.tsx` como exemplo:

### Step 1: Adicione Imports no Topo

**Localize:**
```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
```

**Adicione:**
```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';  // ← ADICIONE ISTO
import {
  PageHeader,
  Panel,
  Button,
  Input,
  Select,
  Field,
  Modal,
  Spinner,
  EmptyState,
  ErrorBanner,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from '@/components/ui';  // ← ADICIONE ISTO
```

### Step 2: Procure por `fetch()` e Substitua

**Encontre:**
```tsx
const loadTasks = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  );
  
  if (response.ok) {
    const data = await response.json();
    setTasks(data.data || []);
  }
};
```

**Substitua por:**
```tsx
const loadTasks = async () => {
  try {
    const data = await api.get<any>('/api/tasks');
    setTasks(Array.isArray(data) ? data : data.data || []);
  } catch (error) {
    console.error('Erro ao carregar tasks:', error);
  }
};
```

### Step 3: Procure por `<button>` e Substitua

**Encontre:**
```tsx
<button
  onClick={() => setShowCreateModal(true)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
>
  + Novo Task
</button>
```

**Substitua por:**
```tsx
<Button onClick={() => setShowCreateModal(true)} variant="primary">
  + Novo Task
</Button>
```

### Step 4: Procure por `<input>` e Substitua

**Encontre:**
```tsx
<input
  type="text"
  placeholder="Buscar tasks..."
  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

**Substitua por:**
```tsx
<Input
  type="text"
  placeholder="Buscar tasks..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

### Step 5: Procure por `<select>` e Substitua

**Encontre:**
```tsx
<select 
  value={priority}
  onChange={(e) => setPriority(e.target.value)}
  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
>
  <option value="LOW">Baixa</option>
  <option value="MEDIUM">Média</option>
  <option value="HIGH">Alta</option>
</select>
```

**Substitua por:**
```tsx
<Select 
  value={priority}
  onChange={(e) => setPriority(e.target.value)}
>
  <option value="LOW">Baixa</option>
  <option value="MEDIUM">Média</option>
  <option value="HIGH">Alta</option>
</Select>
```

### Step 6: Procure por Header/Layout e Substitua

**Encontre:**
```tsx
<div className="p-8">
  <div className="flex items-center justify-between mb-8">
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
      <p className="text-slate-400">Gerencie suas tarefas</p>
    </div>
    <Button>+ Novo Task</Button>
  </div>
  
  <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
    {/* conteúdo */}
  </div>
</div>
```

**Substitua por:**
```tsx
<div className="p-8">
  <PageHeader 
    title="Tasks"
    subtitle="Gerencie suas tarefas"
    action={<Button>+ Novo Task</Button>}
  />
  
  <Panel>
    {/* conteúdo */}
  </Panel>
</div>
```

---

## 🔍 Checklist de Migração

Para cada página, copie e marque:

```markdown
### [ ] app/tasks/page.tsx

- [ ] Adicionar imports (api, componentes)
- [ ] Substituir fetch() por api.get/post/patch/delete
- [ ] Substituir <button> por <Button>
- [ ] Substituir <input> por <Input>
- [ ] Substituir <select> por <Select>
- [ ] Substituir header/layout por PageHeader + Panel
- [ ] Se tem erro handling, adicionar ErrorBanner
- [ ] Se está carregando, adicionar Spinner
- [ ] Se lista vazia, adicionar EmptyState
- [ ] Importar STATUS_LABELS/PRIORITY_LABELS se needed
- [ ] Testar no browser (npm run dev)
- [ ] Verificar se não há console errors
- [ ] Git commit com mensagem clara
```

---

## ✅ Exemplo Completo Pronto

Veja estas páginas como REFERÊNCIA (já estão migradas):

**Ótimas referências:**
- `app/dashboard/page.tsx` - Layout com cards + gráficos
- `app/assets/page.tsx` - Tabela com filtros + API calls
- `app/settings/users/page.tsx` - CRUD modal com forms
- `components/CreateTicketModal.tsx` - Modal + form fields

Copie os padrões delas!

---

## 🚀 Ordem Recomendada

Comece por estas (mais simples):
1. `app/network/page.tsx` - Buttons + Inputs simples
2. `app/planning/page.tsx` - Buttons + Inputs + Selects
3. `app/contracts/page.tsx` - Table + Buttons
4. `app/entities/page.tsx` - Simple form
5. `app/licenses/page.tsx` - Simple list

Depois estas (mais complexas):
6. `app/tasks/page.tsx` - Modals + API
7. `app/recurring-tickets/page.tsx` - Modal + Modal
8. `app/ratings/page.tsx` - RatingModal custom
9. `app/portal-admin/page.tsx` - Admin panel

---

## 🛠️ Quick Search Commands

Para encontrar coisas que precisam mudar:

```bash
cd apps/web

# Encontrar buttons inline
grep -r "className.*bg-blue-600" app/ components/ --include="*.tsx"

# Encontrar inputs inline
grep -r "type=\"text\"" app/ components/ --include="*.tsx"

# Encontrar fetch() calls
grep -r "fetch(" app/ components/ --include="*.tsx"

# Encontrar selects inline
grep -r "<select" app/ components/ --include="*.tsx"
```

---

## 📝 Commit Message Template

Quando terminar cada página:

```
feat: migrate [page-name] to design system

- Replace inline buttons with Button component
- Replace inline inputs with Input component
- Replace inline selects with Select component
- Migrate fetch() calls to api.ts
- Update layout with PageHeader + Panel
- Add proper error handling with ErrorBanner
- Add loading state with Spinner
- Add empty state with EmptyState

Pages completed: X/9

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

---

## 🎓 Pro Tips

1. **Use Find & Replace** em VSCode:
   - Ctrl+H abre Find & Replace
   - Use regex para substituições em massa
   - Exemplo: `<button className="bg-blue.*?"` → `<Button variant="primary"`

2. **Test After Each Page:**
   - `npm run dev` e verifica se não há erros
   - Clica nos botões/inputs para testar
   - Verifica console do browser (F12)

3. **Se algo quebrar:**
   - Veja a página correspondente que já foi migrada
   - Compare o código antigo vs novo
   - Procure por typos (variant vs variant)

4. **Type Safety:**
   - Se usa TypeScript, adicione tipos: `api.get<TaskType[]>(...)`
   - Componentes já têm tipos corretos em `components/ui.tsx`

---

## 🎯 Final Checklist

Quando terminar todas as 9 páginas:

- [ ] 0 inline buttons (`<button className="bg-...">`)
- [ ] 0 inline inputs (`<input className="...">`)
- [ ] 0 direct fetch() calls no frontend
- [ ] Todas 33 páginas têm design system
- [ ] PROGRESS.md atualizado
- [ ] Todos commits feitos
- [ ] Tests passam: `npm test`
- [ ] Build sem erros: `npm run build`

---

**Ready?** Start with `app/network/page.tsx` - é a mais simples! 🚀
