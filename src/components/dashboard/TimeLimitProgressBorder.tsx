"use client";

import {
  getTimeLimitBorderPhase,
  type TimeLimitBorderPhase,
} from "@/lib/timeLimit";
import { cn } from "@/lib/utils";

interface TimeLimitProgressBorderProps {
  progress: number;
  isExpired: boolean;
  isPS: boolean;
  children: React.ReactNode;
}

const borderColors: Record<
  TimeLimitBorderPhase,
  { playstation: string; steering: string }
> = {
  normal: { playstation: "#6366f1", steering: "#3b82f6" },
  warning: { playstation: "#f59e0b", steering: "#fbbf24" },
  critical: { playstation: "#ef4444", steering: "#f43f5e" },
};

export function TimeLimitProgressBorder({
  progress,
  isExpired,
  isPS,
  children,
}: TimeLimitProgressBorderProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const degrees = clamped * 360;
  const phase = getTimeLimitBorderPhase(clamped, isExpired);
  const color = isPS ? borderColors[phase].playstation : borderColors[phase].steering;

  return (
    <div className="relative rounded-2xl p-[2px]">
      <div
        className={cn(
          "absolute inset-0 rounded-2xl transition-[background] duration-1000 ease-linear",
          phase === "critical" && "animate-pulse",
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
