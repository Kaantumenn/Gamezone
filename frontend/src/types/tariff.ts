export type TariffDeviceType = "PLAYSTATION" | "STEERING_WHEEL";

export interface Tariff {
  id: number;
  name: string;
  deviceType: TariffDeviceType;
  openingMinutes: number;
  openingPrice: string;
  pricePerMinute: string;
  extraControllerFee: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TariffFormValues {
  name: string;
  deviceType: TariffDeviceType;
  openingMinutes: string;
  openingPrice: string;
  pricePerMinute: string;
  extraControllerFee: string;
  isActive: boolean;
}

export interface TariffPayload {
  name: string;
  deviceType: TariffDeviceType;
  openingMinutes: number;
  openingPrice: number;
  pricePerMinute: number;
  extraControllerFee: number;
  isActive?: boolean;
}

export function getEmptyTariffForm(
  deviceType: TariffDeviceType = "PLAYSTATION",
): TariffFormValues {
  return {
    name: "",
    deviceType,
    openingMinutes: "60",
    openingPrice: "100",
    pricePerMinute: "2",
    extraControllerFee: "0",
    isActive: true,
  };
}

export function tariffToFormValues(tariff: Tariff): TariffFormValues {
  return {
    name: tariff.name,
    deviceType: tariff.deviceType,
    openingMinutes: String(tariff.openingMinutes),
    openingPrice: String(tariff.openingPrice),
    pricePerMinute: String(tariff.pricePerMinute),
    extraControllerFee: String(tariff.extraControllerFee),
    isActive: tariff.isActive,
  };
}

export function getTariffDeviceLabel(deviceType: TariffDeviceType): string {
  return deviceType === "PLAYSTATION" ? "PlayStation" : "Direksiyon";
}
