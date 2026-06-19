"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Clock,
  Gamepad2,
  Loader2,
  Plus,
  Tag,
  Timer,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { SessionControllerChangeModal } from "@/components/modals/SessionControllerChangeModal";
import { SessionStartTimeModal } from "@/components/modals/SessionStartTimeModal";
import { useDevices } from "@/hooks/useDevices";
import { useMenu } from "@/hooks/useMenu";
import { useSessionOrders } from "@/hooks/useSessionOrders";
import { formatTimeFromIso } from "@/lib/format";
import { mapSessionOrders } from "@/lib/mapSessionOrders";
import { useAddOrderModalStore } from "@/stores/addOrderModalStore";
import { useCloseTableModalStore } from "@/stores/closeTableModalStore";
import { useMergeTableModalStore } from "@/stores/mergeTableModalStore";
import { useTransferTableModalStore } from "@/stores/transferTableModalStore";
import { useTableDetailPanelStore } from "@/stores/tableDetailPanelStore";
import { cn } from "@/lib/utils";

function formatPanelAmount(amount: number): string {
  const rounded = Math.round(amount);
  if (Math.abs(amount - rounded) < 0.01) {
    return `${rounded.toLocaleString("tr-TR")} ₺`;
  }

  return `${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}

interface PanelActionButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  variant?: "neutral" | "indigo" | "emerald" | "sky" | "amber";
  className?: string;
}

const panelActionVariants = {
  neutral: {
    button:
      "border-white/12 bg-[#161622] hover:border-white/20 hover:bg-[#1c1c2a]",
    icon: "bg-white/[0.08]",
    label: "text-white/65",
  },
  indigo: {
    button:
      "border-[#6366f1]/45 bg-[#6366f1]/12 hover:border-[#818cf8]/70 hover:bg-[#6366f1]/18 shadow-[0_0_22px_rgba(99,102,241,0.22)]",
    icon: "bg-[#6366f1]/25",
    label: "text-[#c7d2fe]",
  },
  emerald: {
    button:
      "border-emerald-500/45 bg-emerald-500/12 hover:border-emerald-400/70 hover:bg-emerald-500/18 shadow-[0_0_22px_rgba(16,185,129,0.22)]",
    icon: "bg-emerald-500/25",
    label: "text-emerald-200",
  },
  sky: {
    button:
      "border-sky-500/45 bg-sky-500/12 hover:border-sky-400/70 hover:bg-sky-500/18 shadow-[0_0_22px_rgba(14,165,233,0.2)]",
    icon: "bg-sky-500/25",
    label: "text-sky-200",
  },
  amber: {
    button:
      "border-amber-500/45 bg-amber-500/12 hover:border-amber-400/70 hover:bg-amber-500/18 shadow-[0_0_22px_rgba(245,158,11,0.2)]",
    icon: "bg-amber-500/25",
    label: "text-amber-200",
  },
} as const;

function PanelActionButton({
  label,
  onClick,
  disabled,
  icon,
  variant = "neutral",
  className,
}: PanelActionButtonProps) {
  const styles = panelActionVariants[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2.5 rounded-xl border px-2 py-3.5 transition-all",
        "hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
        styles.button,
        className,
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          styles.icon,
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          "text-center text-[11px] font-medium leading-tight",
          styles.label,
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function TableDetailPanel() {
  const selectedDeviceId = useTableDetailPanelStore((s) => s.selectedDeviceId);
  const closePanel = useTableDetailPanelStore((s) => s.close);
  const openAddOrderModal = useAddOrderModalStore((s) => s.open);
  const openCloseModal = useCloseTableModalStore((s) => s.open);
  const openMergeModal = useMergeTableModalStore((s) => s.open);
  const openTransferModal = useTransferTableModalStore((s) => s.open);

  const { data: devicesData } = useDevices();
  const { data: menu } = useMenu();
  const [lastUpdate, setLastUpdate] = useState("");
  const [isStartTimeModalOpen, setStartTimeModalOpen] = useState(false);
  const [isControllerModalOpen, setControllerModalOpen] = useState(false);

  const table = useMemo(() => {
    if (!selectedDeviceId || !devicesData) return null;

    return (
      [...devicesData.playstation, ...devicesData.steering].find(
        (item) => item.deviceId === selectedDeviceId,
      ) ?? null
    );
  }, [selectedDeviceId, devicesData]);

  const {
    data: sessionOrders = [],
    isLoading: ordersLoading,
  } = useSessionOrders(table?.sessionId, !!table?.isOpen);

  const orderLines = useMemo(
    () => mapSessionOrders(sessionOrders, menu?.products ?? []),
    [sessionOrders, menu?.products],
  );

  const orderSubtotal = useMemo(
    () =>
      orderLines.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    [orderLines],
  );

  useEffect(() => {
    if (!selectedDeviceId) {
      setStartTimeModalOpen(false);
      setControllerModalOpen(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (!selectedDeviceId) return;

    const tick = () => {
      const now = new Date();
      setLastUpdate(
        now.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [selectedDeviceId]);

  useEffect(() => {
    if (table && !table.isOpen) {
      closePanel();
    }
  }, [table, closePanel]);

  const isAddOrderOpen = useAddOrderModalStore((s) => s.isOpen);
  const isCloseTableOpen = useCloseTableModalStore((s) => s.isOpen);
  const isMergeOpen = useMergeTableModalStore((s) => s.isOpen);
  const isTransferOpen = useTransferTableModalStore((s) => s.isOpen);

  useEffect(() => {
    if (!selectedDeviceId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isAddOrderOpen || isCloseTableOpen || isMergeOpen || isTransferOpen) return;
      if (isStartTimeModalOpen || isControllerModalOpen) return;

      closePanel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDeviceId, closePanel, isAddOrderOpen, isCloseTableOpen, isMergeOpen, isTransferOpen, isStartTimeModalOpen, isControllerModalOpen]);

  if (!selectedDeviceId || !table) return null;

  const isPS = table.type === "playstation";
  const accentBg = isPS ? "bg-[#6366f1]" : "bg-[#3b82f6]";
  const accentBorder = isPS ? "border-[#6366f1]/30" : "border-[#3b82f6]/30";
  const accentText = isPS ? "text-[#818cf8]" : "text-[#60a5fa]";
  const accentButton = isPS
    ? "border-[#6366f1]/40 text-[#a5b4fc] hover:border-[#6366f1]/60 hover:bg-[#6366f1]/10"
    : "border-[#3b82f6]/40 text-[#93c5fd] hover:border-[#3b82f6]/60 hover:bg-[#3b82f6]/10";

  const handleAddOrder = () => openAddOrderModal(table);
  const handleCloseAccount = () => openCloseModal(table);
  const handleMerge = () => openMergeModal(table);
  const handleTransfer = () => openTransferModal(table);

  return (
    <div className="fixed inset-0 top-[72px] z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={closePanel}
        aria-label="Paneli kapat"
      />
      <aside className="absolute right-0 top-0 flex h-full w-[500px] flex-col border-l border-white/[0.06] bg-[#080810] shadow-[-16px_0_48px_rgba(0,0,0,0.55)]">
      <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold text-white">{table.name}</h2>
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]">
            AÇIK
          </span>
        </div>
        <button
          type="button"
          onClick={closePanel}
          className="rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/5 hover:text-white/70"
          aria-label="Paneli kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-[#0b0e14] p-3">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Clock className={cn("h-4 w-4", accentText)} />
            <span className="text-[10px] text-white/35">Açılış Saati</span>
            <span className="text-sm font-semibold text-white">
              {formatTimeFromIso(table.startedAt)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Timer className={cn("h-4 w-4", accentText)} />
            <span className="text-[10px] text-white/35">Süre</span>
            <span className="text-sm font-semibold text-white">
              {table.elapsedText}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Wallet className={cn("h-4 w-4", accentText)} />
            <span className="text-[10px] text-white/35">Toplam Tutar</span>
            <span className="text-sm font-semibold text-white">
              {formatPanelAmount(table.grandTotal)}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {isPS && (
            <button
              type="button"
              onClick={() => setControllerModalOpen(true)}
              disabled={!table.sessionId}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/8 px-3 py-2.5 text-xs font-medium text-white/70 transition-colors hover:border-fuchsia-500/40 hover:bg-fuchsia-500/12 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Gamepad2 className="h-3.5 w-3.5 text-fuchsia-400/80" />
              Kol Sayısını Güncelle
            </button>
          )}
          <button
            type="button"
            onClick={() => setStartTimeModalOpen(true)}
            disabled={!table.sessionId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/8 px-3 py-2.5 text-xs font-medium text-white/70 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/12 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Clock className="h-3.5 w-3.5 text-cyan-400/80" />
            Açılış Saatini Güncelle
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-2.5 text-[10px] font-bold tracking-[0.14em] text-white/30">
            SİPARİŞLER
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-[#0b0e14]">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-white/30" />
              </div>
            ) : orderLines.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-white/25">
                Henüz sipariş yok
              </p>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {orderLines.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-sm text-white/35">
                        {item.quantity}x
                      </span>
                      <span className="truncate text-sm text-white/85">
                        {item.name}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm text-white/85">
                      {formatPanelAmount(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
              <span className="text-sm text-white/40">Ara Toplam</span>
              <span className="text-sm font-semibold text-white">
                {formatPanelAmount(orderSubtotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2.5 text-[10px] font-bold tracking-[0.14em] text-white/30">
            MASA İŞLEMLERİ
          </p>
          <div className="flex gap-2">
            <PanelActionButton
              label="Masa Aktar"
              onClick={handleTransfer}
              variant="amber"
              icon={<ArrowLeftRight className="h-4 w-4 text-amber-300" />}
            />
            <PanelActionButton
              label="Masa Birleştir"
              onClick={handleMerge}
              variant="indigo"
              icon={<Users className="h-4 w-4 text-[#a5b4fc]" />}
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2.5 text-[10px] font-bold tracking-[0.14em] text-white/30">
            DİĞER İŞLEMLER
          </p>
          <div className="flex gap-2">
            <PanelActionButton
              label="Sipariş Ekle"
              onClick={handleAddOrder}
              variant="emerald"
              icon={<Plus className="h-4 w-4 text-emerald-300" />}
            />
            <PanelActionButton
              label="İndirim Uygula"
              disabled
              variant="sky"
              icon={<Tag className="h-4 w-4 text-sky-300" />}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-5 py-4">
        <button
          type="button"
          onClick={handleCloseAccount}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(244,63,94,0.4)] transition-colors hover:bg-rose-600"
        >
          <XCircle className="h-4 w-4" />
          Hesabı Kapat
        </button>
        <button
          type="button"
          onClick={handleAddOrder}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border bg-transparent py-3 text-sm font-medium transition-colors",
            accentButton,
            accentBorder,
          )}
        >
          <ArrowUpRight className="h-4 w-4" />
          Masa Detayı
        </button>
        <p className="mt-3 text-center text-[11px] text-white/25">
          Son güncelleme: {lastUpdate}
        </p>
      </div>
      </aside>

      <SessionStartTimeModal
        isOpen={isStartTimeModalOpen}
        onClose={() => setStartTimeModalOpen(false)}
        sessionId={table.sessionId}
        startedAt={table.startedAt}
        accentClass={accentBg}
      />

      {isPS && (
        <SessionControllerChangeModal
          isOpen={isControllerModalOpen}
          onClose={() => setControllerModalOpen(false)}
          sessionId={table.sessionId}
          controllerCount={table.controllerCount ?? 2}
          accentBg={accentBg}
        />
      )}
    </div>
  );
}
