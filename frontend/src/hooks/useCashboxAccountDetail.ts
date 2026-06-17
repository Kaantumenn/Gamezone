import { useQuery } from "@tanstack/react-query";
import { mapCashboxAccountDetail } from "@/lib/mapCashbox";
import { fetchCashboxAccountDetail } from "@/services/cashbox";

export function useCashboxAccountDetail(
  sessionId: number | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["cashbox-account-detail", sessionId],
    queryFn: async () => {
      const data = await fetchCashboxAccountDetail(sessionId!);
      return mapCashboxAccountDetail(data);
    },
    enabled: enabled && !!sessionId,
    staleTime: 0,
  });
}
