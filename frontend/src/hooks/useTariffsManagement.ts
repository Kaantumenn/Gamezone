import { useQuery } from "@tanstack/react-query";
import { fetchTariffs } from "@/services/tariffs";

export function useTariffsManagement() {
  return useQuery({
    queryKey: ["tariffs"],
    queryFn: fetchTariffs,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}
