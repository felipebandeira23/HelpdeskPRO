import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('api/whatsapp')
export class WhatsappController {
  constructor(private service: WhatsappService) {}

  @Post('send')
  sendMessage(
    @Body() data: { to: string; message: string; ticketId?: string },
  ) {
    return this.service.sendMessage(data.to, data.message, data.ticketId);
  }

  @Get('conversations')
  getConversations(@Query('phone') phone?: string) {
    return this.service.getConversations(phone);
  }

  @Post('link')
  linkPhoneToTicket(
    @Body() data: { ticketId: string; phoneNumber: string },
  ) {
    return this.service.linkPhoneToTicket(data.ticketId, data.phoneNumber);
  }

  @Get('webhook')
  getWebhookStatus() {
    return this.service.getWebhookStatus();
  }
}
