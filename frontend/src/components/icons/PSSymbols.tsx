import { cn } from "@/lib/utils";

interface PSSymbolsProps {
  className?: string;
}

export function PSSymbols({ className }: PSSymbolsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <span className="text-[#00d4ff] text-sm font-bold drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">
        △
      </span>
      <span className="text-[#ff6b9d] text-sm font-bold drop-shadow-[0_0_8px_rgba(255,107,157,0.6)]">
        ○
      </span>
      <span className="text-[#7dd3fc] text-sm font-bold drop-shadow-[0_0_8px_rgba(125,211,252,0.6)]">
        ✕
      </span>
      <span className="text-[#fbbf24] text-sm font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
        □
      </span>
    </div>
  );
}
