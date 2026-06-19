"use client";

import type { EmployeeSummary } from "@/types/employee";
import { Briefcase, ChevronRight, Package, Phone } from "lucide-react";
import { useEmployeeDetailPanelStore } from "@/stores/employeeDetailPanelStore";
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  employee: EmployeeSummary;
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

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const openPanel = useEmployeeDetailPanelStore((s) => s.open);
  const selectedEmployeeId = useEmployeeDetailPanelStore(
    (s) => s.selectedEmployeeId,
  );
  const isSelected = selectedEmployeeId === employee.id;
  const hasOrders = employee.itemCount > 0 || employee.total > 0;

  const handleOpenDetail = () => openPanel(employee.id);

  return (
    <div
      className={cn(
        "relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#6366f1] bg-gradient-to-br from-[#1a1a2e] via-[#12121e] to-[#16162a] transition-all",
        isSelected
          ? "shadow-[0_0_32px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(99,102,241,0.15)] ring-1 ring-[#6366f1]/60"
          : "shadow-[0_0_28px_rgba(99,102,241,0.28),inset_0_1px_0_rgba(99,102,241,0.15)] hover:border-[#818cf8]",
      )}
      onClick={handleOpenDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleOpenDetail();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="truncate pr-2 text-sm font-semibold text-white">
          {employee.fullName}
        </h3>
        <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]">
          AKTİF
        </span>
      </div>

      <div className="relative min-h-[100px] flex-1 overflow-hidden px-4 py-3">
        <div className="relative z-10 space-y-2">
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Phone className="h-3.5 w-3.5 text-[#818cf8]/70" />
              <span className="truncate">{employee.phone}</span>
            </div>
          )}
          {hasOrders ? (
            <>
              <div className="flex items-center gap-2 text-sm text-white">
                <Package className="h-3.5 w-3.5 text-[#818cf8]" />
                <span>{employee.itemCount} ürün</span>
              </div>
              <p className="text-sm font-medium text-white">
                {formatCardAmount(employee.total)}
              </p>
            </>
          ) : (
            <p className="text-sm text-white/30">Henüz sipariş yok</p>
          )}
        </div>

        <div className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2">
          <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-[#6366f1]/10">
            <Briefcase className="h-10 w-10 text-[#818cf8]/35" />
          </div>
        </div>
      </div>

      <div className="border-t border-[#6366f1]/25">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDetail();
          }}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-[#6366f1]/10 hover:text-white"
        >
          <span>Detay</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
