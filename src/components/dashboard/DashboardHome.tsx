"use client";

import { TableSection } from "@/components/dashboard/TableSection";
import { useTabFilter } from "@/context/TabFilterContext";
import { useDevices } from "@/hooks/useDevices";
import { Loader2 } from "lucide-react";

export function DashboardHome() {
  const { activeTab } = useTabFilter();
  const { data, isLoading, isError, refetch } = useDevices();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/50">
        <p>Cihazlar yüklenemedi.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm text-white hover:bg-[#5558e3]"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activeTab === "playstation" ? (
        <TableSection
          id="ps-tables"
          title="PLAYSTATION MASALARI"
          type="playstation"
          tables={data.playstation}
        />
      ) : (
        <TableSection
          id="steering-tables"
          title="DİREKSİYON MASALARI"
          type="steering"
          tables={data.steering}
        />
      )}
    </div>
  );
}
