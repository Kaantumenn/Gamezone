"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  ChevronDown,
  Gamepad2,
  Loader2,
} from "lucide-react";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { useDevices } from "@/hooks/useDevices";
import { useTariffs } from "@/hooks/useTariffs";
import { transferSession } from "@/services/sessions";
import { useTableDetailPanelStore } from "@/stores/tableDetailPanelStore";
import { useTransferTableModalStore } from "@/stores/transferTableModalStore";
import type { Table, TableType } from "@/types/table";
import type { Tariff } from "@/types/tariff";
import { getTariffDeviceLabel } from "@/types/tariff";
import { submitFormById } from "@/lib/submitFormById";
import { cn } from "@/lib/utils";

const controllerOptions = [1, 2, 3, 4] as const;

function getTransferTargets(sourceTable: Table, allTables: Table[]): Table[] {
  return allTables.filter(
    (table) => !table.isOpen && table.deviceId !== sourceTable.deviceId,
  );
}

function getDeviceTypeLabel(type: TableType): string {
  return type === "playstation" ? "PlayStation" : "Direksiyon";
}

function getTariffPricePerHour(tariff: Tariff): number {
  return Number(tariff.pricePerMinute) * 60;
}

function getDefaultControllerCount(
  sourceTable: Table,
  targetTable: Table,
): number {
  if (targetTable.type === "steering") return 1;
  if (sourceTable.type === "playstation") {
    return sourceTable.controllerCount ?? 2;
  }
  return 2;
}

