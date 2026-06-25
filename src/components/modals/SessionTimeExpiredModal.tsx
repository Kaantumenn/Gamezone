"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2, X, XCircle } from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import { updateSessionTimeLimit } from "@/services/sessions";
import { useCloseTableModalStore } from "@/stores/closeTableModalStore";
import { useTimeExpiredModalStore } from "@/stores/timeExpiredModalStore";
import { cn } from "@/lib/utils";

export function SessionTimeExpiredModal() {
  const queryClient = useQueryClient();
  const { table, isOpen, close, dismiss, suppressSession } =
    useTimeExpiredModalStore();
  const openCloseModal = useCloseTableModalStore((s) => s.open);
  const { data: devicesData } = useDevices();
  const [customMinutes, setCustomMinutes] = useState("");

  const currentTable =
    table && devicesData
      ? [...devicesData.playstation, ...devicesData.steering].find(
          (item) => item.sessionId === table.sessionId,
        ) ?? table
      : table;

  const extendMutation = useMutation({
    mutationFn: ({
      sessionId,
      timeLimitMin,
    }: {
      sessionId: number;
      timeLimitMin: number;
    }) => updateSessionTimeLimit(sessionId, { timeLimitMin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      setCustomMinutes("");
      close();
    },
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCustomMinutes("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !currentTable?.sessionId || !currentTable.timeLimitMin) {
    return null;
  }

  const isPS = currentTable.type === "playstation";
  const isPending = extendMutation.isPending;
  const baseLimit = currentTable.timeLimitMin;
  const parsedCustomMinutes = Number.parseInt(customMinutes, 10);
  const canCustomExtend =
    !Number.isNaN(parsedCustomMinutes) && parsedCustomMinutes > 0;

  const handleExtend = (extraMinutes: number) => {
    if (isPending) return;
    extendMutation.mutate({
      sessionId: currentTable.sessionId!,
      timeLimitMin: baseLimit + extraMinutes,
    });
  };

  const handleCustomExtend = () => {
    if (!canCustomExtend || isPending) return;
    handleExtend(parsedCustomMinutes);
  };

  const handleDismiss = () => {
    if (isPending || !currentTable.sessionId) return;
    dismiss(currentTable.sessionId);
  };

  const handleCloseAccount = () => {
    if (isPending || !currentTable.sessionId) return;
    suppressSession(currentTable.sessionId);
    close();
    openCloseModal(currentTable);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={handleDismiss}
        disabled={isPending}
        aria-label="Kapat"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
        <button
          type="button"
          onClick={handleDismiss}
          disabled={isPending}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/80 disabled:opacity-50"
          aria-label="Kapat"
          title="1 dakika sonra tekrar hatırlat"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pt-6 pb-4">
          <div
            className={cn(
              "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
              isPS ? "bg-[#6366f1]/20 text-[#818cf8]" : "bg-[#3b82f6]/20 text-[#60a5fa]",
            )}
          >
            <Clock className="h-7 w-7" />
          </div>
          <h2 className="text-center text-xl font-semibold text-white">
            {currentTable.name} süresi doldu.
          </h2>
          <p className="mt-2 text-center text-sm text-white/45">
            Masa açık kalır. Süreyi uzatabilir veya hesabı kapatabilirsiniz.
            Kapatırsanız 1 dakika içinde tekrar hatırlatılır.
          </p>
        </div>

        <div className="space-y-2 px-6 pb-6">
          <div className="mb-3 flex gap-2">
            <input
              type="number"
              min={1}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Dakika"
              disabled={isPending}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#12121e] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#6366f1]/50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleCustomExtend}
              disabled={isPending || !canCustomExtend}
              className={cn(
                "shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50",
                isPS
                  ? "bg-[#6366f1] hover:bg-[#5558e3]"
                  : "bg-[#3b82f6] hover:bg-[#2563eb]",
              )}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Uzat"
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleExtend(30)}
            disabled={isPending}
            className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#12121e] py-3.5 text-sm font-semibold text-white/80 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            30 dk Uzat
          </button>

          <button
            type="button"
            onClick={() => handleExtend(60)}
            disabled={isPending}
            className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#12121e] py-3.5 text-sm font-semibold text-white/80 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            1 Saat Uzat
          </button>

          <button
            type="button"
            onClick={handleCloseAccount}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Hesabı Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
