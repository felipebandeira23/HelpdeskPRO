/**
 * Caixa de entrada IMAP → tickets (padrão GLPI "coletor de emails").
 *
 * A cada IMAP_POLL_SECONDS (padrão 120s), busca mensagens não lidas,
 * cria o ticket com o remetente como solicitante (criando o usuário
 * VIEWER se não existir), aplica a política de SLA e responde com
 * confirmação contendo o número do ticket.
 *
 * Env: IMAP_HOST, IMAP_PORT (993), IMAP_USER, IMAP_PASS, IMAP_SECURE (true).
 * Sem IMAP_HOST, o coletor fica desabilitado.
 */
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SLAService } from '../sla/sla.service';
import { sendMailQuick, emailTemplate } from './mailer';

@Injectable()
export class MailInboxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailInboxService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private polling = false;

  constructor(
    private prisma: PrismaService,
    private slaService: SLAService,
  ) {}

  onModuleInit(): void {
    if (!process.env.IMAP_HOST) {
      this.logger.warn('IMAP_HOST não configurado — coleta de emails desabilitada');
      return;
    }
    const seconds = parseInt(process.env.IMAP_POLL_SECONDS || '120', 10);
    this.timer = setInterval(() => void this.poll(), seconds * 1000);
    this.logger.log(`Coletor IMAP ativo (intervalo ${seconds}s)`);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  /** Um ciclo de coleta. Exposto para testes/disparo manual. */
  async poll(): Promise<{ created: number }> {
    if (this.polling) return { created: 0 }; // evita ciclos sobrepostos
    this.polling = true;
    let created = 0;

    const client = new ImapFlow({
      host: process.env.IMAP_HOST!,
      port: parseInt(process.env.IMAP_PORT || '993', 10),
      secure: process.env.IMAP_SECURE !== 'false',
      auth: {
        user: process.env.IMAP_USER || '',
        pass: process.env.IMAP_PASS || '',
      },
      logger: false,
    });

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');
      try {
        for await (const msg of client.fetch(
          { seen: false },
          { source: true, uid: true },
        )) {
          try {
            await this.processMessage(msg.source!);
            created++;
            await client.messageFlagsAdd({ uid: String(msg.uid) }, ['\\Seen'], {
              uid: true,
            });
          } catch (err) {
            this.logger.error(`Falha ao processar email uid=${msg.uid}: ${err}`);
          }
        }
      } finally {
        lock.release();
      }
      await client.logout();
    } catch (err) {
      this.logger.error(`Coleta IMAP falhou: ${err}`);
    } finally {
      this.polling = false;
    }

    if (created > 0) this.logger.log(`${created} ticket(s) criados via email`);
    return { created };
  }

  private async processMessage(source: Buffer): Promise<void> {
    const parsed = await simpleParser(source);
    const fromAddress = parsed.from?.value?.[0]?.address?.toLowerCase();
    const fromName = parsed.from?.value?.[0]?.name || fromAddress || 'Desconhecido';
    if (!fromAddress) throw new Error('Email sem remetente válido');

    const subject = (parsed.subject || 'Sem assunto').slice(0, 200);
    const body =
      (parsed.text || parsed.html || 'Sem conteúdo').toString().slice(0, 10_000);

    const requester = await this.ensureUser(fromAddress, fromName);

    const ticket = await this.prisma.ticket.create({
      data: {
        title: subject,
        description: body,
        requesterId: requester.id,
      },
    });

    await this.slaService.applyPolicyToTicket(ticket.id).catch(() => null);

    // Marca a origem EMAIL na timeline (rastreabilidade estilo Milvus)
    await this.prisma.ticketFollowup.create({
      data: {
        ticketId: ticket.id,
        authorId: requester.id,
        message: `Ticket criado automaticamente a partir de email de ${fromAddress}.`,
        isInternal: true,
        origin: 'EMAIL',
      },
    });

    await sendMailQuick(
      fromAddress,
      `[HelpdeskPRO #${ticket.ticketNumber}] Recebemos seu chamado`,
      emailTemplate(
        `Chamado #${ticket.ticketNumber} registrado`,
        `Olá, ${fromName}! Recebemos sua solicitação "<strong>${subject}</strong>" e nossa equipe já foi notificada. Você receberá atualizações por email.`,
        `/portal`,
      ),
    );
  }

  /** Cria o solicitante como VIEWER se for o primeiro contato (padrão GLPI). */
  private async ensureUser(
    email: string,
    name: string,
  ): Promise<{ id: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    const randomPassword = await bcrypt.hash(randomBytes(24).toString('hex'), 10);
    return this.prisma.user.create({
      data: { email, name, password: randomPassword, role: 'VIEWER' },
    });
  }
}
