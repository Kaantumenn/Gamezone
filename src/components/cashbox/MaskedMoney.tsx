import { cn } from "@/lib/utils";

interface MaskedMoneyProps {
  visible: boolean;
  children: React.ReactNode;
  className?: string;
}

export function MaskedMoney({
  visible,
  children,
  className,
}: MaskedMoneyProps) {
  if (visible) {
    return (
      <span className={cn("transition-opacity duration-300", className)}>
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 select-none transition-all duration-300",
        className,
      )}
      aria-hidden
    >
      <span className="text-white/20">₺</span>
      <span className="relative overflow-hidden rounded-lg bg-white/[0.06] px-3 py-1 font-mono text-sm tracking-[0.35em] text-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <span className="blur-[3px]">00000</span>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] tracking-[0.5em] text-white/25">
          •••••
        </span>
      </span>
    </span>
  );
}
