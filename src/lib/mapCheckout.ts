import type {
  SessionCheckout,
  SessionCheckoutOrder,
  SessionCheckoutResponse,
  SessionMergedSession,
  SessionMergedSessionApi,
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

function mapMergedSession(
  session: SessionMergedSessionApi,
): SessionMergedSession {
  return {
    id: session.id,
    sourceSessionId: session.sourceSessionId,
    targetSessionId: session.targetSessionId,
    sourceDeviceName: session.sourceDeviceName,
    targetDeviceName: session.targetDeviceName,
    sourceGameTotal: toNumber(session.sourceGameTotal),
    sourceOrderTotal: toNumber(session.sourceOrderTotal),
    sourceGrandTotal: toNumber(session.sourceGrandTotal),
    mergedAt: session.mergedAt,
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
      mergedUsageTotal: toNumber(
        data.usage.mergedUsageTotal ?? data.mergedUsageTotal,
      ),
      usageSegments,
    },
    tariffName: data.tariffName,
    gameTotal: toNumber(data.gameTotal),
    mergedUsageTotal: toNumber(
      data.mergedUsageTotal ?? data.usage?.mergedUsageTotal,
    ),
    orderTotal: toNumber(data.orderTotal),
    bonusTotal: toNumber(data.bonusTotal),
    grandTotal: toNumber(data.grandTotal),
    orders: (data.orders ?? []).map(mapOrder),
    mergedSessions: (data.mergedSessions ?? []).map(mapMergedSession),
    usageSegments,
    controllerChanges:
      data.usage?.controllerChanges ?? data.controllerChanges ?? [],
  };
}
