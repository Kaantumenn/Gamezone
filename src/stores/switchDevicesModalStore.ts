import type { Table } from "@/types/table";
import { create } from "zustand";

interface SwitchDevicesModalStore {
  sourceTable: Table | null;
  isOpen: boolean;
  open: (table: Table) => void;
  close: () => void;
}

export const useSwitchDevicesModalStore = create<SwitchDevicesModalStore>(
  (set) => ({
    sourceTable: null,
    isOpen: false,
    open: (table) => set({ sourceTable: table, isOpen: true }),
    close: () => set({ sourceTable: null, isOpen: false }),
  }),
);
