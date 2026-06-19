import type { Table } from "@/types/table";

export function hasActiveTimeLimit(table: Table): boolean {
  return (
    table.isOpen &&
    table.timeLimitMin != null &&
    table.timeLimitMin > 0 &&
    !!table.startedAt
  );
}

export function getElapsedMinutesFromStart(startedAt: string | null): number {
  if (!startedAt) return 0;
  const started = new Date(startedAt).getTime();
  if (Number.isNaN(started)) return 0;
  return Math.max(0, Math.floor((Date.now() - started) / 60_000));
}

export function getElapsedSecondsFromStart(startedAt: string | null): number {
  if (!startedAt) return 0;
  const started = new Date(startedAt).getTime();
  if (Number.isNaN(started)) return 0;
  return Math.max(0, Math.floor((Date.now() - started) / 1000));
}

export function getTimeLimitProgress(
  elapsedMin: number,
  limitMin: number,
): number {
  if (limitMin <= 0) return 0;
  return Math.min(1, elapsedMin / limitMin);
}

export function getTimeLimitProgressFromSeconds(
  elapsedSec: number,
  limitMin: number,
): number {
  const limitSec = limitMin * 60;
  if (limitSec <= 0) return 0;
  return Math.min(1, elapsedSec / limitSec);
}

export function getRemainingMinutes(
  elapsedMin: number,
  limitMin: number,
): number {
  return Math.max(0, limitMin - elapsedMin);
}

export function isTimeLimitExpired(
  elapsedMin: number,
  limitMin: number,
): boolean {
  return limitMin > 0 && elapsedMin >= limitMin;
}
