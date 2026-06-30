import type { TableType } from "@/types/table";

export function mapApiDeviceType(raw?: string | null): TableType | null {
  if (!raw) return null;

  const upper = raw.toUpperCase();
  if (upper === "PLAYSTATION") return "playstation";
  if (upper === "STEERING_WHEEL" || upper === "STEERING") return "steering";

  return null;
}

export function getCashboxDeviceBadgeLabel(
  deviceType: TableType,
  mergedUsageTotal = 0,
): string {
  if (mergedUsageTotal > 0 && deviceType === "steering") {
    return "PS + Direksiyon";
  }

  return deviceType === "playstation" ? "PS" : "Direksiyon";
}

export function getCashboxDeviceBadgeClass(
  deviceType: TableType,
  mergedUsageTotal = 0,
): string {
  if (mergedUsageTotal > 0 && deviceType === "steering") {
    return "bg-amber-500/15 text-amber-300";
  }

  return deviceType === "steering"
    ? "bg-sky-500/15 text-sky-300"
    : "bg-[#6366f1]/15 text-[#a5b4fc]";
}

export function getDeviceTypeLabel(deviceType: TableType): string {
  return deviceType === "playstation" ? "PlayStation" : "Direksiyon";
}

export function getInferredPreviousDeviceType(
  closingDeviceType: TableType,
): TableType {
  return closingDeviceType === "steering" ? "playstation" : "steering";
}

export function hasCrossDeviceTransfer(mergedUsageTotal = 0): boolean {
  return mergedUsageTotal > 0;
}
