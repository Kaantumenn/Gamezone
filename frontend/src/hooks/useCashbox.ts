import { useQuery } from "@tanstack/react-query";
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
}: UseCashboxParams) {
  const enabled =
    mode === "today" ||
    (mode === "date" && !!date) ||
    (mode === "range" && !!startDate && !!endDate);

  return useQuery({
    queryKey: ["cashbox", mode, date, startDate, endDate],
    queryFn: async () => {
      let data;
      if (mode === "today") {
        data = await fetchCashboxToday();
      } else if (mode === "date") {
        data = await fetchCashboxByDate(date!);
      } else {
        data = await fetchCashboxRange(startDate!, endDate!);
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
