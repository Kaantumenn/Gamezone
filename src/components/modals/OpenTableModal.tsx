"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ChevronDown,
  Gamepad2,
  Loader2,
  Play,
  Receipt,
  X,
} from "lucide-react";
import { PlayStationLogo } from "@/components/icons/PlayStationLogo";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { HelpLabel } from "@/components/ui/HelpLabel";
import { Toggle } from "@/components/ui/Toggle";
import { useTariffs } from "@/hooks/useTariffs";
import { buildOpenSessionPayload } from "@/lib/openTableForm";
import { openSession } from "@/services/sessions";
import { useOpenTableModalStore } from "@/stores/openTableModalStore";
import {
  formatDateTime,
  getDefaultFormState,
  type ControllerCount,
  type OpenTableFormState,
  type TimeLimitPreset,
} from "@/types/openTable";
import type { Tariff } from "@/types/tariff";
import { cn } from "@/lib/utils";

const controllerOptions: ControllerCount[] = [1, 2, 3, 4];

const timePresets: { id: TimeLimitPreset; label: string }[] = [
  { id: "30dk", label: "30 dk" },
  { id: "1saat", label: "1 Saat" },
  { id: "2saat", label: "2 Saat" },
  { id: "3saat", label: "3 Saat" },
  { id: "sinirsiz", label: "Sınırsız" },
];

function presetToForm(preset: TimeLimitPreset): Partial<OpenTableFormState> {
  switch (preset) {
    case "30dk":
      return { timeLimitValue: 30, timeLimitUnit: "minute" };
    case "1saat":
      return { timeLimitValue: 1, timeLimitUnit: "hour" };
    case "2saat":
      return { timeLimitValue: 2, timeLimitUnit: "hour" };
    case "3saat":
      return { timeLimitValue: 3, timeLimitUnit: "hour" };
    case "sinirsiz":
      return { timeLimitEnabled: false };
    default:
      return {};
  }
}

function getTariffPricePerHour(tariff: Tariff): number {
  return Number(tariff.pricePerMinute) * 60;
}

