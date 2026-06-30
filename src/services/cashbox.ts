import { api } from "@/lib/api";
import type { CashboxRangeQueryParams } from "@/lib/cashboxTimeFilter";
import type {
  CashboxAccountsApiResponse,
  CashboxAccountDetailResponse,
  CashboxApiResponse,
  UpdateCashboxAccountPayload,
} from "@/types/cashbox";

export async function fetchCashboxToday(): Promise<CashboxApiResponse> {
  const { data } = await api.get<CashboxApiResponse>("/cashbox/today");
  return data;
}

export async function fetchCashboxByDate(
  range: CashboxRangeQueryParams,
): Promise<CashboxApiResponse> {
  const { data } = await api.get<CashboxApiResponse>("/cashbox/date", {
    params: { start: range.start, end: range.end },
  });
  return data;
}

export async function fetchCashboxRange(
  range: CashboxRangeQueryParams,
): Promise<CashboxApiResponse> {
  const { data } = await api.get<CashboxApiResponse>("/cashbox/range", {
    params: { start: range.start, end: range.end },
  });
  return data;
}

export async function fetchCashboxAccounts(
  range: CashboxRangeQueryParams,
): Promise<CashboxAccountsApiResponse> {
  const { data } = await api.get<CashboxAccountsApiResponse>(
    "/cashbox/accounts",
    { params: { start: range.start, end: range.end } },
  );
  return data;
}

export async function fetchCashboxAccountDetail(
  sessionId: number,
): Promise<CashboxAccountDetailResponse> {
  const { data } = await api.get<CashboxAccountDetailResponse>(
    `/cashbox/accounts/${sessionId}`,
  );
  return data;
}

export async function updateCashboxAccount(
  sessionId: number,
  payload: UpdateCashboxAccountPayload,
) {
  const { data } = await api.patch(`/cashbox/accounts/${sessionId}`, payload);
  return data;
}
