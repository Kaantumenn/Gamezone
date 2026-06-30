import type { TableType } from "@/types/table";
import type { SessionControllerChange } from "@/types/session";

export interface CashboxEntry {
  id?: number | string;
  deviceName?: string;
  deviceType?: string;
  closedAt?: string;
  paymentMethod?: string;
  cashAmount?: number | string;
  cardAmount?: number | string;
  gameTotal?: number | string;
  orderTotal?: number | string;
  mergedUsageTotal?: number | string;
  grandTotal?: number | string;
  total?: number | string;
}

export interface CashboxTotalsApi {
  grandTotal?: number | string;
  totalRevenue?: number | string;
  total?: number | string;
  cashTotal?: number | string;
  cash?: number | string;
  cardTotal?: number | string;
  card?: number | string;
  gameTotal?: number | string;
  usageTotal?: number | string;
  orderTotal?: number | string;
  accountCount?: number | string;
  sessionCount?: number | string;
  closedSessions?: number | string;
  closedSessionCount?: number | string;
}

export interface CashboxDayApi {
  date: string;
  grandTotal?: number | string;
  totalRevenue?: number | string;
  cashTotal?: number | string;
  cardTotal?: number | string;
  gameTotal?: number | string;
  orderTotal?: number | string;
  accountCount?: number | string;
  sessionCount?: number | string;
}

export interface CashboxApiResponse {
  date?: string;
  startDate?: string;
  endDate?: string;
  totals?: CashboxTotalsApi;
  summary?: CashboxTotalsApi;
  grandTotal?: number | string;
  totalRevenue?: number | string;
  cashTotal?: number | string;
  cardTotal?: number | string;
  gameTotal?: number | string;
  orderTotal?: number | string;
  accountCount?: number | string;
  sessionCount?: number | string;
  closedSessions?: number | string;
  entries?: CashboxEntry[];
  sessions?: CashboxEntry[];
  payments?: CashboxEntry[];
  items?: CashboxEntry[];
  days?: CashboxDayApi[];
  accounts?: CashboxAccountApi[];
}

export interface CashboxTotals {
  grandTotal: number;
  cashTotal: number;
  cardTotal: number;
  gameTotal: number;
  orderTotal: number;
  accountCount: number;
}

export interface CashboxReportEntry {
  id: string;
  label: string;
  sublabel?: string;
  deviceType: TableType;
  mergedUsageTotal: number;
  cashAmount: number;
  cardAmount: number;
  gameTotal: number;
  orderTotal: number;
  grandTotal: number;
  closedAt?: string;
}

export interface CashboxDaySummary {
  date: string;
  grandTotal: number;
  cashTotal: number;
  cardTotal: number;
  gameTotal: number;
  orderTotal: number;
  accountCount: number;
}

export interface CashboxReport {
  label: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  totals: CashboxTotals;
  entries: CashboxReportEntry[];
  days: CashboxDaySummary[];
}

export type CashboxViewMode = "today" | "date" | "range";

export interface CashboxAccountApi {
  id?: number;
  sessionId?: number;
  deviceId?: number;
  deviceName?: string;
  deviceType?: string;
  type?: string;
  psNo?: string;
  psNumber?: string;
  startedAt?: string;
  endedAt?: string;
  closedAt?: string;
  durationText?: string;
  elapsedText?: string;
  elapsedMinutes?: number;
  controllerCount?: number;
  gameTotal?: number | string;
  usageTotal?: number | string;
  orderTotal?: number | string;
  grandTotal?: number | string;
  cashTotal?: number | string;
  cashAmount?: number | string;
  cardTotal?: number | string;
  cardAmount?: number | string;
  remainingTotal?: number | string;
  mergedUsageTotal?: number | string;
}

export type CashboxAccountsApiResponse =
  | CashboxAccountApi[]
  | { accounts?: CashboxAccountApi[]; items?: CashboxAccountApi[] };

