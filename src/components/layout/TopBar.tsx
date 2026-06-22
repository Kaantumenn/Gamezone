"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Gamepad2, LogOut, Menu } from "lucide-react";
import { SteeringWheelIcon } from "@/components/icons/SteeringWheelIcon";
import { useTabFilter, type TopTab } from "@/context/TabFilterContext";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { cn } from "@/lib/utils";

const tabs: { id: TopTab; label: string; icon: React.ReactNode; activeClass: string }[] = [
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

function getUserInitial(user: ReturnType<typeof useAuthStore.getState>["user"]) {
  const name = user?.fullName ?? user?.name ?? user?.username ?? "Yönetici";
  return name.charAt(0).toUpperCase();
}

function getUserDisplayName(user: ReturnType<typeof useAuthStore.getState>["user"]) {
  return user?.fullName ?? user?.name ?? user?.username ?? "Yönetici";
}

function getUserRole(user: ReturnType<typeof useAuthStore.getState>["user"]) {
  return user?.role ?? "Admin";
}

export function TopBar() {
  const router = useRouter();
  const { activeTab, setActiveTab } = useTabFilter();
  const { user, logout } = useAuthStore();
  const openMobileSidebar = useSidebarStore((s) => s.openMobile);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    router.replace("/login");
  };

  return (
    <header className="flex h-[64px] shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-[#080810]/80 px-3 backdrop-blur-sm sm:h-[72px] sm:gap-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={openMobileSidebar}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#12121e] text-white/60 transition-colors hover:text-white/90 lg:hidden"
          aria-label="Menüyü aç"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold tracking-wide transition-all sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-sm",
                activeTab === tab.id
                  ? tab.activeClass
                  : "bg-[#12121e] text-white/50 hover:text-white/70",
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl bg-[#12121e] px-2 py-2 transition-colors hover:bg-[#1a1a28] sm:gap-3 sm:px-3"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#3b82f6] text-sm font-bold text-white">
              {getUserInitial(user)}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-white">
                {getUserDisplayName(user)}
              </p>
              <p className="text-[11px] text-white/40">{getUserRole(user)}</p>
            </div>
            <ChevronDown
              className={cn(
                "hidden h-4 w-4 text-white/40 transition-transform md:block",
                menuOpen && "rotate-180",
              )}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-[#12121e] shadow-xl"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-rose-300 transition-colors hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
