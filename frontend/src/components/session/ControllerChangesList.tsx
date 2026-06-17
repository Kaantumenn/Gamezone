import { formatTimeFromIso } from "@/lib/format";
import type { SessionControllerChange } from "@/types/session";

interface ControllerChangesListProps {
  changes: SessionControllerChange[];
  className?: string;
}

export function ControllerChangesList({
  changes,
  className,
}: ControllerChangesListProps) {
  if (changes.length === 0) return null;

  const sorted = [...changes].sort(
    (a, b) =>
      new Date(a.effectiveAt).getTime() - new Date(b.effectiveAt).getTime(),
  );

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium text-white/45">Kol Değişiklikleri</p>
      <div className="space-y-1.5">
        {sorted.map((change) => (
          <div
            key={change.id}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="font-mono text-white/55">
              {formatTimeFromIso(change.effectiveAt)}
            </span>
            <span className="font-medium text-[#818cf8]">
              {change.controllerCount} Kol
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
