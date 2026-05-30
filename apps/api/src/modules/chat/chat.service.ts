import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  async initSocket(server: any) {
    return server.on('connection', (socket: any) => {
      socket.on('send_message', (data: any) => {
        server.emit('receive_message', data);
      });
    });
  }

  async getConversations(userId: string) {
    return [];
  }

  async createChat(participantIds: string[]) {
    return { id: 'chat-' + Date.now(), participants: participantIds };
  }

  async sendMessage(chatId: string, userId: string, message: string) {
    return {
      id: 'msg-' + Date.now(),
      chatId,
      userId,
      message,
      timestamp: new Date(),
    };
  }
}
