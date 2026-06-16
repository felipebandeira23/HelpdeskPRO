import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateChatConversationDto } from './dto/create-chat-conversation.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { CreateTicketFromChatDto } from './dto/create-ticket-from-chat.dto';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  async listConversations(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.chatService.listConversations({
      status: status as any,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') conversationId: string) {
    return this.chatService.getConversation(conversationId);
  }

  @Get('conversations/:id/history')
  async getHistory(@Param('id') conversationId: string) {
    return this.chatService.getHistory(conversationId);
  }

  @Post('conversations')
  async createConversation(
    @Body() dto: CreateChatConversationDto,
    @Request() req: any,
  ) {
    const userId = req.user.id || req.user.sub;
    return this.chatService.createConversation(dto, userId);
  }

  @Post('conversations/:id/message')
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() dto: SendChatMessageDto,
    @Request() req: any,
  ) {
    const userId = req.user.id || req.user.sub;
    return this.chatService.sendMessage(conversationId, userId, dto.content);
  }

  @Post('conversations/:id/close')
  async closeConversation(@Param('id') conversationId: string) {
    return this.chatService.closeConversation(conversationId);
  }

  @Post('conversations/:id/ticket')
  async convertToTicket(
    @Param('id') conversationId: string,
    @Body() dto: CreateTicketFromChatDto,
    @Request() req: any,
  ) {
    const userId = req.user.id || req.user.sub;
    return this.chatService.convertToTicket(conversationId, dto, userId);
  }

  @Get('technicians/available')
  async getAvailableTechnicians() {
    return this.chatService.getAvailableTechnicians();
  }

  @Post('conversations/:id/assign')
  async assignTechnician(
    @Param('id') conversationId: string,
    @Body('technicianId') technicianId: string,
  ) {
    return this.chatService.assignTechnician(conversationId, technicianId);
  }
}
