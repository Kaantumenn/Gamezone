"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Timer } from "lucide-react";
import { updateSessionTimeLimit } from "@/services/sessions";
import { submitFormById } from "@/lib/submitFormById";
import { cn } from "@/lib/utils";

type TimeLimitPresetId = "unlimited" | "1h" | "1.5h" | "2h";

const TIME_LIMIT_PRESETS: {
  id: TimeLimitPresetId;
  label: string;
  value: number | null;
}[] = [
  { id: "unlimited", label: "Süresiz", value: null },
  { id: "1h", label: "1 Saat", value: 60 },
  { id: "1.5h", label: "1.5 Saat", value: 90 },
  { id: "2h", label: "2 Saat", value: 120 },
];

interface SessionTimeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number | null;
  timeLimitMin: number | null;
  accentClass?: string;
}

export function SessionTimeLimitModal({
  isOpen,
  onClose,
  sessionId,
  timeLimitMin,
  accentClass = "bg-[#6366f1]",
}: SessionTimeLimitModalProps) {
  const queryClient = useQueryClient();
  const [selectedPreset, setSelectedPreset] = useState<TimeLimitPresetId | null>(
    null,
  );
  const [customMinutes, setCustomMinutes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: { timeLimitMin: number | null }) =>
      updateSessionTimeLimit(sessionId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["session-checkout"] });
      onClose();
    },
    onError: () => {
      setError("Süre sınırı güncellenemedi. Lütfen tekrar deneyin.");
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (timeLimitMin == null) {
      setSelectedPreset("unlimited");
    } else if (timeLimitMin === 60) {
      setSelectedPreset("1h");
    } else if (timeLimitMin === 90) {
      setSelectedPreset("1.5h");
    } else if (timeLimitMin === 120) {
      setSelectedPreset("2h");
    } else {
      setSelectedPreset(null);
      setCustomMinutes(String(timeLimitMin));
    }

    setError(null);
  }, [isOpen, timeLimitMin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || mutation.isPending) return;

      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Enter") {
        const target = e.target as HTMLElement;
        const tag = target.tagName;

        if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

        e.preventDefault();
        submitFormById("session-time-limit-form");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, mutation.isPending]);

  if (!isOpen || !sessionId) return null;

  const parsedCustomMinutes = Number.parseInt(customMinutes, 10);
  const hasValidCustom =
    customMinutes.trim() !== "" &&
    !Number.isNaN(parsedCustomMinutes) &&
    parsedCustomMinutes > 0;

  const handlePresetSelect = (presetId: TimeLimitPresetId) => {
    setSelectedPreset(presetId);
    setCustomMinutes("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasValidCustom) {
      mutation.mutate({ timeLimitMin: parsedCustomMinutes });
      return;
    }

    if (!selectedPreset) {
      setError("Bir süre seçin veya dakika girin.");
      return;
    }

    const preset = TIME_LIMIT_PRESETS.find((item) => item.id === selectedPreset);
    if (!preset) {
      setError("Geçerli bir süre seçin.");
      return;
    }

    mutation.mutate({ timeLimitMin: preset.value });
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
          <Timer className="h-4 w-4 text-amber-400" />
          <h3 className="text-base font-semibold text-white">Süre Sınırı Koy</h3>
        </div>
        <p className="mt-1 text-xs text-white/40">
          Masanın süre sınırını belirleyin veya sınırsız yapın.
        </p>

        <form id="session-time-limit-form" onSubmit={handleSubmit}>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {TIME_LIMIT_PRESETS.map((preset) => {
              const isSelected =
                !hasValidCustom && selectedPreset === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  disabled={mutation.isPending}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm font-medium transition-colors disabled:opacity-50",
                    isSelected
                      ? "border-amber-500/60 bg-amber-500/15 text-amber-200"
                      : "border-white/10 bg-[#12121e] text-white/70 hover:border-white/20 hover:text-white",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs text-white/40">
              Özel süre (dakika)
            </label>
            <input
              type="number"
              min={1}
              value={customMinutes}
              onChange={(e) => {
                setCustomMinutes(e.target.value);
                setSelectedPreset(null);
                setError(null);
              }}
              placeholder="Örn. 45"
              disabled={mutation.isPending}
              className="w-full rounded-xl border border-white/10 bg-[#12121e] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-amber-500/50 disabled:opacity-50"
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
              type="submit"
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
        </form>
      </div>
    </div>
  );
}
