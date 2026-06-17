import { cn } from "@/lib/utils";

interface ControllerArtProps {
  className?: string;
}

export function ControllerArt({ className }: ControllerArtProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[200px]", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.4)_0%,transparent_65%)]" />
      <svg
        viewBox="0 0 200 90"
        fill="none"
        className="relative w-full drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]"
        aria-hidden="true"
      >
        <path
          d="M30 45 C30 25 50 15 100 15 C150 15 170 25 170 45 C170 60 160 72 145 75 L135 78 C130 79 125 75 125 70 L125 55 C125 50 120 47 115 47 L85 47 C80 47 75 50 75 55 L75 70 C75 75 70 79 65 78 L55 75 C40 72 30 60 30 45Z"
          fill="url(#controllerGrad)"
          stroke="rgba(99,102,241,0.3)"
          strokeWidth="1"
        />
        <circle cx="55" cy="48" r="10" fill="rgba(99,102,241,0.25)" />
        <circle cx="145" cy="48" r="10" fill="rgba(59,130,246,0.25)" />
        <rect x="92" y="38" width="16" height="6" rx="2" fill="rgba(255,255,255,0.08)" />
        <circle cx="68" cy="58" r="3" fill="rgba(255,255,255,0.15)" />
        <circle cx="132" cy="58" r="3" fill="rgba(255,255,255,0.15)" />
        <defs>
          <linearGradient id="controllerGrad" x1="30" y1="15" x2="170" y2="75">
            <stop offset="0%" stopColor="#1e1e30" />
            <stop offset="50%" stopColor="#2a2a42" />
            <stop offset="100%" stopColor="#1a1a28" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
