# Boas Práticas — Módulo de Ativos Expandido

## 🎯 Estratégia de Cadastro

### 1. **Começar pelos Computadores**
```
✓ Desktop e Notebooks corporativos
✓ Servidores (físicos e virtuais)
✓ Depois: periféricos (monitores, teclados)
```

**Por quê?** Computadores têm a melhor cobertura de agente monitoramento.

### 2. **Infraestrutura de Rede**
```
✓ Switches e roteadores críticos
✓ Depois: APs, impressoras
```

**Por quê?** Rede é geralmente a 3ª prioridade em TI.

### 3. **Impressoras**
```
✓ Impressoras corporativas (laser, multifuncional)
✓ Depois: jatos de tinta
✓ Rastrear consumíveis (toner, papel)
```

**Por quê?** Consumíveis são custos previsíveis e necessitam rastreamento.

## 💾 Campos Obrigatórios vs Opcionais

### Sempre Preencher
```
✓ Hostname (único, legível)
✓ Tipo de dispositivo
✓ Status
```

**Exemplo:**
```
Hostname: desktop-001, laptop-gerencia, printer-andar2
```

### Muito Recomendado
```
⭐ IP ou MAC address
⭐ Serial number (para RMA/suporte)
⭐ Inventário (para compliance)
```

### Opcional (mas útil)
```
◉ Fabricante e modelo
◉ Sistema operacional
◉ Técnico encarregado
```

## 🏷️ Convenções de Nomenclatura

### Computadores
```
desktop-{numero}       Desktop (ex: desktop-001)
laptop-{departamento}  Notebook (ex: laptop-gerencia)
server-{nome}          Servidor (ex: server-db-prod)
```

### Rede
```
switch-{andar}-{numero}       Switch (ex: switch-2-gbit-01)
router-{locacao}              Roteador (ex: router-internet-primary)
ap-{andar}-{sala}             Access Point (ex: ap-2-sala201)
```

### Impressoras
```
printer-{andar}-{tipo}        Impressora (ex: printer-andar3-laser)
mfp-{departamento}            Multifuncional (ex: mfp-financeiro)
```

### Telefones
```
phone-{ramal}                 Telefone (ex: phone-200)
mobile-{usuario}              Celular corporativo (ex: mobile-anderson)
```

## 📊 Padrão de Status

### Ciclo de Vida Típico
```
IN_USE (Operação normal)
  ↓
MAINTENANCE (Quebrou, indo pra manutenção)
  ↓
IN_USE (Retornou da manutenção)
  ↓
AVAILABLE (Será aposentado)
  ↓
RETIRED (Descartado oficialmente)
```

### Casos Especiais
```
STOLEN      → Registra ocorrência, ativa busca
LENT        → Emprestado a terceiros, aguardando retorno
```

### Exemplo de Transição
```
1. Cria desktop-001 com status "IN_USE"
2. Disco falha → muda para "MAINTENANCE"
3. Disco trocado → volta para "IN_USE"
4. Após 4 anos → "AVAILABLE" (candidato a descarte)
5. Descartado oficialmente → "RETIRED"
```

## 🔍 Filtros Recomendados

### Por Departamento
```
Você: Filtro por tipo = COMPUTER
Resultado: Todos os desktops/laptops
```

### Por Localização
```
Você: Buscar por hostname (ex: "andar3")
Resultado: Todos os ativos do andar 3
```

### Por Situação
```
Você: Filtro por status = MAINTENANCE
Resultado: Ativos que estão sendo consertados
```

### Por Agente
```
Você: Filtro por agente = OFFLINE
Resultado: Computadores que não comunicam há 24h+
```

## 🛡️ Conformidade & Auditoria

### ISO 27001 (Segurança da Informação)
```
✓ Registre data de aquisição (createdAt)
✓ Mantenha serial (evidência física)
✓ Rastreie responsáveis (technician + user)
✓ Documente fim de vida (status RETIRED)
```

### LGPD (Proteção de Dados)
```
⚠️ Ao descartar: garantir destruição de dados
✓ Status RETIRED pode acionar procedimento de sanitização
```

### Compliance Geral
```
✓ Inventário atualizado (mensal)
✓ Relatório de ativos críticos (trimestral)
✓ Auditoria de propriedade (anual)
```

## 🚨 Alertas Automáticos (Futuros)

Quando implementado, você terá alertas para:

```
🔔 Consumíveis vencendo
   "Toner de printer-andar2 em 20%"

🔔 Agente offline > 48h
   "laptop-gerencia não reporta telemetria"

🔔 Manutenção programada
   "switch-2-gbit-01 vence manutenção em 7 dias"

🔔 Fim de ciclo
   "desktop-001 completa 4 anos, candidato a RETIRED"
```

