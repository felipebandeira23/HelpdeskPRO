# Chat Module Implementation Progress

**Data**: 2026-06-16  
**Status**: Fase 1 ✅ Concluída

## Visão Geral

Implementação de um módulo de Chat em Tempo Real para HelpdeskPRO, permitindo que usuários finais (via agente desktop) conversem com técnicos de suporte em tempo real, com capacidade de converter a conversa em um chamado (ticket).

## Fase 1 — Fundação ✅ COMPLETA

### Modelos Prisma
- ✅ `ChatConversation` — conversas com status (WAITING, ACTIVE, CLOSED, CONVERTED_TO_TICKET)
- ✅ `ChatMessage` — mensagens com tipo de remetente (USER, TECHNICIAN, SYSTEM)
- ✅ `ChatParticipant` — participantes com roles (REQUESTER, TECHNICIAN)
- ✅ Enums: `ChatStatus`, `ChatSenderType`, `ChatParticipantRole`
- ✅ Migração aplicada ao banco PostgreSQL

### Backend NestJS

#### ChatGateway (`chat.gateway.ts`)
- ✅ WebSocket namespace `/chat`
- ✅ Autenticação JWT no handshake
- ✅ Socket.io rooms por conversa (`conversation:{id}`)
- ✅ Eventos implementados:
  - `chat:join_conversation` — usuário entra em uma conversa
  - `chat:send_message` — envia mensagem (broadcast bidirecional)
  - `chat:typing` — indicador de digitação
  - `chat:leave_conversation` — usuário sai
  - `chat:message_received` — novo tipo de evento (resposta)
  - `chat:user_joined`, `chat:user_left` — notificações de presença
- ✅ Broadcasting para ambos os lados (agente desktop + web)

#### ChatService (`chat.service.ts`)
Implementação real com Prisma ORM:
- ✅ `createConversation(dto, userId)` — cria nova conversa + notifica técnico
- ✅ `sendMessage(conversationId, userId, content)` — envia msg com validações
- ✅ `getConversation(id)` — retorna conversa com histórico e participantes
- ✅ `listConversations(filters)` — lista com paginação e filtros de status
- ✅ `getHistory(conversationId)` — histórico ordenado
- ✅ `convertToTicket(conversationId, dto, userId)` — **converte em chamado com transcript**
- ✅ `updateConversationStatus(conversationId, status)` — muda status + broadcast
- ✅ `closeConversation(conversationId)` — encerra + add msg de sistema
- ✅ `getAvailableTechnicians()` — lista técnicos com carga de trabalho
- ✅ `assignTechnician(conversationId, technicianId)` — reassigna + notifica

#### ChatController (`chat.controller.ts`)
8 endpoints REST JWT-protegidos:
- ✅ `GET /api/chat/conversations` — lista conversas ativas
- ✅ `GET /api/chat/conversations/:id` — detalhe com histórico
- ✅ `GET /api/chat/conversations/:id/history` — histórico de msgs
- ✅ `POST /api/chat/conversations` — cria nova conversa
- ✅ `POST /api/chat/conversations/:id/message` — envia mensagem
- ✅ `POST /api/chat/conversations/:id/close` — encerra conversa
- ✅ `POST /api/chat/conversations/:id/ticket` — **gera ticket a partir do chat**
- ✅ `GET /api/chat/technicians/available` — técnicos disponíveis
- ✅ `POST /api/chat/conversations/:id/assign` — atribui técnico

#### DTOs
- ✅ `CreateChatConversationDto` — requester info + channel
- ✅ `SendChatMessageDto` — conteúdo da mensagem
- ✅ `CreateTicketFromChatDto` — título, prioridade, descrição, assignee

#### ChatModule
- ✅ Registra ChatGateway + ChatService
- ✅ Importa TicketsModule + AutomationModule + JwtModule
- ✅ Exporta ChatService para outros módulos

### Dependências Instaladas
- ✅ `@nestjs/websockets@10`
- ✅ `@nestjs/platform-socket.io@10`
- ✅ `socket.io`

### Status de Build
- ✅ TypeScript: sem erros
- ✅ Prisma Client: gerado
- ✅ Database: sincronizada

