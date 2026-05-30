import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private service: ChatService) {}

  @Get('conversations/:userId')
  getConversations(@Param('userId') userId: string) {
    return this.service.getConversations(userId);
  }

  @Post('create')
  createChat(@Body() data: { participants: string[] }) {
    return this.service.createChat(data.participants);
  }

  @Post('send')
  sendMessage(
    @Body() data: { chatId: string; userId: string; message: string },
  ) {
    return this.service.sendMessage(data.chatId, data.userId, data.message);
  }
}
