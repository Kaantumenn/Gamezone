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
import { formatDeviceDisplayName } from "@/lib/format";
import {
  getCashboxDeviceBadgeLabel,
  mapApiDeviceType,
} from "@/lib/cashboxDevice";

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
  const mergedUsageTotal = toNumber(entry.mergedUsageTotal);
  const deviceType =
    mapApiDeviceType(entry.deviceType) ??
    inferCashboxAccountDeviceType({
      deviceType: entry.deviceType,
      deviceName: entry.deviceName,
    });

  return {
    id: String(entry.id ?? index),
    label: formatDeviceDisplayName(entry.deviceName ?? `Kayıt ${index + 1}`),
    sublabel: getCashboxDeviceBadgeLabel(deviceType, mergedUsageTotal),
    deviceType,
    mergedUsageTotal,
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
  const fromApi =
    mapApiDeviceType(item.deviceType) ?? mapApiDeviceType(item.type);
  if (fromApi) return fromApi;

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

function mapRemainingTotal(
  item: Pick<
    CashboxAccountApi,
    "remainingTotal" | "grandTotal" | "cashTotal" | "cashAmount" | "cardTotal" | "cardAmount"
  >,
  grandTotal: number,
  cashTotal: number,
  cardTotal: number,
): number {
  if (item.remainingTotal !== undefined && item.remainingTotal !== null) {
    return Math.max(0, toNumber(item.remainingTotal));
  }

  return Math.max(0, grandTotal - cashTotal - cardTotal);
}

function mapAccount(item: CashboxAccountApi, index: number): CashboxAccount {
  const gameTotal = toNumber(item.gameTotal ?? item.usageTotal);
  const orderTotal = toNumber(item.orderTotal);
  const grandTotal = toNumber(item.grandTotal) || gameTotal + orderTotal;
  const cashTotal = toNumber(item.cashTotal ?? item.cashAmount);
  const cardTotal = toNumber(item.cardTotal ?? item.cardAmount);
  const rawPsNo = item.psNo ?? item.psNumber ?? item.deviceName ?? `PS ${index + 1}`;
  const deviceType = inferCashboxAccountDeviceType(item);
  const mergedUsageTotal = toNumber(item.mergedUsageTotal);

  return {
    id: String(item.id ?? item.sessionId ?? index),
    sessionId: item.sessionId,
    psNo: formatDeviceDisplayName(rawPsNo),
    deviceType,
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
    cashTotal,
    cardTotal,
    remainingTotal: mapRemainingTotal(item, grandTotal, cashTotal, cardTotal),
    mergedUsageTotal,
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
    id: order.id ?? order.orderItemId,
    name: order.name ?? order.productName ?? `Ürün ${index + 1}`,
    quantity: order.quantity,
    unitPrice: unitPrice || (order.quantity > 0 ? total / order.quantity : 0),
    total,
  };
}

function sumPaymentsByMethod(
  payments: CashboxAccountDetailResponse["payments"],
  method: string,
): number {
  return (payments ?? [])
    .filter((payment) => payment.method === method)
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
}

export function mapCashboxAccountDetail(
  data: CashboxAccountDetailResponse,
): CashboxAccountDetail {
  const usage = data.usage ?? {};
  const totals = data.totals ?? {};
  const device = data.device;
  const tariff = data.tariff;

  const gameTotal = toNumber(
    totals.gameTotal ?? data.gameTotal ?? usage.gameTotal,
  );
  const orderTotal = toNumber(totals.orderTotal ?? data.orderTotal);
  const bonusTotal = toNumber(totals.bonusTotal ?? data.bonusTotal);
  const mergedUsageTotal = toNumber(
    totals.mergedUsageTotal ?? data.mergedUsageTotal,
  );
  const grandTotal =
    toNumber(totals.grandTotal ?? data.grandTotal) ||
    gameTotal + orderTotal + bonusTotal + mergedUsageTotal;
  const cashTotal =
    toNumber(totals.cashTotal ?? data.cashTotal) ||
    sumPaymentsByMethod(data.payments, "CASH");
  const cardTotal =
    toNumber(totals.cardTotal ?? data.cardTotal) ||
    sumPaymentsByMethod(data.payments, "CARD");

  const rawDeviceName =
    device?.name ?? data.deviceName ?? data.psNo ?? "Masa";
  const rawPsNo = data.psNo ?? device?.name ?? data.deviceName ?? "—";

  return {
    sessionId: data.sessionId,
    deviceName: formatDeviceDisplayName(rawDeviceName),
    psNo: formatDeviceDisplayName(rawPsNo),
    tariffName: tariff?.name ?? data.tariffName ?? "—",
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
    bonusTotal,
    mergedUsageTotal,
    grandTotal,
    cashTotal,
    cardTotal,
    remainingTotal: mapRemainingTotal(
      {
        remainingTotal: totals.remainingTotal ?? data.remainingTotal,
      },
      grandTotal,
      cashTotal,
      cardTotal,
    ),
    note: data.note ?? null,
    orders: (data.orders ?? []).map(mapDetailOrder),
    controllerChanges:
      data.controllerChanges ?? usage.controllerChanges ?? [],
  };
}
