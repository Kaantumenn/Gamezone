import { create } from "zustand";

const STORAGE_KEY = "gamezone-sidebar-collapsed";

interface SidebarStore {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
  toggleCollapsed: () => void;
  hydrateCollapsed: () => void;
}

function readCollapsedPreference(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

function persistCollapsedPreference(collapsed: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(collapsed));
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isMobileOpen: false,
  isCollapsed: false,
  openMobile: () => set({ isMobileOpen: true }),
  closeMobile: () => set({ isMobileOpen: false }),
  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  toggleCollapsed: () =>
    set((state) => {
      const isCollapsed = !state.isCollapsed;
      persistCollapsedPreference(isCollapsed);
      return { isCollapsed };
    }),
  hydrateCollapsed: () => set({ isCollapsed: readCollapsedPreference() }),
}));

export function toggleSidebar() {
  if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
    useSidebarStore.getState().toggleCollapsed();
    return;
  }

  useSidebarStore.getState().toggleMobile();
}
