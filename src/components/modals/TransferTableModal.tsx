"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import { transferSession } from "@/services/sessions";
import { useTableDetailPanelStore } from "@/stores/tableDetailPanelStore";
import { useTransferTableModalStore } from "@/stores/transferTableModalStore";
import type { Table } from "@/types/table";
import { cn } from "@/lib/utils";

function getTransferTargets(
  sourceTable: Table,
  allTables: Table[],
): Table[] {
  return allTables.filter(
    (table) =>
      !table.isOpen &&
      table.type === sourceTable.type &&
      table.deviceId !== sourceTable.deviceId,
  );
}

export function TransferTableModal() {
  const queryClient = useQueryClient();
  const { sourceTable, isOpen, close } = useTransferTableModalStore();
  const selectPanelTable = useTableDetailPanelStore((s) => s.select);
  const { data: devicesData } = useDevices();
  const [targetDeviceId, setTargetDeviceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allTables = useMemo(() => {
    if (!devicesData) return [];
    return [...devicesData.playstation, ...devicesData.steering];
  }, [devicesData]);

  const transferTargets = useMemo(() => {
    if (!sourceTable) return [];
    return getTransferTargets(sourceTable, allTables);
  }, [sourceTable, allTables]);

  const mutation = useMutation({
    mutationFn: (payload: { sessionId: number; targetDeviceId: number }) =>
      transferSession(payload.sessionId, {
        targetDeviceId: payload.targetDeviceId,
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
    setTargetDeviceId(transferTargets[0]?.deviceId ?? null);
  }, [isOpen, sourceTable, transferTargets]);

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
        document.getElementById("transfer-table-form")?.requestSubmit();
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

    mutation.mutate({
      sessionId: sourceTable.sessionId!,
      targetDeviceId,
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

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0e14] p-5 shadow-2xl">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-amber-400" />
          <h3 className="text-base font-semibold text-white">Masayı Aktar</h3>
        </div>
        <p className="mt-1 text-xs text-white/40">
          <span className="font-medium text-white/70">{sourceTable.name}</span>{" "}
          hangi masaya aktarılsın?
        </p>

        <form id="transfer-table-form" onSubmit={handleSubmit}>
          <div className="mt-4 space-y-2">
            {transferTargets.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-6 text-center text-sm text-white/40">
                Aktarılabilecek boş masa yok.
              </p>
            ) : (
              transferTargets.map((table) => {
                const isSelected = targetDeviceId === table.deviceId;

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
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {table.name}
                      </p>
                      <p className="text-xs text-white/40">Boş masa</p>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

          <div className="mt-5 flex gap-3">
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
                !targetDeviceId
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
