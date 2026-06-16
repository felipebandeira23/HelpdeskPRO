import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChatConversation, ChatMessage, ChatStatus, ChatSenderType, ChatParticipantRole } from '@prisma/client';
import { CreateChatConversationDto } from './dto/create-chat-conversation.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { CreateTicketFromChatDto } from './dto/create-ticket-from-chat.dto';
import { TicketsService } from '../tickets/tickets.service';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  private logger = new Logger('ChatService');

  constructor(
    private prisma: PrismaService,
    private ticketsService: TicketsService,
    private chatGateway: ChatGateway,
  ) {}

  async createConversation(
    dto: CreateChatConversationDto,
    currentUserId: string,
  ): Promise<any> {
    const conversation = await this.prisma.chatConversation.create({
      data: {
        status: ChatStatus.WAITING,
        channel: dto.channel || 'DESKTOP_AGENT',
        participants: {
          createMany: {
            data: [
              {
                userId: dto.requesterId,
                role: ChatParticipantRole.REQUESTER,
                externalName: dto.requesterName,
                externalEmail: dto.requesterEmail,
              },
              {
                userId: currentUserId,
                role: ChatParticipantRole.TECHNICIAN,
              },
            ],
          },
        },
      },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    this.chatGateway.notifyNewConversation(currentUserId, {
      id: conversation.id,
      status: conversation.status,
      requesterName: dto.requesterName,
      createdAt: conversation.createdAt,
    });

    return conversation;
  }

  async getConversation(conversationId: string): Promise<any> {
    const conversation = await this.prisma.chatConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        participants: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        ticket: {
          select: { id: true, ticketNumber: true, title: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async listConversations(filters?: {
    status?: ChatStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ conversations: any[]; total: number }> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    const [conversations, total] = await Promise.all([
      this.prisma.chatConversation.findMany({
        where,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          participants: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      this.prisma.chatConversation.count({ where }),
    ]);

    return { conversations, total };
  }

  async sendMessage(
    conversationId: string,
    userId: string,
    content: string,
  ): Promise<ChatMessage> {
    const conversation = await this.getConversation(conversationId);

    if (
      conversation.status === ChatStatus.CLOSED ||
      conversation.status === ChatStatus.CONVERTED_TO_TICKET
    ) {
      throw new BadRequestException('Cannot send message to closed conversation');
    }

    const participant = conversation.participants.find(
      (p: any) => p.userId === userId,
    );

    if (!participant) {
      throw new BadRequestException('User is not a participant of this conversation');
    }

    const senderType =
      participant.role === ChatParticipantRole.TECHNICIAN
        ? ChatSenderType.TECHNICIAN
        : ChatSenderType.USER;

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        senderType,
        senderName: participant.user?.name || participant.externalName || 'Unknown',
        senderId: userId,
        content,
      },
    });

    await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    if (conversation.status === ChatStatus.WAITING) {
      await this.updateConversationStatus(conversationId, ChatStatus.ACTIVE);
    }

    return message;
  }

  async getHistory(conversationId: string): Promise<ChatMessage[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return messages;
  }

  async updateConversationStatus(
    conversationId: string,
    status: ChatStatus,
  ): Promise<any> {
    const conversation = await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: { status },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    this.chatGateway.broadcastConversationStatus(conversationId, status.toLowerCase());

    return conversation;
  }

  async closeConversation(conversationId: string): Promise<any> {
    const conversation = await this.getConversation(conversationId);

    const updated = await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        status: ChatStatus.CLOSED,
        closedAt: new Date(),
      },
      include: { participants: true },
    });

    await this.prisma.chatMessage.create({
      data: {
        conversationId,
        senderType: ChatSenderType.SYSTEM,
        senderName: 'System',
        content: 'Conversation closed by technician',
      },
    });

    this.chatGateway.broadcastConversationStatus(conversationId, 'closed');

    return updated;
  }

  async convertToTicket(
    conversationId: string,
    dto: CreateTicketFromChatDto,
    userId: string,
  ): Promise<{ ticket: any; conversation: any }> {
    const conversation = await this.getConversation(conversationId);

    if (conversation.ticketId) {
      throw new BadRequestException('Conversation already converted to ticket');
    }

    const transcript = conversation.messages
      .map(
        (msg: any) =>
          `[${msg.createdAt.toLocaleTimeString('pt-BR')}] ${msg.senderName}: ${msg.content}`,
      )
      .join('\n');

    const requesterParticipant = conversation.participants.find(
      (p: any) => p.role === ChatParticipantRole.REQUESTER,
    );

    const ticketDto = {
      title: dto.title,
      description: dto.description || transcript,
      priority: dto.priority,
      categoryId: dto.categoryId,
      requesterId: requesterParticipant.userId,
      assignedToId: dto.assignedToId,
      groupId: dto.groupId,
    };

    const ticket = await this.ticketsService.create(ticketDto, userId);

    const updated = await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        status: ChatStatus.CONVERTED_TO_TICKET,
        ticketId: ticket.id,
        closedAt: new Date(),
      },
      include: { participants: true },
    });

    await this.prisma.chatMessage.create({
      data: {
        conversationId,
        senderType: ChatSenderType.SYSTEM,
        senderName: 'System',
        content: `Conversation converted to ticket #${ticket.ticketNumber}`,
      },
    });

    this.chatGateway.broadcastConversationStatus(conversationId, 'converted_to_ticket', {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
    });

    return { ticket, conversation: updated };
  }

  async getAvailableTechnicians(): Promise<any[]> {
    const technicians = await this.prisma.user.findMany({
      where: {
        profile: { name: { in: ['ADMIN', 'TECHNICIAN'] } },
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        assignedTickets: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
          select: { id: true },
        },
      },
    });

    return technicians.map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      activeTickets: t.assignedTickets.length,
    }));
  }

  async assignTechnician(
    conversationId: string,
    technicianId: string,
  ): Promise<any> {
    const conversation = await this.getConversation(conversationId);

    await this.prisma.chatParticipant.deleteMany({
      where: {
        conversationId,
        role: ChatParticipantRole.TECHNICIAN,
      },
    });

    await this.prisma.chatParticipant.create({
      data: {
        conversationId,
        userId: technicianId,
        role: ChatParticipantRole.TECHNICIAN,
      },
    });

    const technician = await this.prisma.user.findUnique({
      where: { id: technicianId },
      select: { name: true },
    });

    await this.prisma.chatMessage.create({
      data: {
        conversationId,
        senderType: ChatSenderType.SYSTEM,
        senderName: 'System',
        content: `Conversation assigned to ${technician?.name || 'Unknown'}`,
      },
    });

    this.chatGateway.notifyNewConversation(technicianId, {
      id: conversationId,
      action: 'assigned',
    });

    return this.getConversation(conversationId);
  }
}
