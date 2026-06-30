import { Gamepad2 } from "lucide-react";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { UsageSegmentsList } from "@/components/session/UsageSegmentsList";
import {
  getCashboxDeviceBadgeClass,
  getCashboxDeviceBadgeLabel,
  getDeviceTypeLabel,
  getInferredPreviousDeviceType,
  hasCrossDeviceTransfer,
} from "@/lib/cashboxDevice";
import { formatCurrency } from "@/lib/format";
import type { SessionUsageSegment } from "@/types/checkout";
import type { TableType } from "@/types/table";
import { cn } from "@/lib/utils";

function isTransferSegment(segment: SessionUsageSegment): boolean {
  const type = segment.type?.toUpperCase() ?? "";
  return (
    type === "TRANSFER" ||
    type === "MERGED_USAGE" ||
    segment.description?.toLowerCase().includes("aktar") === true
  );
}

function DeviceTypeIcon({
  deviceType,
  className,
}: {
  deviceType: TableType;
  className?: string;
}) {
  if (deviceType === "steering") {
    return <SteeringWheelIcon className={className} />;
  }

  return <Gamepad2 className={className} />;
}

interface CrossDeviceTransferSummaryProps {
  closingDeviceType: TableType;
  mergedUsageTotal: number;
  currentUsageTotal: number;
  usageSegments?: SessionUsageSegment[];
  className?: string;
}

export function CrossDeviceTransferSummary({
  closingDeviceType,
  mergedUsageTotal,
  currentUsageTotal,
  usageSegments = [],
  className,
}: CrossDeviceTransferSummaryProps) {
  if (!hasCrossDeviceTransfer(mergedUsageTotal)) return null;

  const previousDeviceType = getInferredPreviousDeviceType(closingDeviceType);
  const transferSegments = usageSegments.filter(isTransferSegment);

  return (
    <section
      className={cn(
        "rounded-xl border border-amber-500/20 bg-amber-500/5 p-4",
        className,
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-white">
          Farklı Cihaz Aktarımı
        </h3>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
            getCashboxDeviceBadgeClass(closingDeviceType, mergedUsageTotal),
          )}
        >
          {getCashboxDeviceBadgeLabel(closingDeviceType, mergedUsageTotal)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-[#0b0e14]/60 px-3 py-2.5">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]/15 text-[#818cf8]">
              <DeviceTypeIcon deviceType={previousDeviceType} className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/85">
                Önceki cihaz · {getDeviceTypeLabel(previousDeviceType)}
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                Aktarım öncesi kullanım ücreti
              </p>
            </div>
          </div>
          <span className="shrink-0 font-medium text-amber-300">
            ₺{formatCurrency(mergedUsageTotal)}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-[#0b0e14]/60 px-3 py-2.5">
          <div className="flex items-start gap-2.5">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                closingDeviceType === "steering"
                  ? "bg-[#3b82f6]/15 text-[#60a5fa]"
                  : "bg-[#6366f1]/15 text-[#818cf8]",
              )}
            >
              <DeviceTypeIcon deviceType={closingDeviceType} className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/85">
                Mevcut cihaz · {getDeviceTypeLabel(closingDeviceType)}
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                Aktarım sonrası kullanım ücreti
              </p>
            </div>
          </div>
          <span className="shrink-0 font-medium text-[#818cf8]">
            ₺{formatCurrency(currentUsageTotal)}
          </span>
        </div>
      </div>

      {transferSegments.length > 0 && (
        <UsageSegmentsList
          segments={transferSegments}
          className="mt-3 border-t border-white/5 pt-3"
        />
      )}
    </section>
  );
}
