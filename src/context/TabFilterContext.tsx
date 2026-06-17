"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type TopTab = "all" | "playstation" | "steering";

interface TabFilterContextValue {
  activeTab: TopTab;
  setActiveTab: (tab: TopTab) => void;
}

const TabFilterContext = createContext<TabFilterContextValue | null>(null);

export function TabFilterProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTabState] = useState<TopTab>("all");

  const setActiveTab = useCallback((tab: TopTab) => {
    setActiveTabState(tab);

    if (tab === "all") {
      document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const targetId = tab === "playstation" ? "ps-tables" : "steering-tables";
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <TabFilterContext.Provider value={{ activeTab, setActiveTab }}>
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
