import type { TariffFormValues, TariffPayload } from "@/types/tariff";

export function buildTariffPayload(values: TariffFormValues): TariffPayload {
  return {
    name: values.name.trim(),
    deviceType: values.deviceType,
    openingMinutes: Number(values.openingMinutes),
    openingPrice: Number(values.openingPrice),
    pricePerMinute: Number(values.pricePerMinute),
    extraControllerFee: Number(values.extraControllerFee || 0),
    isActive: values.isActive,
  };
}
