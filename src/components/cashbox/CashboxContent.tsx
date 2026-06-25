"use client";

import { useMemo, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Calendar,
  CalendarRange,
  CreditCard,
  Eye,
  EyeOff,
  Gamepad2,
  Loader2,
  Receipt,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MaskedMoney } from "@/components/cashbox/MaskedMoney";
import {
  CashboxDayTimeFilterModal,
  CashboxFilterTrigger,
  CashboxRangeFilterModal,
} from "@/components/cashbox/CashboxFilters";
import { useCashbox } from "@/hooks/useCashbox";
import { useCashboxAccounts } from "@/hooks/useCashboxAccounts";
import { CashboxAccountsTable } from "@/components/cashbox/CashboxAccountsTable";
import {
  buildDayTimeBounds,
  buildRangeTimeBounds,
  filterCashboxByTime,
  formatRangeFilterLabel,
  formatTimeFilterLabel,
  hasDayTimeFilter,
  normalizeTimeInput,
} from "@/lib/cashboxTimeFilter";
import {
  formatCurrency,
  formatDateLabel,
  formatDateTimeFromIso,
  toDateInputValue,
} from "@/lib/format";
import type { CashboxViewMode } from "@/types/cashbox";
import { canViewCashboxHistory } from "@/lib/permissions";
import { useAuthStore } from "@/stores/authStore";
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
  showAmounts,
  maskValue = true,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  showAmounts: boolean;
  maskValue?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12121e] p-5 transition-colors hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white/40">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {maskValue ? (
              <MaskedMoney visible={showAmounts}>{value}</MaskedMoney>
            ) : (
              value
            )}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
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
  showAmounts,
}: {
  label: string;
  amount: number;
  total: number;
  colorClass: string;
  showAmounts: boolean;
}) {
  const percent = total > 0 ? Math.min(100, (amount / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-base">
        <span className="text-white/60">{label}</span>
        <span className="font-medium text-white">
          <MaskedMoney visible={showAmounts}>
            ₺{formatCurrency(amount)}{" "}
            <span className="text-white/35">({percent.toFixed(0)}%)</span>
          </MaskedMoney>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorClass,
            !showAmounts && "opacity-30",
          )}
          style={{ width: showAmounts ? `${percent}%` : "100%" }}
        />
      </div>
    </div>
  );
}

