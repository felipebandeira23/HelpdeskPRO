/**
 * Cálculo de prazos respeitando expediente e feriados.
 *
 * Por quê: SLA que conta 24/7 estoura injustamente tickets abertos
 * fora do horário de atendimento (sexta à noite, feriados).
 */

export interface BusinessHoursConfig {
  weekday: number; // 0 = domingo ... 6 = sábado
  start: string; // "08:00"
  end: string; // "18:00"
  enabled: boolean;
}

export interface HolidayConfig {
  date: Date;
  recurring: boolean;
}

const MAX_DAYS_LOOKAHEAD = 366;

function parseTime(time: string): { h: number; m: number } {
  const [h, m] = time.split(':').map(Number);
  return { h: h || 0, m: m || 0 };
}

function isHoliday(date: Date, holidays: HolidayConfig[]): boolean {
  return holidays.some((h) => {
    const hd = new Date(h.date);
    const sameMonthDay =
      hd.getMonth() === date.getMonth() && hd.getDate() === date.getDate();
    return h.recurring
      ? sameMonthDay
      : sameMonthDay && hd.getFullYear() === date.getFullYear();
  });
}

/**
 * Soma `minutes` minutos úteis a partir de `start`.
 * Se não houver nenhum dia de expediente habilitado, cai para tempo corrido.
 */
export function addBusinessMinutes(
  start: Date,
  minutes: number,
  hours: BusinessHoursConfig[],
  holidays: HolidayConfig[],
): Date {
  const enabledDays = hours.filter((h) => h.enabled);
  if (enabledDays.length === 0) {
    return new Date(start.getTime() + minutes * 60000);
  }

  let remaining = minutes;
  const cursor = new Date(start);

  for (let day = 0; day < MAX_DAYS_LOOKAHEAD; day++) {
    const config = enabledDays.find((h) => h.weekday === cursor.getDay());

    if (config && !isHoliday(cursor, holidays)) {
      const { h: sh, m: sm } = parseTime(config.start);
      const { h: eh, m: em } = parseTime(config.end);

      const windowStart = new Date(cursor);
      windowStart.setHours(sh, sm, 0, 0);
      const windowEnd = new Date(cursor);
      windowEnd.setHours(eh, em, 0, 0);

      const effectiveStart = cursor > windowStart ? cursor : windowStart;

      if (effectiveStart < windowEnd) {
        const availableMinutes =
          (windowEnd.getTime() - effectiveStart.getTime()) / 60000;

        if (remaining <= availableMinutes) {
          return new Date(effectiveStart.getTime() + remaining * 60000);
        }
        remaining -= availableMinutes;
      }
    }

    // avança para o início do próximo dia
    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(0, 0, 0, 0);
  }

  // fallback: configuração inválida (ex: todos os dias feriado)
  return new Date(start.getTime() + minutes * 60000);
}
