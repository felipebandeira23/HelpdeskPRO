/**
 * Tipos e avaliador de condições do motor de automação.
 *
 * Regra = Quando (trigger) + Condições (todas devem passar) + Ações.
 * Formato JSON armazenado em AutomationRule.conditions / .actions:
 *
 * conditions: [{ "field": "priority", "operator": "equals", "value": "URGENT" }]
 * actions:    [{ "type": "set_priority", "priority": "HIGH" },
 *              { "type": "assign", "assignedToId": "..." },
 *              { "type": "set_group", "groupId": "..." },
 *              { "type": "add_follower", "userId": "..." },
 *              { "type": "notify", "userId": "...", "message": "..." }]
 */

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'is_empty'
  | 'is_not_empty';

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value?: unknown;
}

export interface RuleAction {
  type: 'assign' | 'set_priority' | 'set_group' | 'add_follower' | 'notify';
  assignedToId?: string;
  priority?: string;
  groupId?: string;
  userId?: string;
  message?: string;
}

export interface TicketContext {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  categoryId: string | null;
  groupId: string | null;
  assignedToId: string | null;
  requesterId: string;
  [key: string]: unknown;
}

/** Resolve campo no contexto (suporta caminho raso: "priority", "categoryId"). */
function fieldValue(context: TicketContext, field: string): unknown {
  return context[field];
}

export function evaluateCondition(
  condition: RuleCondition,
  context: TicketContext,
): boolean {
  const actual = fieldValue(context, condition.field);
  const expected = condition.value;

  switch (condition.operator) {
    case 'equals':
      return actual === expected;
    case 'not_equals':
      return actual !== expected;
    case 'contains':
      return (
        typeof actual === 'string' &&
        typeof expected === 'string' &&
        actual.toLowerCase().includes(expected.toLowerCase())
      );
    case 'not_contains':
      return !(
        typeof actual === 'string' &&
        typeof expected === 'string' &&
        actual.toLowerCase().includes(expected.toLowerCase())
      );
    case 'in':
      return Array.isArray(expected) && expected.includes(actual);
    case 'is_empty':
      return actual === null || actual === undefined || actual === '';
    case 'is_not_empty':
      return actual !== null && actual !== undefined && actual !== '';
    default:
      return false;
  }
}

export function evaluateConditions(
  conditions: unknown,
  context: TicketContext,
): boolean {
  if (!conditions) return true;
  if (!Array.isArray(conditions)) return false; // formato inválido — não executa
  if (conditions.length === 0) return true;
  return conditions.every((c) =>
    evaluateCondition(c as RuleCondition, context),
  );
}
