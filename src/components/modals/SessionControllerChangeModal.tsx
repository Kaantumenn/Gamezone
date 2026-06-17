"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Gamepad2, Loader2 } from "lucide-react";
import { toDateTimeLocalValue } from "@/lib/format";
import { changeSessionController } from "@/services/sessions";
import { cn } from "@/lib/utils";

interface SessionControllerChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number | null;
  controllerCount: number;
  accentBg?: string;
}

export function SessionControllerChangeModal({
  isOpen,
  onClose,
  sessionId,
  controllerCount,
  accentBg = "bg-[#6366f1]",
}: SessionControllerChangeModalProps) {
  const queryClient = useQueryClient();
  const [selectedCount, setSelectedCount] = useState(2);
  const [effectiveAt, setEffectiveAt] = useState(
    toDateTimeLocalValue(new Date()),
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: { controllerCount: number; effectiveAt: string }) =>
      changeSessionController(sessionId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["session-checkout"] });
      queryClient.invalidateQueries({ queryKey: ["session-orders"] });
      onClose();
    },
    onError: () => {
      setError("Kol sayısı güncellenemedi. Lütfen tekrar deneyin.");
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    setSelectedCount(controllerCount || 2);
    setEffectiveAt(toDateTimeLocalValue(new Date()));
    setError(null);
  }, [isOpen, controllerCount]);

  if (!isOpen || !sessionId) return null;

  const handleSave = () => {
    const date = new Date(effectiveAt);
    if (Number.isNaN(date.getTime())) {
      setError("Geçerli bir geçerlilik saati girin.");
      return;
    }

    mutation.mutate({
      controllerCount: selectedCount,
      effectiveAt: date.toISOString(),
    });
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
          <Gamepad2 className="h-4 w-4 text-[#818cf8]" />
          <h3 className="text-base font-semibold text-white">
            Kol Sayısını Güncelle
          </h3>
        </div>
        <p className="mt-1 text-xs text-white/40">
          Belirttiğiniz saatten itibaren yeni kol sayısı geçerli olur.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-1.5 text-xs text-white/40">Yeni Kol Sayısı</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSelectedCount(count)}
                  className={cn(
                    "flex h-9 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                    selectedCount === count
                      ? cn(accentBg, "border-transparent text-white")
                      : "border-white/10 bg-[#12121e] text-white/60 hover:text-white",
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/40">
              Geçerlilik Saati
            </label>
            <input
              type="datetime-local"
              value={effectiveAt}
              onChange={(e) => setEffectiveAt(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#12121e] px-3 py-2.5 text-sm text-white outline-none focus:border-[#6366f1]/50"
            />
            <p className="mt-1.5 text-[11px] text-white/30">
              Bu saate kadar mevcut kol sayısı, sonrasında seçilen kol sayısı
              uygulanır.
            </p>
          </div>
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
              accentBg,
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
