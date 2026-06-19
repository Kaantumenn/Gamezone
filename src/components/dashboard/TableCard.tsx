"use client";

import type { Table } from "@/types/table";
import { ChevronRight, Clock, Users } from "lucide-react";
import Image from "next/image";
import { useOpenTableModalStore } from "@/stores/openTableModalStore";
import { useTableDetailPanelStore } from "@/stores/tableDetailPanelStore";
import { cn } from "@/lib/utils";

interface TableCardProps {
  table: Table;
}

function formatCardAmount(amount: number): string {
  const rounded = Math.round(amount);
  if (Math.abs(amount - rounded) < 0.01) {
    return `${rounded.toLocaleString("tr-TR")} ₺`;
  }

  return `${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}

export function TableCard({ table }: TableCardProps) {
  const openModal = useOpenTableModalStore((s) => s.open);
  const openPanel = useTableDetailPanelStore((s) => s.open);
  const selectedDeviceId = useTableDetailPanelStore((s) => s.selectedDeviceId);
  const isOpen = table.isOpen;
  const isPS = table.type === "playstation";
  const isSelected = selectedDeviceId === table.deviceId;

  const handleOpenTable = () => openModal(table);
  const handleOpenDetail = () => openPanel(table.deviceId);

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border transition-all",
        isOpen
          ? isPS
            ? cn(
                "cursor-pointer border-[#6366f1] bg-gradient-to-br from-[#1a1a2e] via-[#12121e] to-[#16162a]",
                isSelected
                  ? "shadow-[0_0_32px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(99,102,241,0.15)] ring-1 ring-[#6366f1]/60"
                  : "shadow-[0_0_28px_rgba(99,102,241,0.28),inset_0_1px_0_rgba(99,102,241,0.15)] hover:border-[#818cf8]",
              )
            : cn(
                "cursor-pointer border-[#3b82f6] bg-gradient-to-br from-[#121a2e] via-[#12121e] to-[#121a2a]",
                isSelected
                  ? "shadow-[0_0_32px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(59,130,246,0.15)] ring-1 ring-[#3b82f6]/60"
                  : "shadow-[0_0_28px_rgba(59,130,246,0.28),inset_0_1px_0_rgba(59,130,246,0.15)] hover:border-[#60a5fa]",
              )
          : "cursor-pointer border-white/5 bg-[#12121e]/60 hover:border-white/10",
      )}
      onClick={isOpen ? handleOpenDetail : handleOpenTable}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (isOpen) handleOpenDetail();
          else handleOpenTable();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(
          "flex items-center justify-between px-4 pt-4",
          !isPS && !isOpen && "pb-1",
        )}
      >
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

      <div
        className={cn(
          "relative min-h-[100px] flex-1 overflow-hidden px-4 py-3",
          !isPS && "pt-4 pb-2",
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
            {table.controllerCount != null && table.controllerCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Users
                  className={cn(
                    "h-3.5 w-3.5",
                    isPS ? "text-[#818cf8]/70" : "text-[#60a5fa]/70",
                  )}
                />
                <span>{table.controllerCount} Kişi</span>
              </div>
            )}
            {table.grandTotal > 0 && (
              <p className="text-sm font-medium text-white">
                {formatCardAmount(table.grandTotal)}
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
            "pointer-events-none absolute right-1",
            isPS ? "top-1/2 -translate-y-1/2" : "bottom-1",
          )}
        >
          {isPS ? (
            <Image
              src="/consol_icon.png"
              alt=""
              width={88}
              height={88}
              className={cn(
                "h-[88px] w-[88px] object-contain mix-blend-lighten",
                !isOpen && "opacity-45",
              )}
            />
          ) : (
            <Image
              src="/car-simu.png"
              alt=""
              width={72}
              height={72}
              className={cn(
                "h-[72px] w-[72px] object-contain object-right mix-blend-lighten",
                !isOpen && "opacity-45",
              )}
            />
          )}
        </div>
      </div>

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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetail();
            }}
            className={cn(
              "flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors",
              isPS
                ? "text-white/70 hover:bg-[#6366f1]/10 hover:text-white"
                : "text-white/70 hover:bg-[#3b82f6]/10 hover:text-white",
            )}
          >
            <span>Detay</span>
            <ChevronRight className="h-4 w-4" />
          </button>
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
