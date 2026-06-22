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
  return formatDateTime(new Date(iso));
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
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
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
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
