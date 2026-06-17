"use client";

import { useMemo, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Calendar,
  CalendarRange,
  CreditCard,
  Gamepad2,
  Loader2,
  Receipt,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCashbox } from "@/hooks/useCashbox";
import { useCashboxAccounts } from "@/hooks/useCashboxAccounts";
import { CashboxAccountsTable } from "@/components/cashbox/CashboxAccountsTable";
import {
  formatCurrency,
  formatDateLabel,
  formatDateTimeFromIso,
  toDateInputValue,
} from "@/lib/format";
import type { CashboxViewMode } from "@/types/cashbox";
import { cn } from "@/lib/utils";

const viewModes: { id: CashboxViewMode; label: string; icon: React.ReactNode }[] =
  [
    { id: "today", label: "Bugün", icon: <Wallet className="h-4 w-4" /> },
    { id: "date", label: "Tarih", icon: <Calendar className="h-4 w-4" /> },
    {
      id: "range",
      label: "Aralık",
      icon: <CalendarRange className="h-4 w-4" />,
    },
  ];

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12121e] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-white/40">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            accent,
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  amount,
  total,
  colorClass,
}: {
  label: string;
  amount: number;
  total: number;
  colorClass: string;
}) {
  const percent = total > 0 ? Math.min(100, (amount / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-base">
        <span className="text-white/60">{label}</span>
        <span className="font-medium text-white">
          ₺{formatCurrency(amount)}{" "}
          <span className="text-white/35">({percent.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function CashboxContent() {
  const queryClient = useQueryClient();
  const today = toDateInputValue();
  const monthStart = toDateInputValue(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const [mode, setMode] = useState<CashboxViewMode>("today");
  const [selectedDate, setSelectedDate] = useState(today);
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(today);

  const { data, isLoading, isError, refetch, isFetching } = useCashbox({
    mode,
    date: selectedDate,
    startDate,
    endDate,
  });

  const {
    data: accounts = [],
    isLoading: accountsLoading,
    isError: accountsError,
  } = useCashboxAccounts({
    mode,
    today,
    selectedDate,
    startDate,
    endDate,
  });

  const title = useMemo(() => {
    if (mode === "today") return "Bugünkü Kasa";
    if (mode === "date") return `${formatDateLabel(selectedDate)} Kasa Özeti`;
    return `${formatDateLabel(startDate)} — ${formatDateLabel(endDate)}`;
  }, [mode, selectedDate, startDate, endDate]);

  const totals = data?.totals;

  const accountsSubtitle = useMemo(() => {
    if (mode === "today") return formatDateLabel(today);
    if (mode === "date") return formatDateLabel(selectedDate);
    return `${formatDateLabel(startDate)} — ${formatDateLabel(endDate)}`;
  }, [mode, today, selectedDate, startDate, endDate]);

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["devices"] });
    void queryClient.invalidateQueries({ queryKey: ["cashbox"] });
    void queryClient.invalidateQueries({ queryKey: ["cashbox-accounts"] });
    void refetch();
  }, [queryClient, refetch]);

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Kasa / Hesaplar</h1>
            <p className="text-base text-white/40">{title}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isFetching || accountsLoading}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white/70 transition-colors hover:border-emerald-500/30 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              (isFetching || accountsLoading) && "animate-spin",
            )}
          />
          Yenile
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-white/10 bg-[#0b0e14] p-1">
          {viewModes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                mode === item.id
                  ? "bg-emerald-600 text-white shadow-[0_0_16px_rgba(16,185,129,0.2)]"
                  : "text-white/45 hover:text-white/70",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {mode === "date" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/40"
          />
        )}

        {mode === "range" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/40"
            />
            <span className="text-white/30">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/40"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-24 text-white/40">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Kasa verisi yükleniyor...
        </div>
      ) : isError || !totals ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#12121e] py-24 text-white/50">
          <p>Kasa verisi yüklenemedi.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Genel Toplam"
              value={`₺${formatCurrency(totals.grandTotal)}`}
              icon={<TrendingUp className="h-5 w-5" />}
              accent="bg-emerald-500/15 text-emerald-400"
            />
            <StatCard
              label="Nakit"
              value={`₺${formatCurrency(totals.cashTotal)}`}
              icon={<Banknote className="h-5 w-5" />}
              accent="bg-amber-500/15 text-amber-400"
            />
            <StatCard
              label="Kart"
              value={`₺${formatCurrency(totals.cardTotal)}`}
              icon={<CreditCard className="h-5 w-5" />}
              accent="bg-sky-500/15 text-sky-400"
            />
            <StatCard
              label="Oyun Geliri"
              value={`₺${formatCurrency(totals.gameTotal)}`}
              icon={<Gamepad2 className="h-5 w-5" />}
              accent="bg-[#6366f1]/15 text-[#818cf8]"
            />
            <StatCard
              label="Sipariş Geliri"
              value={`₺${formatCurrency(totals.orderTotal)}`}
              icon={<ShoppingBag className="h-5 w-5" />}
              accent="bg-rose-500/15 text-rose-400"
            />
            <StatCard
              label="Kapatılan Masa"
              value={String(totals.accountCount)}
              icon={<Receipt className="h-5 w-5" />}
              accent="bg-white/5 text-white/60"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-[#12121e] p-6">
              <h2 className="mb-4 text-base font-semibold text-white">
                Ödeme Dağılımı
              </h2>
              <div className="space-y-4">
                <ProgressBar
                  label="Nakit"
                  amount={totals.cashTotal}
                  total={totals.grandTotal}
                  colorClass="bg-amber-500"
                />
                <ProgressBar
                  label="Kart"
                  amount={totals.cardTotal}
                  total={totals.grandTotal}
                  colorClass="bg-sky-500"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#12121e] p-6">
              <h2 className="mb-4 text-base font-semibold text-white">
                Gelir Dağılımı
              </h2>
              <div className="space-y-4">
                <ProgressBar
                  label="Oyun"
                  amount={totals.gameTotal}
                  total={totals.grandTotal}
                  colorClass="bg-[#6366f1]"
                />
                <ProgressBar
                  label="Sipariş"
                  amount={totals.orderTotal}
                  total={totals.grandTotal}
                  colorClass="bg-rose-500"
                />
              </div>
            </section>
          </div>

          {data.days.length > 0 && (
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14]">
              <div className="border-b border-white/5 px-5 py-4">
                <h2 className="text-sm font-semibold text-white">
                  Günlük Özet
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-[#0b0e14] text-xs text-white/40">
                    <tr className="border-b border-white/5">
                      <th className="px-5 py-3 font-medium">Tarih</th>
                      <th className="px-5 py-3 font-medium">Nakit</th>
                      <th className="px-5 py-3 font-medium">Kart</th>
                      <th className="px-5 py-3 font-medium">Oyun</th>
                      <th className="px-5 py-3 font-medium">Sipariş</th>
                      <th className="px-5 py-3 font-medium">Toplam</th>
                      <th className="px-5 py-3 font-medium">Masa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.days.map((day) => (
                      <tr
                        key={day.date}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3 text-white/80">
                          {formatDateLabel(day.date)}
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          ₺{formatCurrency(day.cashTotal)}
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          ₺{formatCurrency(day.cardTotal)}
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          ₺{formatCurrency(day.gameTotal)}
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          ₺{formatCurrency(day.orderTotal)}
                        </td>
                        <td className="px-5 py-3 font-medium text-emerald-400">
                          ₺{formatCurrency(day.grandTotal)}
                        </td>
                        <td className="px-5 py-3 text-white/50">
                          {day.accountCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {data.entries.length > 0 && (
            <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14]">
              <div className="border-b border-white/5 px-5 py-4">
                <h2 className="text-sm font-semibold text-white">
                  Kapanan Masalar
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#0b0e14] text-xs text-white/40">
                    <tr className="border-b border-white/5">
                      <th className="px-5 py-3 font-medium">Masa</th>
                      <th className="px-5 py-3 font-medium">Kapanış</th>
                      <th className="px-5 py-3 font-medium">Oyun</th>
                      <th className="px-5 py-3 font-medium">Sipariş</th>
                      <th className="px-5 py-3 font-medium">Nakit</th>
                      <th className="px-5 py-3 font-medium">Kart</th>
                      <th className="px-5 py-3 font-medium">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium text-white">{entry.label}</p>
                          {entry.sublabel && (
                            <p className="text-xs text-white/35">
                              {entry.sublabel}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-white/50">
                          {entry.closedAt
                            ? formatDateTimeFromIso(entry.closedAt)
                            : "—"}
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          ₺{formatCurrency(entry.gameTotal)}
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          ₺{formatCurrency(entry.orderTotal)}
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          ₺{formatCurrency(entry.cashAmount)}
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          ₺{formatCurrency(entry.cardAmount)}
                        </td>
                        <td className="px-5 py-3 font-medium text-emerald-400">
                          ₺{formatCurrency(entry.grandTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <CashboxAccountsTable
            accounts={accounts}
            isLoading={accountsLoading}
            isError={accountsError}
            subtitle={accountsSubtitle}
            onReopenSuccess={handleRefresh}
          />
        </div>
      )}
    </div>
  );
}
