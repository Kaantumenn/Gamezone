import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { buildTariffPayload } from "@/lib/tariffForm";
import type { Tariff, TariffFormValues } from "@/types/tariff";

export async function fetchTariffs(): Promise<Tariff[]> {
  const { data } = await api.get<Tariff[]>("/tariffs");
  return data;
}

export async function fetchTariff(id: number): Promise<Tariff> {
  const { data } = await api.get<Tariff>(`/tariffs/${id}`);
  return data;
}

export async function createTariff(values: TariffFormValues): Promise<Tariff> {
  const { data } = await api.post<Tariff>(
    "/tariffs",
    buildTariffPayload(values),
  );
  return data;
}

export async function updateTariff(
  id: number,
  values: TariffFormValues,
): Promise<Tariff> {
  const { data } = await api.patch<Tariff>(
    `/tariffs/${id}`,
    buildTariffPayload(values),
  );
  return data;
}

export async function deleteTariff(id: number): Promise<Tariff> {
  const { data } = await api.delete<Tariff>(`/tariffs/${id}`);
  return data;
}

/** @deprecated Use deleteTariff */
export const deactivateTariff = deleteTariff;

export function getTariffApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(", ");

  return fallback;
}
