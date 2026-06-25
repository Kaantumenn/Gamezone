"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, X } from "lucide-react";
import { useCashboxAccountDetail } from "@/hooks/useCashboxAccountDetail";
import { updateCashboxAccount } from "@/services/cashbox";
import type {
  CashboxAccount,
  UpdateCashboxAccountPaymentPayload,
} from "@/types/cashbox";
import { submitFormById } from "@/lib/submitFormById";
import { cn } from "@/lib/utils";

interface CashboxAccountEditModalProps {
  account: CashboxAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditFormState {
  cashTotal: string;
  cardTotal: string;
  note: string;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#12121e] px-3 py-2.5 text-sm text-white outline-none focus:border-[#6366f1]/50 disabled:opacity-50";

function parseMoneyInput(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toMoneyInput(value: number): string {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function amountsMatch(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.005;
}

function buildFormState(detail?: {
  cashTotal: number;
  cardTotal: number;
  note: string | null;
}): EditFormState {
  return {
    cashTotal: toMoneyInput(detail?.cashTotal ?? 0),
    cardTotal: toMoneyInput(detail?.cardTotal ?? 0),
    note: detail?.note ?? "",
  };
}

function buildPaymentsPayload(
  cashTotal: number,
  cardTotal: number,
): UpdateCashboxAccountPaymentPayload[] {
  const payments: UpdateCashboxAccountPaymentPayload[] = [];

  if (cashTotal > 0) {
    payments.push({ method: "CASH", amount: cashTotal });
  }

  if (cardTotal > 0) {
    payments.push({ method: "CARD", amount: cardTotal });
  }

  return payments;
}

export function CashboxAccountEditModal({
  account,
  isOpen,
  onClose,
  onSuccess,
}: CashboxAccountEditModalProps) {
  const queryClient = useQueryClient();
  const sessionId = account?.sessionId ?? null;
  const { data: detail, isLoading: detailLoading } = useCashboxAccountDetail(
    sessionId,
    isOpen,
  );

  const [form, setForm] = useState<EditFormState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grandTotal = detail?.grandTotal ?? account?.grandTotal ?? 0;

  const remainingPreview = useMemo(() => {
    if (!form) return grandTotal;
    const cashTotal = parseMoneyInput(form.cashTotal);
    const cardTotal = parseMoneyInput(form.cardTotal);
    return Number((grandTotal - cashTotal - cardTotal).toFixed(2));
  }, [form, grandTotal]);

  const totalPaid = useMemo(() => {
    if (!form) return 0;
    return parseMoneyInput(form.cashTotal) + parseMoneyInput(form.cardTotal);
  }, [form]);

  const isPaymentMatched = useMemo(() => {
    return amountsMatch(totalPaid, grandTotal);
  }, [totalPaid, grandTotal]);

  const canSubmit = totalPaid > 0.005;

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateCashboxAccount>[1]) =>
      updateCashboxAccount(sessionId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashbox-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["cashbox"] });
      queryClient.invalidateQueries({
        queryKey: ["cashbox-account-detail", sessionId],
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      setError("Ödemeler güncellenemedi. Lütfen tekrar deneyin.");
    },
  });

  useEffect(() => {
    if (!isOpen || !account) return;

    setForm(
      buildFormState(
        detail
          ? {
              cashTotal: detail.cashTotal,
              cardTotal: detail.cardTotal,
              note: detail.note,
            }
          : {
              cashTotal: account.cashTotal,
              cardTotal: account.cardTotal,
              note: null,
            },
      ),
    );
    setError(null);
  }, [isOpen, account, detail]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
        submitFormById("cashbox-account-edit-form");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, mutation.isPending]);

  if (!isOpen || !account || !sessionId) return null;

  const updateField = (patch: Partial<EditFormState>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
    setError(null);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;

    const cashTotal = parseMoneyInput(form.cashTotal);
    const cardTotal = parseMoneyInput(form.cardTotal);

    if (cashTotal + cardTotal <= 0.005) {
      setError("En az bir ödeme tutarı girilmelidir.");
      return;
    }

    mutation.mutate({
      note: form.note.trim() || null,
      payments: buildPaymentsPayload(cashTotal, cardTotal),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !mutation.isPending && onClose()}
        aria-label="Kapat"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-[#818cf8]" />
            <div>
              <h2 className="text-lg font-semibold text-white">Ödemeyi Düzenle</h2>
              <p className="mt-0.5 text-sm text-white/40">
                {detail?.psNo ?? account.psNo} · Oturum #{sessionId}
              </p>
              <p className="mt-1 text-sm text-emerald-400">
                Hesap tutarı: ₺{toMoneyInput(grandTotal)}
              </p>
            </div>
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

        {detailLoading && !form ? (
          <div className="flex flex-1 items-center justify-center py-16 text-white/40">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Veriler yükleniyor...
          </div>
        ) : (
          <form
            id="cashbox-account-edit-form"
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Ödemeler</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs text-white/40">
                      Nakit
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form?.cashTotal ?? ""}
                      onChange={(e) => updateField({ cashTotal: e.target.value })}
                      disabled={mutation.isPending}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-white/40">
                      Kart
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form?.cardTotal ?? ""}
                      onChange={(e) => updateField({ cardTotal: e.target.value })}
                      disabled={mutation.isPending}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-sm",
                    isPaymentMatched
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-amber-500/20 bg-amber-500/10",
                  )}
                >
                  <span
                    className={
                      isPaymentMatched ? "text-emerald-200/80" : "text-amber-200/80"
                    }
                  >
                    {remainingPreview > 0
                      ? "Eksik Kalan"
                      : remainingPreview < 0
                        ? "Fazla Ödeme"
                        : "Ödeme Tamam"}
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      isPaymentMatched ? "text-emerald-300" : "text-amber-300",
                    )}
                  >
                    ₺{toMoneyInput(Math.abs(remainingPreview))}
                  </span>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Not</h3>
                <textarea
                  value={form?.note ?? ""}
                  onChange={(e) => updateField({ note: e.target.value })}
                  disabled={mutation.isPending}
                  rows={3}
                  placeholder="Manuel düzeltme notu..."
                  className={cn(inputClass, "resize-none")}
                />
              </section>

              {error && (
                <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3 border-t border-white/5 px-5 py-4">
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
                disabled={mutation.isPending || !form || !canSubmit}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6366f1] py-2.5 text-sm font-semibold text-white hover:bg-[#5558e3] disabled:opacity-60"
              >
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Kaydet
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
