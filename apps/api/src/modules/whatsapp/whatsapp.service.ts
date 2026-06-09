import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private apiKey = process.env.WHATSAPP_API_KEY;
  private businessPhoneId = process.env.WHATSAPP_BUSINESS_PHONE_ID;

  async sendMessage(
    to: string,
    message: string,
    ticketId?: string,
  ): Promise<unknown> {
    try {
      // In production: use Meta WhatsApp Business API
      // For now: mock implementation
      if (!to || !message) {
        throw new Error('Phone and message are required');
      }

      await Promise.resolve();

      return {
        id: `msg-${Date.now()}`,
        to,
        message,
        ticketId,
        status: 'sent',
        timestamp: new Date(),
      };
    } catch (err) {
      throw new Error(
        `Failed to send WhatsApp message: ${(err as Error).message}`,
      );
    }
  }

  async getConversations(phoneNumber?: string): Promise<unknown> {
    // Get all WhatsApp conversations for a customer
    await Promise.resolve();
    return {
      conversations: [
        {
          id: 'conv-1',
          phoneNumber: phoneNumber || '+5511999999999',
          lastMessage: 'Como posso ajudar?',
          timestamp: new Date(),
          unreadCount: 2,
        },
      ],
    };
  }

  async linkPhoneToTicket(
    ticketId: string,
    phoneNumber: string,
  ): Promise<unknown> {
    // Link a WhatsApp phone to a ticket for continuous chat
    await Promise.resolve();
    return {
      ticketId,
      phoneNumber,
      linked: true,
      linkedAt: new Date(),
    };
  }

  async getWebhookStatus(): Promise<unknown> {
    await Promise.resolve();
    return {
      configured: !!this.apiKey,
      webhook: process.env.WHATSAPP_WEBHOOK_URL || 'not configured',
      status: 'active',
    };
  }
}
