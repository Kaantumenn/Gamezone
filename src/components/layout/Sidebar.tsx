"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Home,
  Package,
  Receipt,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import { ClockWidget } from "@/components/layout/ClockWidget";
import { useTabFilter } from "@/context/TabFilterContext";
import { useSidebarStore } from "@/stores/sidebarStore";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/urunler", label: "Ürünler / Stok", icon: Package },
  { href: "/tarifeler", label: "Tarifeler", icon: Receipt },
  { href: "/kasa", label: "Kasa / Hesaplar", icon: Wallet },
  { href: "/calisanlar", label: "Çalışanlar", icon: Briefcase },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
];

const collapseButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#12121e] text-white/50 transition-colors hover:border-[#6366f1]/40 hover:bg-[#6366f1]/10 hover:text-[#a5b4fc]";

export function Sidebar() {
  const pathname = usePathname();
  const { goHome } = useTabFilter();
  const {
    isMobileOpen,
    isCollapsed,
    closeMobile,
    toggleCollapsed,
    hydrateCollapsed,
  } = useSidebarStore();

  useEffect(() => {
    hydrateCollapsed();
  }, [hydrateCollapsed]);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!isMobileOpen) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[1px] lg:hidden"
          onClick={closeMobile}
          aria-label="Menüyü kapat"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[80] flex h-screen flex-col border-r border-white/5 bg-[#080810] transition-[transform,width] duration-300 ease-out",
          "w-[min(280px,88vw)]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:shrink-0 lg:translate-x-0",
          isCollapsed ? "lg:w-[76px]" : "lg:w-[260px]",
        )}
      >
        <div
          className={cn(
            "relative flex items-center px-4 pt-5 lg:pt-6",
            isCollapsed
              ? "justify-center lg:px-2"
              : "justify-between lg:justify-center lg:px-5",
          )}
        >
          {!isCollapsed && (
            <Image
              src="/gamezone_logo.png"
              alt="Gamezone"
              width={960}
              height={320}
              priority
              className="h-24 w-auto max-w-[200px] object-contain lg:h-40 lg:max-w-full"
            />
          )}

          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white/70 lg:hidden"
            aria-label="Menüyü kapat"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              collapseButtonClass,
              "hidden lg:flex",
              !isCollapsed && "absolute right-3 top-6",
            )}
            aria-label={isCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav
          className={cn(
            "mt-4 flex-1 space-y-0.5 overflow-y-auto px-3 lg:mt-6",
            isCollapsed && "lg:px-2",
          )}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isHome = item.href === "/";

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                onClick={() => {
                  if (isHome) goHome();
                  closeMobile();
                }}
                className={cn(
                  "flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors",
                  isCollapsed
                    ? "gap-0 px-3 lg:justify-center lg:px-0"
                    : "gap-3 px-3",
                  isActive
                    ? "bg-[#6366f1] text-white shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className={cn(isCollapsed && "lg:hidden")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className={cn("px-4 pb-4", isCollapsed && "lg:hidden")}>
          <ClockWidget />
        </div>
      </aside>
    </>
  );
}
