"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type TopTab = "playstation" | "steering";

interface TabFilterContextValue {
  activeTab: TopTab;
  setActiveTab: (tab: TopTab) => void;
  goHome: () => void;
}

const TabFilterContext = createContext<TabFilterContextValue | null>(null);

function scrollHome() {
  if (typeof window === "undefined") return;
  document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
}

export function TabFilterProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState<TopTab>("playstation");
  const pendingScrollHome = useRef(false);

  useEffect(() => {
    if (pathname !== "/") return;
    if (!pendingScrollHome.current) return;

    pendingScrollHome.current = false;

    const frame = window.requestAnimationFrame(() => {
      scrollHome();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  const setActiveTab = useCallback(
    (tab: TopTab) => {
      setActiveTabState(tab);

      if (pathname !== "/") {
        pendingScrollHome.current = true;
        router.push("/");
        return;
      }

      scrollHome();
    },
    [pathname, router],
  );

  const goHome = useCallback(() => {
    pendingScrollHome.current = true;

    if (pathname !== "/") {
      router.push("/");
      return;
    }

    scrollHome();
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