export function TransferTableModal() {
  const queryClient = useQueryClient();
  const { sourceTable, isOpen, close } = useTransferTableModalStore();
  const selectPanelTable = useTableDetailPanelStore((s) => s.select);
  const { data: devicesData } = useDevices();
  const [targetDeviceId, setTargetDeviceId] = useState<number | null>(null);
  const [tariffId, setTariffId] = useState<number | null>(null);
  const [controllerCount, setControllerCount] = useState(1);
  const [tariffDropdownOpen, setTariffDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allTables = useMemo(() => {
    if (!devicesData) return [];
    return [...devicesData.playstation, ...devicesData.steering];
  }, [devicesData]);

  const transferTargets = useMemo(() => {
    if (!sourceTable) return [];
    return getTransferTargets(sourceTable, allTables);
  }, [sourceTable, allTables]);

  const selectedTarget = useMemo(
    () => transferTargets.find((table) => table.deviceId === targetDeviceId) ?? null,
    [transferTargets, targetDeviceId],
  );

  const isCrossTypeTransfer = Boolean(
    sourceTable &&
      selectedTarget &&
      selectedTarget.type !== sourceTable.type,
  );

  const { data: tariffs = [], isLoading: tariffsLoading } = useTariffs(
    isCrossTypeTransfer ? selectedTarget!.type : undefined,
  );

  const selectedTariff =
    tariffs.find((tariff) => tariff.id === tariffId) ?? tariffs[0] ?? null;

  const mutation = useMutation({
    mutationFn: (payload: {
      sessionId: number;
      targetDeviceId: number;
      tariffId?: number;
      controllerCount?: number;
    }) =>
      transferSession(payload.sessionId, {
        targetDeviceId: payload.targetDeviceId,
        ...(payload.tariffId != null ? { tariffId: payload.tariffId } : {}),
        ...(payload.controllerCount != null
          ? { controllerCount: payload.controllerCount }
          : {}),
      }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["session-orders"] });
      queryClient.invalidateQueries({ queryKey: ["session-checkout"] });

      const deviceId = response.deviceId ?? variables.targetDeviceId;
      selectPanelTable(deviceId);
      close();
    },
    onError: () => {
      setError("Masa aktarılamadı. Lütfen tekrar deneyin.");
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setTariffDropdownOpen(false);
    setTargetDeviceId(transferTargets[0]?.deviceId ?? null);
  }, [isOpen, sourceTable, transferTargets]);

  useEffect(() => {
    if (!isOpen || !sourceTable || !selectedTarget) return;

    if (isCrossTypeTransfer) {
      setControllerCount(
        getDefaultControllerCount(sourceTable, selectedTarget),
      );
      setTariffId(null);
      setTariffDropdownOpen(false);
    }
  }, [isOpen, sourceTable, selectedTarget, isCrossTypeTransfer, targetDeviceId]);

  useEffect(() => {
    if (!isCrossTypeTransfer || tariffs.length === 0) return;
    setTariffId((current) => current ?? tariffs[0].id);
  }, [isCrossTypeTransfer, tariffs]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || mutation.isPending) return;

      if (e.key === "Escape") {
        close();
        return;
      }

      if (e.key === "Enter") {
        const target = e.target as HTMLElement;
        const tag = target.tagName;

        if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

        e.preventDefault();
        submitFormById("transfer-table-form");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, mutation.isPending]);

  if (!isOpen || !sourceTable?.sessionId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetDeviceId) {
      setError("Aktarılacak hedef masayı seçin.");
      return;
    }

    if (isCrossTypeTransfer && !selectedTariff) {
      setError("Hedef cihaz için bir tarife seçin.");
      return;
    }

    mutation.mutate({
      sessionId: sourceTable.sessionId!,
      targetDeviceId,
      ...(isCrossTypeTransfer && selectedTariff
        ? {
            tariffId: selectedTariff.id,
            controllerCount:
              selectedTarget?.type === "steering" ? 1 : controllerCount,
          }
        : {}),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={() => !mutation.isPending && close()}
        aria-label="Kapat"
      />

      <div className="relative z-10 flex h-[80vh] w-[80vw] max-w-5xl flex-col rounded-2xl border border-white/10 bg-[#0b0e14] p-5 shadow-2xl">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-amber-400" />
          <h3 className="text-base font-semibold text-white">Masayı Aktar</h3>
        </div>
        <p className="mt-1 text-xs text-white/40">
          <span className="font-medium text-white/70">{sourceTable.name}</span>{" "}
          hangi masaya aktarılsın?
        </p>

        <form
          id="transfer-table-form"
          onSubmit={handleSubmit}
          className="mt-4 flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {transferTargets.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-6 text-center text-sm text-white/40">
                Aktarılabilecek boş masa yok.
              </p>
            ) : (
              transferTargets.map((table) => {
                const isSelected = targetDeviceId === table.deviceId;
                const isCrossType =
                  sourceTable && table.type !== sourceTable.type;

                return (
                  <label
                    key={table.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                      isSelected
                        ? "border-amber-500/50 bg-amber-500/10"
                        : "border-white/10 bg-[#12121e] hover:border-white/15",
                    )}
                  >
                    <input
                      type="radio"
                      name="transfer-target"
                      value={table.deviceId}
                      checked={isSelected}
                      onChange={() => setTargetDeviceId(table.deviceId)}
                      className="h-4 w-4 accent-amber-500"
                    />
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        table.type === "playstation"
                          ? "bg-[#6366f1]/15 text-[#818cf8]"
                          : "bg-[#3b82f6]/15 text-[#60a5fa]",
                      )}
                    >
                      {table.type === "playstation" ? (
                        <Gamepad2 className="h-4 w-4" />
                      ) : (
                        <SteeringWheelIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {table.name}
                      </p>
                      <p className="text-xs text-white/40">
                        Boş masa · {getDeviceTypeLabel(table.type)}
                        {isCrossType ? " · Farklı tip" : ""}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {isCrossTypeTransfer && selectedTarget && (
            <div className="mt-4 space-y-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs text-amber-200/80">
                Farklı cihaz tipine aktarımda mevcut kullanım ücreti korunur ve
                süre{" "}
                <span className="font-medium text-amber-100">
                  {selectedTarget.name}
                </span>{" "}
                tarifesiyle sıfırdan başlar.
              </p>

              <div>
                <label className="mb-1.5 block text-xs text-white/40">
                  Yeni Tarife ({getTariffDeviceLabel(
                    selectedTarget.type === "playstation"
                      ? "PLAYSTATION"
                      : "STEERING_WHEEL",
                  )})
                </label>
                {tariffsLoading ? (
                  <div className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#12121e]">
                    <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                  </div>
                ) : selectedTariff ? (
                  <div className="relative rounded-xl border border-white/10 bg-[#12121e]">
                    <button
                      type="button"
                      onClick={() => setTariffDropdownOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between px-4 py-3"
                    >
                      <span className="text-sm text-white/80">
                        {selectedTariff.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-amber-300">
                          ₺{getTariffPricePerHour(selectedTariff)}
                          <span className="font-normal text-white/40">
                            {" "}
                            / saat
                          </span>
                        </span>
                        {tariffs.length > 1 && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-white/30 transition-transform",
                              tariffDropdownOpen && "rotate-180",
                            )}
                          />
                        )}
                      </div>
                    </button>

                    {tariffDropdownOpen && tariffs.length > 1 && (
                      <div className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#12121e] shadow-xl">
                        {tariffs.map((tariff) => (
                          <button
                            key={tariff.id}
                            type="button"
                            onClick={() => {
                              setTariffId(tariff.id);
                              setTariffDropdownOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5",
                              tariff.id === selectedTariff.id &&
                                "bg-amber-500/10",
                            )}
                          >
                            <span className="text-sm text-white/80">
                              {tariff.name}
                            </span>
                            <span className="text-sm font-semibold text-amber-300">
                              ₺{getTariffPricePerHour(tariff)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-3 text-sm text-white/40">
                    Bu cihaz tipi için aktif tarife bulunamadı.
                  </p>
                )}
              </div>

              {selectedTarget.type === "playstation" && (
                <div>
                  <label className="mb-2 block text-xs text-white/40">
                    Kol Sayısı
                  </label>
                  <div className="flex gap-2">
                    {controllerOptions.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setControllerCount(count)}
                        className={cn(
                          "flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-colors",
                          controllerCount === count
                            ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
                            : "border-white/10 bg-[#12121e] text-white/50 hover:text-white/80",
                        )}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <p className="mt-3 shrink-0 text-sm text-rose-400">{error}</p>}

          <div className="mt-5 flex shrink-0 gap-3">
            <button
              type="button"
              onClick={close}
              disabled={mutation.isPending}
              className="flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5 text-sm text-white/70 hover:text-white disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={
                mutation.isPending ||
                transferTargets.length === 0 ||
                !targetDeviceId ||
                (isCrossTypeTransfer && !selectedTariff)
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Aktar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
