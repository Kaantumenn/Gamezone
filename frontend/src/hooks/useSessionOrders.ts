import { useQuery } from "@tanstack/react-query";
import { fetchSessionOrders } from "@/services/orders";

export function useSessionOrders(
  sessionId: number | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["session-orders", sessionId],
    queryFn: () => fetchSessionOrders(sessionId!),
    enabled: enabled && !!sessionId,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
