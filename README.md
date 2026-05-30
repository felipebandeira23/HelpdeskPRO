# HelpdeskPRO - Sistema de Gestão de Chamados e Ativos de TI

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4)](https://tailwindcss.com/)

**Última atualização:** 2026-05-30  
**Design System Progress:** 33% (11/33 páginas) ✅

---

## 📖 Índice

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Roadmap](#roadmap)

---

## ✨ Features

### Sistema de Chamados
- ✅ Criação, atualização e resolução de tickets
- ✅ Priorização (Baixa, Média, Alta, Urgente)
- ✅ Status tracking (Aberto, Em Andamento, Aguardando, Pausado, Fechado)
- ✅ Atribuição a técnicos
- ✅ SLA management com alertas
- ✅ Histórico completo de mudanças

### Gestão de Ativos
- ✅ Inventário de dispositivos (PCs, servidores, impressoras)
- ✅ Status de agente (Online/Offline)
- ✅ Integração com monitoramento
- ✅ Relacionamento com tickets

### Operações
- ✅ Dashboard com métricas em tempo real
- ✅ Relatórios de atendimento e SLA
- ✅ Automações de regras de negócio
- ✅ Chat com clientes (WhatsApp, Telegram, Widget)
- ✅ Modo TV para NOC

### Configurações
- ✅ Gestão de usuários (Admin, Técnico, Visualizador)
- ✅ Autenticação com 2FA
- ✅ Integração LDAP/Active Directory
- ✅ Customização de SLA e calendário
- ✅ White-label do portal do cliente

---

## 🛠️ Tech Stack

### Frontend
```
Next.js 14          - React framework
TypeScript 5        - Type safety
Tailwind CSS 3      - Styling (dark mode)
React Query/SWR     - Data fetching
Zustand/Context     - State management
Jest + RTL          - Testing
```

### Backend
```
NestJS 10           - Node framework
TypeScript          - Type safety
Prisma ORM          - Database
PostgreSQL/SQLite   - Database (dev: SQLite)
JWT                 - Authentication
```

### DevOps
```
Docker              - Containerization
GitHub Actions      - CI/CD
```

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
npm 9+
```

### Installation
```bash
# Clone repository
git clone https://github.com/seu-repo/helpdesk-pro.git
cd Helpdesk\ PRO

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Initialize database
npm run db:init

# Run development server
npm run dev
```

### Access Application
```
Frontend:  http://localhost:3000
API:       http://localhost:3001
```

---

## 📁 Project Structure

```
Helpdesk PRO/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── app/                  # Route pages
│   │   ├── components/           # React components
│   │   │   ├── ui.tsx            # 🎨 Design system primitives
│   │   │   ├── Sidebar.tsx       # Navigation menu
│   │   │   ├── CreateTicketModal.tsx
│   │   │   └── TicketMetadata.tsx
│   │   ├── lib/
│   │   │   ├── api.ts            # API client
│   │   │   └── auth.ts           # Auth utilities
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── theme.css
│   │   └── DESIGN_SYSTEM.md      # 📚 Component guide
│   │
│   └── api/                      # NestJS backend
│       ├── src/
│       │   ├── modules/          # Feature modules
│       │   ├── common/           # Guards, pipes, filters
│       │   └── main.ts
│       └── prisma/               # Database schema
│
├── prisma/
│   └── schema.prisma             # Database models
│
├── PROGRESS.md                   # 📊 Implementation status
└── README.md                     # This file
```

---

## 🎨 Design System

### Quick Reference
```tsx
import { 
  Button, Input, Select, Field, Label,
  Modal, PageHeader, Panel,
  Spinner, EmptyState, ErrorBanner, StatCard,
  StatusBadge, PriorityBadge,
  STATUS_LABELS, PRIORITY_LABELS
} from '@/components/ui';

// Button example
<Button variant="primary" size="md" loading={saving}>
  Save Changes
</Button>

// Form example
<Field label="Email" required>
  <Input type="email" placeholder="user@company.com" />
</Field>

// Badge example
<StatusBadge status="OPEN" />
<PriorityBadge priority="URGENT" />
```

**Complete Guide:** See `apps/web/DESIGN_SYSTEM.md`

### Migrated Pages (11/33 = 33%) ✅
- ✅ dashboard
- ✅ automation
- ✅ billing
- ✅ chat
- ✅ reports
- ✅ settings/security
- ✅ settings/sla
- ✅ settings/portal
- ✅ settings/users
- ✅ assets
- ✅ CreateTicketModal

### Pages Pending Migration (9/33)
- ⏳ tasks
- ⏳ recurring-tickets
- ⏳ ratings
- ⏳ network
- ⏳ planning
- ⏳ contracts
- ⏳ entities
- ⏳ licenses
- ⏳ portal-admin

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
```bash
# Header
Authorization: Bearer <JWT_TOKEN>

# Get token
POST /auth/login
{
  "email": "user@company.com",
  "password": "password"
}
```

### Endpoints (Main)

#### Tickets
```
GET    /tickets              # List all tickets
POST   /tickets              # Create ticket
GET    /tickets/:id          # Get ticket details
PATCH  /tickets/:id          # Update ticket
DELETE /tickets/:id          # Delete ticket
GET    /tickets/:id/timeline # Get activity history
```

#### Assets
```
GET    /assets               # List devices
POST   /assets               # Add device
GET    /assets/:id           # Get device details
PATCH  /assets/:id           # Update device
DELETE /assets/:id           # Remove device
```

#### Users
```
GET    /users                # List users
POST   /users                # Create user
GET    /users/:id            # Get user details
PATCH  /users/:id            # Update user
DELETE /users/:id            # Delete user
```

#### Reports
```
GET    /dashboard/metrics    # Dashboard stats
GET    /dashboard/sla/breached    # Breached SLAs
GET    /dashboard/sla/warning     # Warning SLAs
```

**Full API Spec:** Documentação Swagger (em desenvolvimento)

---

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
cd apps/web
npm run test

# API tests
cd apps/api
npm run test

# Coverage
npm run test:cov
```

### Setup (To Do)
- [ ] Jest configuration
- [ ] React Testing Library setup
- [ ] Component tests (Button, Input, Modal)
- [ ] API integration tests
- [ ] E2E tests (Cypress/Playwright)

---

## 📊 Current Status

### Completed (Sprint 1)
- ✅ Design system (8 primitives)
- ✅ Form components (Button, Input, Select, Field, Modal)
- ✅ Layout components (PageHeader, Panel, Spinner, EmptyState)
- ✅ Badge components (StatusBadge, PriorityBadge)
- ✅ API client base (lib/api.ts)
- ✅ Menu sidebar (33 routes, 5 sections)
- ✅ 11 pages migrated to design system
- ✅ DESIGN_SYSTEM.md documentation

### In Progress (Sprint 2 - Tech Debt)
- ⏳ Notion documentation update
- ⏳ API client centralization (8+ pages)
- ⏳ Remove next-auth dependency
- ⏳ Frontend tests setup

### Planned (Sprint 3-4)
- ⏳ Remaining 9 pages migration
- ⏳ Theme toggle (dark mode)
- ⏳ Search/filters in all pages
- ⏳ Performance optimization
- ⏳ Full test coverage

---

## 🔧 Development

### Code Style
```
- TypeScript with strict mode
- ESLint + Prettier
- Tailwind CSS utilities
- Component composition pattern
```

### Commit Convention
```
feat: new feature
fix: bug fix
refactor: code refactoring
docs: documentation
test: tests
chore: dependencies, config
```

### Pre-commit Hooks
- TypeScript check
- ESLint validation
- Prettier formatting
- No secrets detection

---

## 🚀 Roadmap

### Phase 1: Design System (May 2026) ✅
- [x] Audit & design tokens
- [x] Core primitives
- [x] 11 pages migrated
- [x] Documentation

### Phase 2: Tech Debt (May 2026) ⏳
- [ ] Notion docs update
- [ ] API client centralization
- [ ] Tests setup
- [ ] Remove unused deps

### Phase 3: Feature Completion (June 2026)
- [ ] Remaining 9 pages
- [ ] Theme toggle
- [ ] Advanced search
- [ ] Performance

### Phase 4: Stability (June-July 2026)
- [ ] Full test coverage
- [ ] CI/CD pipeline
- [ ] Load testing
- [ ] Security audit

---

## 📝 Contributing

### Setup Development Environment
```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

### Creating a New Page
1. Create file in `apps/web/app/[feature]/page.tsx`
2. Import components from `@/components/ui`
3. Follow design system pattern (see DESIGN_SYSTEM.md)
4. Use `api.get/post/patch/delete` from `lib/api.ts`
5. Add tests in `apps/web/__tests__/app/[feature]/`

### Component Development
1. Add to `apps/web/components/ui.tsx`
2. Export from same file
3. Document in DESIGN_SYSTEM.md
4. Add tests: `apps/web/__tests__/components/[Component].test.tsx`
5. Use in pages with consistent variants

---

## 📞 Support

### Issues & Bugs
```bash
# GitHub Issues
https://github.com/seu-repo/issues
```

### Documentation
- Design System: `apps/web/DESIGN_SYSTEM.md`
- Progress Tracking: `PROGRESS.md`
- API Reference: `apps/api/README.md` (to do)

### Team Contact
- Backend Lead: API team
- Frontend Lead: UI team
- DevOps: Infrastructure team

---

## 📄 License

[Inserir licença do projeto]

---

## 🙌 Acknowledgments

- Next.js team for the framework
- Tailwind CSS for utilities
- Prisma for ORM
- NestJS for backend

---

**Status:** Active Development 🚀  
**Last Updated:** 2026-05-30  
**Next Review:** 2026-06-06