## 📈 Relatórios Úteis

### Cobertura de Agente
```
Dashboard → Ativos com agente ONLINE / OFFLINE / UNKNOWN
% de visibilidade em tempo real
```

### Ativos por Status
```
Gráfico de pizza:
- IN_USE: 450 (87%)
- MAINTENANCE: 35 (7%)
- AVAILABLE: 20 (4%)
- RETIRED: 10 (2%)
```

### Ativos por Tipo
```
Tabela:
- COMPUTER:  350
- LAPTOP:    100
- PRINTER:   30
- SWITCH:    25
- ROUTER:    5
```

### Consumíveis (Impressoras)
```
Lista:
- printer-andar2: Toner 40%
- printer-andar3: Papel OK
- mfp-financeiro: Cilindro 60%
```

## 🔗 Integração com Tickets

### Ao Criar Ticket
```
1. Selecione "Dispositivo / Ativo"
2. Campo auto-completa hostname
3. Tipo de ativo é preenchido automaticamente
4. SLA sugerido baseado no tipo
```

### Exemplo
```
Criar ticket para impressora quebrada:
- Descrição: "HP LaserJet papel travado"
- Ativo: [Buscar "printer-andar3" ▼]
- Tipo sugerido: PRINTER
- SLA sugerido: 4 horas (impressoras críticas)
```

### Rastreabilidade
```
No detalhe do ticket:
- "Relacionado a: printer-andar3"
- No detalhe do ativo:
  - "Chamados: #TKT-0245, #TKT-0239, #TKT-0198"
```

## 📋 Checklist Mensal

Para manter o inventário limpo:

```
☐ Revisão de ativos OFFLINE > 30 dias
  → Investigar se desligado ou avariado
  
☐ Atualizar consumíveis (impressoras)
  → Toner, papel, manutenção programada
  
☐ Validar responsáveis
  → Se usuário saiu da empresa, desalocar
  
☐ Rastrear STOLEN
  → Se recuperado, voltar para IN_USE
  → Se confirmado perdido, manter STOLEN + data

☐ Candidatos a RETIRED (> 4 anos)
  → Marcar como AVAILABLE se funcionando
  → Transferir para RETIRED se descartado
```

## 🎨 Exemplo Prático: Cadastro Completo

### Cenário: Adicionar nova workstation

**Passo 1: Adicionar ativo**
```
Modal → Novo ativo

Tipo:                   Computador
Status:                 Em uso
Hostname:               desktop-financeiro-05
IP:                     192.168.10.25
Fabricante:             Dell
Modelo:                 OptiPlex 7090
Serial:                 DELL7090001234
Número de inventário:   INV-2024-0450
SO:                     Windows 11 Pro
Técnico:                João Silva
Usuário:                Maria Conceição
Comentários:            "Substituição de desktop-financeiro-02"

✓ Criar
```

**Passo 2: Aguardar agente check-in**
```
Na listagem:
desktop-financeiro-05 | 192.168.10.25 | Dell OptiPlex | ⚫ Sem agente

(Após instalar agente no desktop:)
desktop-financeiro-05 | 192.168.10.25 | Dell OptiPlex | 🟢 Online
```

**Passo 3: Visualizar telemetria**
```
Na página de detalhe:
→ Abrir seção "Telemetria"
→ Ver CPU 32%, RAM 12GB/16GB, Disco 450GB/1TB
```

**Passo 4: Linkar a chamado existente**
```
Na página do ticket #TKT-0340:
"Necessidade de workstation para Maria"

→ Editar ticket
→ Dispositivo / Ativo: [Selecionar desktop-financeiro-05]
→ Status: RESOLVED
```

**Passo 5: Histórico**
```
No detalhe do ativo:
→ Seção "Chamados"
→ Mostra #TKT-0340 que originou a compra
```

---

## 🎓 Próximos Passos

1. **Onboard todos os usuários de TI**
   - Mostrar como filtrar e criar ativos
   - Convenções de nome

2. **Importação em massa**
   - CSV com ativos existentes
   - Mapping de tipos e status

3. **Agente em todos os computadores**
   - Telemetria automática
   - Alertas de OFFLINE

4. **Automação**
   - Alerts quando Consumíveis < 30%
   - Auto-RETIRED após 4 anos

---

**Última atualização:** 2026-06-16  
**Versão:** 1.0  
**Status:** ✅ Pronto para uso