export interface CashboxAccount {
  id: string;
  sessionId?: number;
  psNo: string;
  deviceType: TableType;
  startedAt: string | null;
  endedAt: string | null;
  durationText: string;
  controllerCount: number;
  gameTotal: number;
  orderTotal: number;
  grandTotal: number;
  cashTotal: number;
  cardTotal: number;
  remainingTotal: number;
  mergedUsageTotal: number;
}

export interface CashboxAccountDetailOrderApi {
  id?: number;
  orderItemId?: number;
  name?: string;
  productName?: string;
  quantity: number;
  total?: number | string;
  lineTotal?: number | string;
  unitPrice?: number | string;
}

export interface CashboxAccountDetailDeviceApi {
  id?: number;
  name?: string;
  type?: string;
}

export interface CashboxAccountDetailPaymentApi {
  id?: number;
  method: string;
  amount: number | string;
  note?: string | null;
  createdAt?: string;
}

export interface CashboxAccountDetailTariffApi {
  id?: number;
  name?: string;
}

export interface CashboxAccountDetailTotalsApi {
  gameTotal?: number | string;
  orderTotal?: number | string;
  bonusTotal?: number | string;
  mergedUsageTotal?: number | string;
  grandTotal?: number | string;
  cashTotal?: number | string;
  cardTotal?: number | string;
  remainingTotal?: number | string;
}

export interface CashboxAccountDetailUsageApi {
  startedAt?: string;
  endedAt?: string;
  closedAt?: string;
  elapsedMinutes?: number;
  elapsedText?: string;
  durationText?: string;
  controllerCount?: number;
  controllerMultiplier?: number;
  baseUsageTotal?: number | string;
  gameTotal?: number | string;
  openingMinutes?: number;
  openingPrice?: number | string;
  pricePerMinute?: number | string;
  controllerChanges?: SessionControllerChange[];
}

export interface CashboxAccountDetailResponse {
  sessionId: number;
  status?: string;
  deviceId?: number;
  deviceName?: string;
  device?: CashboxAccountDetailDeviceApi;
  psNo?: string;
  startedAt?: string;
  endedAt?: string;
  closedAt?: string;
  tariffName?: string;
  tariff?: CashboxAccountDetailTariffApi;
  usage?: CashboxAccountDetailUsageApi;
  totals?: CashboxAccountDetailTotalsApi;
  gameTotal?: number | string;
  orderTotal?: number | string;
  bonusTotal?: number | string;
  mergedUsageTotal?: number | string;
  grandTotal?: number | string;
  cashTotal?: number | string;
  cardTotal?: number | string;
  remainingTotal?: number | string;
  note?: string | null;
  orders?: CashboxAccountDetailOrderApi[];
  payments?: CashboxAccountDetailPaymentApi[];
  controllerChanges?: SessionControllerChange[];
}

export interface CashboxAccountDetailOrder {
  id?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CashboxAccountDetail {
  sessionId: number;
  deviceName: string;
  psNo: string;
  tariffName: string;
  startedAt: string | null;
  endedAt: string | null;
  elapsedText: string;
  controllerCount: number;
  controllerMultiplier: number;
  baseUsageTotal: number;
  gameTotal: number;
  orderTotal: number;
  bonusTotal: number;
  mergedUsageTotal: number;
  grandTotal: number;
  cashTotal: number;
  cardTotal: number;
  remainingTotal: number;
  note: string | null;
  orders: CashboxAccountDetailOrder[];
  controllerChanges: SessionControllerChange[];
}

export interface UpdateCashboxAccountPaymentPayload {
  method: "CASH" | "CARD";
  amount: number;
  note?: string | null;
}

export interface UpdateCashboxAccountPayload {
  gameTotal?: number;
  orderTotal?: number;
  bonusTotal?: number;
  mergedUsageTotal?: number;
  grandTotal?: number;
  note?: string | null;
  payments?: UpdateCashboxAccountPaymentPayload[];
}
