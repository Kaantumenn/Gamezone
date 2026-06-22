"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Gamepad2, LayoutGrid, Loader2, Pencil, Trash2 } from "lucide-react";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { CashboxAccountDetailModal } from "@/components/cashbox/CashboxAccountDetailModal";
import { CashboxAccountEditModal } from "@/components/cashbox/CashboxAccountEditModal";
import {
  formatCurrency,
  formatDateLabel,
  formatTimeFromIso,
} from "@/lib/format";
import {
  canDeleteCashboxAccount,
  canEditCashboxAccount,
} from "@/lib/permissions";
import { deleteCashboxAccount } from "@/services/cashbox";
import { useAuthStore } from "@/stores/authStore";
import type { CashboxAccount } from "@/types/cashbox";
import type { TableType } from "@/types/table";
import { cn } from "@/lib/utils";

const iconActionClass =
  "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40";

type AccountDeviceFilter = "all" | TableType;

const deviceFilters: {
  id: AccountDeviceFilter;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    id: "all",
    label: "HEPSİ",
    icon: <LayoutGrid className="h-4 w-4" />,
    activeClass: "bg-white/10 text-white shadow-[0_0_16px_rgba(255,255,255,0.08)]",
  },
  {
    id: "playstation",
    label: "PLAYSTATION",
    icon: <Gamepad2 className="h-4 w-4" />,
    activeClass: "bg-[#6366f1] text-white shadow-[0_0_16px_rgba(99,102,241,0.35)]",
  },
  {
    id: "steering",
    label: "DİREKSİYON",
    icon: <SteeringWheelIcon className="h-4 w-4" />,
    activeClass: "bg-[#3b82f6] text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]",
  },
];

interface CashboxAccountsTableProps {
  accounts: CashboxAccount[];
  isLoading: boolean;
  isError: boolean;
  subtitle?: string;
  onReopenSuccess?: () => void;
}

