import { useQuery } from "@tanstack/react-query";
import { fetchTariffs } from "@/services/tariffs";
import type { TableType } from "@/types/table";
import type { TariffDeviceType } from "@/types/tariff";

function toTariffDeviceType(type: TableType): TariffDeviceType {
  return type === "playstation" ? "PLAYSTATION" : "STEERING_WHEEL";
}

export function useTariffs(deviceType?: TableType) {
  return useQuery({
    queryKey: ["tariffs"],
    queryFn: fetchTariffs,
    select: (tariffs) => {
      if (!deviceType) return tariffs.filter((t) => t.isActive);
      const type = toTariffDeviceType(deviceType);
      return tariffs.filter((t) => t.isActive && t.deviceType === type);
    },
    staleTime: 60_000,
  });
}