---

## Fase 2 — Frontend Web ⏳ PRÓXIMA

### Objetivos
- Reescrever `/chat` page (`apps/web/app/chat/page.tsx`) para usar Socket.io real
- Implementar hook `useChatSocket(conversationId)`
- Conectar ao WebSocket ao montar
- Buscar histórico via REST ao entrar em conversa
- Escutar eventos de mensagens em tempo real
- Mostrar indicador de digitação

### Tarefas
1. [ ] Criar hook `useChatSocket()` em `apps/web/lib/hooks/useChat Socket.ts`
   - Gerenciar conexão Socket.io
   - Emitir eventos
   - Escutar mensagens
   - Reconexão automática
   
2. [ ] Reescrever `/chat/page.tsx`
   - Remover localStorage
   - Chamar API real: `GET /api/chat/conversations`
   - Usar hook `useChatSocket()`
   - Renderizar mensagens do banco
   - Emitir mensagens via Socket.io
   
3. [ ] Badge global de novas conversas
   - Escutar `chat:new_conversation` no socket de presença
   - Mostrar badge no sidebar menu
   
4. [ ] Indicador de digitação
   - Emitir `chat:typing` com delay
   - Exibir "X está digitando..."

---

## Fase 3 — Fluxo Chat → Ticket ⏳ PRÓXIMA

### Objetivos
- Modal "Gerar Ticket" com campos pré-preenchidos
- Integração real com TicketsService
- Feedback visual de sucesso

### Tarefas
1. [ ] Criar componente `ChatTicketModal.tsx`
   - Título sugerido (1ª mensagem)
   - Prioridade (select)
   - Categoria (select)
   - Assignee (select de técnicos)
   - Descrição customizável
   
2. [ ] Endpoint `POST /api/chat/conversations/:id/ticket`
   - ✅ Já implementado no backend
   - Conectar frontend ao endpoint
   
3. [ ] Evento `chat:ticket_created`
   - Emitir do backend ao agente desktop
   - Mostrar confirmação: "Chamado #1042 criado"
   - Arquivo do chat

---

## Fase 4 — Polimento ⏳ FUTURA

### Tarefas
- [ ] Transferência de conversa (reassign técnico)
- [ ] Notificações push para novo chat
- [ ] Marcação de lido/não lido
- [ ] Upload de anexos (placeholder já existe)
- [ ] Presença online/offline
- [ ] Sons de notificação

---

## Contrato de API — Resumo

### WebSocket (`/chat`)

**Eventos que o cliente emite:**
```typescript
// Entrar em conversa
client.emit('chat:join_conversation', { conversationId: string })

// Enviar mensagem
client.emit('chat:send_message', { conversationId, content })

// Indicador de digitação
client.emit('chat:typing', { conversationId, isTyping: boolean })

// Sair de conversa
client.emit('chat:leave_conversation', { conversationId })
```

**Eventos que o servidor envia (broadcast):**
```typescript
// Nova mensagem (todos na room)
server.emit('chat:message_received', { id, conversationId, content, senderName, senderType, createdAt })

// Usuário digitando (todos na room)
server.emit('chat:user_typing', { userId, conversationId, isTyping })

// Usuário entrou (todos na room)
server.emit('chat:user_joined', { userId, conversationId })

// Usuário saiu (todos na room)
server.emit('chat:user_left', { userId, conversationId })

// Nova conversa (apenas o técnico)
server.to(socketId).emit('chat:new_conversation', { id, requesterName, createdAt })

// Status mudou
server.to(room).emit('chat:conversation_active', { conversationId })
server.to(room).emit('chat:conversation_closed', { conversationId })
server.to(room).emit('chat:conversation_converted_to_ticket', { conversationId, ticketId, ticketNumber })
```

