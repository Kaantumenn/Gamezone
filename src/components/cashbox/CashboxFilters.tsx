"use client";

import { useId, useMemo } from "react";
import { Clock, X } from "lucide-react";
import {
  generateTimeOptions,
  isValidDayTimeRange,
  normalizeTimeInput,
} from "@/lib/cashboxTimeFilter";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#12121e] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/40";

const TIME_PRESETS = [
  { label: "Sabah", start: "08:00", end: "12:00" },
  { label: "Öğle", start: "12:00", end: "17:00" },
  { label: "Akşam", start: "17:00", end: "23:59" },
  { label: "Tüm Gün", start: "09:00", end: "04:00" },
] as const;

interface TimeComboSelectProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

function TimeComboSelect({
  value,
  onChange,
  label,
  placeholder = "Saat seçin veya yazın",
}: TimeComboSelectProps) {
  const listId = useId();
  const options = useMemo(() => generateTimeOptions(30), []);

  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/40">{label}</label>
      <div className="relative">
        <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
        <input
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => {
            const normalized = normalizeTimeInput(e.target.value);
            if (normalized !== e.target.value) {
              onChange(normalized);
            }
          }}
          placeholder={placeholder}
          className={cn(inputClass, "pl-9")}
          inputMode="numeric"
        />
        <datalist id={listId}>
          {options.map((time) => (
            <option key={time} value={time} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

interface FilterModalShellProps {
  title: string;
  subtitle: string;
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
  applyDisabled?: boolean;
  children: React.ReactNode;
  error?: string | null;
}

function FilterModalShell({
  title,
  subtitle,
  isOpen,
  onClose,
  onClear,
  onApply,
  applyDisabled = false,
  children,
  error,
}: FilterModalShellProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Kapat"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-0.5 text-sm text-white/40">{subtitle}</p>
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

        <div className="space-y-5 px-5 py-5">{children}</div>

        {error && (
          <p className="px-5 pb-2 text-sm text-rose-400">{error}</p>
        )}

        <div className="flex gap-3 border-t border-white/5 px-5 py-4">
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white/70 hover:text-white"
          >
            Temizle
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5 text-sm text-white/70 hover:text-white"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={applyDisabled}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Uygula
          </button>
        </div>
      </div>
    </div>
  );
}

interface CashboxDayTimeFilterModalProps {
  isOpen: boolean;
  dateLabel: string;
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function CashboxDayTimeFilterModal({
  isOpen,
  dateLabel,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onApply,
  onClear,
  onClose,
}: CashboxDayTimeFilterModalProps) {
  const normalizedStart = normalizeTimeInput(startTime);
  const normalizedEnd = normalizeTimeInput(endTime);
  const hasInvalidInput =
    (startTime.trim() && !normalizedStart) || (endTime.trim() && !normalizedEnd);
  const isInvalid =
    hasInvalidInput || !isValidDayTimeRange(startTime, endTime);

  return (
    <FilterModalShell
      title="Saat Aralığı"
      subtitle={`${dateLabel} için başlangıç ve bitiş saati seçin`}
      isOpen={isOpen}
      onClose={onClose}
      onClear={onClear}
      onApply={onApply}
      applyDisabled={isInvalid}
      error={
        hasInvalidInput
          ? "Geçerli bir saat girin (ör. 14:30)."
          : !isValidDayTimeRange(startTime, endTime)
            ? "Geçerli bir saat aralığı girin."
            : null
      }
    >
      <div className="flex flex-wrap gap-2">
        {TIME_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              onStartTimeChange(preset.start);
              onEndTimeChange(preset.end);
            }}
            className="rounded-full border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-emerald-500/30 hover:text-white"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TimeComboSelect
          label="Başlangıç Saati"
          value={startTime}
          onChange={onStartTimeChange}
          placeholder="08:00"
        />
        <TimeComboSelect
          label="Bitiş Saati"
          value={endTime}
          onChange={onEndTimeChange}
          placeholder="23:59"
        />
      </div>
    </FilterModalShell>
  );
}

interface CashboxRangeFilterModalProps {
  isOpen: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function CashboxRangeFilterModal({
  isOpen,
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onApply,
  onClear,
  onClose,
}: CashboxRangeFilterModalProps) {
  const normalizedStartTime = normalizeTimeInput(startTime) || "00:00";
  const normalizedEndTime = normalizeTimeInput(endTime) || "23:59";
  const hasInvalidInput =
    (startTime.trim() && !normalizeTimeInput(startTime)) ||
    (endTime.trim() && !normalizeTimeInput(endTime));
  const isInvalid =
    !startDate ||
    !endDate ||
    hasInvalidInput ||
    new Date(`${startDate}T${normalizedStartTime}`).getTime() >
      new Date(`${endDate}T${normalizedEndTime}`).getTime();

  return (
    <FilterModalShell
      title="Tarih Aralığı"
      subtitle="Başlangıç ve bitiş için tarih ile saat seçin"
      isOpen={isOpen}
      onClose={onClose}
      onClear={onClear}
      onApply={onApply}
      applyDisabled={isInvalid}
      error={
        hasInvalidInput
          ? "Geçerli bir saat girin (ör. 14:30)."
          : isInvalid
            ? "Bitiş tarihi ve saati başlangıçtan önce olamaz."
            : null
      }
    >
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Başlangıç</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-white/40">Tarih</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <TimeComboSelect
            label="Saat"
            value={startTime}
            onChange={onStartTimeChange}
            placeholder="00:00"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Bitiş</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-white/40">Tarih</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <TimeComboSelect
            label="Saat"
            value={endTime}
            onChange={onEndTimeChange}
            placeholder="23:59"
          />
        </div>
      </section>
    </FilterModalShell>
  );
}

interface CashboxFilterTriggerProps {
  label: string;
  onClick: () => void;
  active?: boolean;
}

export function CashboxFilterTrigger({
  label,
  onClick,
  active = false,
}: CashboxFilterTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors",
        active
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-white/10 bg-[#12121e] text-white/75 hover:border-emerald-500/30 hover:text-white",
      )}
    >
      <Clock className="h-4 w-4 shrink-0 opacity-70" />
      <span className="truncate">{label}</span>
    </button>
  );
}
