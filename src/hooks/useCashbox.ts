import { useQuery } from "@tanstack/react-query";
import type { CashboxRangeQueryParams } from "@/lib/cashboxTimeFilter";
import { mapCashboxResponse } from "@/lib/mapCashbox";
import {
  fetchCashboxByDate,
  fetchCashboxRange,
  fetchCashboxToday,
} from "@/services/cashbox";
import type { CashboxViewMode } from "@/types/cashbox";

interface UseCashboxParams {
  mode: CashboxViewMode;
  date?: string;
  startDate?: string;
  endDate?: string;
  range?: CashboxRangeQueryParams | null;
}

function getQueryLabel(mode: CashboxViewMode, date?: string, startDate?: string, endDate?: string) {
  if (mode === "today") return "Bugünkü Kasa";
  if (mode === "date" && date) return date;
  if (mode === "range" && startDate && endDate) {
    return `${startDate} — ${endDate}`;
  }
  return "Kasa";
}

export function useCashbox({
  mode,
  date,
  startDate,
  endDate,
  range,
}: UseCashboxParams) {
  const enabled =
    mode === "today" ||
    (mode === "date" && !!range) ||
    (mode === "range" && !!range);

  return useQuery({
    queryKey: ["cashbox", mode, date, startDate, endDate, range],
    queryFn: async () => {
      let data;
      if (mode === "today") {
        data = range
          ? await fetchCashboxByDate(range)
          : await fetchCashboxToday();
      } else if (mode === "date") {
        data = await fetchCashboxByDate(range!);
      } else {
        data = await fetchCashboxRange(range!);
      }

      return mapCashboxResponse(
        data,
        getQueryLabel(mode, date, startDate, endDate),
      );
    },
    enabled,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}
