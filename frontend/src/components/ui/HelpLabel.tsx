import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function HelpLabel({ children, className }: HelpLabelProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="text-sm text-white/70">{children}</span>
      <CircleHelp className="h-3.5 w-3.5 text-white/25" />
    </div>
  );
}
