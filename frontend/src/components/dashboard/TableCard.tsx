"use client";

import type { Table } from "@/types/table";
import { Clock, ChevronRight, Lock, Plus, Target } from "lucide-react";
import { PlayStationLogo } from "@/components/icons/PlayStationLogo";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { useOpenTableModalStore } from "@/stores/openTableModalStore";
import { useCloseTableModalStore } from "@/stores/closeTableModalStore";
import { useAddOrderModalStore } from "@/stores/addOrderModalStore";
import { cn } from "@/lib/utils";

interface TableCardProps {
  table: Table;
}

export function TableCard({ table }: TableCardProps) {
  const openModal = useOpenTableModalStore((s) => s.open);
  const closeModal = useCloseTableModalStore((s) => s.open);
  const addOrderModal = useAddOrderModalStore((s) => s.open);
  const isOpen = table.isOpen;
  const isPS = table.type === "playstation";

  const handleAddOrder = () => addOrderModal(table);
  const handleOpenTable = () => openModal(table);
  const handleCloseTable = () => closeModal(table);

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border transition-all",
        isOpen
          ? isPS
            ? "border-[#6366f1] bg-gradient-to-br from-[#1a1a2e] via-[#12121e] to-[#16162a] shadow-[0_0_28px_rgba(99,102,241,0.28),inset_0_1px_0_rgba(99,102,241,0.15)]"
            : "border-[#3b82f6] bg-gradient-to-br from-[#121a2e] via-[#12121e] to-[#121a2a] shadow-[0_0_28px_rgba(59,130,246,0.28),inset_0_1px_0_rgba(59,130,246,0.15)]"
          : "cursor-pointer border-white/5 bg-[#12121e]/60 hover:border-white/10",
      )}
      onClick={!isOpen ? handleOpenTable : undefined}
      onKeyDown={
        !isOpen
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") handleOpenTable();
            }
          : undefined
      }
      role={!isOpen ? "button" : undefined}
      tabIndex={!isOpen ? 0 : undefined}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <h3
          className={cn(
            "text-sm font-semibold",
            isOpen ? "text-white" : "text-white/80",
          )}
        >
          {table.name}
        </h3>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider",
            isOpen
              ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              : "bg-white/5 text-white/35",
          )}
        >
          {isOpen ? "AÇIK" : "KAPALI"}
        </span>
      </div>

      <button
        type="button"
        onClick={isOpen ? handleAddOrder : undefined}
        className={cn(
          "relative min-h-[100px] flex-1 px-4 py-3 text-left transition-colors",
          isOpen && "cursor-pointer hover:bg-white/[0.02]",
        )}
      >
        {isOpen ? (
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-sm text-white">
              <Clock
                className={cn(
                  "h-3.5 w-3.5",
                  isPS ? "text-[#818cf8]" : "text-[#60a5fa]",
                )}
              />
              <span className="font-mono tracking-wide">{table.elapsedText}</span>
            </div>
            {table.tariffName && (
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Target
                  className={cn(
                    "h-3.5 w-3.5",
                    isPS ? "text-[#818cf8]/70" : "text-[#60a5fa]/70",
                  )}
                />
                <span>{table.tariffName}</span>
              </div>
            )}
            {table.grandTotal > 0 && (
              <p className="text-sm font-medium text-white">
                ₺{table.grandTotal}
                <span className="text-white/50"> toplam</span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <p className="text-base font-medium text-white/25">Boş</p>
            <p className="text-sm text-white/15">—</p>
          </div>
        )}

        <div
          className={cn(
            "pointer-events-none absolute right-1 top-1/2 -translate-y-1/2",
            isOpen
              ? isPS
                ? "text-[#6366f1] opacity-[0.22]"
                : "text-[#3b82f6] opacity-[0.22]"
              : "text-white opacity-[0.04]",
          )}
        >
          {isPS ? (
            <PlayStationLogo className="h-[88px] w-[88px]" />
          ) : (
            <SteeringWheelIcon className="h-[88px] w-[88px]" />
          )}
        </div>
      </button>

      <div
        className={cn(
          "border-t",
          isOpen
            ? isPS
              ? "border-[#6366f1]/25"
              : "border-[#3b82f6]/25"
            : "border-white/5",
        )}
      >
        {isOpen ? (
          <div className="flex">
            <button
              type="button"
              onClick={handleAddOrder}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors",
                isPS
                  ? "text-white hover:bg-[#6366f1]/15"
                  : "text-white hover:bg-[#3b82f6]/15",
              )}
            >
              <Plus className="h-4 w-4" />
              Sipariş Ekle
            </button>
            <div
              className={cn(
                "w-px",
                isPS ? "bg-[#6366f1]/25" : "bg-[#3b82f6]/25",
              )}
            />
            <button
              type="button"
              onClick={handleCloseTable}
              className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm text-rose-400/80 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Lock className="h-3.5 w-3.5" />
              Kapat
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenTable();
            }}
            className="flex w-full items-center justify-between px-4 py-3 text-sm text-white/30 transition-colors hover:bg-white/5 hover:text-white/50"
          >
            <span>Masayı Aç</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
