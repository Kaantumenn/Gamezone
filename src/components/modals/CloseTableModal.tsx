"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  Lock,
  Loader2,
  Minus,
  Plus,
  Receipt,
  X,
} from "lucide-react";
import { HelpLabel } from "@/components/ui/HelpLabel";
import { UsageSegmentsList } from "@/components/session/UsageSegmentsList";
import { useMenu } from "@/hooks/useMenu";
import { useSessionCheckout } from "@/hooks/useSessionCheckout";
import { useSessionOrders } from "@/hooks/useSessionOrders";
import {
  formatCurrency,
  formatDateTimeFromIso,
  formatDurationFromMinutes,
  formatSignedCurrency,
} from "@/lib/format";
import { mapSessionOrders } from "@/lib/mapSessionOrders";
import { closeSession, addSessionBonus, removeSessionBonus } from "@/services/sessions";
import { useAddOrderModalStore } from "@/stores/addOrderModalStore";
import { useCloseTableModalStore } from "@/stores/closeTableModalStore";
import { useTimeExpiredModalStore } from "@/stores/timeExpiredModalStore";
import {
  paymentMethodLabels,
  paymentMethodOptions,
  type CloseSessionBody,
  type PaymentEntry,
  type PaymentMethodType,
} from "@/types/closeSession";

