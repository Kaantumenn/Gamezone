import type {
  SessionCheckout,
  SessionCheckoutOrder,
  SessionCheckoutResponse,
  SessionUsageSegment,
} from "@/types/checkout";

function toNumber(value: number | string | undefined): number {
  if (value === undefined) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapUsageSegment(segment: SessionUsageSegment): SessionUsageSegment {
  return {
    ...segment,
    minutes: toNumber(segment.minutes),
    controllerCount: toNumber(segment.controllerCount),
    multiplier: toNumber(segment.multiplier) || 1,
    unitPrice: toNumber(segment.unitPrice),
    amount: toNumber(segment.amount),
    amountUntilThisPoint: toNumber(segment.amountUntilThisPoint),
  };
}

function mapOrder(order: SessionCheckoutOrder) {
  const total = toNumber(order.total ?? order.lineTotal);
  const unitPrice = toNumber(order.unitPrice);

  return {
    id: order.id ?? order.orderItemId,
    name: order.name ?? order.productName ?? "Ürün",
    quantity: order.quantity,
    unitPrice: unitPrice || (order.quantity > 0 ? total / order.quantity : 0),
    total,
  };
}

export function mapCheckoutResponse(
  data: SessionCheckoutResponse,
): SessionCheckout {
  const usageSegments = (data.usage?.usageSegments ?? []).map(mapUsageSegment);

  return {
    sessionId: data.sessionId,
    deviceId: data.deviceId,
    deviceName: data.deviceName,
    usage: {
      ...data.usage,
      controllerMultiplier: toNumber(data.usage.controllerMultiplier) || 1,
      openingPrice: toNumber(data.usage.openingPrice),
      pricePerMinute: toNumber(data.usage.pricePerMinute),
      baseUsageTotal: toNumber(
        data.usage.baseUsageTotal ?? data.usage.gameTotal,
      ),
      gameTotal: toNumber(data.usage.gameTotal),
      usageSegments,
    },
    tariffName: data.tariffName,
    gameTotal: toNumber(data.gameTotal),
    orderTotal: toNumber(data.orderTotal),
    grandTotal: toNumber(data.grandTotal),
    orders: (data.orders ?? []).map(mapOrder),
    usageSegments,
    controllerChanges:
      data.usage?.controllerChanges ?? data.controllerChanges ?? [],
  };
}
