export const TURKEY_TIMEZONE = "Europe/Istanbul";

function getTurkeyDateTimeParts(iso: string | Date) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TURKEY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    day: get("day"),
    month: get("month"),
    year: get("year"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function localDateTimeToUtcIso(
  date: string,
  time: string,
  endOfMinute = false,
): string {
  const [hours = "00", minutes = "00"] = time.split(":");
  const seconds = endOfMinute ? "59" : "00";
  const fractional = endOfMinute ? ".999" : ".000";
  const localDate = new Date(
    `${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds}${fractional}+03:00`,
  );
  return localDate.toISOString();
}

export function formatDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function toDateTimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatDateTimeFromIso(iso: string | null): string {
  if (!iso) return "—";
  const { day, month, year, hour, minute } = getTurkeyDateTimeParts(iso);
  return `${day}.${month}.${year} ${hour}:${minute}`;
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSignedCurrency(amount: number): string {
  if (amount < 0) {
    return `-₺${formatCurrency(-amount)}`;
  }
  return `₺${formatCurrency(amount)}`;
}

export function formatDurationFromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours} Saat ${mins} dk`;
  if (hours > 0) return `${hours} Saat`;
  return `${mins} dk`;
}

export function toDateInputValue(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TURKEY_TIMEZONE,
  }).format(date);
}

export function isValidDateInputValue(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function formatDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
}

export function formatDateLabelFromIso(iso: string | null): string {
  if (!iso) return "—";
  const { day, month, year } = getTurkeyDateTimeParts(iso);
  return `${day}.${month}.${year}`;
}

export function getDateRangeDays(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) {
    return [startDate];
  }

  while (current <= end) {
    dates.push(toDateInputValue(current));
    current.setDate(current.getDate() + 1);
  }

  return dates.length > 0 ? dates : [startDate];
}

export function formatTimeFromIso(iso: string | null): string {
  if (!iso) return "—";
  const { hour, minute } = getTurkeyDateTimeParts(iso);
  return `${hour}:${minute}`;
}

export function formatDeviceDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  const normalized = trimmed.toLowerCase();

  if (
    normalized.includes("direksiyon") ||
    normalized.includes("steering") ||
    /^d\s*\d/.test(normalized)
  ) {
    const match = trimmed.match(/(\d+)/);
    return match ? `D${match[1]}` : "D";
  }

  return trimmed.replace(/PS(\d+)/i, "PS $1");
}
