import { useQuery } from "@tanstack/react-query";
import { fetchEmployee } from "@/services/employees";

export function useEmployee(employeeId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => fetchEmployee(employeeId!),
    enabled: enabled && employeeId != null,
    staleTime: 5_000,
  });
}
