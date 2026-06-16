import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('ChatGateway');
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized on namespace /chat');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id;

      // Store mapping of user to socket
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      this.logger.error('Connection failed:', (error as Error).message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('chat:join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = client.data.userId;
      const conversation = await this.chatService.getConversation(
        data.conversationId,
      );

      if (!conversation) {
        return { error: 'Conversation not found' };
      }

      // Join Socket.io room
      client.join(`conversation:${data.conversationId}`);

      // Notify others that user joined
      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('chat:user_joined', {
          userId,
          conversationId: data.conversationId,
          timestamp: new Date(),
        });

      return { success: true };
    } catch (error) {
      this.logger.error('Error joining conversation:', (error as Error).message);
      return { error: (error as Error).message };
    }
  }

  @SubscribeMessage('chat:send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
    },
  ) {
    try {
      const userId = client.data.userId;

      const message = await this.chatService.sendMessage(
        data.conversationId,
        userId,
        data.content,
      );

      // Broadcast to all users in the conversation
      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('chat:message_received', {
          id: message.id,
          conversationId: message.conversationId,
          senderType: message.senderType,
          senderName: message.senderName,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt,
        });

      return { success: true, messageId: message.id };
    } catch (error) {
      this.logger.error('Error sending message:', (error as Error).message);
      return { error: (error as Error).message };
    }
  }

  @SubscribeMessage('chat:typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      isTyping: boolean;
    },
  ) {
    try {
      const userId = client.data.userId;

      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('chat:user_typing', {
          userId,
          isTyping: data.isTyping,
          conversationId: data.conversationId,
        });

      return { success: true };
    } catch (error) {
      this.logger.error('Error handling typing:', (error as Error).message);
      return { error: (error as Error).message };
    }
  }

  @SubscribeMessage('chat:leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = client.data.userId;

      client.leave(`conversation:${data.conversationId}`);

      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('chat:user_left', {
          userId,
          conversationId: data.conversationId,
          timestamp: new Date(),
        });

      return { success: true };
    } catch (error) {
      this.logger.error('Error leaving conversation:', (error as Error).message);
      return { error: (error as Error).message };
    }
  }

  // Helper method to notify user about new conversation (called from service)
  notifyNewConversation(userId: string, conversationData: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('chat:new_conversation', conversationData);
    }
  }

  // Helper method to broadcast conversation status change
  broadcastConversationStatus(
    conversationId: string,
    status: string,
    data: any = {},
  ) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit(`chat:conversation_${status}`, {
        conversationId,
        ...data,
      });
  }
}
