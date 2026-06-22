import type { Device } from "@/types/device";
import type { Table } from "@/types/table";
import { formatDeviceDisplayName } from "@/lib/format";

export function mapDeviceToTable(device: Device): Table {
  return {
    id: String(device.id),
    deviceId: device.id,
    name: formatDeviceDisplayName(device.name),
    type: device.type === "PLAYSTATION" ? "playstation" : "steering",
    isOpen: device.isOpen,
    sessionId: device.sessionId,
    startedAt: device.startedAt,
    elapsedText: device.elapsedText,
    elapsedMinutes: device.elapsedMinutes,
    tariffName: device.tariffName,
    tariffId: device.tariffId,
    controllerCount: device.controllerCount,
    timeLimitMin: device.timeLimitMin,
    priceLimit: device.priceLimit,
    gameTotal: device.gameTotal,
    orderTotal: device.orderTotal,
    grandTotal: device.grandTotal,
  };
}

export function findTableByDeviceId(
  devices: { playstations: Device[]; steeringWheels: Device[] } | undefined,
  deviceId: number,
): Table | null {
  if (!devices) return null;

  const device =
    devices.playstations.find((d) => d.id === deviceId) ??
    devices.steeringWheels.find((d) => d.id === deviceId);

  return device ? mapDeviceToTable(device) : null;
}
