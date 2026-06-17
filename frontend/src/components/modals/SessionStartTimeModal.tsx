"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Loader2 } from "lucide-react";
import { toDateTimeLocalValue } from "@/lib/format";
import { updateSessionStartTime } from "@/services/sessions";
import { cn } from "@/lib/utils";

interface SessionStartTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number | null;
  startedAt: string | null;
  accentClass?: string;
}

export function SessionStartTimeModal({
  isOpen,
  onClose,
  sessionId,
  startedAt,
  accentClass = "bg-[#6366f1]",
}: SessionStartTimeModalProps) {
  const queryClient = useQueryClient();
  const [openingTime, setOpeningTime] = useState(
    toDateTimeLocalValue(new Date()),
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (startedAtValue: string) =>
      updateSessionStartTime(sessionId!, { startedAt: startedAtValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["session-checkout"] });
      queryClient.invalidateQueries({ queryKey: ["session-orders"] });
      onClose();
    },
    onError: () => {
      setError("Açılış saati güncellenemedi. Lütfen tekrar deneyin.");
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    setOpeningTime(
      startedAt
        ? toDateTimeLocalValue(new Date(startedAt))
        : toDateTimeLocalValue(new Date()),
    );
    setError(null);
  }, [isOpen, startedAt]);

  if (!isOpen || !sessionId) return null;

  const handleSave = () => {
    const date = new Date(openingTime);
    if (Number.isNaN(date.getTime())) {
      setError("Geçerli bir açılış saati girin.");
      return;
    }

    mutation.mutate(date.toISOString());
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={() => !mutation.isPending && onClose()}
        aria-label="Kapat"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0e14] p-5 shadow-2xl">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#818cf8]" />
          <h3 className="text-base font-semibold text-white">
            Açılış Saatini Güncelle
          </h3>
        </div>
        <p className="mt-1 text-xs text-white/40">
          Masa yanlış saatte açıldıysa gerçek açılış saatini girin.
        </p>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs text-white/40">
            Açılış Saati
          </label>
          <input
            type="datetime-local"
            value={openingTime}
            onChange={(e) => setOpeningTime(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#12121e] px-3 py-2.5 text-sm text-white outline-none focus:border-[#6366f1]/50"
          />
        </div>

        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5 text-sm text-white/70 hover:text-white disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={mutation.isPending}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60",
              accentClass,
            )}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
