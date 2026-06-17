import type { OpenTableFormState } from "@/types/openTable";
import type { OpenSessionPayload } from "@/types/session";
import type { Table } from "@/types/table";

export function toTimeLimitMinutes(form: OpenTableFormState): number {
  if (form.timeLimitUnit === "hour") {
    return form.timeLimitValue * 60;
  }
  return form.timeLimitValue;
}

export function buildOpenSessionPayload(
  table: Table,
  form: OpenTableFormState,
): OpenSessionPayload {
  const priceLimit = Number(form.amountLimit.replace(",", "."));

  return {
    deviceId: table.deviceId,
    tariffId: form.tariffId,
    controllerCount: table.type === "steering" ? 1 : form.controllerCount,
    startedAt: new Date(form.openingTime).toISOString(),
    hasTimeLimit: form.timeLimitEnabled,
    timeLimitMin: form.timeLimitEnabled ? toTimeLimitMinutes(form) : null,
    hasPriceLimit: form.amountLimitEnabled,
    priceLimit:
      form.amountLimitEnabled && !Number.isNaN(priceLimit) ? priceLimit : null,
    warnBeforeMinutes: form.warnBeforeTimeEnd ? 10 : null,
    warnAtPricePercent: form.warnAt90Percent ? 90 : null,
    note: form.note.trim(),
  };
}
