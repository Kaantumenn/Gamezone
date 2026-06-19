"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Loader2,
  Package,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { useEmployee } from "@/hooks/useEmployee";
import { useEmployees } from "@/hooks/useEmployees";
import { useMenu } from "@/hooks/useMenu";
import { mapEmployeeOrders } from "@/lib/mapEmployeeOrders";
import { deleteEmployee } from "@/services/employees";
import { useEmployeeDetailPanelStore } from "@/stores/employeeDetailPanelStore";
import { useEmployeeOrderModalStore } from "@/stores/employeeOrderModalStore";
import { EmployeeFormModal } from "@/components/modals/EmployeeFormModal";
import { cn } from "@/lib/utils";

const EMPLOYEE_DELETE_PASSWORD = "Mkaantumen13.";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-rose-500/50";

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
  variant?: "neutral" | "indigo" | "emerald" | "rose";
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
  rose: {
    button:
      "border-rose-500/45 bg-rose-500/12 hover:border-rose-400/70 hover:bg-rose-500/18 shadow-[0_0_22px_rgba(244,63,94,0.22)]",
    icon: "bg-rose-500/25",
    label: "text-rose-200",
  },
} as const;

function PanelActionButton({
  label,
  onClick,
  disabled,
  icon,
  variant = "neutral",
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

export function EmployeeDetailPanel() {
  const queryClient = useQueryClient();
  const selectedEmployeeId = useEmployeeDetailPanelStore(
    (s) => s.selectedEmployeeId,
  );
  const closePanel = useEmployeeDetailPanelStore((s) => s.close);
  const openOrderModal = useEmployeeOrderModalStore((s) => s.open);
  const isOrderModalOpen = useEmployeeOrderModalStore((s) => s.isOpen);

  const { data: employees = [] } = useEmployees();
  const { data: employeeDetail, isLoading: detailLoading } = useEmployee(
    selectedEmployeeId,
    !!selectedEmployeeId,
  );
  const { data: menu } = useMenu();

  const [lastUpdate, setLastUpdate] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState<string | null>(
    null,
  );
  const deletePasswordRef = useRef<HTMLInputElement>(null);

  const employeeSummary = useMemo(
    () => employees.find((item) => item.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId],
  );

  const orderLines = useMemo(
    () => mapEmployeeOrders(employeeDetail, menu?.products ?? []),
    [employeeDetail, menu?.products],
  );

  const orderSubtotal = useMemo(
    () =>
      orderLines.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    [orderLines],
  );

  const itemCount = useMemo(
    () => orderLines.reduce((sum, item) => sum + item.quantity, 0),
    [orderLines],
  );

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      closePanel();
      closeDeleteModal();
    },
  });

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletePassword("");
    setDeletePasswordError(null);
  };

  useEffect(() => {
    if (!selectedEmployeeId) {
      setEditOpen(false);
      closeDeleteModal();
    }
  }, [selectedEmployeeId]);

  useEffect(() => {
    if (!deleteModalOpen) return;

    const timerId = window.setTimeout(() => deletePasswordRef.current?.focus(), 50);
    return () => window.clearTimeout(timerId);
  }, [deleteModalOpen]);

  useEffect(() => {
    if (!selectedEmployeeId) return;

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
  }, [selectedEmployeeId]);

  useEffect(() => {
    if (!selectedEmployeeId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isOrderModalOpen || editOpen) return;
      if (deleteModalOpen) {
        closeDeleteModal();
        return;
      }
      closePanel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEmployeeId, closePanel, isOrderModalOpen, editOpen, deleteModalOpen]);

  if (!selectedEmployeeId || !employeeSummary) return null;

  const handleAddOrder = () => openOrderModal(employeeSummary);
  const handleEdit = () => setEditOpen(true);
  const handleDelete = () => {
    setDeletePassword("");
    setDeletePasswordError(null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletePassword !== EMPLOYEE_DELETE_PASSWORD) {
      setDeletePasswordError("Şifre hatalı.");
      return;
    }
    setDeletePasswordError(null);
    deleteMutation.mutate(selectedEmployeeId);
  };

  return (
    <>
      <div className="fixed inset-0 top-[72px] z-50">
        <button
          type="button"
          className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
          onClick={closePanel}
          aria-label="Paneli kapat"
        />
        <aside className="absolute right-0 top-0 flex h-full w-[500px] flex-col border-l border-white/[0.06] bg-[#080810] shadow-[-16px_0_48px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="truncate text-lg font-semibold text-white">
                  {employeeSummary.fullName}
                </h2>
                <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-[0_0_10px_rgba(16,185,129,0.35)]">
                  AKTİF
                </span>
              </div>
              {employeeSummary.phone && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
                  <Phone className="h-3 w-3" />
                  {employeeSummary.phone}
                </p>
              )}
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
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.06] bg-[#0b0e14] p-3">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Package className="h-4 w-4 text-[#818cf8]" />
                <span className="text-[10px] text-white/35">Ürün Adedi</span>
                <span className="text-sm font-semibold text-white">
                  {itemCount}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <Wallet className="h-4 w-4 text-[#818cf8]" />
                <span className="text-[10px] text-white/35">Toplam Tutar</span>
                <span className="text-sm font-semibold text-white">
                  {formatPanelAmount(
                    employeeDetail?.total ?? employeeSummary.total,
                  )}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2.5 text-[10px] font-bold tracking-[0.14em] text-white/30">
                SİPARİŞLER
              </p>
              <div className="rounded-xl border border-white/[0.06] bg-[#0b0e14]">
                {detailLoading ? (
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
                ÇALIŞAN İŞLEMLERİ
              </p>
              <div className="flex gap-2">
                <PanelActionButton
                  label="Düzenle"
                  onClick={handleEdit}
                  variant="indigo"
                  icon={<Pencil className="h-4 w-4 text-[#a5b4fc]" />}
                />
                <PanelActionButton
                  label="Kaldır"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  variant="rose"
                  icon={
                    deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-rose-300" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-rose-300" />
                    )
                  }
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
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] px-5 py-4">
            <button
              type="button"
              onClick={handleAddOrder}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#6366f1]/40 bg-transparent py-3 text-sm font-medium text-[#a5b4fc] transition-colors hover:border-[#6366f1]/60 hover:bg-[#6366f1]/10"
            >
              <ArrowUpRight className="h-4 w-4" />
              Sipariş Ekle
            </button>
            <p className="mt-3 text-center text-[11px] text-white/25">
              Son güncelleme: {lastUpdate}
            </p>
          </div>
        </aside>
      </div>

      <EmployeeFormModal
        mode="edit"
        employee={employeeSummary}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeDeleteModal}
            aria-label="Kapat"
          />

          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h3 className="text-base font-semibold text-white">
                Çalışanı Kaldır
              </h3>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white/80"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm text-white/50">
                <span className="font-medium text-white/80">
                  {employeeSummary.fullName}
                </span>{" "}
                adlı çalışanı kaldırmak için şifre girin.
              </p>

              <div>
                <label className="mb-1.5 block text-xs text-white/40">
                  Şifre
                </label>
                <input
                  ref={deletePasswordRef}
                  type="password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeletePasswordError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !deleteMutation.isPending) {
                      confirmDelete();
                    }
                  }}
                  placeholder="Şifrenizi girin"
                  className={inputClass}
                />
              </div>

              {deletePasswordError && (
                <p className="text-sm text-rose-400">{deletePasswordError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
                >
                  {deleteMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Kaldır
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
