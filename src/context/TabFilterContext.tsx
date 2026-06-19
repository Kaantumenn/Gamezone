"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type TopTab = "all" | "playstation" | "steering";

interface TabFilterContextValue {
  activeTab: TopTab;
  setActiveTab: (tab: TopTab) => void;
  goHome: () => void;
}

const TabFilterContext = createContext<TabFilterContextValue | null>(null);

function scrollToTab(tab: TopTab) {
  if (typeof window === "undefined") return;

  if (tab === "all") {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const targetId = tab === "playstation" ? "ps-tables" : "steering-tables";
  document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
}

export function TabFilterProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState<TopTab>("all");
  const pendingScrollTab = useRef<TopTab | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    if (pendingScrollTab.current === null) return;

    const tab = pendingScrollTab.current;
    pendingScrollTab.current = null;

    const frame = window.requestAnimationFrame(() => {
      scrollToTab(tab);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  const setActiveTab = useCallback(
    (tab: TopTab) => {
      setActiveTabState(tab);

      if (pathname !== "/") {
        pendingScrollTab.current = tab;
        router.push("/");
        return;
      }

      scrollToTab(tab);
    },
    [pathname, router],
  );

  const goHome = useCallback(() => {
    setActiveTabState("all");
    pendingScrollTab.current = "all";

    if (pathname !== "/") {
      router.push("/");
      return;
    }

    scrollToTab("all");
  }, [pathname, router]);

  return (
    <TabFilterContext.Provider value={{ activeTab, setActiveTab, goHome }}>
      {children}
    </TabFilterContext.Provider>
  );
}

export function useTabFilter() {
  const context = useContext(TabFilterContext);
  if (!context) {
    throw new Error("useTabFilter must be used within TabFilterProvider");
  }
  return context;
}
