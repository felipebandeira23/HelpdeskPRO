import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SLAService } from '../sla/sla.service';
import { TicketFollowup } from '@prisma/client';
import { sendMailQuick, emailTemplate } from '../mail/mailer';

@Injectable()
export class PortalService {
  constructor(
    private prisma: PrismaService,
    private slaService: SLAService,
  ) {}

  /**
   * Abertura pública de chamado. Cria o solicitante como VIEWER no primeiro
   * contato (padrão GLPI). Antes havia requesterId 'public-user' — FK quebrada.
   */
  async createTicketPublic(data: {
    email: string;
    name: string;
    title: string;
    description: string;
  }): Promise<{ id: string; ticketNumber: number }> {
    if (!data.email?.includes('@') || !data.title || !data.description) {
      throw new BadRequestException('Informe email, título e descrição');
    }

    const requester = await this.ensureUser(
      data.email.toLowerCase(),
      data.name || data.email,
    );

    const ticket = await this.prisma.ticket.create({
      data: {
        title: data.title.slice(0, 200),
        description: data.description.slice(0, 10_000),
        requesterId: requester.id,
      },
    });

    await this.slaService.applyPolicyToTicket(ticket.id).catch(() => null);

    await this.prisma.ticketFollowup.create({
      data: {
        ticketId: ticket.id,
        authorId: requester.id,
        message: 'Ticket aberto pelo Portal do Cliente.',
        isInternal: true,
        origin: 'PORTAL',
      },
    });

    await sendMailQuick(
      data.email,
      `[HelpdeskPRO #${ticket.ticketNumber}] Chamado registrado`,
      emailTemplate(
        `Chamado #${ticket.ticketNumber} registrado`,
        `Olá, ${requester.name}! Seu chamado "<strong>${ticket.title}</strong>" foi registrado. Acompanhe pelo portal usando seu email e o número do chamado.`,
      ),
    );

    return { id: ticket.id, ticketNumber: ticket.ticketNumber };
  }

  /** Lista resumida dos chamados do email informado. */
  async getTicketsPublic(email: string): Promise<unknown[]> {
    const user = await this.prisma.user.findUnique({
      where: { email: email?.toLowerCase() || '' },
    });
    if (!user) return [];

    return this.prisma.ticket.findMany({
      where: { requesterId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        ticketNumber: true,
        title: true,
        status: true,
        createdAt: true,
        closedAt: true,
      },
    });
  }

  /**
   * Detalhe público: exige número do ticket + email do solicitante,
   * evitando enumeração de IDs.
   */
  async getTicketPublic(ticketNumber: number, email: string): Promise<unknown> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketNumber },
      select: {
        ticketNumber: true,
        title: true,
        status: true,
        priority: true,
        description: true,
        createdAt: true,
        requester: { select: { email: true } },
        followups: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' },
          select: {
            message: true,
            createdAt: true,
            author: { select: { name: true } },
          },
        },
      },
    });

    if (!ticket || ticket.requester.email !== email?.toLowerCase()) {
      throw new NotFoundException('Chamado não encontrado para este email');
    }

    const { requester: _omit, ...publicTicket } = ticket;
    return publicTicket;
  }

  /** Resposta pública do solicitante (verifica posse pelo email). */
  async addPublicFollowup(
    ticketNumber: number,
    email: string,
    message: string,
  ): Promise<TicketFollowup> {
    if (!message?.trim()) throw new BadRequestException('Mensagem vazia');

    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketNumber },
      select: { id: true, requester: { select: { id: true, email: true } } },
    });
    if (!ticket || ticket.requester.email !== email?.toLowerCase()) {
      throw new NotFoundException('Chamado não encontrado para este email');
    }

    return this.prisma.ticketFollowup.create({
      data: {
        ticketId: ticket.id,
        authorId: ticket.requester.id,
        message: message.slice(0, 5000),
        isInternal: false,
        origin: 'PORTAL',
      },
    });
  }

  private async ensureUser(
    email: string,
    name: string,
  ): Promise<{ id: string; name: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    const randomPassword = await bcrypt.hash(randomBytes(24).toString('hex'), 10);

    const viewerProfile = await this.prisma.profile.findFirst({
      where: { name: 'Visualizador' },
    });

    return this.prisma.user.create({
      data: {
        email,
        name,
        password: randomPassword,
        profileId: viewerProfile?.id || '',
      },
    });
  }
}
