import { useQuery } from "@tanstack/react-query";
import type { CashboxRangeQueryParams } from "@/lib/cashboxTimeFilter";
import { mapCashboxAccountsResponse } from "@/lib/mapCashbox";
import {
  fetchCashboxAccounts,
  fetchCashboxByDate,
  fetchCashboxRange,
  fetchCashboxToday,
} from "@/services/cashbox";
import type {
  CashboxAccountApi,
  CashboxApiResponse,
  CashboxViewMode,
} from "@/types/cashbox";

interface UseCashboxAccountsParams {
  mode: CashboxViewMode;
  range?: CashboxRangeQueryParams | null;
}

function extractAccountsFromCashboxResponse(data: CashboxApiResponse) {
  if (data.accounts?.length) {
    return mapCashboxAccountsResponse({ accounts: data.accounts });
  }

  const items = data.items;
  if (Array.isArray(items) && items.length > 0) {
    const first = items[0] as CashboxAccountApi | CashboxEntryLike;
    if ("sessionId" in first || "startedAt" in first || "psNo" in first) {
      return mapCashboxAccountsResponse({ items: items as CashboxAccountApi[] });
    }
  }

  return [];
}

type CashboxEntryLike = { deviceName?: string };

export function useCashboxAccounts({
  mode,
  range,
}: UseCashboxAccountsParams) {
  return useQuery({
    queryKey: ["cashbox-accounts", mode, range],
    queryFn: async () => {
      if (mode === "range" && range) {
        const data = await fetchCashboxRange(range);
        const fromRange = extractAccountsFromCashboxResponse(data);
        if (fromRange.length > 0) return fromRange;

        return mapCashboxAccountsResponse(await fetchCashboxAccounts(range));
      }

      if (mode === "today" && !range) {
        const data = await fetchCashboxToday();
        const fromToday = extractAccountsFromCashboxResponse(data);
        if (fromToday.length > 0) return fromToday;
      }

      if (!range) return [];

      const data = await fetchCashboxByDate(range);
      const fromDate = extractAccountsFromCashboxResponse(data);
      if (fromDate.length > 0) return fromDate;

      return mapCashboxAccountsResponse(await fetchCashboxAccounts(range));
    },
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}
