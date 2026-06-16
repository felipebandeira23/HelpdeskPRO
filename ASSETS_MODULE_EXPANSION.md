# Expansão do Módulo de Ativos — Todos os Tipos de Dispositivos de TI

## 📋 Resumo das Mudanças

O módulo de ativos foi completamente expandido para suportar **todos os tipos de dispositivos de TI**, não apenas computadores. Agora você pode cadastrar e gerenciar:

- 💻 **Computadores** (Desktop/Laptop/Servidor)
- 🖨️ **Impressoras** (com toner, contagem de páginas)
- 🖥️ **Monitores** (resolução, tamanho, conexão)
- 🔀 **Switches** (portas, VLANs, gerenciável)
- 📡 **Roteadores** (WAN, WiFi, segurança)
- ☎️ **Telefones** (número, operadora, IMEI)
- 📱 **Tablets** (SO, armazenamento, navegador)
- 🔌 **Outros** (genérico para tipos não listados)

## 🎯 Tipos de Dispositivos Suportados

### 1. **COMPUTER** (Computador/Desktop)
```
- Hostname, IP, Fabricante, Modelo
- Serial, UUID, SO
- Componentes (CPU, RAM, GPU, etc)
- Softwares instalados
- Volumes/Partições
- Portas de rede
- Telemetria (CPU, RAM, Disco, Rede)
- Agente monitoramento
```

### 2. **LAPTOP** (Notebook)
```
- Hostname, IP, Fabricante, Modelo
- Serial, SO
- Bateria, Processador
- Telemetria, Manutenção
```

### 3. **SERVER** (Servidor)
```
- Hostname, IP, Fabricante, Modelo
- SO (Linux/Windows), Versão
- Redundância, Backup
- Telemetria completa
- Agente monitoramento crítico
```

### 4. **PRINTER** (Impressora)
```
- IP, Fabricante, Modelo
- Contagem de páginas
- Cartucho / Toner (%)
- Papel em estoque
- Manutenção programada
```

### 5. **MONITOR** (Monitor)
```
- Fabricante, Modelo
- Resolução (ex: 1920x1080)
- Tamanho da tela (polegadas)
- Tipo de conexão (HDMI, DisplayPort, VGA)
```

### 6. **SWITCH** (Switch)
```
- IP, Fabricante, Modelo
- Número de portas
- Gerenciável (managed/unmanaged)
- VLANs suportadas
- Firmware versão
```

### 7. **ROUTER** (Roteador)
```
- IP, Fabricante, Modelo
- Velocidade WAN (Mbps)
- Padrão wireless (WiFi 6, WiFi 7)
- Número de portas
- Segurança (WPA3)
```

### 8. **PHONE** (Telefone)
```
- Número de telefone
- Operadora (Vivo, Claro, Oi, TIM)
- IMEI / Serial
- SO (iOS/Android)
- Plano contratado
```

### 9. **TABLET** (Tablet)
```
- Fabricante, Modelo
- SO (iOS/Android)
- Versão SO
- Armazenamento (GB)
- Versão navegador
```

### 10. **OTHER** (Outro)
```
- Genérico para dispositivos não categorizados
```

## 🔄 Status de Ativos

Todos os ativos agora têm um status que indica seu ciclo de vida:

| Status | Emoji | Significado |
|--------|-------|-------------|
| IN_USE | ✓ | Dispositivo em operação |
| AVAILABLE | ◉ | Disponível para alocação |
| MAINTENANCE | ⚙️ | Em manutenção/reparação |
| RETIRED | ✕ | Descartado/Aposentado |
| STOLEN | ⚠️ | Furtado ou roubado |
| LENT | → | Emprestado a terceiros |

## 🎨 Frontend — Mudanças na Listagem

### Página `/assets/`

**Nova tabela com colunas:**
```
┌─────┬──────────┬──────┬──────────────┬─────────┬────────┬──────────┐
│Tipo │Hostname  │IP    │Fab./Modelo   │Status   │Agente  │Ações    │
├─────┼──────────┼──────┼──────────────┼─────────┼────────┼──────────┤
│💻   │desktop-1 │192...|Dell OptiPlex │✓ Em uso │Online  │Ed. Del. │
│🖨️   │printer-1 │192...|HP LaserJet   │✓ Em uso │Offline │Ed. Del. │
│🔀   │switch-01 │192...|Cisco 2960    │◉ Disp.  │Unknown │Ed. Del. │
└─────┴──────────┴──────┴──────────────┴─────────┴────────┴──────────┘
```

**Filtros adicionados:**
1. **Filtro por Tipo** (select dropdown com todos os 10 tipos)
2. **Filtro por Status** (select dropdown com 6 status)
3. **Busca** (hostname, IP, serial, inventário)

**Exemplo:**
```
Filtro Tipo: [Impressora ▼]
Filtro Status: [Manutenção ▼]
Busca: [HP LaserJet__________]
```

### Página `/assets/[id]/`

**Cabeçalho melhorado:**
```
← Inventário
💻 desktop-001
 Computador | SN: DELL7090SP001 | INV: INV-2024-001
 [✓ Em uso]  [Online]
```

