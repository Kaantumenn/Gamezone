"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Gamepad2, Loader2, Receipt, RotateCcw, X } from "lucide-react";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { ControllerChangesList } from "@/components/session/ControllerChangesList";
import { CrossDeviceTransferSummary } from "@/components/session/CrossDeviceTransferSummary";
import { useCashboxAccountDetail } from "@/hooks/useCashboxAccountDetail";
import {
  formatCurrency,
  formatDateTimeFromIso,
} from "@/lib/format";
import {
  getCashboxDeviceBadgeClass,
  getCashboxDeviceBadgeLabel,
  hasCrossDeviceTransfer,
} from "@/lib/cashboxDevice";
import { reopenSession } from "@/services/sessions";
import type { CashboxAccount } from "@/types/cashbox";
import { cn } from "@/lib/utils";

interface CashboxAccountDetailModalProps {
  account: CashboxAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onReopenSuccess?: () => void;
}

export function CashboxAccountDetailModal({
  account,
  isOpen,
  onClose,
  onReopenSuccess,
}: CashboxAccountDetailModalProps) {
  const sessionId = account?.sessionId ?? null;
  const { data: detail, isLoading, isError, refetch } = useCashboxAccountDetail(
    sessionId,
    isOpen,
  );

  const reopenMutation = useMutation({
    mutationFn: reopenSession,
    onSuccess: () => {
      onReopenSuccess?.();
      onClose();
    },
  });

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !account) return null;

  const remainingTotal = detail?.remainingTotal ?? account.remainingTotal;
  const mergedUsageTotal = detail?.mergedUsageTotal ?? account.mergedUsageTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Kapat"
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                account.deviceType === "steering"
                  ? "bg-[#3b82f6]/15 text-[#60a5fa]"
                  : "bg-[#6366f1]/15 text-[#818cf8]",
              )}
            >
              {account.deviceType === "steering" ? (
                <SteeringWheelIcon className="h-5 w-5" />
              ) : (
                <Gamepad2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">
                  {detail?.psNo ?? account.psNo} Hesap Detayı
                </h2>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                    getCashboxDeviceBadgeClass(
                      account.deviceType,
                      mergedUsageTotal,
                    ),
                  )}
                >
                  {getCashboxDeviceBadgeLabel(
                    account.deviceType,
                    mergedUsageTotal,
                  )}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-white/40">
                Oturum #{sessionId ?? "—"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white/80"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-white/40">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Detay yükleniyor...
            </div>
          ) : isError || !detail ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-white/50">
              <p>Hesap detayı yüklenemedi.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm text-white"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <section className="rounded-xl border border-white/10 bg-[#12121e] p-4">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Kullanım Detayı
                </h3>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/45">Başlangıç</dt>
                    <dd className="text-white/80">
                      {formatDateTimeFromIso(detail.startedAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/45">Bitiş</dt>
                    <dd className="text-white/80">
                      {formatDateTimeFromIso(detail.endedAt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/45">Süre</dt>
                    <dd className="font-medium text-[#818cf8]">
                      {detail.elapsedText}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/45">Tarife</dt>
                    <dd className="text-right text-white/80">
                      {detail.tariffName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/45">Kol Sayısı</dt>
                    <dd className="text-white/80">
                      {detail.controllerCount} Kol
                      {detail.controllerMultiplier > 1 && (
                        <span className="ml-1 text-white/40">
                          (x{detail.controllerMultiplier})
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-white/5 pt-3">
                    <dt className="font-medium text-white/70">Kullanım Toplamı</dt>
                    <dd className="font-bold text-[#818cf8]">
                      ₺{formatCurrency(detail.gameTotal)}
                    </dd>
                  </div>
                </dl>
              </section>

              <CrossDeviceTransferSummary
                closingDeviceType={account.deviceType}
                mergedUsageTotal={mergedUsageTotal}
                currentUsageTotal={detail.gameTotal}
              />

              <section className="rounded-xl border border-white/10 bg-[#12121e] p-4">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Sipariş Kalemleri
                </h3>
                {detail.orders.length > 0 ? (
                  <div className="space-y-2">
                    {detail.orders.map((order, index) => (
                      <div
                        key={order.id ?? `${order.name}-${index}`}
                        className="flex justify-between text-sm text-white/75"
                      >
                        <span>
                          {order.quantity} x {order.name}
                        </span>
                        <span>₺{formatCurrency(order.total)}</span>
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
                  <span className="text-sm font-bold text-rose-300">
                    ₺{formatCurrency(detail.orderTotal)}
                  </span>
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-[#12121e] p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Receipt className="h-4 w-4 text-emerald-400" />
                  Hesap Özeti
                </h3>
                <ControllerChangesList
                  changes={detail.controllerChanges}
                  className="mb-4 border-b border-white/5 pb-4"
                />
                <div className="space-y-2 text-sm">
                  {hasCrossDeviceTransfer(mergedUsageTotal) ? (
                    <>
                      <div className="flex justify-between text-white/70">
                        <span>Önceki Cihaz Kullanımı</span>
                        <span className="text-amber-300">
                          ₺{formatCurrency(mergedUsageTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-white/70">
                        <span>Mevcut Cihaz Kullanımı</span>
                        <span>₺{formatCurrency(detail.gameTotal)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2 font-medium text-white/85">
                        <span>Oyun Ücreti</span>
                        <span>
                          ₺
                          {formatCurrency(
                            detail.gameTotal + mergedUsageTotal,
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-white/70">
                      <span>Oyun Ücreti</span>
                      <span>₺{formatCurrency(detail.gameTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/70">
                    <span>Sipariş Toplamı</span>
                    <span>₺{formatCurrency(detail.orderTotal)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Nakit</span>
                    <span className="text-amber-300">
                      ₺{formatCurrency(detail.cashTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Kart</span>
                    <span className="text-sky-300">
                      ₺{formatCurrency(detail.cardTotal)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex justify-between",
                      remainingTotal > 0
                        ? "font-medium text-amber-300"
                        : "text-white/70",
                    )}
                  >
                    <span>Eksik Kalan</span>
                    <span>₺{formatCurrency(remainingTotal)}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between border-t border-white/5 pt-4">
                  <span className="text-sm font-semibold text-white">
                    Genel Toplam
                  </span>
                  <span className="text-xl font-bold text-emerald-400">
                    ₺{formatCurrency(detail.grandTotal)}
                  </span>
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-white/5 px-5 py-4">
          <button
            type="button"
            onClick={() => sessionId && reopenMutation.mutate(sessionId)}
            disabled={!sessionId || reopenMutation.isPending}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white",
              "bg-[#6366f1] hover:bg-[#5558e3] disabled:opacity-50",
            )}
          >
            {reopenMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Tekrar Aç
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={reopenMutation.isPending}
            className={cn(
              "flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5",
              "text-sm font-medium text-white/70 hover:text-white disabled:opacity-50",
            )}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
