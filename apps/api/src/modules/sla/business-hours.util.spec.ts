import { addBusinessMinutes, BusinessHoursConfig } from './business-hours.util';

const WEEK_8_18: BusinessHoursConfig[] = [1, 2, 3, 4, 5].map((weekday) => ({
  weekday,
  start: '08:00',
  end: '18:00',
  enabled: true,
}));

describe('addBusinessMinutes', () => {
  it('soma minutos dentro do mesmo expediente', () => {
    // Quarta-feira 10/06/2026 às 10:00
    const start = new Date(2026, 5, 10, 10, 0, 0);
    const result = addBusinessMinutes(start, 120, WEEK_8_18, []);
    expect(result).toEqual(new Date(2026, 5, 10, 12, 0, 0));
  });

  it('transborda para o próximo dia útil', () => {
    // Quarta 17:00 + 120min úteis = sobra 1h hoje, +1h amanhã a partir das 08:00
    const start = new Date(2026, 5, 10, 17, 0, 0);
    const result = addBusinessMinutes(start, 120, WEEK_8_18, []);
    expect(result).toEqual(new Date(2026, 5, 11, 9, 0, 0));
  });

  it('pula o fim de semana', () => {
    // Sexta 12/06/2026 às 17:00 + 120min → segunda 09:00
    const start = new Date(2026, 5, 12, 17, 0, 0);
    const result = addBusinessMinutes(start, 120, WEEK_8_18, []);
    expect(result).toEqual(new Date(2026, 5, 15, 9, 0, 0));
  });

  it('pula feriado fixo', () => {
    // Quarta 17:00 + 120min, quinta 11/06 é feriado → sexta 09:00
    const start = new Date(2026, 5, 10, 17, 0, 0);
    const result = addBusinessMinutes(start, 120, WEEK_8_18, [
      { date: new Date(2026, 5, 11), recurring: false },
    ]);
    expect(result).toEqual(new Date(2026, 5, 12, 9, 0, 0));
  });

  it('pula feriado recorrente de anos anteriores', () => {
    const start = new Date(2026, 5, 10, 17, 0, 0);
    const result = addBusinessMinutes(start, 120, WEEK_8_18, [
      { date: new Date(2020, 5, 11), recurring: true }, // 11/06 todo ano
    ]);
    expect(result).toEqual(new Date(2026, 5, 12, 9, 0, 0));
  });

  it('início antes do expediente conta a partir da abertura', () => {
    // Quarta 06:00 + 60min → 09:00
    const start = new Date(2026, 5, 10, 6, 0, 0);
    const result = addBusinessMinutes(start, 60, WEEK_8_18, []);
    expect(result).toEqual(new Date(2026, 5, 10, 9, 0, 0));
  });

  it('cai para tempo corrido sem expediente configurado', () => {
    const start = new Date(2026, 5, 10, 10, 0, 0);
    const result = addBusinessMinutes(start, 90, [], []);
    expect(result).toEqual(new Date(2026, 5, 10, 11, 30, 0));
  });
});
