# 🛠️ HelpDesk PRO - Guia de Instalação

Instruções completas para instalar, configurar e rodar o HelpDesk PRO em sua máquina.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js 18+**
   - [Baixar do nodejs.org](https://nodejs.org/)
   - Verificar: `node --version` e `npm --version`

2. **PostgreSQL 14+**
   - [Baixar do postgresql.org](https://www.postgresql.org/download/)
   - Ou use Docker: `docker pull postgres:15`

3. **Git**
   - [Baixar do git-scm.com](https://git-scm.com/)

4. **Docker & Docker Compose** (opcional, para PostgreSQL)
   - [Instalar Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## 🚀 Passo 1: Preparar o Ambiente

### 1.1 Instalar dependências Node.js

```bash
cd "E:\Helpdesk PRO"
npm install
```

Isso instalará todas as dependências do projeto (pode levar alguns minutos).

### 1.2 Configurar banco de dados PostgreSQL

#### Opção A: PostgreSQL Local

1. **Criar banco de dados:**
   ```sql
   CREATE DATABASE helpdeskpro;
   CREATE USER helpdeskpro WITH PASSWORD 'helpdeskpro';
   ALTER ROLE helpdeskpro WITH CREATEDB;
   GRANT ALL PRIVILEGES ON DATABASE helpdeskpro TO helpdeskpro;
   ```

2. **Testar conexão:**
   ```bash
   psql -U helpdeskpro -h localhost -d helpdeskpro
   ```

#### Opção B: PostgreSQL com Docker (Recomendado)

```bash
# Na raiz do projeto, há docker-compose.yml
docker-compose up -d db

# Aguarde alguns segundos para o banco ficar pronto
docker-compose ps
```

---

## 🔧 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Criar arquivo `.env` na raiz do projeto

```bash
cp .env.example .env
```

### 2.2 Editar `.env` com suas credenciais

**Arquivo: `.env`**

```env
# Base de Dados
DATABASE_URL="postgresql://helpdeskpro:helpdeskpro@localhost:5432/helpdeskpro"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura-aqui-min-32-caracteres"

# Environment
NODE_ENV="development"
API_PORT=3000

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Importante:** 
- Altere o `JWT_SECRET` com uma chave segura (32+ caracteres aleatórios)
- Ajuste o `DATABASE_URL` conforme sua configuração PostgreSQL

### 2.3 Criar arquivo `.env.local` em `apps/web`

**Arquivo: `apps/web/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🗄️ Passo 3: Sincronizar Banco de Dados

### 3.1 Executar Prisma Push

```bash
npx prisma db push
```

Isso criará todas as tabelas conforme o schema Prisma.

### 3.2 Popular dados de teste

```bash
node prisma/seed-admin.js
```

Isso criará:
- **Admin user:** `admin@helpdesk.local` / `Admin@123456`
- **Test agents:** `agente1@helpdesk.local` e `agente2@helpdesk.local` / `Agent@123456`
- **Support group:** "Suporte Técnico"
- **Ticket types:** Suporte Técnico, Solicitação, Incidente

---

## ▶️ Passo 4: Iniciar o Projeto

### 4.1 Iniciar Backend (API)

Em uma janela do terminal:

```bash
cd "E:\Helpdesk PRO\apps\api"
npm run start:dev
```

Você deve ver:
```
[Nest] XXXXX - ... [NestFactory] Starting Nest application...
[Nest] XXXXX - ... Listening on port 3000
```

### 4.2 Iniciar Frontend (Next.js)

Em outra janela do terminal:

```bash
cd "E:\Helpdesk PRO\apps\web"
npm run dev
```

Você deve ver:
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3001
  - Environments: .env.local
```

---

## 🌐 Passo 5: Acessar a Aplicação

1. **Abra o navegador** e acesse:
   ```
   http://localhost:3001
   ```

2. **Login com credenciais de teste:**
   - Email: `admin@helpdesk.local`
   - Senha: `Admin@123456`

3. **Explore o sistema:**
   - Dashboard com gráficos e SLA
   - Sidebar com 16 módulos diferentes
   - Inventário de ativos
   - Gestão de usuários e grupos
   - Tipos de ticket com SLA

---

## 🔍 Verificação de Status

### Verificar se API está rodando

```bash
curl http://localhost:3000/api/health
```

Deve retornar status 200.

### Verificar conexão com BD

```bash
# No diretório raiz
npx prisma studio

# Abre interface visual do banco em http://localhost:5555
```

---

## 📚 Estrutura do Projeto

```
E:\Helpdesk PRO/
├── apps/
│   ├── api/              # Backend NestJS
│   │   ├── src/modules/  # 20+ módulos (tickets, users, assets, etc)
│   │   ├── .env          # Configuração backend
│   │   └── package.json
│   └── web/              # Frontend Next.js 14
│       ├── app/          # Rotas (dashboard, tickets, assets, etc)
│       ├── components/   # Componentes React
│       ├── lib/          # Utilitários (api.ts, etc)
│       └── .env.local    # Configuração frontend
├── prisma/
│   ├── schema.prisma     # Definição do BD (Customers, Tasks, Users, etc)
│   └── seed-admin.js     # Script de dados iniciais
├── .env.example          # Template de variáveis
├── docker-compose.yml    # PostgreSQL containerizado (opcional)
└── package.json          # Dependências do workspace
```

---

## 🆘 Troubleshooting

### ❌ "Error: connect ECONNREFUSED localhost:5432"

**Problema:** PostgreSQL não está rodando ou credenciais erradas.

**Solução:**
```bash
# Se usando Docker
docker-compose up -d db
docker-compose logs db

# Se usando PostgreSQL local
# Verifique se o serviço está rodando
psql -U helpdeskpro -h localhost -d helpdeskpro
```

### ❌ "EPERM: operation not permitted" no Prisma

**Problema:** Arquivo bloqueado do Prisma client.

**Solução:**
```bash
rm -recurse -force node_modules/.prisma
npm install
npx prisma generate
```

### ❌ "Failed to fetch" ao fazer login

**Problema:** Frontend não consegue atingir API (CORS).

**Solução:**
- Verifique se API está rodando em `http://localhost:3000`
- Verifique `.env.local` em `apps/web`: `NEXT_PUBLIC_API_URL=http://localhost:3000`
- Reinicie ambos os servidores

### ❌ "JWT_SECRET not found"

**Problema:** Variável de ambiente não definida.

**Solução:**
```bash
# Certifique-se que .env existe na raiz
cat .env | grep JWT_SECRET

# Se vazio, adicione:
echo 'JWT_SECRET="seu-secret-superSeguro-min32chars"' >> .env
```

---

## 📦 Scripts Úteis

```bash
# Reinstalar tudo do zero
npm run clean
npm install
npx prisma db push
node prisma/seed-admin.js

# Build para produção
npm run build

# Rodar testes
npm run test

# Ver logs do Docker
docker-compose logs -f

# Parar serviços
docker-compose down
```

---

## 🔐 Configuração de Produção

Para ambiente de produção:

1. **Altere NODE_ENV para "production"**
2. **Use um JWT_SECRET forte** (mínimo 32 caracteres aleatórios)
3. **Configure DATABASE_URL com credentials seguros**
4. **Disable CORS para apenas domínios autorizados**
5. **Use HTTPS/SSL**
6. **Configure variáveis de ambiente no servidor**

Exemplo para produção:
```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:password@prod-db-host:5432/helpdeskpro"
JWT_SECRET="gerar-com-openssl-rand-hex-32-chars-aleatorios"
API_PORT=3000
NEXT_PUBLIC_API_URL="https://seu-dominio.com"
```

---

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ rodando
- [ ] `.env` criado com credenciais corretas
- [ ] `npm install` executado com sucesso
- [ ] `npx prisma db push` completado
- [ ] `node prisma/seed-admin.js` executado
- [ ] Backend iniciado em `http://localhost:3000`
- [ ] Frontend iniciado em `http://localhost:3001`
- [ ] Login funciona com `admin@helpdesk.local` / `Admin@123456`
- [ ] Sidebar com 16 módulos visível
- [ ] Dashboard carregando com gráficos

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do terminal (ambos API e Web)
2. Confirme que PostgreSQL está acessível
3. Limpe cache: `rm -r node_modules .next`
4. Reinstale: `npm install`
5. Recreie BD: `npx prisma db push --force-reset` (cuidado: apaga tudo)

---

**Versão do documento:** 1.0  
**Data:** 2026-05-30  
**HelpDesk PRO v0.1.0-mvp**

Bom desenvolvimento! 🚀
