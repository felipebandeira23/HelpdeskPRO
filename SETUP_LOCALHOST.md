# HelpDesk Pro v1.0 — Setup Completo em Localhost

## 📋 Pré-requisitos

- **Node.js** v20+ (verif: `node --version`)
- **npm** v10+ (verif: `npm --version`)
- **Docker Desktop** instalado e rodando
- **WSL 2** com Docker Desktop integrado (recomendado para Windows)

## 🚀 Instruções Passo-a-Passo

### 1️⃣ Abra WSL Ubuntu

```bash
# No PowerShell ou CMD:
wsl

# Você está agora no WSL
cd /mnt/c/Users/felip/OneDrive/Documentos/HelpDesk\ Pro
```

### 2️⃣ Instale Dependências

```bash
npm install
```

### 3️⃣ Inicie o Banco de Dados (PostgreSQL)

```bash
# Terminal 1 - Deixe rodando
docker-compose up db

# Aguarde até ver:
# database system is ready to accept connections
```

### 4️⃣ Rode as Migrações do Prisma

```bash
# Terminal 2 (novo)
cd /mnt/c/Users/felip/OneDrive/Documentos/HelpDesk\ Pro

# Sincronize schema com banco
npx prisma db push

# Gere dados de teste
npm run db:seed
```

### 5️⃣ Inicie o Backend

```bash
# Terminal 3 (novo)
cd /mnt/c/Users/felip/OneDrive/Documentos/HelpDesk\ Pro/apps/api

# Modo desenvolvimento (com hot-reload)
npm run start:dev

# Ou modo produção
npm run start

# Aguarde:
# [NestFactory] Nest application successfully started
```

**Backend rodando em:** http://localhost:3000

### 6️⃣ Inicie o Frontend

```bash
# Terminal 4 (novo)
cd /mnt/c/Users/felip/OneDrive/Documentos/HelpDesk\ Pro/apps/web

npm run dev

# Aguarde:
# ▲ Next.js 14.2.35 ready
```

**Frontend rodando em:** http://localhost:3001

---

## 🔐 Credenciais Padrão para Login

Vá para: http://localhost:3001/auth/login

### Admin
- **Email:** admin@helpdesk.local
- **Senha:** Admin@123456

### Support
- **Email:** support@helpdesk.local  
- **Senha:** Support@123456

### User
- **Email:** user@helpdesk.local
- **Senha:** User@123456

---

## 📡 Testando Endpoints da API

```bash
# Login (get token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@helpdesk.local",
    "password": "Admin@123456"
  }'

# Guardar o token retornado e usar em:

# Get dashboard metrics
curl http://localhost:3000/api/dashboard/metrics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# List tickets
curl http://localhost:3000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get network status
curl http://localhost:3000/api/network/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ Checklist de Verificação

- [ ] Terminal 1: Docker rodando (PostgreSQL online)
- [ ] Terminal 2: Migrações executadas (`npx prisma db push`)
- [ ] Terminal 2: Seed rodado (`npm run db:seed`)
- [ ] Terminal 3: Backend iniciado (porta 3000 respondendo)
- [ ] Terminal 4: Frontend iniciado (porta 3001 respondendo)
- [ ] Consegue fazer login em http://localhost:3001
- [ ] Pode ver Dashboard
- [ ] Pode listar Tickets

---

## 🛠️ Troubleshooting

### Porta 3000 já em uso
```bash
# WSL: Matar processo na porta 3000
lsof -i :3000
kill -9 <PID>

# Windows: via PowerShell
Get-Process -Name node
Stop-Process -Name node -Force
```

### PostgreSQL não conecta
```bash
# Verificar se container está rodando
docker ps

# Ver logs do banco
docker logs helpdesk_pro-db-1

# Resetar banco (⚠️ apaga dados!)
docker-compose down -v
docker-compose up -d db
```

### Prisma migration error
```bash
# Reset schema (⚠️ apaga dados!)
npx prisma migrate reset

# Reapply migrations
npx prisma db push
```

### Node modules corrompido
```bash
rm -rf node_modules package-lock.json
npm install
npm rebuild
```

---

## 📊 Estrutura do Projeto

```
HelpDesk Pro/
├── apps/
│   ├── api/          # Backend NestJS (porta 3000)
│   └── web/          # Frontend Next.js (porta 3001)
├── prisma/
│   ├── schema.prisma # Database schema
│   └── migrations/   # Migrações SQL
├── docker-compose.yml
└── package.json
```

---

## 🎯 Próximos Passos

1. Explore o Dashboard: http://localhost:3001/dashboard
2. Crie um ticket: http://localhost:3001/tickets (botão novo)
3. Teste Kanban/Cards/List views
4. Configure LDAP (opcional)
5. Teste WhatsApp integration (opcional)

---

**Projeto Status:** ✅ v1.0 COMPLETO

Todos os 21 módulos estão implementados e funcionais!
