"use client";

import { useMemo, useState } from "react";
import { Eye, Gamepad2, LayoutGrid, Loader2 } from "lucide-react";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { CashboxAccountDetailModal } from "@/components/cashbox/CashboxAccountDetailModal";
import {
  formatCurrency,
  formatDateLabel,
  formatTimeFromIso,
} from "@/lib/format";
import type { CashboxAccount } from "@/types/cashbox";
import type { TableType } from "@/types/table";
import { cn } from "@/lib/utils";

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
  const [selectedAccount, setSelectedAccount] = useState<CashboxAccount | null>(
    null,
  );
  const [deviceFilter, setDeviceFilter] = useState<AccountDeviceFilter>("all");

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
            <table className="w-full min-w-[1320px] text-left text-base">
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
                  <th className="px-5 py-3.5 font-medium">Eksik</th>
                  <th className="px-5 py-3.5 text-right font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
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
                      <td
                        className={cn(
                          "px-5 py-4",
                          account.remainingTotal > 0
                            ? "font-medium text-amber-300"
                            : "text-white/35",
                        )}
                      >
                        ₺{formatCurrency(account.remainingTotal)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedAccount(account)}
                            disabled={!account.sessionId}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                              "border-white/10 bg-[#12121e] text-white/60 hover:border-emerald-500/40 hover:text-white",
                              "disabled:cursor-not-allowed disabled:opacity-40",
                            )}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Detay
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
    </>
  );
}
