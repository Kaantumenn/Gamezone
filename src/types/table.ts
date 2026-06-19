export type TableType = "playstation" | "steering";

export interface Table {
  id: string;
  deviceId: number;
  name: string;
  type: TableType;
  isOpen: boolean;
  sessionId: number | null;
  startedAt: string | null;
  elapsedText: string;
  elapsedMinutes: number;
  tariffName: string | null;
  tariffId: number | null;
  controllerCount: number | null;
  timeLimitMin: number | null;
  priceLimit: number | null;
  gameTotal: number;
  orderTotal: number;
  grandTotal: number;
}
