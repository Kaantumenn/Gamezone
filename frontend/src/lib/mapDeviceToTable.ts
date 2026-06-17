import type { Device } from "@/types/device";
import type { Table } from "@/types/table";

function formatDeviceName(device: Device): string {
  if (device.type === "PLAYSTATION") {
    return device.name.replace(/PS(\d+)/i, "PS $1");
  }

  const match = device.name.match(/(\d+)/);
  return match ? `D${match[1]}` : device.name;
}

export function mapDeviceToTable(device: Device): Table {
  return {
    id: String(device.id),
    deviceId: device.id,
    name: formatDeviceName(device),
    type: device.type === "PLAYSTATION" ? "playstation" : "steering",
    isOpen: device.isOpen,
    sessionId: device.sessionId,
    startedAt: device.startedAt,
    elapsedText: device.elapsedText,
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
