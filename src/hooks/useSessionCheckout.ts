import { useQuery } from "@tanstack/react-query";
import { mapCheckoutResponse } from "@/lib/mapCheckout";
import { fetchSessionCheckout } from "@/services/sessions";

export function useSessionCheckout(
  sessionId: number | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["session-checkout", sessionId],
    queryFn: async () => {
      const data = await fetchSessionCheckout(sessionId!);
      return mapCheckoutResponse(data);
    },
    enabled: enabled && !!sessionId,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
