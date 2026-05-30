import { Injectable } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private apiKey = process.env.WHATSAPP_API_KEY;
  private businessPhoneId = process.env.WHATSAPP_BUSINESS_PHONE_ID;

  async sendMessage(to: string, message: string, ticketId?: string) {
    try {
      // In production: use Meta WhatsApp Business API
      // For now: mock implementation
      if (!to || !message) {
        throw new Error('Phone and message are required');
      }

      return {
        id: `msg-${Date.now()}`,
        to,
        message,
        ticketId,
        status: 'sent',
        timestamp: new Date(),
      };
    } catch (err) {
      throw new Error(`Failed to send WhatsApp message: ${err}`);
    }
  }

  async getConversations(phoneNumber?: string) {
    // Get all WhatsApp conversations for a customer
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

  async linkPhoneToTicket(ticketId: string, phoneNumber: string) {
    // Link a WhatsApp phone to a ticket for continuous chat
    return {
      ticketId,
      phoneNumber,
      linked: true,
      linkedAt: new Date(),
    };
  }

  async getWebhookStatus() {
    return {
      configured: !!this.apiKey,
      webhook: process.env.WHATSAPP_WEBHOOK_URL || 'not configured',
      status: 'active',
    };
  }
}
