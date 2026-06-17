export type PaymentMethodType = "CASH" | "CARD";

export interface PaymentEntry {
  id: string;
  method: PaymentMethodType;
  amount: string;
}

export interface CloseOrderItem {
  name: string;
  quantity: number;
  total: number;
}

export interface CloseUsageLine {
  label: string;
  detail: string;
  amount: number;
}

export interface SessionClosePreview {
  sessionId: number;
  deviceName: string;
  tableLabel: string;
  startedAt: string;
  closedAt: string;
  durationText: string;
  tariffDescription: string;
  controllerCount: number;
  timeLimitText: string | null;
  priceLimit: number | null;
  usageLines: CloseUsageLine[];
  usageTotal: number;
  orders: CloseOrderItem[];
  orderTotal: number;
  grandTotal: number;
}

export interface CloseSessionBody {
  payments: { method: PaymentMethodType; amount: number }[];
  note?: string;
}

export const paymentMethodLabels: Record<PaymentMethodType, string> = {
  CASH: "Nakit",
  CARD: "Kart",
};

export const paymentMethodOptions: PaymentMethodType[] = ["CASH", "CARD"];
