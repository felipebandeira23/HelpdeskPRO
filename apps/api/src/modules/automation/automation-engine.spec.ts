import { evaluateConditions, TicketContext } from './automation-engine';

const ticket: TicketContext = {
  id: 't1',
  ticketNumber: 42,
  title: 'Impressora do RH não imprime',
  description: 'Erro de papel atolado',
  status: 'OPEN',
  priority: 'URGENT',
  categoryId: 'cat-impressora',
  groupId: null,
  assignedToId: null,
  requesterId: 'u1',
};

describe('evaluateConditions', () => {
  it('sem condições → sempre executa', () => {
    expect(evaluateConditions(null, ticket)).toBe(true);
    expect(evaluateConditions([], ticket)).toBe(true);
  });

  it('equals e not_equals', () => {
    expect(
      evaluateConditions(
        [{ field: 'priority', operator: 'equals', value: 'URGENT' }],
        ticket,
      ),
    ).toBe(true);
    expect(
      evaluateConditions(
        [{ field: 'status', operator: 'not_equals', value: 'CLOSED' }],
        ticket,
      ),
    ).toBe(true);
    expect(
      evaluateConditions(
        [{ field: 'priority', operator: 'equals', value: 'LOW' }],
        ticket,
      ),
    ).toBe(false);
  });

  it('contains (case-insensitive) no título', () => {
    expect(
      evaluateConditions(
        [{ field: 'title', operator: 'contains', value: 'impressora' }],
        ticket,
      ),
    ).toBe(true);
  });

  it('in com lista de valores', () => {
    expect(
      evaluateConditions(
        [{ field: 'priority', operator: 'in', value: ['HIGH', 'URGENT'] }],
        ticket,
      ),
    ).toBe(true);
  });

  it('is_empty / is_not_empty', () => {
    expect(
      evaluateConditions([{ field: 'assignedToId', operator: 'is_empty' }], ticket),
    ).toBe(true);
    expect(
      evaluateConditions([{ field: 'categoryId', operator: 'is_not_empty' }], ticket),
    ).toBe(true);
  });

  it('todas as condições devem passar (AND)', () => {
    expect(
      evaluateConditions(
        [
          { field: 'priority', operator: 'equals', value: 'URGENT' },
          { field: 'status', operator: 'equals', value: 'CLOSED' },
        ],
        ticket,
      ),
    ).toBe(false);
  });

  it('formato inválido não executa (fail-safe)', () => {
    expect(evaluateConditions({ field: 'x' }, ticket)).toBe(false);
  });
});