export function CashboxAccountsTable({
  accounts,
  isLoading,
  isError,
  subtitle,
  onReopenSuccess,
}: CashboxAccountsTableProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canEdit = canEditCashboxAccount(user);
  const canDelete = canDeleteCashboxAccount(user);

  const [selectedAccount, setSelectedAccount] = useState<CashboxAccount | null>(
    null,
  );
  const [editingAccount, setEditingAccount] = useState<CashboxAccount | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<CashboxAccount | null>(null);
  const [deviceFilter, setDeviceFilter] = useState<AccountDeviceFilter>("all");

  const deleteMutation = useMutation({
    mutationFn: deleteCashboxAccount,
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["cashbox-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["cashbox"] });
      onReopenSuccess?.();
    },
  });

  const filteredAccounts = useMemo(() => {
    if (deviceFilter === "all") return accounts;
    return accounts.filter((account) => account.deviceType === deviceFilter);
  }, [accounts, deviceFilter]);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14]">
        <div className="space-y-4 border-b border-white/5 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Hesap Listesi</h2>
              {subtitle && (
                <p className="mt-0.5 text-xs text-white/35">{subtitle}</p>
              )}
            </div>
            {!isLoading && (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                {filteredAccounts.length} kayıt
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {deviceFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setDeviceFilter(filter.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-all",
                  deviceFilter === filter.id
                    ? filter.activeClass
                    : "bg-[#12121e] text-white/50 hover:text-white/70",
                )}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/40">
            <Loader2 className="h-5 w-5 animate-spin" />
            Hesaplar yükleniyor...
          </div>
        ) : isError ? (
          <div className="px-5 py-16 text-center text-sm text-rose-400/80">
            Hesap listesi yüklenemedi.
          </div>
        ) : accounts.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-white/30">
            Bu dönem için hesap kaydı bulunamadı.
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-white/30">
            Bu filtre için hesap kaydı bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-base">
              <thead className="sticky top-0 z-10 bg-[#10131a] text-sm text-white/40">
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3.5 font-medium">PS No</th>
                  <th className="px-5 py-3.5 font-medium">Başlangıç</th>
                  <th className="px-5 py-3.5 font-medium">Bitiş</th>
                  <th className="px-5 py-3.5 font-medium">Süre</th>
                  <th className="px-5 py-3.5 font-medium">Kol</th>
                  <th className="px-5 py-3.5 font-medium">Kullanım</th>
                  <th className="px-5 py-3.5 font-medium">Sipariş</th>
                  <th className="px-5 py-3.5 font-medium">Toplam</th>
                  <th className="px-5 py-3.5 font-medium">Nakit</th>
                  <th className="px-5 py-3.5 font-medium">Kart</th>
                  <th className="px-5 py-3.5 text-right font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => {
                  const isDeleting =
                    deleteMutation.isPending &&
                    deleteTarget?.sessionId === account.sessionId;

                  return (
                    <tr
                      key={account.id}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366f1]/15 text-[#818cf8]">
                            <Gamepad2 className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-white">
                            {account.psNo}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/70">
                        <p>{formatTimeFromIso(account.startedAt)}</p>
                        <p className="text-xs text-white/30">
                          {account.startedAt
                            ? formatDateLabel(account.startedAt.slice(0, 10))
                            : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-white/70">
                        <p>{formatTimeFromIso(account.endedAt)}</p>
                        <p className="text-xs text-white/30">
                          {account.endedAt
                            ? formatDateLabel(account.endedAt.slice(0, 10))
                            : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-mono text-white/80">
                        {account.durationText}
                      </td>
                      <td className="px-5 py-4 text-white/70">
                        {account.controllerCount}
                      </td>
                      <td className="px-5 py-4 text-[#818cf8]">
                        ₺{formatCurrency(account.gameTotal)}
                      </td>
                      <td className="px-5 py-4 text-rose-300/90">
                        ₺{formatCurrency(account.orderTotal)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-emerald-400">
                        ₺{formatCurrency(account.grandTotal)}
                      </td>
                      <td className="px-5 py-4 text-amber-300/90">
                        ₺{formatCurrency(account.cashTotal)}
                      </td>
                      <td className="px-5 py-4 text-sky-300/90">
                        ₺{formatCurrency(account.cardTotal)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedAccount(account)}
                            disabled={!account.sessionId}
                            aria-label="Detay"
                            className={cn(
                              iconActionClass,
                              "border-white/10 bg-[#12121e] text-white/60 hover:border-emerald-500/40 hover:text-white",
                            )}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => setEditingAccount(account)}
                              disabled={!account.sessionId}
                              aria-label="Düzenle"
                              className={cn(
                                iconActionClass,
                                "border-[#6366f1]/30 bg-[#6366f1]/10 text-[#a5b4fc] hover:border-[#6366f1]/50 hover:text-white",
                              )}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(account)}
                              disabled={!account.sessionId || deleteMutation.isPending}
                              aria-label="İptal et"
                              className={cn(
                                iconActionClass,
                                "border-rose-500/30 bg-rose-500/10 text-rose-300 hover:border-rose-500/50 hover:text-white",
                              )}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CashboxAccountDetailModal
        account={selectedAccount}
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onReopenSuccess={onReopenSuccess}
      />

      {canEdit && (
        <CashboxAccountEditModal
          account={editingAccount}
          isOpen={!!editingAccount}
          onClose={() => setEditingAccount(null)}
          onSuccess={onReopenSuccess}
        />
      )}

      {canDelete && deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !deleteMutation.isPending && setDeleteTarget(null)}
            aria-label="Kapat"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0e14] p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Hesabı İptal Et</h3>
            <p className="mt-2 text-sm text-white/50">
              <span className="text-white">{deleteTarget.psNo}</span> hesabını
              iptal etmek istediğinize emin misiniz? Ödeme kayıtları silinir ve
              hesap tutarları sıfırlanır.
            </p>
            {deleteMutation.isError && (
              <p className="mt-3 text-sm text-rose-400">
                Hesap iptal edilemedi. Lütfen tekrar deneyin.
              </p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5 text-sm text-white/70 hover:text-white disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteTarget.sessionId &&
                  deleteMutation.mutate(deleteTarget.sessionId)
                }
                disabled={!deleteTarget.sessionId || deleteMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
