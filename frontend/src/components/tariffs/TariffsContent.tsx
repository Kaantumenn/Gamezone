"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Gamepad2,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Receipt,
  Timer,
  Trash2,
  Zap,
} from "lucide-react";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { TariffFormModal } from "@/components/modals/TariffFormModal";
import { useTariffsManagement } from "@/hooks/useTariffsManagement";
import { formatCurrency } from "@/lib/format";
import { deleteTariff, getTariffApiErrorMessage } from "@/services/tariffs";
import type { Tariff, TariffDeviceType } from "@/types/tariff";
import { getTariffDeviceLabel } from "@/types/tariff";
import { cn } from "@/lib/utils";

type DeviceFilter = "all" | TariffDeviceType;

const deviceFilters: {
  id: DeviceFilter;
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
    id: "PLAYSTATION",
    label: "PLAYSTATION",
    icon: <Gamepad2 className="h-4 w-4" />,
    activeClass: "bg-[#6366f1] text-white shadow-[0_0_16px_rgba(99,102,241,0.35)]",
  },
  {
    id: "STEERING_WHEEL",
    label: "DİREKSİYON",
    icon: <SteeringWheelIcon className="h-4 w-4" />,
    activeClass: "bg-[#3b82f6] text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]",
  },
];

function getHourlyRate(tariff: Tariff): number {
  return Number(tariff.pricePerMinute) * 60;
}

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
    <div className="rounded-2xl border border-white/10 bg-[#12121e] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/40">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            accent,
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function TariffCard({
  tariff,
  onEdit,
  onDeactivate,
}: {
  tariff: Tariff;
  onEdit: (tariff: Tariff) => void;
  onDeactivate: (tariff: Tariff) => void;
}) {
  const isPlaystation = tariff.deviceType === "PLAYSTATION";

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-[#12121e] p-5 transition-all",
        tariff.isActive
          ? "border-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          : "border-white/5 opacity-60",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl",
          isPlaystation ? "bg-[#6366f1]/20" : "bg-[#3b82f6]/20",
        )}
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                isPlaystation
                  ? "bg-[#6366f1]/15 text-[#818cf8]"
                  : "bg-[#3b82f6]/15 text-[#60a5fa]",
              )}
            >
              {isPlaystation ? (
                <Gamepad2 className="h-5 w-5" />
              ) : (
                <SteeringWheelIcon className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{tariff.name}</h3>
              <p className="mt-0.5 text-sm text-white/40">
                {getTariffDeviceLabel(tariff.deviceType)}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
              tariff.isActive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-white/5 text-white/35",
            )}
          >
            {tariff.isActive ? "Aktif" : "Pasif"}
          </span>
        </div>

        <div className="space-y-3 rounded-xl border border-white/5 bg-[#0b0e14]/80 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-white/45">
              <Clock className="h-4 w-4" />
              Açılış
            </span>
            <span className="text-right text-white/85">
              {tariff.openingMinutes} dk · ₺
              {formatCurrency(Number(tariff.openingPrice))}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-white/45">
              <Timer className="h-4 w-4" />
              Dakika
            </span>
            <span className="font-medium text-[#a5b4fc]">
              ₺{formatCurrency(Number(tariff.pricePerMinute))} / dk
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-white/45">
              <Zap className="h-4 w-4" />
              Saatlik
            </span>
            <span className="text-white/85">
              ₺{formatCurrency(getHourlyRate(tariff))} / saat
            </span>
          </div>
          {Number(tariff.extraControllerFee) > 0 && (
            <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3 text-sm">
              <span className="text-white/45">Ek Kol</span>
              <span className="text-amber-300/90">
                ₺{formatCurrency(Number(tariff.extraControllerFee))}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(tariff)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0b0e14] py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-[#6366f1]/40 hover:text-white"
          >
            <Pencil className="h-4 w-4" />
            Düzenle
          </button>
          {tariff.isActive && (
            <button
              type="button"
              onClick={() => onDeactivate(tariff)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/40 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
              aria-label={`${tariff.name} pasifleştir`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function TariffsContent() {
  const queryClient = useQueryClient();
  const { data: tariffs = [], isLoading, isError, refetch } =
    useTariffsManagement();

  const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Tariff | null>(null);

  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
      setDeactivateTarget(null);
      setDeactivateError(null);
    },
    onError: (error) => {
      setDeactivateError(
        getTariffApiErrorMessage(error, "Tarife pasifleştirilemedi."),
      );
    },
  });

  const filteredTariffs = useMemo(() => {
    if (deviceFilter === "all") return tariffs;
    return tariffs.filter((tariff) => tariff.deviceType === deviceFilter);
  }, [tariffs, deviceFilter]);

  const stats = useMemo(() => {
    const active = tariffs.filter((t) => t.isActive).length;
    const playstation = tariffs.filter(
      (t) => t.deviceType === "PLAYSTATION" && t.isActive,
    ).length;
    const steering = tariffs.filter(
      (t) => t.deviceType === "STEERING_WHEEL" && t.isActive,
    ).length;

    return { total: tariffs.length, active, playstation, steering };
  }, [tariffs]);

  const defaultDeviceType: TariffDeviceType =
    deviceFilter === "STEERING_WHEEL" ? "STEERING_WHEEL" : "PLAYSTATION";

  const openCreate = () => {
    setFormMode("create");
    setEditingTariff(null);
    setFormOpen(true);
  };

  const openEdit = (tariff: Tariff) => {
    setFormMode("edit");
    setEditingTariff(tariff);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingTariff(null);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Tarifeler</h1>
            <p className="text-base text-white/40">
              PlayStation ve direksiyon fiyatlandırma yönetimi
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-colors hover:bg-[#5558e3]"
        >
          <Plus className="h-4 w-4" />
          Tarife Ekle
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Toplam Tarife"
          value={String(stats.total)}
          icon={<Receipt className="h-5 w-5" />}
          accent="bg-white/5 text-white/60"
        />
        <StatCard
          label="Aktif Tarife"
          value={String(stats.active)}
          icon={<Zap className="h-5 w-5" />}
          accent="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          label="PlayStation"
          value={String(stats.playstation)}
          icon={<Gamepad2 className="h-5 w-5" />}
          accent="bg-[#6366f1]/15 text-[#818cf8]"
        />
        <StatCard
          label="Direksiyon"
          value={String(stats.steering)}
          icon={<SteeringWheelIcon className="h-5 w-5" />}
          accent="bg-[#3b82f6]/15 text-[#60a5fa]"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
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

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-24 text-white/40">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Tarifeler yükleniyor...
        </div>
      ) : isError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#12121e] py-24 text-white/50">
          <p>Tarifeler yüklenemedi.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm text-white"
          >
            Tekrar Dene
          </button>
        </div>
      ) : filteredTariffs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0b0e14] py-24 text-white/30">
          <Receipt className="mb-3 h-10 w-10" />
          <p className="text-sm">
            {deviceFilter === "all"
              ? "Henüz tarife tanımlanmamış"
              : "Bu cihaz tipi için tarife bulunamadı"}
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 text-sm font-medium text-[#818cf8] hover:text-white"
          >
            İlk tarifeyi ekle →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTariffs.map((tariff) => (
            <TariffCard
              key={tariff.id}
              tariff={tariff}
              onEdit={openEdit}
              onDeactivate={(tariff) => {
                setDeactivateError(null);
                setDeactivateTarget(tariff);
              }}
            />
          ))}
        </div>
      )}

      <TariffFormModal
        mode={formMode}
        tariff={editingTariff}
        defaultDeviceType={defaultDeviceType}
        isOpen={formOpen}
        onClose={closeForm}
      />

      {deactivateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() =>
              !deleteMutation.isPending && setDeactivateTarget(null)
            }
            aria-label="Kapat"
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0b0e14] p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Tarifeyi Pasifleştir</h3>
            <p className="mt-2 text-sm text-white/50">
              <span className="text-white">{deactivateTarget.name}</span> tarifesi
              pasifleştirilecek. Masa açılışında artık görünmez; daha sonra
              düzenleyerek tekrar aktif edebilirsiniz.
            </p>
            {deactivateError && (
              <p className="mt-3 text-sm text-rose-400">{deactivateError}</p>
            )}
            {deleteMutation.isError && !deactivateError && (
              <p className="mt-3 text-sm text-rose-400">
                İşlem başarısız oldu.
              </p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDeactivateTarget(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl border border-white/10 bg-[#12121e] py-2.5 text-sm text-white/70 hover:text-white disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deactivateTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Pasifleştir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
