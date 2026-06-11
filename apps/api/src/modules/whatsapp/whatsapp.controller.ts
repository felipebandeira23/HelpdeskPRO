import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { WhatsappService } from './whatsapp.service';

@Controller('api/whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsappController {
  constructor(private service: WhatsappService) {}

  @Post('send')
  sendMessage(
    @Body() data: { to: string; message: string; ticketId?: string },
  ): Promise<unknown> {
    return this.service.sendMessage(data.to, data.message, data.ticketId);
  }

  @Get('conversations')
  getConversations(@Query('phone') phone?: string): Promise<unknown> {
    return this.service.getConversations(phone);
  }

  @Post('link')
  linkPhoneToTicket(
    @Body() data: { ticketId: string; phoneNumber: string },
  ): Promise<unknown> {
    return this.service.linkPhoneToTicket(data.ticketId, data.phoneNumber);
  }

  @Get('webhook')
  getWebhookStatus(): Promise<unknown> {
    return this.service.getWebhookStatus();
  }
}
