import { formatCurrency, formatTimeFromIso } from "@/lib/format";
import type { SessionUsageSegment } from "@/types/checkout";

interface UsageSegmentsListProps {
  segments: SessionUsageSegment[];
  className?: string;
}

export function UsageSegmentsList({
  segments,
  className,
}: UsageSegmentsListProps) {
  if (segments.length === 0) return null;

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium text-white/45">Kullanım Detayı</p>
      <div className="space-y-2.5">
        {segments.map((segment, index) => (
          <div
            key={`${segment.from}-${segment.type}-${index}`}
            className="rounded-lg border border-white/5 bg-[#0b0e14]/60 px-3 py-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm text-white/75">
                  {formatTimeFromIso(segment.from)}
                  <span className="text-white/30"> – </span>
                  {formatTimeFromIso(segment.to)}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {segment.controllerCount} Kol
                  {segment.multiplier > 1 && (
                    <span className="text-white/30">
                      {" "}
                      · x{segment.multiplier}
                    </span>
                  )}
                  {segment.minutes > 0 && (
                    <span className="text-white/30"> · {segment.minutes} dk</span>
                  )}
                </p>
              </div>
              <span className="shrink-0 font-medium text-[#818cf8]">
                ₺{formatCurrency(segment.amount)}
              </span>
            </div>
            {segment.description && (
              <p className="mt-1.5 text-xs text-white/35">{segment.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
