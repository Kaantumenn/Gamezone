"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import { mergeSessions } from "@/services/sessions";
import { useMergeTableModalStore } from "@/stores/mergeTableModalStore";
import { useTableDetailPanelStore } from "@/stores/tableDetailPanelStore";
import type { Table } from "@/types/table";
import { cn } from "@/lib/utils";

function formatPanelAmount(amount: number): string {
  const rounded = Math.round(amount);
  if (Math.abs(amount - rounded) < 0.01) {
    return `${rounded.toLocaleString("tr-TR")} ₺`;
  }

  return `${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}

function getMergeTargets(
  sourceTable: Table,
  allTables: Table[],
): Table[] {
  return allTables.filter(
    (table) =>
      table.isOpen &&
      table.sessionId &&
      table.sessionId !== sourceTable.sessionId &&
      table.type === sourceTable.type,
  );
}

export function MergeTableModal() {
  const queryClient = useQueryClient();
  const { sourceTable, isOpen, close } = useMergeTableModalStore();
  const closePanel = useTableDetailPanelStore((s) => s.close);
  const { data: devicesData } = useDevices();
  const [targetSessionId, setTargetSessionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allTables = useMemo(() => {
    if (!devicesData) return [];
    return [...devicesData.playstation, ...devicesData.steering];
  }, [devicesData]);

  const mergeTargets = useMemo(() => {
    if (!sourceTable) return [];
    return getMergeTargets(sourceTable, allTables);
  }, [sourceTable, allTables]);

  const mutation = useMutation({
    mutationFn: (payload: { sourceSessionId: number; targetSessionId: number }) =>
      mergeSessions(payload.sourceSessionId, {
        targetSessionId: payload.targetSessionId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["session-orders"] });
      queryClient.invalidateQueries({ queryKey: ["session-checkout"] });

      closePanel();
      close();
    },
    onError: () => {
      setError("Masalar birleştirilemedi. Lütfen tekrar deneyin.");
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setTargetSessionId(mergeTargets[0]?.sessionId ?? null);
  }, [isOpen, sourceTable, mergeTargets]);

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
        document.getElementById("merge-table-form")?.requestSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, mutation.isPending]);

  if (!isOpen || !sourceTable?.sessionId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetSessionId) {
      setError("Birleştirilecek hedef masayı seçin.");
      return;
    }

    mutation.mutate({
      sourceSessionId: sourceTable.sessionId!,
      targetSessionId,
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
          <Users className="h-4 w-4 text-[#818cf8]" />
          <h3 className="text-base font-semibold text-white">Hesabı Birleştir</h3>
        </div>
        <p className="mt-1 text-xs text-white/40">
          <span className="font-medium text-white/70">{sourceTable.name}</span>{" "}
          hangi masaya birleştirilsin?
        </p>

        <form id="merge-table-form" onSubmit={handleSubmit}>
          <div className="mt-4 space-y-2">
            {mergeTargets.length === 0 ? (
              <p className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-6 text-center text-sm text-white/40">
                Birleştirilebilecek başka açık masa yok.
              </p>
            ) : (
              mergeTargets.map((table) => {
                const isSelected = targetSessionId === table.sessionId;

                return (
                  <label
                    key={table.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                      isSelected
                        ? "border-[#6366f1]/50 bg-[#6366f1]/10"
                        : "border-white/10 bg-[#12121e] hover:border-white/15",
                    )}
                  >
                    <input
                      type="radio"
                      name="merge-target"
                      value={table.sessionId ?? undefined}
                      checked={isSelected}
                      onChange={() => setTargetSessionId(table.sessionId)}
                      className="h-4 w-4 accent-[#6366f1]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {table.name}
                      </p>
                      <p className="text-xs text-white/40">
                        {table.elapsedText} · {formatPanelAmount(table.grandTotal)}
                      </p>
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
                mergeTargets.length === 0 ||
                !targetSessionId
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6366f1] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Birleştir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
