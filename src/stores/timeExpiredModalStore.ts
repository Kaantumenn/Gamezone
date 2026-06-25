import type { Table } from "@/types/table";
import { create } from "zustand";

const SNOOZE_MS = 60_000;

interface TimeExpiredModalStore {
  table: Table | null;
  isOpen: boolean;
  suppressedSessionIds: number[];
  snoozedUntil: Record<number, number>;
  open: (table: Table) => void;
  close: () => void;
  dismiss: (sessionId: number) => void;
  suppressSession: (sessionId: number) => void;
  clearSuppression: (sessionId: number) => void;
  isSessionSnoozed: (sessionId: number) => boolean;
}

export const useTimeExpiredModalStore = create<TimeExpiredModalStore>((set, get) => ({
  table: null,
  isOpen: false,
  suppressedSessionIds: [],
  snoozedUntil: {},
  open: (table) => set({ table, isOpen: true }),
  close: () => set({ table: null, isOpen: false }),
  dismiss: (sessionId) =>
    set((state) => ({
      table: null,
      isOpen: false,
      snoozedUntil: {
        ...state.snoozedUntil,
        [sessionId]: Date.now() + SNOOZE_MS,
      },
    })),
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
      snoozedUntil: Object.fromEntries(
        Object.entries(state.snoozedUntil).filter(
          ([id]) => Number(id) !== sessionId,
        ),
      ),
    })),
  isSessionSnoozed: (sessionId) => {
    const until = get().snoozedUntil[sessionId];
    return until != null && Date.now() < until;
  },
}));
