import type {
  CashboxAccount,
  CashboxAccountApi,
  CashboxAccountDetail,
  CashboxAccountDetailOrderApi,
  CashboxAccountDetailResponse,
  CashboxAccountsApiResponse,
  CashboxApiResponse,
  CashboxDayApi,
  CashboxDaySummary,
  CashboxEntry,
  CashboxReport,
  CashboxReportEntry,
  CashboxTotals,
  CashboxTotalsApi,
} from "@/types/cashbox";
import type { TableType } from "@/types/table";

function toNumber(value: number | string | undefined): number {
  if (value === undefined) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function extractTotals(data: CashboxApiResponse): CashboxTotalsApi {
  return data.totals ?? data.summary ?? data;
}

export function mapCashboxTotals(source: CashboxTotalsApi): CashboxTotals {
  return {
    grandTotal: toNumber(
      source.grandTotal ?? source.totalRevenue ?? source.total,
    ),
    cashTotal: toNumber(source.cashTotal ?? source.cash),
    cardTotal: toNumber(source.cardTotal ?? source.card),
    gameTotal: toNumber(source.gameTotal ?? source.usageTotal),
    orderTotal: toNumber(source.orderTotal),
    accountCount: toNumber(
      source.accountCount ??
        source.sessionCount ??
        source.closedSessions ??
        source.closedSessionCount,
    ),
  };
}

function mapEntry(entry: CashboxEntry, index: number): CashboxReportEntry {
  const grandTotal = toNumber(
    entry.grandTotal ?? entry.total ?? entry.gameTotal,
  );
  const gameTotal = toNumber(entry.gameTotal);
  const orderTotal = toNumber(entry.orderTotal);

  return {
    id: String(entry.id ?? index),
    label: entry.deviceName ?? `Kayıt ${index + 1}`,
    sublabel: entry.paymentMethod,
    cashAmount: toNumber(entry.cashAmount),
    cardAmount: toNumber(entry.cardAmount),
    gameTotal,
    orderTotal,
    grandTotal: grandTotal || gameTotal + orderTotal,
    closedAt: entry.closedAt,
  };
}

function mapDay(day: CashboxDayApi): CashboxDaySummary {
  return {
    date: day.date,
    grandTotal: toNumber(day.grandTotal ?? day.totalRevenue),
    cashTotal: toNumber(day.cashTotal),
    cardTotal: toNumber(day.cardTotal),
    gameTotal: toNumber(day.gameTotal),
    orderTotal: toNumber(day.orderTotal),
    accountCount: toNumber(day.accountCount ?? day.sessionCount),
  };
}

export function mapCashboxResponse(
  data: CashboxApiResponse,
  label: string,
): CashboxReport {
  const rawEntries =
    data.entries ?? data.sessions ?? data.payments ?? data.items ?? [];

  return {
    label,
    date: data.date,
    startDate: data.startDate,
    endDate: data.endDate,
    totals: mapCashboxTotals(extractTotals(data)),
    entries: rawEntries.map(mapEntry),
    days: (data.days ?? []).map(mapDay),
  };
}

function formatDurationText(
  durationText?: string,
  elapsedText?: string,
  elapsedMinutes?: number,
): string {
  if (durationText) return durationText;
  if (elapsedText) return elapsedText;
  if (elapsedMinutes == null) return "—";
  const hours = Math.floor(elapsedMinutes / 60);
  const mins = elapsedMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function inferCashboxAccountDeviceType(
  item: Pick<CashboxAccountApi, "deviceType" | "type" | "psNo" | "psNumber" | "deviceName">,
): TableType {
  const raw = (item.deviceType ?? item.type ?? "").toUpperCase();
  if (raw === "PLAYSTATION") return "playstation";
  if (raw === "STEERING_WHEEL" || raw === "STEERING") return "steering";

  const label = (item.psNo ?? item.psNumber ?? item.deviceName ?? "").trim();
  const normalized = label.toLowerCase();

  if (
    normalized.includes("direksiyon") ||
    normalized.includes("steering") ||
    /^d\s?\d/.test(normalized)
  ) {
    return "steering";
  }

  return "playstation";
}

function mapAccount(item: CashboxAccountApi, index: number): CashboxAccount {
  const gameTotal = toNumber(item.gameTotal ?? item.usageTotal);
  const orderTotal = toNumber(item.orderTotal);
  const grandTotal = toNumber(item.grandTotal) || gameTotal + orderTotal;

  return {
    id: String(item.id ?? item.sessionId ?? index),
    sessionId: item.sessionId,
    psNo: item.psNo ?? item.psNumber ?? item.deviceName ?? `PS ${index + 1}`,
    deviceType: inferCashboxAccountDeviceType(item),
    startedAt: item.startedAt ?? null,
    endedAt: item.endedAt ?? item.closedAt ?? null,
    durationText: formatDurationText(
      item.durationText,
      item.elapsedText,
      item.elapsedMinutes,
    ),
    controllerCount: toNumber(item.controllerCount) || 1,
    gameTotal,
    orderTotal,
    grandTotal,
    cashTotal: toNumber(item.cashTotal ?? item.cashAmount),
    cardTotal: toNumber(item.cardTotal ?? item.cardAmount),
  };
}

export function mapCashboxAccountsResponse(
  data: CashboxAccountsApiResponse,
): CashboxAccount[] {
  const raw = Array.isArray(data)
    ? data
    : (data.accounts ?? data.items ?? []);

  return raw.map(mapAccount);
}

function mapDetailOrder(order: CashboxAccountDetailOrderApi, index: number) {
  const total = toNumber(order.total ?? order.lineTotal);
  const unitPrice = toNumber(order.unitPrice);

  return {
    id: order.id,
    name: order.name ?? order.productName ?? `Ürün ${index + 1}`,
    quantity: order.quantity,
    unitPrice: unitPrice || (order.quantity > 0 ? total / order.quantity : 0),
    total,
  };
}

export function mapCashboxAccountDetail(
  data: CashboxAccountDetailResponse,
): CashboxAccountDetail {
  const usage = data.usage ?? {};
  const gameTotal = toNumber(data.gameTotal ?? usage.gameTotal);
  const orderTotal = toNumber(data.orderTotal);
  const grandTotal = toNumber(data.grandTotal) || gameTotal + orderTotal;

  return {
    sessionId: data.sessionId,
    deviceName: data.deviceName ?? data.psNo ?? "Masa",
    psNo: data.psNo ?? data.deviceName ?? "—",
    tariffName: data.tariffName ?? "—",
    startedAt: data.startedAt ?? usage.startedAt ?? null,
    endedAt: data.endedAt ?? data.closedAt ?? usage.endedAt ?? usage.closedAt ?? null,
    elapsedText: formatDurationText(
      usage.durationText,
      usage.elapsedText,
      usage.elapsedMinutes,
    ),
    controllerCount: toNumber(usage.controllerCount) || 1,
    controllerMultiplier: toNumber(usage.controllerMultiplier) || 1,
    baseUsageTotal: toNumber(usage.baseUsageTotal) || gameTotal,
    gameTotal,
    orderTotal,
    grandTotal,
    cashTotal: toNumber(data.cashTotal),
    cardTotal: toNumber(data.cardTotal),
    orders: (data.orders ?? []).map(mapDetailOrder),
    controllerChanges:
      data.controllerChanges ?? usage.controllerChanges ?? [],
  };
}