**Nova seção dinâmica:**
- "Especificações" aparece apenas para tipos que têm campos específicos
- Exemplo para impressora:
  ```
  Especificações (🖨️ Impressora)
  ┌────────────────────────┬────────────────────────┐
  │ Modelo da impressora   │ HP LaserJet M4003dw__ │
  │ Contagem de páginas    │ 45230________________ │
  │ Cartucho / Toner       │ Toner preto (50%)___  │
  └────────────────────────┴────────────────────────┘
  ```

## 🛠️ Backend — Sem Mudanças Necessárias

O schema Prisma **já suporta tudo**:
- ✅ `assetType` enum com 10 tipos
- ✅ `assetStatus` enum com 6 status
- ✅ Campos básicos: `hostname`, `ip`, `manufacturer`, `model`, `os`, `serialNumber`, `inventoryNumber`
- ✅ Relações: `tickets`, `operatingSystems`, `components`, `softwareList`, `volumes`, `networkPorts`, `telemetry`

## 📝 Modal CRUD (Criar/Editar)

**Antes:**
```
┌────────────────────────────────┐
│ Novo ativo                     │
├────────────────────────────────┤
│ Hostname [desktop-001_____]    │
│ IP [192.168.1.10___] SO [W11 ]│
│ Fab. [Dell_____] Modelo [7090]│
│ [Cancelar] [Criar]             │
└────────────────────────────────┘
```

**Depois:**
```
┌──────────────────────────────────┐
│ Novo ativo                       │
├──────────────────────────────────┤
│ Tipo [Computador ▼]             │
│ Status [Em uso ▼]                │
│ Hostname [desktop-001______]    │
│ IP [192.168.1.10___] SO [W11 ]  │
│ Fab. [Dell____] Modelo [7090]   │
│ Serial [DELL7090SP001] Inv [___]│
│ [Cancelar] [Criar]               │
└──────────────────────────────────┘
```

## 🔍 Filtros em Ação

**Exemplo 1: Listar todas as impressoras em manutenção**
```
Tipo: [Impressora]
Status: [Manutenção]
Resultado: 2 dispositivos
```

**Exemplo 2: Buscar um switch por IP**
```
Tipo: [Todos]
Status: [Todos]
Busca: [192.168.1.100]
Resultado: switch-gbit-2
```

**Exemplo 3: Buscar by serial**
```
Busca: [DELL7090SP001]
Resultado: desktop-001 (Computador)
```

## 📊 Casos de Uso

### Inventário de TI Completo
Agora você pode:
- ✅ Cadastrar todos os 10k dispositivos da empresa
- ✅ Rastrear impressoras (toner, manutenção)
- ✅ Gerenciar switches e roteadores (rede)
- ✅ Monitorar computadores e servidores (telemetria)
- ✅ Manter registro de telefones corporativos
- ✅ Filtrar por tipo ou status rapidamente

### SLA e Manutenção
- ✅ Atrelar SLAs por tipo (ex: servidor 4h, impressora 24h)
- ✅ Alertas de toner/consumíveis vencendo
- ✅ Agendar manutenção periódica por status

### Compliance & Auditoria
- ✅ Rastrear ciclo de vida (IN_USE → RETIRED)
- ✅ Documentar itens roubados (STOLEN)
- ✅ Atualizar inventário em tempo real

## 🔮 Próximas Etapas (Opcionais)

1. **Campos Dinâmicos em JSON**
   - Armazenar especificações em JSON `assetMetadata`
   - Expandir sem alterar schema

2. **Agrupamento na Listagem**
   - Agrupar por tipo automaticamente
   - Contar por status em cada grupo

3. **Relatórios**
   - Dashboard: % por tipo
   - Cobertura de agente por tipo
   - Status de toner/consumíveis

4. **Integração com Tickets**
   - Auto-selecionar tipo ao criar ticket com ativo
   - Sugerir SLA baseado em tipo

5. **Importação em Massa**
   - CSV com tipos, status, IPs, seriais
   - Validar formato por tipo

## 🚀 Como Testar

1. **Acesse** `http://localhost:3001/assets`
2. **Clique em** "+ Novo ativo"
3. **Selecione tipo** (ex: Impressora)
4. **Preencha** hostname e campos opcionais
5. **Clique** "Criar"
6. **Verifique** tabela com ícone do tipo
7. **Filtre** por tipo e status

## 📖 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `apps/web/app/assets/page.tsx` | Filtros, tipos, status, modal expandido |
| `apps/web/app/assets/[id]/page.tsx` | Cabeçalho melhorado, status badges |
| `apps/web/app/assets/[id]/sections/AssetMain.tsx` | Seção dinâmica de especificações |
| `prisma/schema.prisma` | Nenhuma (já tinha enums) |
| `apps/api/src/modules/assets/assets.controller.ts` | Nenhuma mudança |
| `apps/api/src/modules/assets/assets.service.ts` | Nenhuma mudança |

## ✅ Checklist

- [x] Tipos de dispositivos suportados
- [x] Status do ativo (6 opções)
- [x] Filtros na listagem
- [x] Modal com tipo e status
- [x] Tabela com ícone do tipo
- [x] Cabeçalho da página de detalhe
- [x] Seção dinâmica de especificações
- [x] Badges de status coloridas
- [x] Busca por serial/inventário

---

**Data:** 2026-06-16  
**Módulo:** Assets (Inventário de TI)  
**Status:** ✅ Pronto para uso
