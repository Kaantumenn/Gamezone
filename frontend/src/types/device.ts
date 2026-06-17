export type DeviceType = "PLAYSTATION" | "STEERING_WHEEL";

export interface Device {
  id: number;
  name: string;
  type: DeviceType;
  isOpen: boolean;
  sessionId: number | null;
  startedAt: string | null;
  elapsedMinutes: number;
  elapsedText: string;
  tariffId: number | null;
  tariffName: string | null;
  controllerCount: number | null;
  timeLimitMin: number | null;
  priceLimit: number | null;
  gameTotal: number;
  orderTotal: number;
  grandTotal: number;
}

export interface DevicesResponse {
  playstations: Device[];
  steeringWheels: Device[];
}
