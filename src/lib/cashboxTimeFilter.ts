import { localDateTimeToUtcIso } from "@/lib/format";
import type { CashboxViewMode } from "@/types/cashbox";

export interface CashboxRangeQueryParams {
  start: string;
  end: string;
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
  const date = new Date(`${dateStr}T12:00:00+03:00`);
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
  }).format(date);
}

function buildDayUtcRange(
  date: string,
  startTime: string,
  endTime: string,
): CashboxRangeQueryParams {
  const normalizedStart = normalizeTimeInput(startTime) || "00:00";
  const normalizedEnd = normalizeTimeInput(endTime) || "23:59";
  const endDate =
    normalizedEnd <= normalizedStart ? addDays(date, 1) : date;

  return {
    start: localDateTimeToUtcIso(date, normalizedStart),
    end: localDateTimeToUtcIso(endDate, normalizedEnd, true),
  };
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

export function getCashboxQueryRange(
  mode: CashboxViewMode,
  options: {
    today: string;
    selectedDate: string;
    rangeStartDate: string;
    rangeEndDate: string;
    dayStartTime: string;
    dayEndTime: string;
    rangeStartTime: string;
    rangeEndTime: string;
  },
): CashboxRangeQueryParams | null {
  if (mode === "range") {
    return {
      start: localDateTimeToUtcIso(
        options.rangeStartDate,
        normalizeTimeInput(options.rangeStartTime) || "00:00",
      ),
      end: localDateTimeToUtcIso(
        options.rangeEndDate,
        normalizeTimeInput(options.rangeEndTime) || "23:59",
        true,
      ),
    };
  }

  const date = mode === "today" ? options.today : options.selectedDate;

  if (mode === "today" && !hasDayTimeFilter(options.dayStartTime, options.dayEndTime)) {
    return null;
  }

  return buildDayUtcRange(date, options.dayStartTime, options.dayEndTime);
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
