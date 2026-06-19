import { useQuery } from "@tanstack/react-query";
import { fetchEmployees } from "@/services/employees";

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    staleTime: 15_000,
  });
}
