"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Home,
  Package,
  Receipt,
  Settings,
  Wallet,
} from "lucide-react";
import { ClockWidget } from "@/components/layout/ClockWidget";
import { useTabFilter } from "@/context/TabFilterContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Ana Sayfa", icon: Home },
   // { href: "/siparisler", label: "Siparişler", icon: ClipboardList },
  { href: "/urunler", label: "Ürünler / Stok", icon: Package },
  { href: "/tarifeler", label: "Tarifeler", icon: Receipt },
  { href: "/kasa", label: "Kasa / Hesaplar", icon: Wallet },
  //{ href: "/raporlar", label: "Raporlar", icon: BarChart3 },
  { href: "/calisanlar", label: "Çalışanlar", icon: Briefcase },
  { href: "/ayarlar", label: "Ayarlar", icon: Settings },
   // { href: "/kullanicilar", label: "Kullanıcılar", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { goHome } = useTabFilter();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r border-white/5 bg-[#080810]">
      <div className="flex justify-center px-5 pt-6">
        <Image
          src="/gamezone_logo.png"
          alt="Gamezone"
          width={960}
          height={320}
          priority
          className="h-40 w-auto max-w-full object-contain"
        />
      </div>

      <nav className="mt-6 flex-1 space-y-0.5 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const isHome = item.href === "/";

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isHome ? () => goHome() : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#6366f1] text-white shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4">
        <div className="relative mb-3 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-transparent" />
         
        </div>
        <ClockWidget />
      </div>
    </aside>
  );
}
