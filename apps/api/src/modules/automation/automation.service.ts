import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma, AutomationRule } from '@prisma/client';
import {
  evaluateConditions,
  RuleAction,
  TicketContext,
} from './automation-engine';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async createRule(data: Prisma.AutomationRuleCreateInput): Promise<AutomationRule> {
    return this.prisma.automationRule.create({ data });
  }

  async listRules(): Promise<AutomationRule[]> {
    return this.prisma.automationRule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getRule(id: string): Promise<AutomationRule> {
    const rule = await this.prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Regra não encontrada');
    return rule;
  }

  async updateRule(
    id: string,
    data: Prisma.AutomationRuleUpdateInput,
  ): Promise<AutomationRule> {
    return this.prisma.automationRule.update({ where: { id }, data });
  }

  async deleteRule(id: string): Promise<AutomationRule> {
    return this.prisma.automationRule.delete({ where: { id } });
  }

  // ─── Execução ─────────────────────────────────────────────────────────────

  /**
   * Executa as regras habilitadas de um gatilho contra um ticket.
   * Chamado pelo TicketsService em ticket_created / ticket_updated.
   * Nunca lança: automação quebrada não pode derrubar a operação principal.
   */
  async executeRules(
    trigger: string,
    context: TicketContext,
  ): Promise<{ executed: string[] }> {
    const executed: string[] = [];
    try {
      const rules = await this.prisma.automationRule.findMany({
        where: { enabled: true, trigger },
      });

      for (const rule of rules) {
        if (!evaluateConditions(rule.conditions, context)) continue;

        const actions = Array.isArray(rule.actions)
          ? (rule.actions as unknown as RuleAction[])
          : [];

        for (const action of actions) {
          await this.executeAction(action, context, rule.name);
        }
        executed.push(rule.name);
      }
    } catch (err) {
      this.logger.error(`Automação falhou (${trigger}): ${err}`);
    }
    return { executed };
  }

  private async executeAction(
    action: RuleAction,
    context: TicketContext,
    ruleName: string,
  ): Promise<void> {
    // Updates diretos via prisma (não TicketsService) para evitar recursão
    // de gatilhos: ação de automação não dispara nova rodada de regras.
    switch (action.type) {
      case 'assign':
        if (!action.assignedToId) return;
        await this.prisma.ticket.update({
          where: { id: context.id },
          data: { assignedToId: action.assignedToId },
        });
        await this.notifications.notify({
          userId: action.assignedToId,
          type: 'TICKET_ASSIGNED',
          title: `Ticket atribuído pela regra "${ruleName}" — #${context.ticketNumber}`,
          message: context.title,
          link: `/tickets/${context.id}`,
        });
        break;

      case 'set_priority':
        if (!action.priority) return;
        await this.prisma.ticket.update({
          where: { id: context.id },
          data: { priority: action.priority as never },
        });
        break;

      case 'set_group':
        if (!action.groupId) return;
        await this.prisma.ticket.update({
          where: { id: context.id },
          data: { groupId: action.groupId },
        });
        break;

      case 'add_follower':
        if (!action.userId) return;
        await this.prisma.ticketFollower.upsert({
          where: {
            ticketId_userId: { ticketId: context.id, userId: action.userId },
          },
          update: {},
          create: { ticketId: context.id, userId: action.userId },
        });
        break;

      case 'notify': {
        const target = action.userId || context.assignedToId;
        if (!target) return;
        await this.notifications.notify({
          userId: target,
          type: 'TICKET_FOLLOWUP',
          title: `Automação "${ruleName}" — #${context.ticketNumber}`,
          message: action.message || context.title,
          link: `/tickets/${context.id}`,
        });
        break;
      }

      default:
        this.logger.warn(`Ação desconhecida ignorada: ${JSON.stringify(action)}`);
    }
  }
}
