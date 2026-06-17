import { useQuery } from "@tanstack/react-query";
import { mapDeviceToTable } from "@/lib/mapDeviceToTable";
import { fetchDevices } from "@/services/devices";
import type { Table } from "@/types/table";

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: fetchDevices,
    select: (data): { playstation: Table[]; steering: Table[] } => ({
      playstation: data.playstations.map(mapDeviceToTable),
      steering: data.steeringWheels.map(mapDeviceToTable),
    }),
    refetchInterval: 10_000,
  });
}