export function CashboxContent() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canViewHistory = canViewCashboxHistory(user);
  const today = toDateInputValue();
  const monthStart = toDateInputValue(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const [mode, setMode] = useState<CashboxViewMode>("today");
  const [selectedDate, setSelectedDate] = useState(today);
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(today);
  const [amountsVisible, setAmountsVisible] = useState(true);
  const [dayStartTime, setDayStartTime] = useState("");
  const [dayEndTime, setDayEndTime] = useState("");
  const [dayTimeModalOpen, setDayTimeModalOpen] = useState(false);
  const [dayTimeDraft, setDayTimeDraft] = useState({
    startTime: "",
    endTime: "",
  });
  const [rangeModalOpen, setRangeModalOpen] = useState(false);
  const [rangeFilter, setRangeFilter] = useState({
    startDate: monthStart,
    startTime: "00:00",
    endDate: today,
    endTime: "23:59",
  });
  const [rangeDraft, setRangeDraft] = useState(rangeFilter);

  const effectiveMode: CashboxViewMode = canViewHistory ? mode : "today";
  const effectiveSelectedDate = canViewHistory ? selectedDate : today;
  const effectiveStartDate = canViewHistory
    ? effectiveMode === "range"
      ? rangeFilter.startDate
      : startDate
    : today;
  const effectiveEndDate = canViewHistory
    ? effectiveMode === "range"
      ? rangeFilter.endDate
      : endDate
    : today;

  const visibleViewModes = canViewHistory
    ? viewModes
    : viewModes.filter((item) => item.id === "today");

  const { data, isLoading, isError, refetch, isFetching } = useCashbox({
    mode: effectiveMode,
    date: effectiveSelectedDate,
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
  });

  const {
    data: accounts = [],
    isLoading: accountsLoading,
    isError: accountsError,
  } = useCashboxAccounts({
    mode: effectiveMode,
    today,
    selectedDate: effectiveSelectedDate,
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
  });

  const timeBounds = useMemo(() => {
    if (effectiveMode === "today") {
      return buildDayTimeBounds(today, dayStartTime, dayEndTime);
    }
    if (effectiveMode === "date") {
      return buildDayTimeBounds(effectiveSelectedDate, dayStartTime, dayEndTime);
    }
    return buildRangeTimeBounds(
      rangeFilter.startDate,
      rangeFilter.startTime,
      rangeFilter.endDate,
      rangeFilter.endTime,
    );
  }, [
    effectiveMode,
    today,
    effectiveSelectedDate,
    dayStartTime,
    dayEndTime,
    rangeFilter,
  ]);

  const filteredReport = useMemo(() => {
    if (!data) return null;

    const filtered = filterCashboxByTime(
      accounts,
      data.entries,
      timeBounds,
    );

    return {
      ...data,
      totals: filtered.totals,
      entries: filtered.entries,
    };
  }, [data, accounts, timeBounds]);

  const filteredAccounts = useMemo(() => {
    if (!data) return accounts;
    return filterCashboxByTime(accounts, data.entries, timeBounds).accounts;
  }, [accounts, data, timeBounds]);

  const showDaysTable = useMemo(() => {
    if (!data?.days.length) return false;
    if (effectiveMode === "range") return false;
    return !hasDayTimeFilter(dayStartTime, dayEndTime);
  }, [data?.days.length, effectiveMode, dayStartTime, dayEndTime]);

  const title = useMemo(() => {
    if (effectiveMode === "today") {
      const timeLabel = formatTimeFilterLabel(dayStartTime, dayEndTime);
      return timeLabel ? `Bugünkü Kasa · ${timeLabel}` : "Bugünkü Kasa";
    }
    if (effectiveMode === "date") {
      const timeLabel = formatTimeFilterLabel(dayStartTime, dayEndTime);
      const base = `${formatDateLabel(effectiveSelectedDate)} Kasa Özeti`;
      return timeLabel ? `${base} · ${timeLabel}` : base;
    }
    return formatRangeFilterLabel(
      rangeFilter.startDate,
      rangeFilter.startTime,
      rangeFilter.endDate,
      rangeFilter.endTime,
    );
  }, [
    effectiveMode,
    effectiveSelectedDate,
    dayStartTime,
    dayEndTime,
    rangeFilter,
  ]);

  const totals = filteredReport?.totals;

  const accountsSubtitle = useMemo(() => {
    if (effectiveMode === "today") {
      const timeLabel = formatTimeFilterLabel(dayStartTime, dayEndTime);
      return timeLabel
        ? `${formatDateLabel(today)} · ${timeLabel}`
        : formatDateLabel(today);
    }
    if (effectiveMode === "date") {
      const timeLabel = formatTimeFilterLabel(dayStartTime, dayEndTime);
      return timeLabel
        ? `${formatDateLabel(effectiveSelectedDate)} · ${timeLabel}`
        : formatDateLabel(effectiveSelectedDate);
    }
    return formatRangeFilterLabel(
      rangeFilter.startDate,
      rangeFilter.startTime,
      rangeFilter.endDate,
      rangeFilter.endTime,
    );
  }, [
    effectiveMode,
    today,
    effectiveSelectedDate,
    dayStartTime,
    dayEndTime,
    rangeFilter,
  ]);

  const handleClearDayTime = useCallback(() => {
    setDayStartTime("");
    setDayEndTime("");
    setDayTimeDraft({ startTime: "", endTime: "" });
    setDayTimeModalOpen(false);
  }, []);

  const openDayTimeModal = useCallback(() => {
    setDayTimeDraft({
      startTime: dayStartTime,
      endTime: dayEndTime,
    });
    setDayTimeModalOpen(true);
  }, [dayStartTime, dayEndTime]);

  const handleApplyDayTime = useCallback(() => {
    setDayStartTime(normalizeTimeInput(dayTimeDraft.startTime));
    setDayEndTime(normalizeTimeInput(dayTimeDraft.endTime));
    setDayTimeModalOpen(false);
  }, [dayTimeDraft]);

  const dayTimeFilterLabel = useMemo(() => {
    const label = formatTimeFilterLabel(dayStartTime, dayEndTime);
    return label ?? "Saat filtresi";
  }, [dayStartTime, dayEndTime]);

  const dayTimeModalDateLabel = useMemo(() => {
    if (effectiveMode === "date") {
      return formatDateLabel(effectiveSelectedDate);
    }
    return formatDateLabel(today);
  }, [effectiveMode, effectiveSelectedDate, today]);

  const openRangeModal = useCallback(() => {
    setRangeDraft(rangeFilter);
    setRangeModalOpen(true);
  }, [rangeFilter]);

  const handleApplyRange = useCallback(() => {
    setRangeFilter({
      ...rangeDraft,
      startTime: normalizeTimeInput(rangeDraft.startTime) || "00:00",
      endTime: normalizeTimeInput(rangeDraft.endTime) || "23:59",
    });
    setRangeModalOpen(false);
  }, [rangeDraft]);

  const handleClearRange = useCallback(() => {
    const cleared = {
      startDate: monthStart,
      startTime: "00:00",
      endDate: today,
      endTime: "23:59",
    };
    setRangeDraft(cleared);
    setRangeFilter(cleared);
    setRangeModalOpen(false);
  }, [monthStart, today]);

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAmountsVisible((prev) => !prev)}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl border transition-all",
              amountsVisible
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
                : "border-white/10 bg-[#12121e] text-white/40 hover:border-white/20 hover:text-white/70",
            )}
            aria-label={amountsVisible ? "Tutarları gizle" : "Tutarları göster"}
            title={amountsVisible ? "Tutarları gizle" : "Tutarları göster"}
          >
            {amountsVisible ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </button>

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
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        {visibleViewModes.length > 1 && (
          <div className="flex rounded-xl border border-white/10 bg-[#0b0e14] p-1">
            {visibleViewModes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  effectiveMode === item.id
                    ? "bg-emerald-600 text-white shadow-[0_0_16px_rgba(16,185,129,0.2)]"
                    : "text-white/45 hover:text-white/70",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}

        {(effectiveMode === "today" || effectiveMode === "date") && (
          <CashboxFilterTrigger
            label={dayTimeFilterLabel}
            onClick={openDayTimeModal}
            active={hasDayTimeFilter(dayStartTime, dayEndTime)}
          />
        )}

        {canViewHistory && effectiveMode === "date" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/40"
          />
        )}

        {canViewHistory && effectiveMode === "range" && (
          <CashboxFilterTrigger
            label={formatRangeFilterLabel(
              rangeFilter.startDate,
              rangeFilter.startTime,
              rangeFilter.endDate,
              rangeFilter.endTime,
            )}
            onClick={openRangeModal}
            active
          />
        )}
      </div>

      <CashboxDayTimeFilterModal
        isOpen={dayTimeModalOpen}
        dateLabel={dayTimeModalDateLabel}
        startTime={dayTimeDraft.startTime}
        endTime={dayTimeDraft.endTime}
        onStartTimeChange={(value) =>
          setDayTimeDraft((prev) => ({ ...prev, startTime: value }))
        }
        onEndTimeChange={(value) =>
          setDayTimeDraft((prev) => ({ ...prev, endTime: value }))
        }
        onApply={handleApplyDayTime}
        onClear={handleClearDayTime}
        onClose={() => setDayTimeModalOpen(false)}
      />

      <CashboxRangeFilterModal
        isOpen={rangeModalOpen}
        startDate={rangeDraft.startDate}
        startTime={rangeDraft.startTime}
        endDate={rangeDraft.endDate}
        endTime={rangeDraft.endTime}
        onStartDateChange={(value) =>
          setRangeDraft((prev) => ({ ...prev, startDate: value }))
        }
        onStartTimeChange={(value) =>
          setRangeDraft((prev) => ({ ...prev, startTime: value }))
        }
        onEndDateChange={(value) =>
          setRangeDraft((prev) => ({ ...prev, endDate: value }))
        }
        onEndTimeChange={(value) =>
          setRangeDraft((prev) => ({ ...prev, endTime: value }))
        }
        onApply={handleApplyRange}
        onClear={handleClearRange}
        onClose={() => setRangeModalOpen(false)}
      />

      {isLoading || accountsLoading ? (
        <div className="flex flex-1 items-center justify-center py-24 text-white/40">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Kasa verisi yükleniyor...
        </div>
      ) : isError || !filteredReport || !totals ? (
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
              showAmounts={amountsVisible}
            />
            <StatCard
              label="Nakit"
              value={`₺${formatCurrency(totals.cashTotal)}`}
              icon={<Banknote className="h-5 w-5" />}
              accent="bg-amber-500/15 text-amber-400"
              showAmounts={amountsVisible}
            />
            <StatCard
              label="Kart"
              value={`₺${formatCurrency(totals.cardTotal)}`}
              icon={<CreditCard className="h-5 w-5" />}
              accent="bg-sky-500/15 text-sky-400"
              showAmounts={amountsVisible}
            />
            <StatCard
              label="Oyun Geliri"
              value={`₺${formatCurrency(totals.gameTotal)}`}
              icon={<Gamepad2 className="h-5 w-5" />}
              accent="bg-[#6366f1]/15 text-[#818cf8]"
              showAmounts={amountsVisible}
            />
            <StatCard
              label="Sipariş Geliri"
              value={`₺${formatCurrency(totals.orderTotal)}`}
              icon={<ShoppingBag className="h-5 w-5" />}
              accent="bg-rose-500/15 text-rose-400"
              showAmounts={amountsVisible}
            />
            <StatCard
              label="Kapatılan Masa"
              value={String(totals.accountCount)}
              icon={<Receipt className="h-5 w-5" />}
              accent="bg-white/5 text-white/60"
              showAmounts={amountsVisible}
              maskValue={false}
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
                  showAmounts={amountsVisible}
                />
                <ProgressBar
                  label="Kart"
                  amount={totals.cardTotal}
                  total={totals.grandTotal}
                  colorClass="bg-sky-500"
                  showAmounts={amountsVisible}
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
                  showAmounts={amountsVisible}
                />
                <ProgressBar
                  label="Sipariş"
                  amount={totals.orderTotal}
                  total={totals.grandTotal}
                  colorClass="bg-rose-500"
                  showAmounts={amountsVisible}
                />
              </div>
            </section>
          </div>

          {showDaysTable && (
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
                    {filteredReport.days.map((day) => (
                      <tr
                        key={day.date}
                        className="border-b border-white/5 hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3 text-white/80">
                          {formatDateLabel(day.date)}
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          <MaskedMoney visible={amountsVisible}>
                            ₺{formatCurrency(day.cashTotal)}
                          </MaskedMoney>
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          <MaskedMoney visible={amountsVisible}>
                            ₺{formatCurrency(day.cardTotal)}
                          </MaskedMoney>
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          <MaskedMoney visible={amountsVisible}>
                            ₺{formatCurrency(day.gameTotal)}
                          </MaskedMoney>
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          <MaskedMoney visible={amountsVisible}>
                            ₺{formatCurrency(day.orderTotal)}
                          </MaskedMoney>
                        </td>
                        <td className="px-5 py-3 font-medium text-emerald-400">
                          <MaskedMoney visible={amountsVisible}>
                            ₺{formatCurrency(day.grandTotal)}
                          </MaskedMoney>
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

          {filteredReport.entries.length > 0 && (
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
                    {filteredReport.entries.map((entry) => (
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
                          <MaskedMoney visible={amountsVisible}>
                            ₺{formatCurrency(entry.gameTotal)}
                          </MaskedMoney>
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          <MaskedMoney visible={amountsVisible}>
                            ₺{formatCurrency(entry.orderTotal)}
                          </MaskedMoney>
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          <MaskedMoney visible={amountsVisible}>
                            ₺{formatCurrency(entry.cashAmount)}
                          </MaskedMoney>
                        </td>
                        <td className="px-5 py-3 text-white/70">
                          <MaskedMoney visible={amountsVisible}>
                            ₺{formatCurrency(entry.cardAmount)}
                          </MaskedMoney>
                        </td>
                        <td className="px-5 py-3 font-medium text-emerald-400">
                          <MaskedMoney visible={amountsVisible}>
                            ₺{formatCurrency(entry.grandTotal)}
                          </MaskedMoney>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <CashboxAccountsTable
            accounts={filteredAccounts}
            isLoading={accountsLoading}
            isError={accountsError}
            subtitle={accountsSubtitle}
            showAmounts={amountsVisible}
            onReopenSuccess={handleRefresh}
          />
        </div>
      )}
    </div>
  );
}