### REST API

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| GET | `/api/chat/conversations` | JWT | Lista conversas |
| POST | `/api/chat/conversations` | JWT | Cria nova conversa |
| GET | `/api/chat/conversations/:id` | JWT | Detalhe com histórico |
| GET | `/api/chat/conversations/:id/history` | JWT | Apenas mensagens |
| POST | `/api/chat/conversations/:id/message` | JWT | Envia mensagem |
| POST | `/api/chat/conversations/:id/close` | JWT | Encerra conversa |
| POST | `/api/chat/conversations/:id/ticket` | JWT | Gera ticket |
| GET | `/api/chat/technicians/available` | JWT | Técnicos disponíveis |
| POST | `/api/chat/conversations/:id/assign` | JWT | Atribui técnico |

---

## Arquivos Modificados/Criados

### Criados
- ✅ `apps/api/src/modules/chat/chat.gateway.ts` (195 linhas)
- ✅ `apps/api/src/modules/chat/dto/create-chat-conversation.dto.ts`
- ✅ `apps/api/src/modules/chat/dto/send-chat-message.dto.ts`
- ✅ `apps/api/src/modules/chat/dto/create-ticket-from-chat.dto.ts`

### Modificados
- ✅ `apps/api/src/modules/chat/chat.service.ts` — substituído por implementação real
- ✅ `apps/api/src/modules/chat/chat.controller.ts` — endpoints REST reais
- ✅ `apps/api/src/modules/chat/chat.module.ts` — registra gateway + dependências
- ✅ `prisma/schema.prisma` — adicionados 3 modelos + 3 enums

### Dependências Adicionadas
- `@nestjs/websockets@10`
- `@nestjs/platform-socket.io@10`
- `socket.io`

---

## Notas Técnicas

### Autenticação
- Chat usa JWT existente (mesmo que /auth/login)
- Token validado no handshake do Socket.io
- Usuário extraído de `req.user.id` ou `req.user.sub`

### Database
- IDs: `cuid()` (não UUID)
- Timestamps: automáticos (createdAt, updatedAt)
- Relações: FK com onDelete: Cascade/SetNull
- Índices: em status, createdAt, conversationId, userId

### Transcrição Chat → Ticket
- Formato: `[HH:MM] Senderame: mensagem`
- Inserido no campo `description` do ticket
- Mensagens de sistema incluídas

### Notificações (próximas)
- Via `NotificationService` (já existente)
- Tipo: `TICKET_ASSIGNED` (reutilizar)
- Link aponta para `/tickets/:id` ou `/chat/:id`

---

## Como Testar Fase 1

### Backend (com Postman/cURL)

```bash
# 1. Criar conversa
POST http://localhost:3000/api/chat/conversations
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "requesterId": "user-id-aqui",
  "requesterName": "João Silva",
  "requesterEmail": "joao@example.com",
  "channel": "DESKTOP_AGENT"
}

# Resposta: { id: "conv-123", status: "WAITING", ... }

# 2. Listar conversas
GET http://localhost:3000/api/chat/conversations
Authorization: Bearer <JWT>

# 3. Enviar mensagem (REST)
POST http://localhost:3000/api/chat/conversations/conv-123/message
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "content": "Olá, preciso de ajuda com meu email"
}

# 4. Gerar ticket
POST http://localhost:3000/api/chat/conversations/conv-123/ticket
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "title": "Problema com email",
  "priority": "MEDIUM",
  "categoryId": "cat-id-aqui"
}

# Resposta: { ticket: { id, ticketNumber: 1042, ... }, conversation: { ... } }
```

### WebSocket (com wscat ou Socket.io client)

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'seu-jwt-aqui'
  }
});

socket.on('connect', () => {
  console.log('✅ Conectado ao WebSocket');
  
  // Entrar em conversa
  socket.emit('chat:join_conversation', { conversationId: 'conv-123' });
  
  // Enviar mensagem
  socket.emit('chat:send_message', { 
    conversationId: 'conv-123', 
    content: 'Olá!' 
  });
  
  // Escutar mensagens
  socket.on('chat:message_received', (msg) => {
    console.log(`${msg.senderName}: ${msg.content}`);
  });
});
```

---

## Próximos Passos Imediatos

1. ✅ Commitar Fase 1 no Git
2. ✅ Criar PR no GitHub
3. Iniciar Fase 2 — Frontend
   - Criar hook `useChatSocket`
   - Reescrever `/chat/page.tsx`
   - Testar com agente desktop (quando pronto)
