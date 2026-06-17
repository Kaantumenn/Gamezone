import { api } from "@/lib/api";
import type { DevicesResponse } from "@/types/device";

export async function fetchDevices(): Promise<DevicesResponse> {
  const { data } = await api.get<DevicesResponse>("/devices");
  return data;
}