export function OpenTableModal() {
  const queryClient = useQueryClient();
  const { table, isOpen, close } = useOpenTableModalStore();
  const { data: tariffs = [], isLoading: tariffsLoading } = useTariffs(
    table?.type,
  );

  const [form, setForm] = useState<OpenTableFormState>(getDefaultFormState);
  const [currentTime, setCurrentTime] = useState(() => formatDateTime(new Date()));
  const [tariffDropdownOpen, setTariffDropdownOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const openingTimeRef = useRef<HTMLInputElement>(null);

  const openSessionMutation = useMutation({
    mutationFn: openSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      close();
    },
    onError: () => {
      setSubmitError("Masa açılırken bir hata oluştu. Lütfen tekrar deneyin.");
    },
  });

  useEffect(() => {
    if (isOpen && tariffs.length > 0 && table) {
      setForm({
        ...getDefaultFormState(tariffs[0].id),
        controllerCount: table.type === "playstation" ? 2 : 1,
      });
      setCurrentTime(formatDateTime(new Date()));
      setSubmitError(null);
      setTariffDropdownOpen(false);
      document.body.style.overflow = "hidden";
    } else if (!isOpen) {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, tariffs, table]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !openSessionMutation.isPending) close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, openSessionMutation.isPending]);

  if (!isOpen || !table) return null;

  const isPS = table.type === "playstation";
  const accentClass = isPS ? "text-[#818cf8]" : "text-[#60a5fa]";
  const accentBg = isPS ? "bg-[#6366f1]" : "bg-[#3b82f6]";
  const accentBorder = isPS
    ? "border-[#6366f1]/60 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
    : "border-[#3b82f6]/60 shadow-[0_0_12px_rgba(59,130,246,0.2)]";
  const accentBgTint = isPS ? "bg-[#6366f1]/15" : "bg-[#3b82f6]/15";

  const selectedTariff = tariffs.find((t) => t.id === form.tariffId) ?? tariffs[0];

  const updateForm = (patch: Partial<OpenTableFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handlePresetClick = (preset: TimeLimitPreset) => {
    if (preset === "sinirsiz") {
      updateForm({ timeLimitPreset: preset, timeLimitEnabled: false });
      return;
    }
    updateForm({
      timeLimitPreset: preset,
      timeLimitEnabled: true,
      ...presetToForm(preset),
    });
  };

  const handleSubmit = async () => {
    if (!selectedTariff || openSessionMutation.isPending) return;

    setSubmitError(null);
    const payload = buildOpenSessionPayload(table, {
      ...form,
      tariffId: selectedTariff.id,
    });

    openSessionMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !openSessionMutation.isPending && close()}
        aria-label="Kapat"
      />

      <div className="relative z-10 w-full max-w-[820px] rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                accentBgTint,
                accentClass,
              )}
            >
              {isPS ? (
                <PlayStationLogo className="h-5 w-5" />
              ) : (
                <SteeringWheelIcon className="h-5 w-5" />
              )}
            </div>
            <h2 className="text-lg font-semibold text-white">
              {table.name} Masasını Aç
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={openSessionMutation.isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/80 disabled:opacity-50"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div
            className={cn(
              "grid grid-cols-1 gap-5",
              isPS && "md:grid-cols-2",
            )}
          >
            {isPS && (
              <div>
                <HelpLabel className="mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Gamepad2 className="h-3.5 w-3.5 text-white/40" />
                    Kol Sayısı
                  </span>
                </HelpLabel>
                <div className="grid grid-cols-4 gap-2">
                  {controllerOptions.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => updateForm({ controllerCount: count })}
                      className={cn(
                        "rounded-xl border py-2.5 text-sm font-medium transition-all",
                        form.controllerCount === count
                          ? cn(accentBorder, accentBgTint, "text-white")
                          : "border-white/10 bg-[#12121e] text-white/50 hover:border-white/20",
                      )}
                    >
                      {count} Kol
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <HelpLabel className="mb-2.5">Açılış Saati</HelpLabel>
              <div className="relative">
                <input
                  ref={openingTimeRef}
                  type="datetime-local"
                  value={form.openingTime}
                  onChange={(e) => updateForm({ openingTime: e.target.value })}
                  className="datetime-input w-full rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 pr-10 text-sm text-white outline-none focus:border-[#6366f1]/50 [color-scheme:dark]"
                />
                <button
                  type="button"
                  onClick={() => openingTimeRef.current?.showPicker?.()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                  aria-label="Takvim aç"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
              <p className={cn("mt-1.5 text-xs", accentClass)}>
                Şu anki saat: {currentTime}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <HelpLabel className="mb-2.5">Tarife Seçimi</HelpLabel>
              {tariffsLoading ? (
                <div className="flex h-[108px] items-center justify-center rounded-xl border border-white/10 bg-[#12121e]">
                  <Loader2 className="h-5 w-5 animate-spin text-white/40" />
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
                      <span className={cn("text-sm font-semibold", accentClass)}>
                        ₺{getTariffPricePerHour(selectedTariff)}{" "}
                        <span className="font-normal text-white/40">/ saat</span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-white/30 transition-transform",
                          tariffDropdownOpen && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {tariffDropdownOpen && tariffs.length > 1 && (
                    <div className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#12121e] shadow-xl">
                      {tariffs.map((tariff) => (
                        <button
                          key={tariff.id}
                          type="button"
                          onClick={() => {
                            updateForm({ tariffId: tariff.id });
                            setTariffDropdownOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5",
                            tariff.id === selectedTariff.id && accentBgTint,
                          )}
                        >
                          <span className="text-sm text-white/80">{tariff.name}</span>
                          <span className={cn("text-sm font-semibold", accentClass)}>
                            ₺{getTariffPricePerHour(tariff)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-white/5 px-4 py-3">
                    <div className="flex items-start gap-2.5 rounded-lg bg-[#0b0e14] px-3 py-2.5">
                      <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                      <div>
                        <p className="text-sm text-white/70">
                          İlk {selectedTariff.openingMinutes} dk ₺
                          {selectedTariff.openingPrice}
                        </p>
                        <p className="text-xs text-white/35">
                          {selectedTariff.openingMinutes} dk sonrası ₺
                          {selectedTariff.pricePerMinute} / dk
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-6 text-center text-sm text-white/40">
                  Bu cihaz tipi için tarife bulunamadı.
                </div>
              )}
            </div>

            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <HelpLabel>Süre Sınırı (Opsiyonel)</HelpLabel>
                <Toggle
                  checked={form.timeLimitEnabled}
                  onChange={(checked) =>
                    updateForm({
                      timeLimitEnabled: checked,
                      timeLimitPreset: checked ? form.timeLimitPreset : null,
                    })
                  }
                />
              </div>
              <div
                className={cn(
                  "space-y-2.5",
                  !form.timeLimitEnabled && "pointer-events-none opacity-40",
                )}
              >
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={form.timeLimitValue}
                    onChange={(e) =>
                      updateForm({
                        timeLimitValue: Number(e.target.value),
                        timeLimitPreset: null,
                      })
                    }
                    className="w-20 rounded-xl border border-white/10 bg-[#12121e] px-3 py-2.5 text-sm text-white outline-none focus:border-[#6366f1]/50"
                  />
                  <div className="relative flex-1">
                    <select
                      value={form.timeLimitUnit}
                      onChange={(e) =>
                        updateForm({
                          timeLimitUnit: e.target.value as "minute" | "hour",
                          timeLimitPreset: null,
                        })
                      }
                      className="w-full appearance-none rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white outline-none focus:border-[#6366f1]/50"
                    >
                      <option value="minute">Dakika</option>
                      <option value="hour">Saat</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {timePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetClick(preset.id)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                        form.timeLimitPreset === preset.id
                          ? cn(accentBorder, accentBgTint, "text-white")
                          : "border-white/10 bg-[#12121e] text-white/45 hover:border-white/20",
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <HelpLabel>Tutar Sınırı (Opsiyonel)</HelpLabel>
                <Toggle
                  checked={form.amountLimitEnabled}
                  onChange={(checked) =>
                    updateForm({ amountLimitEnabled: checked })
                  }
                />
              </div>
              <div
                className={cn(
                  "relative",
                  !form.amountLimitEnabled && "pointer-events-none opacity-40",
                )}
              >
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40">
                  ₺
                </span>
                <input
                  type="text"
                  value={form.amountLimit}
                  onChange={(e) => updateForm({ amountLimit: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#12121e] py-2.5 pr-4 pl-8 text-sm text-white outline-none focus:border-[#6366f1]/50"
                />
              </div>
            </div>

            <div>
              <HelpLabel className="mb-2.5">Uyarı Ayarları</HelpLabel>
              <div className="space-y-3 rounded-xl border border-white/10 bg-[#12121e] px-4 py-3.5">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.warnBeforeTimeEnd}
                    onChange={(e) =>
                      updateForm({ warnBeforeTimeEnd: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-white/20 bg-transparent accent-[#6366f1]"
                  />
                  <span className="text-sm text-white/70">
                    Süre bitimine 10 dk kala uyar
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.warnAt90Percent}
                    onChange={(e) =>
                      updateForm({ warnAt90Percent: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-white/20 bg-transparent accent-[#6366f1]"
                  />
                  <span className="text-sm text-white/70">
                    Tutar %90 olduğunda uyar
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <HelpLabel className="mb-2.5">Not (Opsiyonel)</HelpLabel>
            <textarea
              value={form.note}
              onChange={(e) => updateForm({ note: e.target.value })}
              placeholder="Masayla ilgili not ekleyebilirsiniz..."
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#12121e] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#6366f1]/50"
            />
          </div>

          {submitError && (
            <p className="text-center text-sm text-red-400">{submitError}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
          <button
            type="button"
            onClick={close}
            disabled={openSessionMutation.isPending}
            className="rounded-xl border border-white/10 bg-[#12121e] px-6 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={openSessionMutation.isPending || !selectedTariff}
            className={cn(
              "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50",
              accentBg,
            )}
          >
            {openSessionMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Açılıyor...
              </>
            ) : (
              <>
                Masayı Aç
                <Play className="h-3.5 w-3.5 fill-current" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
