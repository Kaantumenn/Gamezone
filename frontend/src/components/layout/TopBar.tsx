"use client";

import { useState } from "react";
import { Bell, ChevronDown, Gamepad2, LayoutGrid, Sun } from "lucide-react";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { useTabFilter, type TopTab } from "@/context/TabFilterContext";
import { cn } from "@/lib/utils";

const tabs: { id: TopTab; label: string; icon: React.ReactNode; activeClass: string }[] = [
  {
    id: "all",
    label: "HEPSİ",
    icon: <LayoutGrid className="h-4 w-4" />,
    activeClass: "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]",
  },
  {
    id: "playstation",
    label: "PLAYSTATION",
    icon: <Gamepad2 className="h-4 w-4" />,
    activeClass: "bg-[#6366f1] text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]",
  },
  {
    id: "steering",
    label: "DİREKSİYON",
    icon: <SteeringWheelIcon className="h-4 w-4" />,
    activeClass: "bg-[#3b82f6] text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]",
  },
];

export function TopBar() {
  const { activeTab, setActiveTab } = useTabFilter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/5 bg-[#080810]/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition-all",
              activeTab === tab.id
                ? tab.activeClass
                : "bg-[#12121e] text-white/50 hover:text-white/70",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#12121e] text-white/60 transition-colors hover:text-white/90"
          aria-label="Bildirimler"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#12121e] text-white/60 transition-colors hover:text-white/90"
          aria-label="Tema değiştir"
        >
          <Sun className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-xl bg-[#12121e] px-3 py-2 transition-colors hover:bg-[#1a1a28]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#3b82f6] text-sm font-bold text-white">
            Y
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Yönetici</p>
            <p className="text-[11px] text-white/40">Admin</p>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-white/40 transition-transform",
              menuOpen && "rotate-180",
            )}
          />
        </button>
      </div>
    </header>
  );
}
