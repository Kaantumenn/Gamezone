export interface OpenSessionPayload {
  deviceId: number;
  tariffId: number;
  controllerCount: number;
  startedAt: string;
  hasTimeLimit: boolean;
  timeLimitMin: number | null;
  hasPriceLimit: boolean;
  priceLimit: number | null;
  warnBeforeMinutes: number | null;
  warnAtPricePercent: number | null;
  note: string;
}

export interface UpdateSessionPayload {
  controllerCount?: number;
  startedAt?: string;
}

export interface UpdateSessionStartTimePayload {
  startedAt: string;
}

export interface UpdateSessionTimeLimitPayload {
  timeLimitMin: number | null;
}

export interface SessionControllerChangePayload {
  controllerCount: number;
  effectiveAt: string;
}

export interface SessionBonusPayload {
  amount: number;
}

export interface SessionControllerChange {
  id: number;
  sessionId: number;
  controllerCount: number;
  effectiveAt: string;
  createdAt?: string;
}

export interface MergeSessionPayload {
  targetSessionId: number;
}

export interface MergeSessionResponse {
  id: number;
  deviceName: string;
  status: string;
  orderTotal: number;
  grandTotal: number;
}

export interface TransferSessionPayload {
  targetDeviceId: number;
}

export interface TransferSessionResponse {
  id: number;
  deviceId: number;
  deviceName?: string;
  status?: string;
  orderTotal?: number;
  grandTotal?: number;
}

export interface SwitchSessionDevicesPayload {
  firstSessionId: number;
  secondSessionId: number;
}
