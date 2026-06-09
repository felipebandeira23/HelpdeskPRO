import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, AutomationRule } from '@prisma/client';

@Injectable()
export class AutomationService {
  constructor(private prisma: PrismaService) {}

  async createRule(data: Prisma.AutomationRuleCreateInput): Promise<AutomationRule> {
    return this.prisma.automationRule.create({
      data,
    });
  }

  async listRules(): Promise<AutomationRule[]> {
    return this.prisma.automationRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRule(id: string): Promise<AutomationRule> {
    const rule = await this.prisma.automationRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException('Regra não encontrada');
    }

    return rule;
  }

  async updateRule(
    id: string,
    data: Prisma.AutomationRuleUpdateInput,
  ): Promise<AutomationRule> {
    return this.prisma.automationRule.update({
      where: { id },
      data,
    });
  }

  async deleteRule(id: string): Promise<AutomationRule> {
    return this.prisma.automationRule.delete({
      where: { id },
    });
  }

  async executeRules(trigger: string, context: unknown): Promise<unknown[]> {
    const rules = await this.prisma.automationRule.findMany({
      where: {
        enabled: true,
        trigger,
      },
    });

    const results = [];
    for (const rule of rules) {
      if (
        this.evaluateConditions(
          rule.conditions as Record<string, unknown> | null,
          context,
        )
      ) {
        const result = await this.executeActions(
          rule.actions as Record<string, unknown> | null,
          context,
        );
        results.push(result);
      }
    }

    return results;
  }

  private evaluateConditions(
    conditions: Record<string, unknown> | null,
    _context: unknown,
  ): boolean {
    if (!conditions || Object.keys(conditions).length === 0) return true;
    return true; // Placeholder - implement actual logic
  }

  private async executeActions(
    actions: Record<string, unknown> | null,
    _context: unknown,
  ): Promise<unknown> {
    await Promise.resolve(); // satisfy require-await
    return { success: true, actions };
  }
}
