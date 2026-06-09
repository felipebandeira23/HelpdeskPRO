'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Modal, Field } from '@/components/ui';

interface Message {
  sender: 'client' | 'agent' | 'system';
  text: string;
  time: string;
}

interface Chat {
  id: number;
  name: string;
  channel: string;
  time: string;
  preview: string;
  unread: number;
  active: boolean;
}

const DEFAULT_CHATS: Chat[] = [
  { id: 1, name: 'João Silva', channel: 'WhatsApp', time: '10:32', preview: 'Preciso de ajuda com a senha.', unread: 2, active: true },
  { id: 2, name: 'Maria Souza', channel: 'Widget Website', time: '09:15', preview: 'Obrigado!', unread: 0, active: true },
  { id: 3, name: 'Carlos Santos', channel: 'Telegram', time: 'Ontem', preview: 'A impressora voltou a funcionar.', unread: 0, active: true },
];

const DEFAULT_HISTORIES: Record<number, Message[]> = {
  1: [
    { sender: 'client', text: 'Bom dia, estou com problema de acesso. Minha senha expirou e não consigo trocar.', time: '10:30' },
    { sender: 'agent', text: 'Bom dia! Qual o seu usuário por favor? Vou resetar a senha por aqui.', time: '10:31' },
    { sender: 'client', text: 'É joao.silva', time: '10:32' },
  ],
  2: [
    { sender: 'client', text: 'Olá, a nova licença do Office já foi comprada?', time: '09:10' },
    { sender: 'agent', text: 'Sim Maria, já está disponível no módulo de Licenças. Pode atribuir à sua máquina.', time: '09:14' },
    { sender: 'client', text: 'Obrigado!', time: '09:15' },
  ],
  3: [
    { sender: 'agent', text: 'Olá Carlos, verificou se a impressora do RH voltou a responder na rede?', time: 'Ontem' },
    { sender: 'client', text: 'Sim, a impressora voltou a funcionar. Era o IP duplicado no DHCP.', time: 'Ontem' },
  ],
};

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>(DEFAULT_CHATS);
  const [histories, setHistories] = useState<Record<number, Message[]>>(DEFAULT_HISTORIES);
  const [activeChatId, setActiveChatId] = useState<number | null>(1);
  const [typedMessage, setTypedMessage] = useState('');

  // Search filter
  const [search, setSearch] = useState('');

  // Ticket creation modal states
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [tTitle, setTTitle] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tPriority, setTPriority] = useState('Médio');

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTech, setTransferTech] = useState('Sérgio Meyer');

  // Load chat state
  useEffect(() => {
    const localChats = localStorage.getItem('chat_list');
    const localHistories = localStorage.getItem('chat_histories');
    if (localChats) {
      try {
        setChats(JSON.parse(localChats));
      } catch (e) {
        console.error(e);
      }
    }
    if (localHistories) {
      try {
        setHistories(JSON.parse(localHistories));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChatId || !typedMessage.trim()) return;

    const timeStr = new Date().toLocaleTimeString('pt-BR').substring(0, 5);
    const newMessage: Message = {
      sender: 'agent',
      text: typedMessage,
      time: timeStr,
    };

    // Update active history
    const activeHistory = histories[activeChatId] || [];
    const updatedHistory = [...activeHistory, newMessage];
    const updatedAllHistories = {
      ...histories,
      [activeChatId]: updatedHistory,
    };
    setHistories(updatedAllHistories);
    localStorage.setItem('chat_histories', JSON.stringify(updatedAllHistories));

    // Update preview in chat list, and clear unreads
    const updatedChats = chats.map(c =>
      c.id === activeChatId ? { ...c, preview: typedMessage, unread: 0, time: timeStr } : c
    );
    setChats(updatedChats);
    localStorage.setItem('chat_list', JSON.stringify(updatedChats));

    setTypedMessage('');

    // Simulate auto client reply after 1.5s (only for fun/simulation!)
    setTimeout(() => {
      const replies: Record<number, string> = {
        1: 'Certo, acabei de testar aqui e funcionou! Muito obrigado pelo suporte rápido!',
        2: 'Perfeito, vou fazer a instalação agora mesmo. Tenha um bom dia!',
        3: 'Obrigado técnico. Vou monitorar se ela desconecta de novo.',
      };
      const clientReply = replies[activeChatId] || 'Ok, entendi. Obrigado.';
      
      const updatedHistoryWithClient = [
        ...updatedHistory,
        {
          sender: 'client' as const,
          text: clientReply,
          time: new Date().toLocaleTimeString('pt-BR').substring(0, 5),
        }
      ];
      
      const finalHistories = {
        ...updatedAllHistories,
        [activeChatId]: updatedHistoryWithClient,
      };
      
      setHistories(finalHistories);
      localStorage.setItem('chat_histories', JSON.stringify(finalHistories));

      const finalChats = updatedChats.map(c =>
        c.id === activeChatId ? { ...c, preview: clientReply, time: new Date().toLocaleTimeString('pt-BR').substring(0, 5) } : c
      );
      setChats(finalChats);
      localStorage.setItem('chat_list', JSON.stringify(finalChats));
    }, 2000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !tTitle) return;

    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const ticketNumber = Math.floor(Math.random() * 900) + 100;
    const timeStr = new Date().toLocaleTimeString('pt-BR').substring(0, 5);

    // Append system message to history
    const systemMessage: Message = {
      sender: 'system',
      text: `✓ Chamado #${ticketNumber} ("${tTitle}") criado com sucesso para o solicitante ${activeChat.name} (Prioridade: ${tPriority}).`,
      time: timeStr
    };

    const updatedHistory = [...(histories[activeChatId] || []), systemMessage];
    const updatedAllHistories = {
      ...histories,
      [activeChatId]: updatedHistory,
    };
    setHistories(updatedAllHistories);
    localStorage.setItem('chat_histories', JSON.stringify(updatedAllHistories));

    // Sync preview
    const updatedChats = chats.map(c =>
      c.id === activeChatId ? { ...c, preview: `Chamado #${ticketNumber} criado.` } : c
    );
    setChats(updatedChats);
    localStorage.setItem('chat_list', JSON.stringify(updatedChats));

    setIsTicketModalOpen(false);
    setTTitle('');
    setTDesc('');
    alert(`Chamado #${ticketNumber} registrado com sucesso para ${activeChat.name}!`);
  };

  const handleTransfer = () => {
    if (!activeChatId) return;
    const timeStr = new Date().toLocaleTimeString('pt-BR').substring(0, 5);

    const systemMessage: Message = {
      sender: 'system',
      text: `⇄ Atendimento transferido por você para o técnico ${transferTech}.`,
      time: timeStr
    };

    const updatedHistory = [...(histories[activeChatId] || []), systemMessage];
    const updatedAllHistories = { ...histories, [activeChatId]: updatedHistory };
    setHistories(updatedAllHistories);
    localStorage.setItem('chat_histories', JSON.stringify(updatedAllHistories));

    setIsTransferModalOpen(false);
    alert(`Atendimento transferido para ${transferTech}.`);
  };

  const handleEndChat = () => {
    if (!activeChatId) return;
    if (!confirm('Deseja realmente encerrar este atendimento? Ele será arquivado.')) return;

    const updatedChats = chats.map(c =>
      c.id === activeChatId ? { ...c, active: false } : c
    );
    setChats(updatedChats);
    localStorage.setItem('chat_list', JSON.stringify(updatedChats));
    setActiveChatId(chats.find(c => c.id !== activeChatId && c.active)?.id || null);
  };

  const handleSelectChat = (id: number) => {
    setActiveChatId(id);
    // Clear unread badge
    const updated = chats.map(c => c.id === id ? { ...c, unread: 0 } : c);
    setChats(updated);
    localStorage.setItem('chat_list', JSON.stringify(updated));
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeHistory = activeChatId ? (histories[activeChatId] || []) : [];
  const activeChatsList = chats.filter(c => c.active && c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-[calc(100vh-140px)] bg-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar / Lista de Chats */}
      <div className="w-full md:w-80 bg-slate-800 border-r border-slate-700 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-700 bg-slate-800/80">
          <h2 className="text-lg font-bold text-white mb-3 flex justify-between items-center">
            <span>Atendimentos</span>
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{activeChatsList.length} ativos</span>
          </h2>
          <div className="relative">
            <Input
              type="text"
              placeholder="Pesquisar contatos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeChatsList.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-6 text-center">Nenhum atendimento ativo encontrado</p>
          ) : (
            activeChatsList.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`p-4 border-b border-slate-700/50 cursor-pointer transition-colors ${
                  activeChatId === chat.id ? 'bg-blue-900/20 border-l-4 border-blue-500' : 'hover:bg-slate-700/30'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-200">{chat.name}</h3>
                  <span className="text-xs text-slate-500 font-mono">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-400 truncate pr-2">{chat.preview}</p>
                  {chat.unread > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
                <span className={`inline-block mt-2 text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                  chat.channel === 'WhatsApp'
                    ? 'bg-green-950/20 border-green-800 text-green-400'
                    : chat.channel === 'Telegram'
                    ? 'bg-sky-950/20 border-sky-800 text-sky-400'
                    : 'bg-slate-700 border-slate-600 text-slate-300'
                }`}>
                  {chat.channel}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área de Chat principal */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-slate-900">
          {/* Header do Chat */}
          <div className="h-16 border-b border-slate-700 flex items-center px-6 bg-slate-800/50 shrink-0 justify-between">
            <div>
              <h3 className="font-bold text-white">{activeChat.name}</h3>
              <p className="text-xs text-green-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Atendimento em andamento ({activeChat.channel})
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsTransferModalOpen(true)}>Transferir</Button>
              <Button variant="primary" size="sm" onClick={() => setIsTicketModalOpen(true)}>Gerar Ticket</Button>
              <Button variant="danger" size="sm" onClick={handleEndChat}>Encerrar</Button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
            <div className="flex justify-center mb-2">
              <span className="text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">Hoje</span>
            </div>

            {activeHistory.map((m, idx) => {
              if (m.sender === 'system') {
                return (
                  <div key={idx} className="flex justify-center py-1">
                    <span className="text-[11px] text-slate-300 bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl max-w-lg text-center font-mono">
                      {m.text}
                    </span>
                  </div>
                );
              }
              const isAgent = m.sender === 'agent';
              return (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 max-w-[70%] ${
                    isAgent ? 'self-end ml-auto items-end' : 'items-start'
                  }`}
                >
                  <div className={`p-3 rounded-xl shadow-md text-sm leading-relaxed ${
                    isAgent
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/10'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-500 px-1 font-mono">{m.time}</span>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-800/80 border-t border-slate-700 shrink-0">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => alert('Anexo de arquivos ainda não configurado neste ambiente.')}
                className="p-3 text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-lg border border-slate-700"
              >
                📎
              </button>
              <Input
                type="text"
                placeholder="Digite uma mensagem..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
              />
              <Button variant="primary" type="submit" disabled={!typedMessage.trim()}>Enviar</Button>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex gap-4">
              <span>Operador logado: <b>Técnico Central</b></span>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-slate-500 p-8">
          <span className="text-6xl mb-4">💬</span>
          <p className="text-lg font-bold">Nenhum Atendimento Ativo</p>
          <p className="text-sm text-slate-400 mt-1 max-w-sm text-center">Selecione uma conversa ao lado ou espere novos contatos iniciarem pelo Widget/WhatsApp.</p>
        </div>
      )}

      {/* Generate Ticket Modal */}
      <Modal
        open={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Gerar Chamado de Suporte a partir do Chat"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsTicketModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreateTicket} disabled={!tTitle}>Abrir Ticket</Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Field label="Título do Chamado" required>
            <Input
              type="text"
              placeholder="Ex: Resetar senha de domínio do AD"
              value={tTitle}
              onChange={(e) => setTTitle(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Solicitante (Cliente)">
              <Input type="text" readOnly value={activeChat?.name || ''} className="bg-slate-950/60" />
            </Field>
            <Field label="Prioridade">
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
                value={tPriority}
                onChange={(e) => setTPriority(e.target.value)}
              >
                <option value="Baixo">Baixo</option>
                <option value="Médio">Médio</option>
                <option value="Alto">Alto</option>
                <option value="Crítico">Crítico</option>
              </select>
            </Field>
          </div>
          <Field label="Descrição Detalhada do Problema">
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors"
              rows={3}
              placeholder="Descreva observações adicionais relatadas no chat..."
              value={tDesc}
              onChange={(e) => setTDesc(e.target.value)}
            />
          </Field>
        </form>
      </Modal>

      {/* Transfer Chat Modal */}
      <Modal
        open={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transferir Conversa para Outro Atendente"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" onClick={() => setIsTransferModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleTransfer}>Confirmar Transferência</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Selecione o Operador / Equipe Destino" required>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none"
              value={transferTech}
              onChange={(e) => setTransferTech(e.target.value)}
            >
              <option value="Sérgio Meyer (Nível 2 - Redes)">Sérgio Meyer (Nível 2 - Redes)</option>
              <option value="Cássio Almeida (Nível 1 - Hardware)">Cássio Almeida (Nível 1 - Hardware)</option>
              <option value="Patrícia Vieira (Diretoria / VIP)">Patrícia Vieira (Diretoria / VIP)</option>
              <option value="Suporte Banco de Dados (Mesa DBA)">Suporte Banco de Dados (Mesa DBA)</option>
            </select>
          </Field>
          <p className="text-xs text-slate-400">O histórico completo da conversa será compartilhado com o novo atendente assim que ele aceitar a transferência.</p>
        </div>
      </Modal>
    </div>
  );
}
