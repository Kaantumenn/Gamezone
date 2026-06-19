"use client";

import { cn } from "@/lib/utils";

interface TimeLimitProgressBorderProps {
  progress: number;
  isExpired: boolean;
  isPS: boolean;
  children: React.ReactNode;
}

export function TimeLimitProgressBorder({
  progress,
  isExpired,
  isPS,
  children,
}: TimeLimitProgressBorderProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const degrees = clamped * 360;
  const accent = isPS ? "#6366f1" : "#3b82f6";
  const warning = isPS ? "#f59e0b" : "#fb923c";
  const color = isExpired || clamped >= 0.85 ? warning : accent;

  return (
    <div className="relative rounded-2xl p-[2px]">
      <div
        className={cn(
          "absolute inset-0 rounded-2xl transition-[background] duration-1000 ease-linear",
          isExpired && "animate-pulse",
        )}
        style={{
          background: isExpired
            ? `conic-gradient(from -90deg, ${color} 360deg, rgba(255,255,255,0.08) 360deg)`
            : `conic-gradient(from -90deg, ${color} ${degrees}deg, rgba(255,255,255,0.08) ${degrees}deg)`,
        }}
      />
      <div className="relative rounded-[14px]">{children}</div>
    </div>
  );
}
