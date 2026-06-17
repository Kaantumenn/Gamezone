import { api } from "@/lib/api";
import type {
  CashboxAccountsApiResponse,
  CashboxAccountDetailResponse,
  CashboxApiResponse,
} from "@/types/cashbox";

export async function fetchCashboxToday(): Promise<CashboxApiResponse> {
  const { data } = await api.get<CashboxApiResponse>("/cashbox/today");
  return data;
}

export async function fetchCashboxByDate(
  date: string,
): Promise<CashboxApiResponse> {
  const { data } = await api.get<CashboxApiResponse>("/cashbox/date", {
    params: { date },
  });
  return data;
}

export async function fetchCashboxRange(
  startDate: string,
  endDate: string,
): Promise<CashboxApiResponse> {
  const { data } = await api.get<CashboxApiResponse>("/cashbox/range", {
    params: { startDate, endDate },
  });
  return data;
}

export async function fetchCashboxAccounts(
  date: string,
): Promise<CashboxAccountsApiResponse> {
  const { data } = await api.get<CashboxAccountsApiResponse>(
    "/cashbox/accounts",
    { params: { date } },
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
