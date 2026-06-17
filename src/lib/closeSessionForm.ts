import type { SessionClosePreview } from "@/types/closeSession";
import type { Table } from "@/types/table";
import {
  formatDateTimeFromIso,
  formatDurationFromMinutes,
} from "@/lib/format";

export function buildClosePreviewFromTable(table: Table): SessionClosePreview {
  const now = new Date().toISOString();

  return {
    sessionId: table.sessionId ?? 0,
    deviceName: table.name,
    tableLabel: `Masa #${table.deviceId}`,
    startedAt: table.startedAt ?? now,
    closedAt: now,
    durationText: table.elapsedText || "00:00",
    tariffDescription: table.tariffName ?? "—",
    controllerCount: table.controllerCount ?? 1,
    timeLimitText: table.timeLimitMin
      ? formatDurationFromMinutes(table.timeLimitMin)
      : null,
    priceLimit: table.priceLimit,
    usageLines: [
      {
        label: "Kullanım",
        detail: table.elapsedText,
        amount: table.gameTotal,
      },
    ],
    usageTotal: table.gameTotal,
    orders: [],
    orderTotal: table.orderTotal,
    grandTotal: table.grandTotal,
  };
}

export function getCloseModalSubtitle(preview: SessionClosePreview): string {
  return `${preview.tableLabel} • ${preview.deviceName} • Açılış: ${formatDateTimeFromIso(preview.startedAt)}`;
}