function createPaymentId() {
  return `payment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseAmount(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isNaN(parsed) ? 0 : parsed;
}

const PAYMENT_TOLERANCE = 0.01;

function getPaymentState(grandTotal: number, totalPaid: number) {
  const isFullyPaid = Math.abs(grandTotal - totalPaid) < PAYMENT_TOLERANCE;
  const isOverpaid = totalPaid > grandTotal + PAYMENT_TOLERANCE;
  const isPartiallyPaid =
    totalPaid > PAYMENT_TOLERANCE &&
    totalPaid < grandTotal - PAYMENT_TOLERANCE;
  const canSubmit = totalPaid > PAYMENT_TOLERANCE;

  return { isFullyPaid, isOverpaid, isPartiallyPaid, canSubmit };
}

export function CloseTableModal() {
  const queryClient = useQueryClient();
  const { table, isOpen, close } = useCloseTableModalStore();
  const clearSuppression = useTimeExpiredModalStore((s) => s.clearSuppression);
  const lastSessionIdRef = useRef<number | null>(null);
  const openAddOrderModal = useAddOrderModalStore((s) => s.open);
  const {
    data: checkout,
    isLoading,
    isError,
    refetch,
  } = useSessionCheckout(table?.sessionId, isOpen);
  const { data: menu } = useMenu();
  const {
    data: sessionOrders = [],
    isLoading: ordersLoading,
    isError: ordersError,
  } = useSessionOrders(table?.sessionId, isOpen);

  const orderLines = useMemo(
    () => mapSessionOrders(sessionOrders, menu?.products ?? []),
    [sessionOrders, menu?.products],
  );

  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [personCount, setPersonCount] = useState(2);
  const [note, setNote] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusError, setBonusError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const grandTotal = checkout?.grandTotal ?? 0;

  const closeSessionMutation = useMutation({
    mutationFn: ({
      sessionId,
      body,
    }: {
      sessionId: number;
      body: CloseSessionBody;
    }) => closeSession(sessionId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      close();
    },
    onError: () => {
      setSubmitError("Masa kapatılırken bir hata oluştu. Lütfen tekrar deneyin.");
    },
  });

  const invalidateCheckout = () => {
    queryClient.invalidateQueries({
      queryKey: ["session-checkout", table?.sessionId],
    });
  };

  const addBonusMutation = useMutation({
    mutationFn: (amount: number) =>
      addSessionBonus(table!.sessionId!, { amount }),
    onSuccess: () => {
      invalidateCheckout();
      setBonusAmount("");
      setBonusError(null);
    },
    onError: () => {
      setBonusError("Bonus eklenemedi. Lütfen tekrar deneyin.");
    },
  });

  const removeBonusMutation = useMutation({
    mutationFn: (amount: number) =>
      removeSessionBonus(table!.sessionId!, { amount }),
    onSuccess: () => {
      invalidateCheckout();
      setBonusAmount("");
      setBonusError(null);
    },
    onError: () => {
      setBonusError("Bonus silinemedi. Lütfen tekrar deneyin.");
    },
  });

  const isBonusPending =
    addBonusMutation.isPending || removeBonusMutation.isPending;

  useEffect(() => {
    if (isOpen && table?.sessionId) {
      lastSessionIdRef.current = table.sessionId;
      return;
    }

    if (!isOpen && lastSessionIdRef.current) {
      clearSuppression(lastSessionIdRef.current);
      lastSessionIdRef.current = null;
    }
  }, [isOpen, table?.sessionId, clearSuppression]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !checkout) return;

    setPayments([
      {
        id: createPaymentId(),
        method: "CASH",
        amount: String(checkout.grandTotal),
      },
    ]);
    setPersonCount(2);
    setNote("");
    setBonusAmount("");
    setBonusError(null);
    setSubmitError(null);
  }, [isOpen, checkout]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !closeSessionMutation.isPending) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close, closeSessionMutation.isPending]);

  const totalPaid = useMemo(
    () => payments.reduce((sum, p) => sum + parseAmount(p.amount), 0),
    [payments],
  );

  const remaining = useMemo(
    () => Math.max(0, grandTotal - totalPaid),
    [grandTotal, totalPaid],
  );

  const overpaidAmount = useMemo(
    () => Math.max(0, totalPaid - grandTotal),
    [grandTotal, totalPaid],
  );

  const { isFullyPaid, isOverpaid, isPartiallyPaid, canSubmit } = useMemo(
    () => getPaymentState(grandTotal, totalPaid),
    [grandTotal, totalPaid],
  );

  const perPerson = useMemo(
    () =>
      personCount > 0
        ? Math.ceil((grandTotal / personCount) * 100) / 100
        : 0,
    [grandTotal, personCount],
  );

  if (!isOpen || !table) return null;

  const updatePayment = (id: string, patch: Partial<PaymentEntry>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  };

  const addPayment = () => {
    setPayments((prev) => [
      ...prev,
      {
        id: createPaymentId(),
        method: "CARD",
        amount: remaining > 0 ? String(remaining) : "",
      },
    ]);
  };

  const removePayment = (id: string) => {
    setPayments((prev) =>
      prev.length > 1 ? prev.filter((p) => p.id !== id) : prev,
    );
  };

  const handleSubmit = () => {
    if (!checkout || !table.sessionId || !canSubmit || closeSessionMutation.isPending) {
      return;
    }

    const body: CloseSessionBody = {
      payments: payments
        .map((p) => ({
          method: p.method,
          amount: parseAmount(p.amount),
        }))
        .filter((p) => p.amount > 0),
    };

    const trimmedNote = note.trim();
    if (trimmedNote) {
      body.note = trimmedNote;
    }

    closeSessionMutation.mutate({
      sessionId: table.sessionId,
      body,
    });
  };

  const handleOpenOrderSummary = () => {
    if (!table || closeSessionMutation.isPending) return;
    close();
    openAddOrderModal(table);
  };

  const handleAddBonus = () => {
    const amount = parseAmount(bonusAmount);
    if (amount <= 0 || isBonusPending || !table?.sessionId) return;
    addBonusMutation.mutate(amount);
  };

  const handleRemoveBonus = () => {
    const amount = parseAmount(bonusAmount);
    if (amount <= 0 || isBonusPending || !table?.sessionId) return;
    removeBonusMutation.mutate(amount);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !closeSessionMutation.isPending && close()}
        aria-label="Kapat"
      />

      <div className="relative z-10 flex max-h-[95vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/5 px-4 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {checkout?.deviceName ?? table.name} Masasını Kapat
              </h2>
              <p className="mt-0.5 text-sm text-white/40">
                Masa #{checkout?.deviceId ?? table.deviceId} • Oturum #
                {checkout?.sessionId ?? table.sessionId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={closeSessionMutation.isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/80 disabled:opacity-50"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
            </div>
          ) : isError || !checkout ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/50">
              <p>Hesap özeti yüklenemedi.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm text-white"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <section className="rounded-xl border border-white/10 bg-[#12121e] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">
                    Kullanım Özeti
                  </h3>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/45">Açılış Saati</dt>
                      <dd className="text-white/80">
                        {formatDateTimeFromIso(checkout.usage.startedAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/45">Toplam Süre</dt>
                      <dd className="font-medium text-[#818cf8]">
                        {checkout.usage.elapsedText} (
                        {formatDurationFromMinutes(checkout.usage.elapsedMinutes)})
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/45">Tarife</dt>
                      <dd className="text-right text-white/80">
                        {checkout.tariffName}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/45">Kol Sayısı</dt>
                      <dd className="text-white/80">
                        {checkout.usage.controllerCount} Kol
                        {(checkout.usage.controllerMultiplier ?? 1) > 1 && (
                          <span className="ml-1 text-white/40">
                            (x{checkout.usage.controllerMultiplier})
                          </span>
                        )}
                      </dd>
                    </div>

                    <UsageSegmentsList
                      segments={checkout.usageSegments}
                      className="border-t border-white/5 pt-3"
                    />

                    <div className="flex justify-between gap-4 border-t border-white/5 pt-3">
                      <dt className="text-white/45">Kullanım Toplamı</dt>
                      <dd className="font-medium text-[#818cf8]">
                        ₺{formatCurrency(checkout.usage.gameTotal)}
                      </dd>
                    </div>
                  </dl>
                </section>

                {checkout.mergedSessions.length > 0 && (
                  <section className="rounded-xl border border-[#6366f1]/20 bg-[#6366f1]/5 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-white">
                      Birleştirilen Masalar
                    </h3>
                    <div className="space-y-2">
                      {checkout.mergedSessions.map((merged) => (
                        <p
                          key={merged.id}
                          className="text-sm leading-relaxed text-white/75"
                        >
                          <span className="font-medium text-[#c7d2fe]">
                            {merged.sourceDeviceName.replace(
                              /PS(\d+)/i,
                              "PS $1",
                            )}
                          </span>
                          <span className="text-white/35"> → </span>
                          <span>
                            Kullanım: ₺{formatCurrency(merged.sourceGameTotal)}
                            , Sipariş: ₺
                            {formatCurrency(merged.sourceOrderTotal)}, Toplam: ₺
                            {formatCurrency(merged.sourceGrandTotal)}
                          </span>
                        </p>
                      ))}
                    </div>
                  </section>
                )}

                <section className="rounded-xl border border-white/10 bg-[#12121e] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">
                    Sipariş Kalemleri
                  </h3>
                  {ordersLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-white/40">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Siparişler yükleniyor...
                    </div>
                  ) : ordersError ? (
                    <p className="text-sm text-rose-400/80">
                      Siparişler yüklenemedi.
                    </p>
                  ) : orderLines.length > 0 ? (
                    <div className="space-y-2">
                      {orderLines.map((order) => (
                        <div
                          key={order.orderItemId}
                          className="flex justify-between text-sm text-white/75"
                        >
                          <span>
                            {order.quantity} x {order.name}
                          </span>
                          <span>
                            ₺{formatCurrency(order.price * order.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/30">Sipariş yok</p>
                  )}
                  <div className="mt-3 flex justify-between border-t border-white/5 pt-3">
                    <span className="text-sm font-medium text-white/70">
                      Sipariş Toplamı
                    </span>
                    <span className="text-sm font-bold text-[#818cf8]">
                      ₺{formatCurrency(checkout.orderTotal)}
                    </span>
                  </div>
                </section>

                <section className="rounded-xl border border-white/10 bg-[#12121e] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">
                    Kişi Sayısına Böl (Opsiyonel)
                  </h3>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/45">Kişi Sayısı</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPersonCount((c) => Math.max(1, c - 1))
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#0b0e14] text-white/60 hover:text-white"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-white">
                          {personCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPersonCount((c) => c + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#0b0e14] text-white/60 hover:text-white"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/35">Kişi Başı Tutar</p>
                      <p className="text-sm font-semibold text-[#818cf8]">
                        ₺{formatCurrency(perPerson)}
                        <span className="ml-1 text-xs font-normal text-white/35">
                          (Yuvarlanmış)
                        </span>
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <section className="rounded-xl border border-white/10 bg-[#12121e] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">
                    Hesap Özeti
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Oyun Ücreti</span>
                      <span>₺{formatCurrency(checkout.gameTotal)}</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>Sipariş Toplamı</span>
                      <span>₺{formatCurrency(checkout.orderTotal)}</span>
                    </div>
                    {checkout.bonusTotal !== 0 && (
                      <div
                        className={
                          checkout.bonusTotal > 0
                            ? "flex justify-between text-emerald-400/90"
                            : "flex justify-between text-rose-400/90"
                        }
                      >
                        <span>Bonus</span>
                        <span>{formatSignedCurrency(checkout.bonusTotal)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between border-t border-white/5 pt-4">
                    <span className="text-sm font-semibold text-white">
                      Genel Toplam
                    </span>
                    <span className="text-2xl font-bold text-[#818cf8]">
                      ₺{formatCurrency(checkout.grandTotal)}
                    </span>
                  </div>
                </section>

                <section className="rounded-xl border border-white/10 bg-[#12121e] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">Bonus</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
                        ₺
                      </span>
                      <input
                        type="text"
                        value={bonusAmount}
                        onChange={(e) => {
                          setBonusAmount(e.target.value);
                          setBonusError(null);
                        }}
                        placeholder="Tutar"
                        disabled={isBonusPending}
                        className="w-full rounded-xl border border-white/10 bg-[#0b0e14] py-2.5 pr-3 pl-7 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddBonus}
                      disabled={
                        isBonusPending || parseAmount(bonusAmount) <= 0
                      }
                      className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {addBonusMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Bonus Ekle"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveBonus}
                      disabled={
                        isBonusPending || parseAmount(bonusAmount) <= 0
                      }
                      className="shrink-0 rounded-xl border border-white/10 bg-[#0b0e14] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-rose-500/40 hover:text-rose-400 disabled:opacity-50"
                    >
                      {removeBonusMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Bonus Sil"
                      )}
                    </button>
                  </div>
                  {bonusError && (
                    <p className="mt-2 text-xs text-rose-400">{bonusError}</p>
                  )}
                </section>

                <section className="rounded-xl border border-white/10 bg-[#12121e] p-4">
                  <h3 className="text-sm font-semibold text-white">
                    Ödeme Yöntemi
                  </h3>
                  <p className="mt-1 mb-3 text-xs text-white/35">
                    Birden fazla ödeme yöntemi kullanabilirsiniz.
                  </p>

                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center gap-2">
                        <div className="relative min-w-[130px] flex-1">
                          <select
                            value={payment.method}
                            onChange={(e) =>
                              updatePayment(payment.id, {
                                method: e.target.value as PaymentMethodType,
                              })
                            }
                            className="w-full appearance-none rounded-xl border border-white/10 bg-[#0b0e14] px-3 py-2.5 text-sm text-white outline-none"
                          >
                            {paymentMethodOptions.map((method) => (
                              <option key={method} value={method}>
                                {paymentMethodLabels[method]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
                            ₺
                          </span>
                          <input
                            type="text"
                            value={payment.amount}
                            onChange={(e) =>
                              updatePayment(payment.id, {
                                amount: e.target.value,
                              })
                            }
                            className="w-full rounded-xl border border-white/10 bg-[#0b0e14] py-2.5 pr-3 pl-7 text-sm text-white outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePayment(payment.id)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/30 hover:text-white/60"
                          aria-label="Ödemeyi kaldır"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addPayment}
                    className="mt-3 w-full rounded-xl border border-dashed border-white/15 py-2.5 text-sm text-white/45 transition-colors hover:border-[#6366f1]/40 hover:text-white/70"
                  >
                    + Ödeme Yöntemi Ekle
                  </button>

                  <div className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/45">Ödenen Toplam</span>
                      <span className="font-medium text-emerald-400">
                        ₺{formatCurrency(totalPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/45">
                        {isOverpaid
                          ? "Fazla Tahsilat"
                          : isPartiallyPaid
                            ? "Tahsil Edilmeyen"
                            : "Kalan Tutar"}
                      </span>
                      <span
                        className={
                          isOverpaid
                            ? "font-medium text-sky-300"
                            : isPartiallyPaid
                              ? "font-medium text-amber-400"
                              : "text-white/80"
                        }
                      >
                        ₺
                        {formatCurrency(isOverpaid ? overpaidAmount : remaining)}
                      </span>
                    </div>
                  </div>

                  {isFullyPaid && (
                    <div className="mt-3 rounded-xl border border-[#6366f1]/25 bg-[#6366f1]/10 px-3 py-2.5 text-xs text-[#a5b4fc]">
                      Ödeme toplamı, genel toplam ile eşleşiyor.
                    </div>
                  )}

                  {isPartiallyPaid && (
                    <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200/90">
                      Kısmi tahsilat yapılıyor. ₺{formatCurrency(remaining)} tutarı
                      tahsil edilmeden hesap kapatılacak.
                    </div>
                  )}

                  {isOverpaid && (
                    <div className="mt-3 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-2.5 text-xs text-sky-200/90">
                      Hesap ₺{formatCurrency(overpaidAmount)} fazla tahsil
                      edilerek kapatılacak.
                    </div>
                  )}
                </section>

                <section>
                  <HelpLabel className="mb-2">Not (Opsiyonel)</HelpLabel>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 250))}
                    placeholder="Masayla ilgili not ekleyebilirsiniz..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#12121e] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#6366f1]/50"
                  />
                  <p className="mt-1 text-right text-xs text-white/30">
                    {note.length} / 250
                  </p>
                </section>

                {submitError && (
                  <p className="text-center text-sm text-red-400">{submitError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={handleOpenOrderSummary}
            disabled={closeSessionMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-[#6366f1]/40 hover:text-white disabled:opacity-50 sm:w-auto"
          >
            <ClipboardList className="h-4 w-4" />
            Sipariş Özeti
          </button>

          <div className="flex w-full items-center gap-3 sm:w-auto">
            <button
              type="button"
              onClick={close}
              disabled={closeSessionMutation.isPending}
              className="flex-1 rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50 sm:flex-none sm:px-6"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                closeSessionMutation.isPending ||
                !checkout ||
                !canSubmit
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-rose-600 disabled:opacity-50 sm:flex-none sm:px-6"
            >
              {closeSessionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kapatılıyor...
                </>
              ) : (
                <>
                  Masayı Kapat
                  <Lock className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
