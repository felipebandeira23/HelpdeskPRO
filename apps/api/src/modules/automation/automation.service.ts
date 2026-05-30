import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AutomationService {
  constructor(private prisma: PrismaService) {}

  async createRule(data: {
    name: string;
    description?: string;
    conditions: any;
    actions: any;
    enabled?: boolean;
  }) {
    return this.prisma.automationRule.create({
      data: {
        name: data.name,
        description: data.description,
        conditions: data.conditions,
        actions: data.actions,
        enabled: data.enabled ?? true,
      },
    });
  }

  async listRules() {
    return this.prisma.automationRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRule(id: string) {
    const rule = await this.prisma.automationRule.findUnique({
      where: { id },
    });

    if (!rule) {
      throw new NotFoundException('Regra não encontrada');
    }

    return rule;
  }

  async updateRule(id: string, data: any) {
    return this.prisma.automationRule.update({
      where: { id },
      data,
    });
  }

  async deleteRule(id: string) {
    return this.prisma.automationRule.delete({
      where: { id },
    });
  }

  async executeRules(trigger: string, context: any) {
    const rules = await this.prisma.automationRule.findMany({
      where: {
        enabled: true,
        trigger,
      },
    });

    const results = [];
    for (const rule of rules) {
      if (this.evaluateConditions(rule.conditions, context)) {
        const result = await this.executeActions(rule.actions, context);
        results.push(result);
      }
    }

    return results;
  }

  private evaluateConditions(conditions: any, context: any): boolean {
    if (!conditions || Object.keys(conditions).length === 0) return true;
    return true; // Placeholder - implement actual logic
  }

  private async executeActions(actions: any, context: any) {
    // Placeholder - implement actual actions (change status, assign, notify, etc)
    return { success: true, actions };
  }
}
