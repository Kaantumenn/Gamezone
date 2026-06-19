import type { Table } from "@/types/table";
import { create } from "zustand";

interface TimeExpiredModalStore {
  table: Table | null;
  isOpen: boolean;
  suppressedSessionIds: number[];
  open: (table: Table) => void;
  close: () => void;
  suppressSession: (sessionId: number) => void;
  clearSuppression: (sessionId: number) => void;
}

export const useTimeExpiredModalStore = create<TimeExpiredModalStore>((set) => ({
  table: null,
  isOpen: false,
  suppressedSessionIds: [],
  open: (table) => set({ table, isOpen: true }),
  close: () => set({ table: null, isOpen: false }),
  suppressSession: (sessionId) =>
    set((state) => ({
      suppressedSessionIds: state.suppressedSessionIds.includes(sessionId)
        ? state.suppressedSessionIds
        : [...state.suppressedSessionIds, sessionId],
    })),
  clearSuppression: (sessionId) =>
    set((state) => ({
      suppressedSessionIds: state.suppressedSessionIds.filter(
        (id) => id !== sessionId,
      ),
    })),
}));
