'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<number | null>(1);

  const chats = [
    { id: 1, name: 'João Silva', channel: 'WhatsApp', time: '10:32', preview: 'Preciso de ajuda com a senha.', unread: 2 },
    { id: 2, name: 'Maria Souza', channel: 'Widget', time: '09:15', preview: 'Obrigado!', unread: 0 },
    { id: 3, name: 'Carlos Santos', channel: 'Telegram', time: 'Ontem', preview: 'A impressora voltou a funcionar.', unread: 0 },
  ];

  return (
    <div className="h-[calc(100vh-140px)] bg-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar / Lista de Chats */}
      <div className="w-full md:w-80 bg-slate-800 border-r border-slate-700 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-700 bg-slate-800/80">
          <h2 className="text-lg font-bold text-white mb-3">Atendimentos</h2>
          <div className="relative">
            <Input
              type="text"
              placeholder="Pesquisar..."
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat.id)}
              className={`p-4 border-b border-slate-700/50 cursor-pointer transition-colors ${activeChat === chat.id ? 'bg-blue-900/20' : 'hover:bg-slate-700/30'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-slate-200">{chat.name}</h3>
                <span className="text-xs text-slate-500">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400 truncate pr-2">{chat.preview}</p>
                {chat.unread > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {chat.unread}
                  </span>
                )}
              </div>
              <span className={`inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded border ${chat.channel === 'WhatsApp' ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                {chat.channel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Área de Chat */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-slate-900">
          {/* Header do Chat */}
          <div className="h-16 border-b border-slate-700 flex items-center px-6 bg-slate-800/50 shrink-0 justify-between">
            <div>
              <h3 className="font-bold text-white">{chats.find(c => c.id === activeChat)?.name}</h3>
              <p className="text-xs text-green-400">Online • Atendendo agora</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Transferir</Button>
              <Button variant="primary" size="sm">Gerar Ticket</Button>
              <Button variant="danger" size="sm">Encerrar</Button>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex justify-center">
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Hoje</span>
            </div>
            
            <div className="flex flex-col gap-1 max-w-[80%] items-start">
              <div className="bg-slate-800 text-slate-200 p-3 rounded-lg rounded-tl-none border border-slate-700">
                Bom dia, estou com problema de acesso. Minha senha expirou e não consigo trocar.
              </div>
              <span className="text-xs text-slate-500 ml-1">10:30</span>
            </div>

            <div className="flex flex-col gap-1 max-w-[80%] items-end self-end ml-auto">
              <div className="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none shadow-md shadow-blue-900/20">
                Bom dia! Qual o seu usuário por favor? Vou resetar a senha por aqui.
              </div>
              <span className="text-xs text-slate-500 mr-1">10:31</span>
            </div>

            <div className="flex flex-col gap-1 max-w-[80%] items-start">
              <div className="bg-slate-800 text-slate-200 p-3 rounded-lg rounded-tl-none border border-slate-700">
                É joao.silva
              </div>
              <span className="text-xs text-slate-500 ml-1">10:32</span>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-800/80 border-t border-slate-700 shrink-0">
            <div className="flex gap-2">
              <button className="p-3 text-slate-400 hover:text-white transition-colors bg-slate-900 rounded-lg border border-slate-700">
                📎
              </button>
              <Input
                type="text"
                placeholder="Digite uma mensagem..."
              />
              <Button variant="primary">Enviar</Button>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex gap-4">
              <span>Use <kbd className="bg-slate-700 px-1 rounded">/macro</kbd> para respostas prontas</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-slate-500">
          <span className="text-6xl mb-4">💬</span>
          <p className="text-lg">Selecione uma conversa para iniciar o atendimento</p>
        </div>
      )}
    </div>
  );
}
