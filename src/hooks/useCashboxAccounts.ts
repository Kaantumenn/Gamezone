import { useQuery } from "@tanstack/react-query";
import { getDateRangeDays } from "@/lib/format";
import { mapCashboxAccountsResponse } from "@/lib/mapCashbox";
import { fetchCashboxAccounts } from "@/services/cashbox";
import type { CashboxViewMode } from "@/types/cashbox";

interface UseCashboxAccountsParams {
  mode: CashboxViewMode;
  today: string;
  selectedDate: string;
  startDate: string;
  endDate: string;
}

export function useCashboxAccounts({
  mode,
  today,
  selectedDate,
  startDate,
  endDate,
}: UseCashboxAccountsParams) {
  return useQuery({
    queryKey: ["cashbox-accounts", mode, today, selectedDate, startDate, endDate],
    queryFn: async () => {
      const dates =
        mode === "today"
          ? [today]
          : mode === "date"
            ? [selectedDate]
            : getDateRangeDays(startDate, endDate);

      const responses = await Promise.all(
        dates.map((date) => fetchCashboxAccounts(date)),
      );

      return responses.flatMap(mapCashboxAccountsResponse);
    },
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}
