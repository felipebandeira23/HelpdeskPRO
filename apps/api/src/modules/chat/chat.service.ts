import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  async initSocket(server: {
    on: (event: string, callback: (socket: { on: (event: string, callback: (data: unknown) => void) => void }) => void) => void;
    emit: (event: string, data: unknown) => void;
  }): Promise<unknown> {
    await Promise.resolve();
    return server.on('connection', (socket) => {
      socket.on('send_message', (data) => {
        server.emit('receive_message', data);
      });
    });
  }

  async getConversations(_userId: string): Promise<unknown[]> {
    await Promise.resolve();
    return [];
  }

  async createChat(participantIds: string[]): Promise<unknown> {
    await Promise.resolve();
    return { id: 'chat-' + Date.now(), participants: participantIds };
  }

  async sendMessage(chatId: string, userId: string, message: string): Promise<unknown> {
    await Promise.resolve();
    return {
      id: 'msg-' + Date.now(),
      chatId,
      userId,
      message,
      timestamp: new Date(),
    };
  }
}
