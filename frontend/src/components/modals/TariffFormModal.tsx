"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Gamepad2, Loader2, X } from "lucide-react";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { createTariff, getTariffApiErrorMessage, updateTariff } from "@/services/tariffs";
import type { Tariff, TariffDeviceType, TariffFormValues } from "@/types/tariff";
import {
  getEmptyTariffForm,
  getTariffDeviceLabel,
  tariffToFormValues,
} from "@/types/tariff";
import { cn } from "@/lib/utils";

interface TariffFormModalProps {
  mode: "create" | "edit";
  tariff: Tariff | null;
  defaultDeviceType?: TariffDeviceType;
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#6366f1]/50";

const deviceOptions: {
  value: TariffDeviceType;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    value: "PLAYSTATION",
    label: "PlayStation",
    icon: <Gamepad2 className="h-4 w-4" />,
    activeClass: "border-[#6366f1]/50 bg-[#6366f1]/15 text-[#a5b4fc]",
  },
  {
    value: "STEERING_WHEEL",
    label: "Direksiyon",
    icon: <SteeringWheelIcon className="h-4 w-4" />,
    activeClass: "border-[#3b82f6]/50 bg-[#3b82f6]/15 text-[#93c5fd]",
  },
];

export function TariffFormModal({
  mode,
  tariff,
  defaultDeviceType = "PLAYSTATION",
  isOpen,
  onClose,
}: TariffFormModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<TariffFormValues>(() =>
    getEmptyTariffForm(defaultDeviceType),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (values: TariffFormValues) => {
      if (mode === "create") return createTariff(values);
      if (!tariff) throw new Error("Tarife bulunamadı");
      return updateTariff(tariff.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
      onClose();
    },
    onError: (error) => {
      setSubmitError(
        getTariffApiErrorMessage(
          error,
          mode === "create"
            ? "Tarife eklenirken bir hata oluştu."
            : "Tarife güncellenirken bir hata oluştu.",
        ),
      );
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && tariff) {
      setForm(tariffToFormValues(tariff));
    } else {
      setForm(getEmptyTariffForm(defaultDeviceType));
    }
    setSubmitError(null);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mode, tariff, defaultDeviceType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !mutation.isPending) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, mutation.isPending]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.name.trim()) {
      setSubmitError("Tarife adı zorunludur.");
      return;
    }

    const numbers = [
      { key: "openingMinutes", label: "Açılış süresi" },
      { key: "openingPrice", label: "Açılış ücreti" },
      { key: "pricePerMinute", label: "Dakika ücreti" },
      { key: "extraControllerFee", label: "Ek kol ücreti" },
    ] as const;

    for (const field of numbers) {
      const value = form[field.key];
      if (!value.trim() || Number.isNaN(Number(value)) || Number(value) < 0) {
        setSubmitError(`Geçerli bir ${field.label.toLowerCase()} girin.`);
        return;
      }
    }

    mutation.mutate({
      ...form,
      name: form.name.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !mutation.isPending && onClose()}
        aria-label="Kapat"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {mode === "create" ? "Yeni Tarife" : "Tarife Düzenle"}
            </h2>
            <p className="mt-0.5 text-sm text-white/40">
              {mode === "create"
                ? "Cihaz tipine göre fiyatlandırma tanımlayın"
                : tariff?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white/80 disabled:opacity-50"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Tarife Adı
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Örn. Standart PS, Hafta Sonu Direksiyon"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Cihaz Tipi
              </label>
              <div className="grid grid-cols-2 gap-3">
                {deviceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        deviceType: option.value,
                      }))
                    }
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                      form.deviceType === option.value
                        ? option.activeClass
                        : "border-white/10 bg-[#12121e] text-white/45 hover:text-white/70",
                    )}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Açılış Süresi (dk)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.openingMinutes}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      openingMinutes: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Açılış Ücreti (₺)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.openingPrice}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      openingPrice: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Dakika Ücreti (₺)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.pricePerMinute}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      pricePerMinute: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Ek Kol Ücreti (₺)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.extraControllerFee}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      extraControllerFee: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {mode === "edit" && (
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-[#12121e] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Aktif Tarife</p>
                  <p className="text-xs text-white/40">
                    Pasif tarifeler masa açılışında listelenmez
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                  }
                  className={cn(
                    "relative h-7 w-12 rounded-full transition-colors",
                    form.isActive ? "bg-emerald-500" : "bg-white/10",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
                      form.isActive ? "left-6" : "left-1",
                    )}
                  />
                </button>
              </label>
            )}

            <div className="rounded-xl border border-[#6366f1]/20 bg-[#6366f1]/5 p-4 text-sm text-white/60">
              <p className="font-medium text-[#a5b4fc]">Önizleme</p>
              <p className="mt-2">
                İlk {form.openingMinutes || "0"} dk{" "}
                <span className="text-white">₺{form.openingPrice || "0"}</span>
                , sonrasında{" "}
                <span className="text-white">
                  ₺{form.pricePerMinute || "0"} / dk
                </span>
              </p>
              {Number(form.extraControllerFee) > 0 && (
                <p className="mt-1">
                  Ek kol:{" "}
                  <span className="text-white">
                    ₺{form.extraControllerFee}
                  </span>
                </p>
              )}
              <p className="mt-1 text-xs text-white/35">
                {getTariffDeviceLabel(form.deviceType)} cihazları için
              </p>
            </div>

            {submitError && (
              <p className="text-sm text-rose-400">{submitError}</p>
            )}
          </div>

          <div className="flex gap-3 border-t border-white/5 px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5 text-sm font-medium text-white/70 hover:text-white disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6366f1] py-2.5 text-sm font-semibold text-white hover:bg-[#5558e3] disabled:opacity-60"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Tarife Ekle" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
