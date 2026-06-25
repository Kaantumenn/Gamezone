import type { CashboxAccount, CashboxReportEntry, CashboxTotals } from "@/types/cashbox";

export interface CashboxTimeBounds {
  startAt: Date | null;
  endAt: Date | null;
}

function parseDateTime(dateStr: string, time: string, endOfMinute = false): Date {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  const date = new Date(`${dateStr}T00:00:00`);
  date.setHours(
    Number.isNaN(hours) ? 0 : hours,
    Number.isNaN(minutes) ? 0 : minutes,
    endOfMinute ? 59 : 0,
    endOfMinute ? 999 : 0,
  );
  return date;
}

function startOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function endOfDay(dateStr: string): Date {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function hasDayTimeFilter(startTime: string, endTime: string): boolean {
  return startTime.trim().length > 0 || endTime.trim().length > 0;
}

export function normalizeTimeInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function isValidDayTimeRange(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return true;
  return Boolean(normalizeTimeInput(startTime) && normalizeTimeInput(endTime));
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T12:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildDayTimeBounds(
  date: string,
  startTime: string,
  endTime: string,
): CashboxTimeBounds {
  if (!hasDayTimeFilter(startTime, endTime)) {
    return { startAt: null, endAt: null };
  }

  const normalizedStart = normalizeTimeInput(startTime);
  const normalizedEnd = normalizeTimeInput(endTime);

  const startAt = normalizedStart
    ? parseDateTime(date, normalizedStart)
    : startOfDay(date);

  let endAt = normalizedEnd
    ? parseDateTime(date, normalizedEnd, true)
    : endOfDay(date);

  if (normalizedStart && normalizedEnd && normalizedEnd <= normalizedStart) {
    endAt = parseDateTime(addDays(date, 1), normalizedEnd, true);
  }

  return { startAt, endAt };
}

export function generateTimeOptions(stepMinutes = 30): string[] {
  const options: string[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      options.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      );
    }
  }

  return options;
}

export function buildRangeTimeBounds(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): CashboxTimeBounds {
  const startAt = parseDateTime(startDate, startTime || "00:00");
  const endAt = parseDateTime(endDate, endTime || "23:59", true);
  return { startAt, endAt };
}

function isWithinBounds(
  iso: string | null | undefined,
  bounds: CashboxTimeBounds,
): boolean {
  if (!bounds.startAt && !bounds.endAt) return true;
  if (!iso) return false;

  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return false;
  if (bounds.startAt && value < bounds.startAt) return false;
  if (bounds.endAt && value > bounds.endAt) return false;
  return true;
}

export function sumAccountTotals(accounts: CashboxAccount[]): CashboxTotals {
  return accounts.reduce<CashboxTotals>(
    (totals, account) => ({
      grandTotal: totals.grandTotal + account.grandTotal,
      cashTotal: totals.cashTotal + account.cashTotal,
      cardTotal: totals.cardTotal + account.cardTotal,
      gameTotal: totals.gameTotal + account.gameTotal,
      orderTotal: totals.orderTotal + account.orderTotal,
      accountCount: totals.accountCount + 1,
    }),
    {
      grandTotal: 0,
      cashTotal: 0,
      cardTotal: 0,
      gameTotal: 0,
      orderTotal: 0,
      accountCount: 0,
    },
  );
}

export function filterCashboxByTime(
  accounts: CashboxAccount[],
  entries: CashboxReportEntry[],
  bounds: CashboxTimeBounds,
) {
  const filteredAccounts = accounts.filter((account) =>
    isWithinBounds(account.endedAt, bounds),
  );
  const filteredEntries = entries.filter((entry) =>
    isWithinBounds(entry.closedAt, bounds),
  );

  return {
    accounts: filteredAccounts,
    entries: filteredEntries,
    totals: sumAccountTotals(filteredAccounts),
  };
}

export function formatTimeFilterLabel(
  startTime: string,
  endTime: string,
): string | null {
  if (!hasDayTimeFilter(startTime, endTime)) return null;
  if (startTime && endTime) return `${startTime} — ${endTime}`;
  if (startTime) return `${startTime} sonrası`;
  return `${endTime} öncesi`;
}

export function formatRangeFilterLabel(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): string {
  const [sy, sm, sd] = startDate.split("-");
  const [ey, em, ed] = endDate.split("-");
  const startLabel = `${sd}.${sm}.${sy} ${startTime || "00:00"}`;
  const endLabel = `${ed}.${em}.${ey} ${endTime || "23:59"}`;
  return `${startLabel} — ${endLabel}`;
}
