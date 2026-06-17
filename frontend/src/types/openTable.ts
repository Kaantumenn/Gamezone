import { formatDateTime, toDateTimeLocalValue } from "@/lib/format";

export type ControllerCount = 1 | 2 | 3 | 4;
export type TimeLimitUnit = "minute" | "hour";
export type TimeLimitPreset =
  | "30dk"
  | "1saat"
  | "2saat"
  | "3saat"
  | "sinirsiz"
  | null;

export interface OpenTableFormState {
  controllerCount: ControllerCount;
  openingTime: string;
  tariffId: number;
  timeLimitEnabled: boolean;
  timeLimitValue: number;
  timeLimitUnit: TimeLimitUnit;
  timeLimitPreset: TimeLimitPreset;
  amountLimitEnabled: boolean;
  amountLimit: string;
  warnBeforeTimeEnd: boolean;
  warnAt90Percent: boolean;
  note: string;
}

export { formatDateTime };

export function getDefaultFormState(tariffId = 1): OpenTableFormState {
  return {
    controllerCount: 2,
    openingTime: toDateTimeLocalValue(new Date()),
    tariffId,
    timeLimitEnabled: false,
    timeLimitValue: 2,
    timeLimitUnit: "hour",
    timeLimitPreset: null,
    amountLimitEnabled: false,
    amountLimit: "200",
    warnBeforeTimeEnd: false,
    warnAt90Percent: false,
    note: "",
  };
}
