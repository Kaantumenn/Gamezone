import type { SessionControllerChange } from "@/types/session";

export type UsageSegmentType = "OPENING" | "EXTRA" | string;

export interface SessionUsageSegment {
  type: UsageSegmentType;
  from: string;
  to: string;
  minutes: number;
  controllerCount: number;
  multiplier: number;
  unitPrice: number;
  amount: number;
  amountUntilThisPoint: number;
  description: string;
}

export interface SessionCheckoutUsage {
  startedAt: string;
  elapsedMinutes: number;
  elapsedText: string;
  controllerCount: number;
  controllerMultiplier?: number;
  openingMinutes: number;
  openingPrice: number;
  pricePerMinute: number;
  baseUsageTotal?: number;
  gameTotal: number;
  controllerChanges?: SessionControllerChange[];
  usageSegments?: SessionUsageSegment[];
}

export interface SessionCheckoutOrder {
  id?: number;
  orderItemId?: number;
  name?: string;
  productName?: string;
  quantity: number;
  total?: number | string;
  unitPrice?: number | string;
  lineTotal?: number | string;
}

export interface SessionCheckoutResponse {
  sessionId: number;
  deviceId: number;
  deviceName: string;
  usage: SessionCheckoutUsage;
  tariffName: string;
  gameTotal: number;
  orderTotal: number;
  grandTotal: number;
  orders: SessionCheckoutOrder[];
  controllerChanges?: SessionControllerChange[];
}

export interface SessionCheckoutOrderItem {
  id?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SessionCheckout {
  sessionId: number;
  deviceId: number;
  deviceName: string;
  usage: SessionCheckoutUsage;
  tariffName: string;
  gameTotal: number;
  orderTotal: number;
  grandTotal: number;
  orders: SessionCheckoutOrderItem[];
  usageSegments: SessionUsageSegment[];
  controllerChanges: SessionControllerChange[];
}
