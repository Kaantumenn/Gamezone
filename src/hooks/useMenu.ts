import { useQuery } from "@tanstack/react-query";
import { fetchMenu } from "@/services/orders";

export function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: fetchMenu,
    staleTime: 60_000,
  });
}
