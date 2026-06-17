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

export interface SessionControllerChangePayload {
  controllerCount: number;
  effectiveAt: string;
}

export interface SessionControllerChange {
  id: number;
  sessionId: number;
  controllerCount: number;
  effectiveAt: string;
  createdAt?: string;
}
